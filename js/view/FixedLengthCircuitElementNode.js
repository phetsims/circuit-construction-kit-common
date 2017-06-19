// Copyright 2015-2017, University of Colorado Boulder

/**
 * Renders and provides interactivity for FixedLengthCircuitElements (all CircuitElements except Wires).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  var Property = require( 'AXON/Property' );
  var TandemSimpleDragHandler = require( 'TANDEM/scenery/input/TandemSimpleDragHandler' );
  var CircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementNode' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Image = require( 'SCENERY/nodes/Image' );
  var FixedLengthCircuitElementHighlightNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedLengthCircuitElementHighlightNode' );
  var CircuitConstructionKitCommonUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonUtil' );

  // images
  var fireImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/fire.png' );

  // constants
  var transform = new Matrix3();
  var rotationMatrix = new Matrix3();

  /**
   * @param {CircuitConstructionKitScreenView} circuitConstructionKitScreenView - so that the node can be dropped back into the toolbox
   * @param {CircuitLayerNode} circuitLayerNode - Null if an icon is created
   * @param {FixedLengthCircuitElement} circuitElement - the corresponding model element
   * @param {Property.<string>} viewProperty - 'lifelike'|'schematic'
   * @param {Node} lifelikeNode - the Node that will display the component as a lifelike object.  Origin must be left-center
   * @param {Node} schematicNode - the Node that will display the component. Origin must be left-center.
   * @param {Tandem} tandem
   * @param options
   * @constructor
   */
  function FixedLengthCircuitElementNode( circuitConstructionKitScreenView, circuitLayerNode, circuitElement, viewProperty,
                                          lifelikeNode, schematicNode, tandem, options ) {
    assert && assert( lifelikeNode !== schematicNode, 'schematicNode should be different than lifelikeNode' );
    var self = this;

    options = _.extend( {
      icon: false
    }, options );

    // @public (read-only) {CircuitElement}
    this.circuitElement = circuitElement;

    // @protected (read-only) {Node} node that shows the component, separate from the part that shows the highlight and
    // the fire
    this.contentNode = new Node();

    // Show the selected node
    var viewPropertyListener = function( view ) {
      self.contentNode.children = [ view === 'lifelike' ? lifelikeNode : schematicNode ];
    };
    viewProperty.link( viewPropertyListener );

    // @private {boolean} - Flag to indicate when updating view is necessary, in order to avoid duplicate work when both
    // vertices move
    this.dirty = true;

    // Add highlight (but not for icons)
    if ( !options.icon ) {
      this.highlightNode = new FixedLengthCircuitElementHighlightNode( this, {} );
    }
    var updateLayoutCallback = function() { self.updateLayout(); };

    // Relink when start vertex changes
    circuitElement.vertexMovedEmitter.addListener( updateLayoutCallback );

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

    var circuit = circuitLayerNode && circuitLayerNode.circuit;

    CircuitElementNode.call( this, circuitElement, circuit, _.extend( {
      cursor: 'pointer',
      children: [
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
      this.inputListener = new TandemSimpleDragHandler( {
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

          CircuitElementNode.prototype.endDrag.call( self, event, self.contentNode,
            [ circuitElement.endVertexProperty.get() ], circuitConstructionKitScreenView, circuitLayerNode, startPoint,
            dragged );
        },
        tandem: tandem.createTandem( 'inputListener' ) // TODO (phet-io): some input listeners are 'dragHandler' let's be consistent
      } );
      self.contentNode.addInputListener( this.inputListener );

      var updateHighlightVisibility = function( lastCircuitElement ) {
        var visible = (lastCircuitElement === circuitElement);
        CircuitConstructionKitCommonUtil.setInSceneGraph( visible, circuitLayerNode.highlightLayer, self.highlightNode );
      };
      circuitLayerNode.circuit.selectedCircuitElementProperty.link( updateHighlightVisibility );

      if ( circuitElement instanceof Battery || circuitElement instanceof Resistor ) {
        this.fireNode = new Image( fireImage, { pickable: false, imageOpacity: 0.95 } );
        this.fireNode.mutate( { scale: self.contentNode.width / this.fireNode.width } );
        this.addChild( this.fireNode );

        var showFire = function( current, exploreScreenRunning ) {
          return Math.abs( current ) >= 10 && exploreScreenRunning;
        };

        var updateFireMultilink = null;

        if ( circuitElement instanceof Resistor ) {

          // Show fire in resistors (but only if they have >0 resistance)
          updateFireMultilink = Property.multilink( [
            circuitElement.currentProperty,
            circuitElement.resistanceProperty,
            circuitConstructionKitScreenView.circuitConstructionKitModel.exploreScreenRunningProperty
          ], function( current, resistance, exploreScreenRunning ) {
            self.fireNode.visible = showFire( current, exploreScreenRunning ) && resistance >= 1E-8;
          } );
        }
        else {

          // Show fire in all other circuit elements
          updateFireMultilink = Property.multilink( [
            circuitElement.currentProperty,
            circuitConstructionKitScreenView.circuitConstructionKitModel.exploreScreenRunningProperty
          ], function( current, exploreScreenRunning ) {
            self.fireNode.visible = showFire( current, exploreScreenRunning );
          } );
        }
      }
    }

    // @private - for disposal
    this.disposeFixedLengthCircuitElementNode = function() {

      // End drag event if it was in progress
      if ( self.inputListener && self.inputListener.dragging ) {
        self.inputListener.endDrag();
      }

      circuitElement.vertexMovedEmitter.removeListener( updateLayoutCallback );
      updateHighlightVisibility && circuitLayerNode.circuit.selectedCircuitElementProperty.unlink( updateHighlightVisibility );
      circuitElement.connectedEmitter.removeListener( moveToFront );
      circuitElement.vertexSelectedEmitter.removeListener( moveToFront );
      circuitElement.interactiveProperty.unlink( pickableListener );
      circuitLayerNode && CircuitConstructionKitCommonUtil.setInSceneGraph( false, circuitLayerNode.highlightLayer, self.highlightNode );
      viewProperty.unlink( viewPropertyListener );

      if ( !options.icon && updateFireMultilink ) {
        Property.unmultilink( updateFireMultilink );
      }
    };
  }

  circuitConstructionKitCommon.register( 'FixedLengthCircuitElementNode', FixedLengthCircuitElementNode );

  return inherit( CircuitElementNode, FixedLengthCircuitElementNode, {

    /**
     * Mark dirty to batch changes, so that update can be done once in view step, if necessary
     * @public
     */
    updateLayout: function() {
      this.dirty = true;
    },

    /**
     * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
     * @protected - CircuitConstructionKitLightBulbNode calls updateRender for its child socket node
     */
    updateRender: function() {

      var startPosition = this.circuitElement.startVertexProperty.get().positionProperty.get();
      var endPosition = this.circuitElement.endVertexProperty.get().positionProperty.get();
      var delta = endPosition.minus( startPosition );
      var angle = delta.angle();

      // Update the node transform in a single step, see #66
      CircuitConstructionKitCommonUtil.setToTranslationRotation( transform, startPosition, angle );
      this.contentNode.setMatrix( transform );
      this.highlightNode && this.highlightNode.setMatrix( transform ); // TODO: only update when visible

      // Update the fire transform
      var flameExtent = 0.8;
      var scale = delta.magnitude() / fireImage[ 0 ].width * flameExtent;
      var flameMargin = (1 - flameExtent) / 2;
      CircuitConstructionKitCommonUtil.setToTranslationRotation( transform, startPosition, angle )
        .multiplyMatrix( rotationMatrix.setToScale( scale ) )
        .multiplyMatrix( rotationMatrix.setToTranslation( delta.magnitude() * flameMargin / scale, -fireImage[ 0 ].height ) );
      this.fireNode && this.fireNode.setMatrix( transform ); // TODO: use setInSceneGraph for fire?
    },

    /**
     * @public - called during the view step
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
     */
    dispose: function() {
      CircuitElementNode.prototype.dispose.call( this );
      this.disposeFixedLengthCircuitElementNode();
    }
  }, {
    webglSpriteNodes: [
      new Image( fireImage )
    ]
  } );
} );