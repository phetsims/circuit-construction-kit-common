// Copyright 2016-2017, University of Colorado Boulder

/**
 * Renders and provides interactivity for FixedCircuitElements (all CircuitElements except Wires).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Property = require( 'AXON/Property' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonUtil' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  var CircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementNode' );
  var FixedCircuitElementHighlightNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedCircuitElementHighlightNode' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Vector2 = require( 'DOT/Vector2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Node = require( 'SCENERY/nodes/Node' );
  var CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElementViewType' );

  // images
  var fireImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/fire.png' );

  // constants
  var matrix = new Matrix3();
  var rotationMatrix = new Matrix3();

  /**
   * @param {CircuitConstructionKitScreenView} screenView - the main screen view, null for icon
   * @param {CircuitLayerNode} circuitLayerNode - Null if an icon is created
   * @param {FixedCircuitElement} circuitElement - the corresponding model element
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Node} lifelikeNode - the Node that will display the component as a lifelike object.  Origin must be
   *                            - left-center
   * @param {Node} schematicNode - the Node that will display the component. Origin must be left-center.
   * @param {Tandem} tandem
   * @param options
   * @constructor
   */
  function FixedCircuitElementNode( screenView, circuitLayerNode, circuitElement,
                                    viewTypeProperty, lifelikeNode, schematicNode, tandem, options ) {
    assert && assert( lifelikeNode !== schematicNode, 'schematicNode should be different than lifelikeNode' );
    var self = this;

    // @private {Node} shows the lifelike view
    this.lifelikeNode = lifelikeNode;

    // @private {Node} shows the schematic view
    this.schematicNode = schematicNode;

    //REVIEW*: (performance) Lots of closures here. If memory is still an issue, moving these to methods (where possible or convenient) may help.

    options = _.extend( {
      icon: false,
      showHighlight: true
    }, options );

    // @public (read-only) {CircuitElement}
    this.circuitElement = circuitElement;

    // @private {CircuitLayerNode}
    this.circuitLayerNode = circuitLayerNode;

    // @protected (read-only) {Node} node that shows the component, separate from the part that shows the highlight and
    // the fire
    this.contentNode = new Node();

    // Show the selected node
    var viewPropertyListener = this.setViewType.bind( this );
    viewTypeProperty.link( viewPropertyListener );

    // Add highlight (but not for icons)
    if ( !options.icon && options.showHighlight ) {

      // @protected (read-only) {FixedCircuitElementHighlightNode}
      this.highlightNode = new FixedCircuitElementHighlightNode( this );

      // Update the highlight bounds after it is created
      viewPropertyListener( viewTypeProperty.value );
    }
    var markAsDirty = this.markAsDirty.bind( this );
    circuitElement.vertexMovedEmitter.addListener( markAsDirty );

    var moveToFrontListener = this.moveFixedCircuitElementNodeToFront.bind( this );
    circuitElement.connectedEmitter.addListener( moveToFrontListener );
    circuitElement.vertexSelectedEmitter.addListener( moveToFrontListener );

    var circuit = circuitLayerNode && circuitLayerNode.circuit;

    CircuitElementNode.call( this, circuitElement, circuit, _.extend( {
      cursor: 'pointer',
      children: [ this.contentNode ],
      tandem: tandem
    }, options ) );

    var pickableListener = function( interactive ) {
      self.pickable = interactive;
    };

    // LightBulbSocketNode cannot ever be pickable, so let it opt out of this callback
    if ( options.pickable !== false ) {
      circuitElement.interactiveProperty.link( pickableListener );
    }

    // Use whatever the start node currently is (it can change), and let the circuit manage the dependent vertices
    var startPoint = null;
    var dragged = false;
    if ( !options.icon ) {

      // @private {SimpleDragHandler}
      this.dragHandler = new SimpleDragHandler( {
        allowTouchSnag: true,
        start: function( event ) {
          startPoint = event.pointer.point;
          circuitElement.interactiveProperty.get() && circuitLayerNode.startDragVertex(
            event.pointer.point,
            circuitElement.endVertexProperty.get(),
            false
          );
          dragged = false;
        },
        drag: function( event ) {
          circuitElement.interactiveProperty.get() && circuitLayerNode.dragVertex(
            event.pointer.point,
            circuitElement.endVertexProperty.get(),
            false
          );
          dragged = true;
        },
        end: function( event ) {
          self.endDrag( event, self.contentNode, [ circuitElement.endVertexProperty.get() ], screenView, circuitLayerNode, startPoint, dragged );
        },
        tandem: tandem.createTandem( 'dragHandler' )
      } );
      this.contentNode.addInputListener( this.dragHandler );

      if ( options.showHighlight ) {
        var updateHighlightVisibility = function( lastCircuitElement ) {
          var visible = ( lastCircuitElement === circuitElement );
          CircuitConstructionKitCommonUtil.setInSceneGraph( visible, circuitLayerNode.highlightLayer, self.highlightNode );
          self.markAsDirty();
        };

        circuitLayerNode.circuit.selectedCircuitElementProperty.link( updateHighlightVisibility );
      }

      // Show fire for batteries and resistors
      //REVIEW: Conditional code based on subtype is probably a sign this code should live in the subtypes?
      //REVIEW^(samreid): Battery and Resistor are currently siblings.  Should I create an intermediate parent class for
      //REVIEW^(samreid): them called FixedCircuitElementWithFire?  Or some kind of mix-in that is mixed in from
      //REVIEW^(samreid): Battery and Resistor?  Or what about an `addFire` method in FixedCircuitElementNode that
      //REVIEW^(samreid): can be called by them?  Or even better, what about an `isFlammable` model property?
      //REVIEW^(samreid): That last idea (CircuitElement.isFlammable) seems best to me, and leaving this code here,
      //REVIEW^(samreid): I'll wait to hear your thoughts before proceeding.
      if ( circuitElement instanceof Battery || circuitElement instanceof Resistor ) {
        //REVIEW: consider moving declaration (and docs) up top so it is more visible.
        //REVIEW^(samreid): Should we resolve the preceding REVIEW section before deciding on this, or can you recommend
        //REVIEW^(samreid): a line number or neighborhood where this might be most suitable?
        // @private {Image} - display the fire for flammable CircuitElements
        this.fireNode = new Image( fireImage, { pickable: false, imageOpacity: 0.95 } );
        this.fireNode.mutate( { scale: self.contentNode.width / this.fireNode.width } );
        this.addChild( this.fireNode );

        var showFire = function( current, isValueDepictionEnabled ) {
          return Math.abs( current ) >= 15 && isValueDepictionEnabled;
        };

        var updateFireMultilink = null;

        if ( circuitElement instanceof Resistor ) {

          // Show fire in resistors (but only if they have >0 resistance)
          updateFireMultilink = Property.multilink( [
            circuitElement.currentProperty,
            circuitElement.resistanceProperty,
            screenView.model.isValueDepictionEnabledProperty
          ], function( current, resistance, isValueDepictionEnabled ) {
            self.fireNode.visible = showFire( current, isValueDepictionEnabled ) && resistance >= 1E-8;
          } );
        }
        else {

          // Show fire in all other circuit elements
          updateFireMultilink = Property.multilink( [
            circuitElement.currentProperty,
            screenView.model.isValueDepictionEnabledProperty
          ], function( current, isValueDepictionEnabled ) {
            self.fireNode.visible = showFire( current, isValueDepictionEnabled );
          } );
        }
      }
    }

    // @private {function} - for disposal
    this.disposeFixedCircuitElementNode = function() {

      // Interrupt the drag event if it was in progress
      self.dragHandler && self.dragHandler.interrupt();

      circuitElement.vertexMovedEmitter.removeListener( markAsDirty );
      updateHighlightVisibility && circuitLayerNode.circuit.selectedCircuitElementProperty.unlink( updateHighlightVisibility );
      circuitElement.connectedEmitter.removeListener( moveToFrontListener );
      circuitElement.vertexSelectedEmitter.removeListener( moveToFrontListener );

      if ( options.pickable !== false ) {
        circuitElement.interactiveProperty.unlink( pickableListener );
      }
      circuitLayerNode && self.highlightNode && CircuitConstructionKitCommonUtil.setInSceneGraph( false, circuitLayerNode.highlightLayer, self.highlightNode );
      viewTypeProperty.unlink( viewPropertyListener );

      if ( !options.icon && updateFireMultilink ) {
        Property.unmultilink( updateFireMultilink );
      }

      // Detach the child nodes which are reused (so they don't have a _parents reference)
      self.contentNode.dispose();
    };
  }

  circuitConstructionKitCommon.register( 'FixedCircuitElementNode', FixedCircuitElementNode );

  return inherit( CircuitElementNode, FixedCircuitElementNode, {

    /**
     * Set the view type
     * @param {CircuitElementViewType} viewType
     * @private
     */
    setViewType: function( viewType ) {
      this.contentNode.children = [ viewType === CircuitElementViewType.LIFELIKE ? this.lifelikeNode : this.schematicNode ];

      // Update the dimensions of the highlight.  For Switches, retain the original bounds (big enough to encapsulate
      // both schematic and lifelike open and closed).
      (this.circuitElement.isSizeChangedOnViewChange && this.highlightNode ) && this.highlightNode.recomputeBounds( this );
    },

    /**
     * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
     * @protected - CircuitConstructionKitLightBulbNode calls updateRender for its child socket node
     */
    updateRender: function() {
      var startPosition = this.circuitElement.startPositionProperty.get();
      var endPosition = this.circuitElement.endPositionProperty.get();
      var angle = Vector2.getAngleBetweenVectors( startPosition, endPosition );
      var magnitude = Vector2.getDistanceBetweenVectors( startPosition, endPosition );

      // Update the node transform in a single step, see #66
      matrix.setToTranslationRotationPoint( startPosition, angle );
      this.contentNode.setMatrix( matrix );

      if ( this.highlightNode && this.circuitLayerNode.circuit.selectedCircuitElementProperty.get() === this.circuitElement ) {
        this.highlightNode.setMatrix( matrix );
      }

      // Update the fire transform
      var flameExtent = 0.8;
      var scale = magnitude / fireImage.width * flameExtent;
      var flameMargin = ( 1 - flameExtent ) / 2;
      var flameX = magnitude * flameMargin / scale;
      var flameY = -fireImage.height;
      matrix.multiplyMatrix( rotationMatrix.setToScale( scale ) )
        .multiplyMatrix( rotationMatrix.setToTranslation( flameX, flameY ) );
      this.fireNode && this.fireNode.setMatrix( matrix );
    },

    /**
     * Move the circuit element node to the front
     * @private
     */
    moveFixedCircuitElementNodeToFront: function() {

      // Components outside the black box do not move in front of the overlay
      if ( this.circuitElement.interactiveProperty.get() ) {
        this.moveToFront();
        this.circuitElement.moveToFrontEmitter.emit();
        this.circuitElement.startVertexProperty.get().relayerEmitter.emit();
        this.circuitElement.endVertexProperty.get().relayerEmitter.emit();
      }
    },

    /**
     * @public - dispose resources when no longer used
     * @override
     */
    dispose: function() {
      this.disposeFixedCircuitElementNode();
      CircuitElementNode.prototype.dispose.call( this );
    }
  }, {

    /**
     * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
     * @public {Array.<Image>}
     */
    webglSpriteNodes: [
      new Image( fireImage )
    ]
  } );
} );