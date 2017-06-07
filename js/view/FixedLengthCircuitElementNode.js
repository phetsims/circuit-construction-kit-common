// Copyright 2015-2017, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

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
  var CCKMathUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKMathUtil' );

  // images
  var fireImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/fire.png' );

  // constants
  var transform = new Matrix3();
  var rotationMatrix = new Matrix3();

  /**
   * @param {CCKScreenView} circuitConstructionKitScreenView - so that the node can be dropped back into the toolbox
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

    // @public (read-only)
    this.circuitElement = circuitElement;

    // @protected (read-only) node that shows the component, separate from the part that shows the highlight and the fire
    this.contentNode = new Node();

    // Show the selected node
    var viewPropertyListener = function( view ) {
      self.contentNode.children = [ view === 'lifelike' ? lifelikeNode : schematicNode ];
    };
    viewProperty.link( viewPropertyListener );

    // Flag to indicate when updating view is necessary, in order to avoid duplicate work when both vertices move
    this.dirty = true;

    // Add highlight (but not for icons)
    if ( !options.icon ) {
      this.highlightNode = new FixedLengthCircuitElementHighlightNode( this, {} );
      circuitLayerNode.highlightLayer.addChild( this.highlightNode );
    }
    var updateLayoutCallabck = function() {
      self.updateLayout();
    };

    // Relink when start vertex changes
    circuitElement.vertexMovedEmitter.addListener( updateLayoutCallabck );

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
        tandem: tandem.createTandem( 'inputListener' ), // TODO (phet-io): some input listeners are 'dragHandler' let's be consistent
        start: function( event ) {
          startPoint = event.pointer.point;
          circuitElement.interactiveProperty.get() && circuitLayerNode.startDragVertex( event.pointer.point, circuitElement.endVertexProperty.get(), false );
          dragged = false;
        },
        drag: function( event ) {
          circuitElement.interactiveProperty.get() && circuitLayerNode.dragVertex( event.pointer.point, circuitElement.endVertexProperty.get(), false );
          dragged = true;
        },
        end: function( event ) {

          CircuitElementNode.prototype.endDrag.call( self, event, self.contentNode,
            [ circuitElement.endVertexProperty.get() ], circuitConstructionKitScreenView, circuitLayerNode, startPoint,
            dragged );
        }
      } );
      self.contentNode.addInputListener( this.inputListener );
    }

    if ( !options.icon ) {
      var updateSelectionHighlight = function( lastCircuitElement ) {
        var showHighlight = lastCircuitElement === circuitElement;
        self.highlightNode.visible = showHighlight;
      };
      circuitLayerNode.circuit.selectedCircuitElementProperty.link( updateSelectionHighlight );
    }

    if ( !options.icon && (circuitElement instanceof Battery || circuitElement instanceof Resistor) ) {
      this.fireNode = new Image( fireImage, { pickable: false, opacity: 0.95 } );
      this.fireNode.mutate( { scale: self.contentNode.width / this.fireNode.width } );
      this.addChild( this.fireNode );

      var showFire = function( current, exploreScreenRunning ) {
        return Math.abs( current ) >= 10 && exploreScreenRunning;
      };

      var updateFireMultilink = circuitElement instanceof Resistor ?

        // Show fire in resistors (but only if they have >0 resistance)
                                (Property.multilink( [
                                  circuitElement.currentProperty,
                                  circuitElement.resistanceProperty,
                                  circuitConstructionKitScreenView.circuitConstructionKitModel.exploreScreenRunningProperty
                                ], function( current, resistance, exploreScreenRunning ) {
                                  self.fireNode.visible = showFire( current, exploreScreenRunning ) && resistance >= 1E-8;
                                } )) :

        // Show fire in all other circuit elements
                                (Property.multilink( [
                                  circuitElement.currentProperty,
                                  circuitConstructionKitScreenView.circuitConstructionKitModel.exploreScreenRunningProperty
                                ], function( current, exploreScreenRunning ) {
                                  self.fireNode.visible = showFire( current, exploreScreenRunning );
                                } ));
    }

    // @private - for disposal
    this.disposeFixedLengthCircuitElementNode = function() {
      if ( self.inputListener && self.inputListener.dragging ) {
        self.inputListener.endDrag();
      }

      circuitElement.vertexMovedEmitter.removeListener( updateLayoutCallabck );

      updateSelectionHighlight && circuitLayerNode.circuit.selectedCircuitElementProperty.unlink( updateSelectionHighlight );

      circuitElement.connectedEmitter.removeListener( moveToFront );
      circuitElement.vertexSelectedEmitter.removeListener( moveToFront );

      circuitElement.interactiveProperty.unlink( pickableListener );

      circuitLayerNode && circuitLayerNode.highlightLayer.removeChild( self.highlightNode );

      viewProperty.unlink( viewPropertyListener );

      if ( !options.icon && circuitElement instanceof Battery ) {
        Property.unmultilink( updateFireMultilink );
      }
    };
  }

  circuitConstructionKitCommon.register( 'FixedLengthCircuitElementNode', FixedLengthCircuitElementNode );

  return inherit( CircuitElementNode, FixedLengthCircuitElementNode, {

    // Mark dirty to avoid duplicate work
    updateLayout: function() {
      this.dirty = true;
    },

    /**
     * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
     * @protected - CCKLightBulbNode calls updateRender for its child socket node
     */
    updateRender: function() {

      var startPosition = this.circuitElement.startVertexProperty.get().positionProperty.get();
      var endPosition = this.circuitElement.endVertexProperty.get().positionProperty.get();
      var delta = endPosition.minus( startPosition );
      var angle = delta.angle();

      // Update the node transform in a single step, see #66
      CCKMathUtil.setToTranslationRotation( transform, startPosition, angle );
      this.contentNode.setMatrix( transform );
      this.highlightNode && this.highlightNode.setMatrix( transform );

      // Update the fire transform
      var flameExtent = 0.8;
      var scale = delta.magnitude() / fireImage[ 0 ].width * flameExtent;
      var flameInset = (1 - flameExtent) / 2;
      CCKMathUtil.setToTranslationRotation( transform, startPosition, angle )
        .multiplyMatrix( rotationMatrix.setToScale( scale ) )
        .multiplyMatrix( rotationMatrix.setToTranslation( delta.magnitude() * flameInset / scale, -fireImage[ 0 ].height ) );
      this.fireNode && this.fireNode.setMatrix( transform );
    },

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
    HIGHLIGHT_INSET: 10
  } );
} );