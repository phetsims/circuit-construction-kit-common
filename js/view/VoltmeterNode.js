// Copyright 2016-2019, University of Colorado Boulder

/**
 * Displays the Voltmeter, which has 2 probes and detects potential differences. Exists for the life of the sim and
 * hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const CCKCQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCQueryParameters' );
  const CCKCUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCUtil' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Color = require( 'SCENERY/util/Color' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const Image = require( 'SCENERY/nodes/Image' );
  const merge = require( 'PHET_CORE/merge' );
  const MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  const Node = require( 'SCENERY/nodes/Node' );
  const ProbeTextNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ProbeTextNode' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );
  const WireNode = require( 'SCENERY_PHET/WireNode' );

  // images
  const blackProbe = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/probe-black.png' );
  const redProbe = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/probe-red.png' );
  const voltmeterBodyImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltmeter-body.png' );

  // strings
  const questionMarkString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/questionMark' );
  const voltageString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltage' );

  // constants
  const VOLTMETER_PROBE_TIP_LENGTH = 20; // The probe tip is about 20 view coordinates tall
  const VOLTMETER_NUMBER_SAMPLE_POINTS = 10; // Number of points along the edge of the voltmeter tip to detect voltages

  // unsigned measurements for the circles on the voltmeter body image, for where the probe wires connect
  const PROBE_CONNECTION_POINT_DY = -18;
  const PROBE_CONNECTION_POINT_DX = 8;

  const SCALE = 0.5; // overall scale factor for the nodes
  const PROBE_SCALE = 0.67 * SCALE; // multiplied by the SCALE above
  const PROBE_ANGLE = 22 * Math.PI * 2 / 360;

  class VoltmeterNode extends Node {

    /**
     * @param {Voltmeter} voltmeter - the model Voltmeter to be shown by this node
     * @param {CircuitConstructionKitModel} model
     * @param {CircuitLayerNode} circuitLayerNode
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( voltmeter, model, circuitLayerNode, tandem, options ) {

      options = merge( {

        // Whether this will be used as an icon or not.
        isIcon: false,

        // Draggable bounds
        visibleBoundsProperty: null,

        // Whether values can be displayed (hidden after user makes a change in some Black Box modes).
        showResultsProperty: new BooleanProperty( true )
      }, options );

      const blackProbeNode = new Rectangle( -2, -2, 4, 4, { // the hit area
        fill: CCKCQueryParameters.showVoltmeterSamplePoints ? Color.BLACK : null,
        cursor: 'pointer',
        children: [ new Image( blackProbe, {
          scale: PROBE_SCALE,
          rotation: PROBE_ANGLE,

          // Determined empirically by showing the probe hot spot and zooming in by a factor of 2 in
          // CircuitConstructionKitModel.  Will need to change if PROBE_ANGLE changes
          x: -9.5,
          y: -5
        } ) ]
      } );


      const redProbeNode = new Rectangle( -2, -2, 4, 4, { // the hit area
        fill: CCKCQueryParameters.showVoltmeterSamplePoints ? Color.RED : null,
        cursor: 'pointer',
        children: [ new Image( redProbe, {
          scale: PROBE_SCALE,
          rotation: -PROBE_ANGLE,

          // Determined empirically by showing the probe hot spot and zooming in by a factor of 2 in
          // CircuitConstructionKitModel.  Will need to change if PROBE_ANGLE changes
          x: -11,
          y: +4
        } ) ]
      } );

      // Displays the voltage reading
      const voltageReadoutProperty = new DerivedProperty( [ voltmeter.voltageProperty ], voltage =>
        voltage === null ? questionMarkString : CCKCUtil.createVoltageReadout( voltage )
      );

      const probeTextNode = new ProbeTextNode(
        voltageReadoutProperty, options.showResultsProperty, voltageString, tandem.createTandem( 'probeTextNode' ), {
          centerX: voltmeterBodyImage[ 0 ].width / 2,
          centerY: voltmeterBodyImage[ 0 ].height / 2
        } );

      const bodyNode = new Image( voltmeterBodyImage, {
        scale: SCALE,
        cursor: 'pointer',
        children: [ probeTextNode ]
      } );

      // TODO: Should this be factored out to a type, or perhaps WireNode should export these members?
      const blackWireBodyPositionProperty = new Vector2Property( new Vector2( 0, 0 ) );
      const blackWireProbePositionProperty = new Vector2Property( new Vector2( 0, 0 ) );
      const blackWireNode = new WireNode(
        blackWireBodyPositionProperty, new Vector2Property( new Vector2( -30, 15 ) ), // TODO: Factor out
        blackWireProbePositionProperty, new Vector2Property( new Vector2( -30, 60 ) ), {
          stroke: Color.BLACK,
          lineWidth: 3,
          pickable: false
        }
      );

      const redWireBodyPositionProperty = new Vector2Property( new Vector2( 0, 0 ) );
      const redWireProbePositionProperty = new Vector2Property( new Vector2( 0, 0 ) );
      const redWireNode = new WireNode(
        redWireBodyPositionProperty, new Vector2Property( new Vector2( 30, 15 ) ),
        redWireProbePositionProperty, new Vector2Property( new Vector2( 30, 60 ) ), {
          stroke: Color.RED,
          lineWidth: 3,
          pickable: false
        }
      );

      // When the voltmeter body moves, update the node and wires
      voltmeter.bodyPositionProperty.link( bodyPosition => {

        // Drag the body by the center
        bodyNode.center = bodyPosition;

        blackWireBodyPositionProperty.value = bodyNode.centerBottom.plusXY( -PROBE_CONNECTION_POINT_DX, PROBE_CONNECTION_POINT_DY );
        redWireBodyPositionProperty.value = bodyNode.centerBottom.plusXY( PROBE_CONNECTION_POINT_DX, PROBE_CONNECTION_POINT_DY );

        // When dragging out of the toolbox, the probes move with the body
        if ( voltmeter.draggingProbesWithBodyProperty.get() ) {
          const probeY = -30 - bodyNode.height / 2;
          const probeOffsetX = 78;
          voltmeter.redProbePositionProperty.set( bodyPosition.plusXY( +probeOffsetX, probeY ) );
          voltmeter.blackProbePositionProperty.set( bodyPosition.plusXY( -probeOffsetX, probeY ) );
        }
      } );

      /**
       * Creates listeners for the link function to update the probe node and wire when probe position changes.
       * @param {Node} probeNode
       * @param {Vector2Property} probePositionProperty
       * @param {number} sign
       * @returns {function}
       */
      const probeMovedCallback = ( probeNode, probePositionProperty, sign ) => {
        return probePosition => {
          probeNode.translation = probePosition;

          // Sampled manually, will need to change if probe angle changes
          probePositionProperty.value = probeNode.centerBottom.plusXY( 32 * sign, -4 );
        };
      };

      // When the probe moves, update the node and wire
      voltmeter.redProbePositionProperty.link( probeMovedCallback( redProbeNode, redWireProbePositionProperty, +1 ) );
      voltmeter.blackProbePositionProperty.link( probeMovedCallback( blackProbeNode, blackWireProbePositionProperty, -1 ) );

      super( {
        pickable: true,
        children: [
          bodyNode,

          blackWireNode,
          blackProbeNode,

          redWireNode,
          redProbeNode
        ]
      } );

      // @private {CircuitLayerNode}
      this.circuitLayerNode = circuitLayerNode;

      // @public (read-only) {Voltmeter} - the model
      this.voltmeter = voltmeter;

      // @public (read-only) {Rectangle} - the red probe node
      this.redProbeNode = redProbeNode;

      // @public (read-only) {Rectangle} - the black probe node
      this.blackProbeNode = blackProbeNode;

      // For the real version (not the icon), add drag listeners and update visibility
      if ( !options.isIcon ) {

        // Show the voltmeter when icon dragged out of the toolbox
        voltmeter.visibleProperty.linkAttribute( this, 'visible' );

        /**
         * Gets a drag handler for one of the probes.
         * @param {Property.<Vector2>} positionProperty
         * @param {Tandem} tandem
         * @returns {MovableDragHandler}
         */
        const getProbeDragHandler = ( positionProperty, tandem ) => {
          const probeDragHandler = new MovableDragHandler( positionProperty, {
            startDrag: () => this.moveToFront(),
            tandem: tandem.createTandem( 'probeDragHandler' )
          } );
          options.visibleBoundsProperty.link( visibleBounds => {
            probeDragHandler.dragBounds = visibleBounds.eroded( CCKCConstants.DRAG_BOUNDS_EROSION );
          } );
          return probeDragHandler;
        };

        const redProbeDragHandler = getProbeDragHandler( voltmeter.redProbePositionProperty, tandem.createTandem( 'redProbeDragHandler' ) );
        const blackProbeDragHandler = getProbeDragHandler( voltmeter.blackProbePositionProperty, tandem.createTandem( 'blackProbeDragHandler' ) );

        this.redProbeNode.addInputListener( redProbeDragHandler );
        this.blackProbeNode.addInputListener( blackProbeDragHandler );

        // @public (read-only) {MovableDragHandler} - so events can be forwarded from the toolbox
        this.dragHandler = new MovableDragHandler( voltmeter.bodyPositionProperty, {
          tandem: tandem.createTandem( 'dragHandler' ),
          startDrag: () => this.moveToFront(),
          endDrag: () => {
            voltmeter.droppedEmitter.emit( bodyNode.globalBounds );

            // After dropping in the play area the probes move independently of the body
            voltmeter.draggingProbesWithBodyProperty.set( false );

            redProbeDragHandler.constrainToBounds();
            blackProbeDragHandler.constrainToBounds();
          },

          // use this to do something every time drag is called, such as notify that a user has modified the position
          onDrag: event => {},

          // adds support for zoomed coordinate frame, see
          // https://github.com/phetsims/circuit-construction-kit-common/issues/301
          targetNode: this
        } );
        options.visibleBoundsProperty.link( visibleBounds => {
          this.dragHandler.dragBounds = visibleBounds.eroded( CCKCConstants.DRAG_BOUNDS_EROSION );
        } );
        bodyNode.addInputListener( this.dragHandler );

        /**
         * Starting at the tip, iterate down over several samples and return the first hit, if any.
         * @param {Node} probeNode
         * @param {Vector2} probeTip
         * @param {number} sign - the direction the probe is rotated
         * @returns {VoltageConnection|null} if connected returns VoltageConnection otherwise null
         */
        const findConnection = ( probeNode, probeTip, sign ) => {
          const probeTipVector = Vector2.createPolar( VOLTMETER_PROBE_TIP_LENGTH, sign * VoltmeterNode.PROBE_ANGLE + Math.PI / 2 );
          const probeTipTail = probeTip.plus( probeTipVector );
          for ( let i = 0; i < VOLTMETER_NUMBER_SAMPLE_POINTS; i++ ) {
            const samplePoint = probeTip.blend( probeTipTail, i / VOLTMETER_NUMBER_SAMPLE_POINTS );
            const voltageConnection = circuitLayerNode.getVoltageConnection( samplePoint );

            // For debugging, depict the points where the sampling happens
            if ( CCKCQueryParameters.showVoltmeterSamplePoints ) {

              // Note, these get erased when changing between lifelike/schematic
              this.circuitLayerNode.addChild( new Rectangle( -1, -1, 2, 2, {
                fill: Color.BLACK,
                translation: samplePoint
              } ) );
            }
            if ( voltageConnection ) {
              return voltageConnection;
            }
          }
          return null;
        };

        /**
         * Detection for voltmeter probe + circuit intersection is done in the view since view bounds are used
         */
        const updateVoltmeter = () => {
          if ( voltmeter.visibleProperty.get() ) {
            const blackConnection = findConnection( blackProbeNode, voltmeter.blackProbePositionProperty.get(), +1 );
            const redConnection = findConnection( redProbeNode, voltmeter.redProbePositionProperty.get(), -1 );

            // TODO: move to CircuitLayerNode or model
            const voltage = this.circuitLayerNode.getVoltage( redConnection, blackConnection );
            voltmeter.voltageProperty.set( voltage );
          }
        };
        model.circuit.circuitChangedEmitter.addListener( updateVoltmeter );
        voltmeter.redProbePositionProperty.link( updateVoltmeter );
        voltmeter.blackProbePositionProperty.link( updateVoltmeter );
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

  VoltmeterNode.PROBE_ANGLE = PROBE_ANGLE;

  return circuitConstructionKitCommon.register( 'VoltmeterNode', VoltmeterNode );
} );