// Copyright 2016-2019, University of Colorado Boulder

/**
 * The user interface component with a single probe which reads current values from Wires (not from Vertex or
 * FixedCircuitElement instances). Exists for the life of the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const CCKCUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCUtil' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Color = require( 'SCENERY/util/Color' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const Image = require( 'SCENERY/nodes/Image' );
  const merge = require( 'PHET_CORE/merge' );
  const MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  const Node = require( 'SCENERY/nodes/Node' );
  const ProbeNode = require( 'SCENERY_PHET/ProbeNode' );
  const ProbeTextNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ProbeTextNode' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );
  const WireNode = require( 'SCENERY_PHET/WireNode' );

  // images
  const ammeterBodyImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/ammeter-body.png' );

  // strings
  const currentString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/current' );
  const questionMarkString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/questionMark' );

  // constants
  // measurements for the cubic curve for the wire nodes
  const BODY_LEAD_Y = -30; // in model=view coordinates
  const PROBE_LEAD_Y = 15; // in model=view coordinates
  const HANDLE_WIDTH = 50;

  // overall scale factor for the body and probe
  const SCALE_FACTOR = 0.5;

  // unsigned measurements for the circles on the voltmeter body image, for where the probe wires connect
  const PROBE_CONNECTION_POINT_DY = 8;

  class AmmeterNode extends Node {

    /**
     * @param {Ammeter} ammeter
     * @param {CircuitLayerNode|null} circuitLayerNode - for getting the currents, or null if rendering an icon
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( ammeter, circuitLayerNode, tandem, options ) {
      options = merge( {

        // true if it will be used as a toolbox icon
        isIcon: false,

        // allowable drag bounds in view coordinates
        visibleBoundsProperty: null,

        // For some CCK Black Box modes, when the user makes a change, the results are hidden
        showResultsProperty: new BooleanProperty( true ),

        // For the black box study, there is a different current threshold in the readout
        blackBoxStudy: false
      }, options );

      // TODO: Should this be factored out to a type?  Or maybe WireNode should provide access to its parts?
      const wireBodyPositionProperty = new Vector2Property( new Vector2( 0, 0 ) );
      const wireProbePositionProperty = new Vector2Property( new Vector2( 0, 0 ) );
      const wireNode = new WireNode(
        wireBodyPositionProperty,
        new Vector2Property( new Vector2( 0, BODY_LEAD_Y ) ),
        wireProbePositionProperty,
        new Vector2Property( new Vector2( 0, PROBE_LEAD_Y ) ), {
          stroke: Color.BLACK,
          lineWidth: 3,
          pickable: false
        }
      );

      const currentReadoutProperty = new DerivedProperty( [ ammeter.currentProperty ], function( current ) {

        const max = options.blackBoxStudy ? 1E3 : 1E10;
        const maxString = options.blackBoxStudy ? '> 10^3' : '> 10^10';

        // Ammeters in this sim only show positive values, not direction (which is arbitrary anyways)
        return current === null ? questionMarkString :
               Math.abs( current ) > max ? maxString :
               CCKCUtil.createCurrentReadout( current );
      } );

      const probeTextNode = new ProbeTextNode(
        currentReadoutProperty, options.showResultsProperty, currentString, tandem.createTandem( 'probeTextNode' ), {
          centerX: ammeterBodyImage.width / 2,
          centerY: ammeterBodyImage.height / 2 + 7 // adjust for the top notch design
        } );

      const bodyNode = new Image( ammeterBodyImage, {
        scale: SCALE_FACTOR,
        cursor: 'pointer',
        children: [ probeTextNode ]
      } );

      const probeNode = new ProbeNode( {
        cursor: 'pointer',
        sensorTypeFunction: ProbeNode.crosshairs(),
        scale: SCALE_FACTOR,
        handleWidth: HANDLE_WIDTH,
        color: '#2c2c2b', // The dark gray border
        innerRadius: 43,

        // Add a decoration on the handle to match the color scheme
        children: [
          new Rectangle( 0, 52, HANDLE_WIDTH * 0.72, 19, {
            cornerRadius: 6,
            centerX: 0,
            fill: '#e79547' // Match the orange of the ammeter image
          } )
        ]
      } );

      super( { children: [ bodyNode, wireNode, probeNode ] } );

      // TODO: Annotation
      this.circuitLayerNode = circuitLayerNode;

      // @public (read-only) {ProbeNode}
      this.probeNode = probeNode;

      // @public (read-only) {Ammeter} - the model associated with this view
      this.ammeter = ammeter;

      // When the body position changes, update the body node and the wire
      ammeter.bodyPositionProperty.link( bodyPosition => {
        bodyNode.centerTop = bodyPosition;
        wireBodyPositionProperty.value = bodyNode.centerTop.plusXY( 0, PROBE_CONNECTION_POINT_DY );
        if ( ammeter.draggingProbesWithBodyProperty.get() ) {
          ammeter.probePositionProperty.set( bodyPosition.plusXY( 40, -80 ) );
        }
      } );

      // When the probe position changes, update the probe node and the wire
      ammeter.probePositionProperty.link( probePosition => {
        this.probeNode.centerTop = probePosition;
        wireProbePositionProperty.value = this.probeNode.centerBottom;
      } );

      if ( !options.isIcon ) {

        // Show the ammeter in the play area when dragged from toolbox
        ammeter.visibleProperty.linkAttribute( this, 'visible' );

        const probeDragHandler = new MovableDragHandler( ammeter.probePositionProperty, {
          tandem: tandem.createTandem( 'probeDragHandler' ),
          startDrag: () => this.moveToFront()
        } );

        // @public (read-only) {MovableDragHandler} - so events can be forwarded from the toolbox
        this.dragHandler = new MovableDragHandler( ammeter.bodyPositionProperty, {
          tandem: tandem.createTandem( 'dragHandler' ),
          startDrag: () => this.moveToFront(),
          endDrag: function() {
            ammeter.droppedEmitter.emit( bodyNode.globalBounds );

            // After dropping in the play area the probes move independently of the body
            ammeter.draggingProbesWithBodyProperty.set( false );

            probeDragHandler.constrainToBounds();
          },

          // adds support for zoomed coordinate frame, see
          // https://github.com/phetsims/circuit-construction-kit-common/issues/301
          targetNode: this
        } );
        bodyNode.addInputListener( this.dragHandler );
        options.visibleBoundsProperty.link( visibleBounds => {
          const erodedDragBounds = visibleBounds.eroded( CCKCConstants.DRAG_BOUNDS_EROSION );
          this.dragHandler.dragBounds = erodedDragBounds;
          probeDragHandler.dragBounds = erodedDragBounds;
        } );
        this.probeNode.addInputListener( probeDragHandler );

        /**
         * Detection for ammeter probe + circuit intersection is done in the view since view bounds are used
         */
        const updateAmmeter = () => {

          // Skip work when ammeter is not out, to improve performance.
          if ( ammeter.visibleProperty.get() ) {
            const current = this.circuitLayerNode.getCurrent( this.probeNode );
            ammeter.currentProperty.set( current );
          }
        };
        circuitLayerNode.circuit.circuitChangedEmitter.addListener( updateAmmeter );
        ammeter.probePositionProperty.link( updateAmmeter );
      }

      // When rendered as an icon, the touch area should span the bounds (no gaps between probes and body)
      if ( options.isIcon ) {
        this.touchArea = this.bounds.copy();
        this.mouseArea = this.bounds.copy();
        this.cursor = 'pointer';
      }
    }

    /**
     * Forward a drag from the toolbox to the play area node.
     * @param {Event} event
     */
    startDrag( event ) {
      this.dragHandler.startDrag( event );
    }
  }

  return circuitConstructionKitCommon.register( 'AmmeterNode', AmmeterNode );
} );