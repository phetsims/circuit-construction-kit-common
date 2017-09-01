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
   * REVIEW*: Usually I'd use 'screenView' instead of 'circuitConstructionKitScreenView' (similar to the model). Either
   * REVIEW*: works, the current way is just quite verbose.
   * @param {CircuitConstructionKitScreenView} circuitConstructionKitScreenView - the main screen view, null for icon
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
  function FixedCircuitElementNode( circuitConstructionKitScreenView, circuitLayerNode, circuitElement,
                                    viewTypeProperty, lifelikeNode, schematicNode, tandem, options ) {
    assert && assert( lifelikeNode !== schematicNode, 'schematicNode should be different than lifelikeNode' );
    var self = this;

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
    this.contentNode = new Node( {
      children: [ lifelikeNode ] //REVIEW*: viewPropertyListener link below sets this up. create as new Node()?
    } );

    // @private {boolean} - Flag to indicate when updating view is necessary, in order to avoid duplicate work when both
    // vertices move
    this.dirty = true;

    // Add highlight (but not for icons)
    if ( !options.icon && options.showHighlight ) {
      //REVIEW*: visibility/type docs
      this.highlightNode = new FixedCircuitElementHighlightNode( this );
    }
    //REVIEW*: this.markAsDirty.bind( this );
    var markAsDirty = function() { self.markAsDirty(); };

    // Show the selected node
    var viewPropertyListener = function( view ) {
      self.contentNode.children = [ view === CircuitElementViewType.LIFELIKE ? lifelikeNode : schematicNode ];

      // Update the dimensions of the highlight.  For Switches, retain the original bounds (big enough to encapsulate
      // both schematic and lifelike open and closed).
      if ( circuitElement.isSizeChangedOnViewChange ) {
        self.highlightNode && self.highlightNode.recomputeBounds( self );
      }
    };
    viewTypeProperty.link( viewPropertyListener );

    // Relink when start vertex changes
    //REVIEW*: Doc notes "relinking", but I see this just setting dirty flag.
    circuitElement.vertexMovedEmitter.addListener( markAsDirty );

    var moveToFront = function() {

      // Components outside the black box do not move in front of the overlay
      if ( circuitElement.interactiveProperty.get() ) {
        self.moveToFront();
        self.circuitElement.moveToFrontEmitter.emit();
        self.circuitElement.startVertexProperty.get().relayerEmitter.emit();
        self.circuitElement.endVertexProperty.get().relayerEmitter.emit();
      }
    };
    circuitElement.connectedEmitter.addListener( moveToFront );
    circuitElement.vertexSelectedEmitter.addListener( moveToFront );

    //REVIEW*: It looks like if circuitLayerNode is null, we'll pass null as a circuit to CircuitElementNode.
    //REVIEW*: Its documentation does not say anything about null (only {Circuit}), and it doesn't have property docs
    //REVIEW*: on the value assigned to the object.
    var circuit = circuitLayerNode && circuitLayerNode.circuit;

    CircuitElementNode.call( this, circuitElement, circuit, _.extend( {
      cursor: 'pointer',
      children: [
        //REVIEW*: Use 'this' instead of 'self'?
        self.contentNode
      ],
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
          //REVIEW*: Why the call()? Are we trying to skip the method (don't see it) overridden on this type?
          //REVIEW*: self.endDrag( ... ) should be equivalent, no?
          CircuitElementNode.prototype.endDrag.call( self, event, self.contentNode,
            [ circuitElement.endVertexProperty.get() ], circuitConstructionKitScreenView, circuitLayerNode, startPoint,
            dragged );
        },
        tandem: tandem.createTandem( 'dragHandler' )
      } );
      //REVIEW*: Why is 'self' used here instead of 'this'?
      self.contentNode.addInputListener( this.dragHandler );

      if ( options.showHighlight ) {
        var updateHighlightVisibility = function( lastCircuitElement ) {
          var visible = ( lastCircuitElement === circuitElement );
          CircuitConstructionKitCommonUtil.setInSceneGraph( visible, circuitLayerNode.highlightLayer, self.highlightNode );
          self.markAsDirty();
        };

        circuitLayerNode.circuit.selectedCircuitElementProperty.link( updateHighlightVisibility );
      }

      // Show fire for batteries and resistors
      //REVIEW*: Conditional code based on subtype is probably a sign this code should live in the subtypes?
      if ( circuitElement instanceof Battery || circuitElement instanceof Resistor ) {
        //REVIEW*: visibility/type docs, and consider moving declaration (and docs) up top so it is more visible.
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
            circuitConstructionKitScreenView.model.isValueDepictionEnabledProperty
          ], function( current, resistance, isValueDepictionEnabled ) {
            self.fireNode.visible = showFire( current, isValueDepictionEnabled ) && resistance >= 1E-8;
          } );
        }
        else {

          // Show fire in all other circuit elements
          updateFireMultilink = Property.multilink( [
            circuitElement.currentProperty,
            circuitConstructionKitScreenView.model.isValueDepictionEnabledProperty
          ], function( current, isValueDepictionEnabled ) {
            self.fireNode.visible = showFire( current, isValueDepictionEnabled );
          } );
        }
      }
    }

    // @private {function} - for disposal
    this.disposeFixedCircuitElementNode = function() {

      // End drag event if it was in progress
      //REVIEW*: consider self.dragHandler.interrupt()
      if ( self.dragHandler && self.dragHandler.dragging ) {
        self.dragHandler.endDrag();
      }

      circuitElement.vertexMovedEmitter.removeListener( markAsDirty );
      updateHighlightVisibility && circuitLayerNode.circuit.selectedCircuitElementProperty.unlink( updateHighlightVisibility );
      circuitElement.connectedEmitter.removeListener( moveToFront );
      circuitElement.vertexSelectedEmitter.removeListener( moveToFront );

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
     * Mark dirty to batch changes, so that update can be done once in view step, if necessary
     * @public
     * REVIEW*: The dirty flag, markAsDirty and step functions for this type AND WireNode seem to be duplicates.
     * REVIEW*: Can this be consolidated into CircuitElementNode?
     */
    markAsDirty: function() {
      this.dirty = true;
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

      //REVIEW*: Usually an if-statement would be more readable here, instead of temp variable + short-circuit?
      var updateHighlight = this.highlightNode && this.circuitLayerNode.circuit.selectedCircuitElementProperty.get() === this.circuitElement;
      updateHighlight && this.highlightNode.setMatrix( matrix );

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
     * @public - called during the view step
     * @override
     */
    step: function() {
      CircuitElementNode.prototype.step.call( this );
      if ( this.dirty ) {
        this.updateRender();
        this.dirty = false;
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