// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Battery' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Resistor' );
  var Property = require( 'AXON/Property' );
  var TandemSimpleDragHandler = require( 'TANDEM/scenery/input/TandemSimpleDragHandler' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var CircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CircuitElementNode' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Color = require( 'SCENERY/util/Color' );
  var Image = require( 'SCENERY/nodes/Image' );
  var TNode = require( 'SCENERY/nodes/TNode' );

  // images
  var fireImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/fire.png' );

  /**
   * @param {CircuitConstructionKitScreenView} circuitConstructionKitScreenView
   * @param circuitNode - Null if an icon is created
   * @param circuitElement
   * @param {Node} lifelikeNode - the node that will display the component as a lifelike object
   * @param {Node} schematicNode - the node that will display the component
   * @param {number} contentScale - the scale factor to apply to the image for the size in the play area (icons are automatically scaled up)
   * @param {Tandem} tandem
   * @param options
   * @constructor
   */
  function FixedLengthCircuitElementNode( circuitConstructionKitScreenView, circuitNode, circuitElement, viewProperty,
                                          lifelikeNode, schematicNode, contentScale, tandem, options ) {
    assert && assert( lifelikeNode !== schematicNode, 'schematicNode should be different than lifelikeNode' );
    var self = this;

    var contentNode = new Node();

    contentNode.children = [ lifelikeNode, schematicNode ];
    viewProperty.link( function( view ) {
      lifelikeNode.visible = view === 'lifelike';
      schematicNode.visible = view !== 'lifelike';
    } );

    // Capture the original dimensions of the content node, without the highlight node
    var contentNodeHeight = contentNode.height;

    var highlightParent = new Node();

    var scratchMatrix = new Matrix3();
    var scratchMatrix2 = new Matrix3();
    options = _.extend( {
      icon: false,
      verticalOffset: 0,
      updateLayout: function( startPosition, endPosition ) {
        var delta = endPosition.minus( startPosition );
        var angle = delta.angle();

        // Update the node transform in a single step, see #66
        scratchMatrix.setToTranslation( startPosition.x, startPosition.y )
          .multiplyMatrix( scratchMatrix2.setToRotationZ( angle ) )
          .multiplyMatrix( scratchMatrix2.setToScale( contentScale ) )
          .multiplyMatrix( scratchMatrix2.setToTranslation( 0, -contentNodeHeight / 2 + options.verticalOffset ) );
        contentNode.setMatrix( scratchMatrix );
        highlightNode && highlightParent.setMatrix( scratchMatrix.copy() );

        // Update the fire transform
        var flameExtent = 0.8;
        var scale = delta.magnitude() / fireImage[ 0 ].width * flameExtent;
        var flameInset = (1 - flameExtent) / 2;
        scratchMatrix.setToTranslation( startPosition.x, startPosition.y )
          .multiplyMatrix( scratchMatrix2.setToRotationZ( angle ) )
          .multiplyMatrix( scratchMatrix2.setToScale( scale ) )
          .multiplyMatrix( scratchMatrix2.setToTranslation( delta.magnitude() * flameInset / scale, -fireImage[ 0 ].height ) );
        self.fireNode && self.fireNode.setMatrix( scratchMatrix.copy() );

        // Show the readout node above the center of the component.
        if ( readoutNode ) {
          readoutNode.center = contentNode.center.plusXY( 0, -30 );
        }
      },
      highlightOptions: {}
    }, options );

    // Add highlight (but not for icons)
    if ( circuitNode ) {
      var inset = -FixedLengthCircuitElementNode.HIGHLIGHT_INSET;
      var w = options.contentWidth || contentNode.width;
      var h = options.contentHeight || contentNode.height;
      var highlightNode = new Rectangle(
        inset,
        inset,
        w / contentScale - inset * 2,
        h / contentScale - inset * 2,
        8 / contentScale,
        8 / contentScale,
        _.extend( {
          stroke: CircuitConstructionKitConstants.HIGHLIGHT_COLOR,
          lineWidth: CircuitConstructionKitConstants.HIGHLIGHT_LINE_WIDTH / contentScale / contentScale,
          scale: contentScale,
          pickable: false
        }, options.highlightOptions )
      );

      highlightParent.children = [ highlightNode ];
      circuitNode.highlightLayer.addChild( highlightParent );

      this.highlightParent = highlightParent;
    }

    // Relink when start vertex changes
    var multilink = null;
    var relink = function() {
      multilink && multilink.dispose();
      multilink = Property.multilink( [
        circuitElement.startVertexProperty.get().positionProperty,
        circuitElement.endVertexProperty.get().positionProperty
      ], options.updateLayout );
    };
    relink();

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

    circuitElement.startVertexProperty.lazyLink( relink );
    circuitElement.endVertexProperty.lazyLink( relink );

    var circuit = circuitNode && circuitNode.circuit;
    CircuitElementNode.call( this, circuitElement, circuit, {
      cursor: 'pointer',
      children: [
        contentNode
      ]
    } );

    var pickableListener = function( interactive ) {
      self.pickable = interactive;
    };
    circuitElement.interactiveProperty.link( pickableListener );

    // Use whatever the start node currently is (it can change), and let the circuit manage the dependent vertices
    var p = null;
    var didDrag = false;
    if ( !options.icon ) {
      this.inputListener = new TandemSimpleDragHandler( {
        allowTouchSnag: true,
        tandem: tandem.createTandem( 'inputListener' ), // TODO: some input listeners are 'dragHandler' let's be consistent
        start: function( event ) {
          p = event.pointer.point;
          circuitElement.interactiveProperty.get() && circuitNode.startDrag( event.pointer.point, circuitElement.endVertexProperty.get(), false );
          didDrag = false;
        },
        drag: function( event ) {
          circuitElement.interactiveProperty.get() && circuitNode.drag( event.pointer.point, circuitElement.endVertexProperty.get(), false );
          didDrag = true;
        },
        end: function( event ) {

          if ( !circuitElement.interactiveProperty.get() ) {
            // nothing to do
          }
          else if ( circuitConstructionKitScreenView.canNodeDropInToolbox( self ) ) {

            var creationTime = self.circuitElement.creationTime;
            var lifetime = phet.joist.elapsedTime - creationTime;
            var delayMS = Math.max( 500 - lifetime, 0 );

            // If over the toolbox, then drop into it, and don't process further
            contentNode.removeInputListener( self.inputListener );

            setTimeout( function() {
              circuitConstructionKitScreenView.dropCircuitElementNodeInToolbox( self );
            }, delayMS );
          }
          else {

            circuitNode.endDrag( event, circuitElement.endVertexProperty.get(), didDrag );

            // Only show the editor when tapped, not on every drag.  Also, event could be undefined if this end() was triggered
            // by dispose()
            event && self.maybeSelect( event, circuitNode, p );

            didDrag = false;
          }
        }
      } );
      contentNode.addInputListener( this.inputListener );
    }

    if ( circuitNode ) {
      var updateSelectionHighlight = function( lastCircuitElement ) {
        var showHighlight = lastCircuitElement === circuitElement;
        highlightNode.visible = showHighlight;
      };
      circuitNode.circuit.selectedCircuitElementProperty.link( updateSelectionHighlight );
    }

    // Show values for components inside the black box when "reveal" is pressed.
    if ( circuitElement.insideTrueBlackBoxProperty.value ) {
      var textNode = new Text( 'readout', { fontSize: 20, maxWidth: 50 } );
      circuitElement.resistanceProperty && circuitElement.resistanceProperty.link( function( resistance ) {
        textNode.text = resistance + ' Ω';
      } );
      circuitElement.voltageProperty && circuitElement.voltageProperty.link( function( voltage ) {
        textNode.text = voltage + ' V';
      } );
      var readoutNode = new Panel( textNode, {
        stroke: null,
        fill: new Color( 255, 255, 255, 0.8 ),
        pickable: false
      } );
      this.addChild( readoutNode );
    }

    if ( !options.icon && (circuitElement instanceof Battery || circuitElement instanceof Resistor) ) {
      this.fireNode = new Image( fireImage, { pickable: false, opacity: 0.95 } );
      this.fireNode.mutate( { scale: contentNode.width / this.fireNode.width } );
      this.addChild( this.fireNode );

      // TODO: multilink?
      var updateFire = function() {
        var current = circuitElement.currentProperty.get();
        var lowResistanceResistor = circuitElement instanceof Resistor && circuitElement.resistanceProperty.get() < 1E-8;
        self.fireNode.visible = Math.abs( current ) >= 10 && !lowResistanceResistor && circuitConstructionKitScreenView.circuitConstructionKitModel.exploreScreenRunningProperty.get();
      };
      circuitElement.currentProperty.link( updateFire );
      circuitConstructionKitScreenView.circuitConstructionKitModel.exploreScreenRunningProperty.link( updateFire );
    }

    // Update after the highlight/readout/fire exist
    options.updateLayout(
      circuitElement.startVertexProperty.get().positionProperty.get(),
      circuitElement.endVertexProperty.get().positionProperty.get()
    );

    this.disposeFixedLengthCircuitElementNode = function() {
      if ( self.inputListener && self.inputListener.dragging ) {
        self.inputListener.endDrag();
      }
      multilink && multilink.dispose();
      multilink = null; // Mark null so it doesn't get disposed again in relink()

      updateSelectionHighlight && circuitNode.circuit.selectedCircuitElementProperty.unlink( updateSelectionHighlight );

      circuitElement.connectedEmitter.removeListener( moveToFront );
      circuitElement.vertexSelectedEmitter.removeListener( moveToFront );

      circuitElement.interactiveProperty.unlink( pickableListener );

      circuitNode && circuitNode.highlightLayer.removeChild( highlightParent );

      circuitElement.startVertexProperty.unlink( relink );
      circuitElement.endVertexProperty.unlink( relink );

      tandem.removeInstance( self );
      if ( !options.icon && circuitElement instanceof Battery ) {
        circuitElement.currentProperty.unlink( updateFire );
        circuitConstructionKitScreenView.circuitConstructionKitModel.exploreScreenRunningProperty.unlink( updateFire );
      }
    };

    tandem.addInstance( this, TNode );
  }

  circuitConstructionKitCommon.register( 'FixedLengthCircuitElementNode', FixedLengthCircuitElementNode );

  return inherit( CircuitElementNode, FixedLengthCircuitElementNode, {
    dispose: function() {
      this.disposeFixedLengthCircuitElementNode();
      CircuitElementNode.prototype.dispose.call( this );
    }
  }, {
    HIGHLIGHT_INSET: 10
  } );
} );
