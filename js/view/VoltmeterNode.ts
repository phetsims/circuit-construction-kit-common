// Copyright 2016-2021, University of Colorado Boulder

/**
 * Displays the Voltmeter, which has 2 probes and detects potential differences. Exists for the life of the sim and
 * hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import merge from '../../../phet-core/js/merge.js';
import WireNode from '../../../scenery-phet/js/WireNode.js';
import { DragListener } from '../../../scenery/js/imports.js';
import { Image } from '../../../scenery/js/imports.js';
import { Node } from '../../../scenery/js/imports.js';
import { Rectangle } from '../../../scenery/js/imports.js';
import { Color } from '../../../scenery/js/imports.js';
import probeBlackImage from '../../mipmaps/probe-black_png.js';
import probeRedImage from '../../mipmaps/probe-red_png.js';
import voltmeterBodyImage from '../../mipmaps/voltmeter-body_png.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import CCKCUtils from '../CCKCUtils.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import ProbeTextNode from './ProbeTextNode.js';
import Voltmeter from '../model/Voltmeter.js';
import CircuitConstructionKitModel from '../model/CircuitConstructionKitModel.js';
import CircuitLayerNode from './CircuitLayerNode.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';

const voltageString = circuitConstructionKitCommonStrings.voltage;

// constants
const VOLTMETER_PROBE_TIP_LENGTH = 20; // The probe tip is about 20 view coordinates tall
const VOLTMETER_NUMBER_SAMPLE_POINTS = 10; // Number of points along the edge of the voltmeter tip to detect voltages

// unsigned measurements for the circles on the voltmeter body image, for where the probe wires connect
const PROBE_CONNECTION_POINT_DY = -18;
const PROBE_CONNECTION_POINT_DX = 8;

const SCALE = 0.5; // overall scale factor for the nodes
const PROBE_SCALE = 0.67 * SCALE; // multiplied by the SCALE above
const PROBE_ANGLE = 22 * Math.PI * 2 / 360;

const CONTROL_POINT_X = 30;
const CONTROL_POINT_Y1 = 15;
const CONTROL_POINT_Y2 = 60;

class VoltmeterNode extends Node {
  private readonly circuitLayerNode: CircuitLayerNode | null;
  readonly voltmeter: Voltmeter;
  private readonly redProbeNode: Rectangle;
  private readonly blackProbeNode: Rectangle;
  private readonly dragHandler: DragListener | null;
  static PROBE_ANGLE: number;

  /**
   * @param {Voltmeter} voltmeter - the model Voltmeter to be shown by this node
   * @param {CircuitConstructionKitModel} model
   * @param {CircuitLayerNode} circuitLayerNode
   * @param {Tandem} tandem
   * @param {Object} [providedOptions]
   */
  constructor( voltmeter: Voltmeter, model: CircuitConstructionKitModel | null, circuitLayerNode: CircuitLayerNode | null,
               tandem: Tandem, providedOptions?: any ) {

    providedOptions = merge( {

      // Whether this will be used as an icon or not.
      isIcon: false,

      // Draggable bounds
      visibleBoundsProperty: null,

      // Whether values can be displayed (hidden after user makes a change in some Black Box modes).
      showResultsProperty: new BooleanProperty( true )
    }, providedOptions );

    const blackProbeNode = new Rectangle( -2, -2, 4, 4, { // the hit area
      fill: CCKCQueryParameters.showVoltmeterSamplePoints ? Color.BLACK : null,
      cursor: 'pointer',
      children: [ new Image( probeBlackImage, {
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
      children: [ new Image( probeRedImage, {
        scale: PROBE_SCALE,
        rotation: -PROBE_ANGLE,

        // Determined empirically by showing the probe hot spot and zooming in by a factor of 2 in
        // CircuitConstructionKitModel.  Will need to change if PROBE_ANGLE changes
        x: -11,
        y: +4
      } ) ]
    } );

    // Displays the voltage reading
    const voltageReadoutProperty = new DerivedProperty( [ voltmeter.voltageProperty ], ( voltage: number | null ) =>
      voltage === null ? MathSymbols.NO_VALUE : CCKCUtils.createVoltageReadout( voltage )
    );

    const probeTextNode = new ProbeTextNode(
      voltageReadoutProperty, providedOptions.showResultsProperty, voltageString, tandem.createTandem( 'probeTextNode' ), {
        centerX: voltmeterBodyImage[ 0 ].width / 2,
        centerY: voltmeterBodyImage[ 0 ].height / 2
      } );

    const bodyNode = new Image( voltmeterBodyImage, {
      scale: SCALE,
      cursor: 'pointer',
      children: [ probeTextNode ]
    } );

    /**
     * Creates a Vector2Property with a new Vector2 at the specified position.
     * @param {number} [x]
     * @param {number} [y]
     */
    const createVector2Property = function( x = 0, y = 0 ) {
      return new Vector2Property( new Vector2( x, y ) );
    };

    const blackWireBodyPositionProperty = createVector2Property();
    const blackWireProbePositionProperty = createVector2Property();
    const blackWireNode = new WireNode(
      blackWireBodyPositionProperty, createVector2Property( -CONTROL_POINT_X, CONTROL_POINT_Y1 ),
      blackWireProbePositionProperty, createVector2Property( -CONTROL_POINT_X, CONTROL_POINT_Y2 ), {
        stroke: Color.BLACK,
        lineWidth: 3,
        pickable: false
      }
    );

    const redWireBodyPositionProperty = createVector2Property();
    const redWireProbePositionProperty = createVector2Property();
    const redWireNode = new WireNode(
      redWireBodyPositionProperty, createVector2Property( CONTROL_POINT_X, CONTROL_POINT_Y1 ),
      redWireProbePositionProperty, createVector2Property( CONTROL_POINT_X, CONTROL_POINT_Y2 ), {
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

        const constrain = ( pt: Vector2 ) => providedOptions.visibleBoundsProperty ?
                                             providedOptions.visibleBoundsProperty.value.eroded( CCKCConstants.DRAG_BOUNDS_EROSION ).closestPointTo( pt ) :
                                             pt;

        voltmeter.redProbePositionProperty.set( constrain( bodyPosition.plusXY( +probeOffsetX, probeY ) ) );
        voltmeter.blackProbePositionProperty.set( constrain( bodyPosition.plusXY( -probeOffsetX, probeY ) ) );
      }
    } );

    /**
     * Creates listeners for the link function to update the probe node and wire when probe position changes.
     * @param {Node} probeNode
     * @param {Vector2Property} probePositionProperty
     * @param {number} sign
     * @returns {function}
     */
    const probeMovedCallback = ( probeNode: Node, probePositionProperty: Vector2Property, sign: number ) => {
      return ( probePosition: Vector2 ) => {
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
      tandem: tandem,
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
    if ( !providedOptions.isIcon ) {

      // Show the voltmeter when icon dragged out of the toolbox
      voltmeter.visibleProperty.linkAttribute( this, 'visible' );

      /**
       * Gets a drag handler for one of the probes.
       * @param {Property.<Vector2>} positionProperty
       * @param {Tandem} tandem
       * @returns {MovableDragHandler}
       */
      const createProbeDragListener = ( positionProperty: Vector2Property, tandem: Tandem ) => {
        const probeDragListener = new DragListener( {
          positionProperty: positionProperty,
          start: () => this.moveToFront(),
          tandem: tandem.createTandem( 'probeDragListener' )
        } );
        providedOptions.visibleBoundsProperty.link( ( visibleBounds: Bounds2 ) => {
          probeDragListener.dragBounds = visibleBounds.eroded( CCKCConstants.DRAG_BOUNDS_EROSION );
        } );
        return probeDragListener;
      };

      const redProbeDragListener = createProbeDragListener( voltmeter.redProbePositionProperty, tandem.createTandem( 'redProbeDragListener' ) );
      const blackProbeDragListener = createProbeDragListener( voltmeter.blackProbePositionProperty, tandem.createTandem( 'blackProbeDragListener' ) );

      this.redProbeNode.addInputListener( redProbeDragListener );
      this.blackProbeNode.addInputListener( blackProbeDragListener );

      // @public (read-only) {MovableDragHandler} - so events can be forwarded from the toolbox
      this.dragHandler = new DragListener( {

        positionProperty: voltmeter.bodyPositionProperty,
        tandem: tandem.createTandem( 'dragHandler' ),
        useParentOffset: true,
        start: ( event: any ) => {
          this.moveToFront();
        },
        end: () => {
          voltmeter.droppedEmitter.emit( bodyNode.globalBounds );

          // After dropping in the play area the probes move independently of the body
          voltmeter.draggingProbesWithBodyProperty.set( false );
        },

        // adds support for zoomed coordinate frame, see
        // https://github.com/phetsims/circuit-construction-kit-common/issues/301
        targetNode: this
      } );
      providedOptions.visibleBoundsProperty.link( ( visibleBounds: Bounds2 ) => {
        const erodedBounds = visibleBounds.eroded( CCKCConstants.DRAG_BOUNDS_EROSION );
        this.dragHandler!.dragBounds = erodedBounds;

        voltmeter.redProbePositionProperty.set( erodedBounds.closestPointTo( voltmeter.redProbePositionProperty.value ) );
        voltmeter.blackProbePositionProperty.set( erodedBounds.closestPointTo( voltmeter.blackProbePositionProperty.value ) );
        voltmeter.bodyPositionProperty.set( erodedBounds.closestPointTo( voltmeter.bodyPositionProperty.value ) );
      } );
      bodyNode.addInputListener( this.dragHandler );

      /**
       * Starting at the tip, iterate down over several samples and return the first hit, if any.
       * @param {Node} probeNode
       * @param {Vector2} probeTip
       * @param {number} sign - the direction the probe is rotated
       * @returns {VoltageConnection|null} if connected returns VoltageConnection otherwise null
       */
      const findConnection = ( probeNode: Node, probeTip: Vector2, sign: number ) => {
        const probeTipVector = Vector2.createPolar( VOLTMETER_PROBE_TIP_LENGTH, sign * VoltmeterNode.PROBE_ANGLE + Math.PI / 2 );
        const probeTipTail = probeTip.plus( probeTipVector );
        for ( let i = 0; i < VOLTMETER_NUMBER_SAMPLE_POINTS; i++ ) {
          const samplePoint = probeTip.blend( probeTipTail, i / VOLTMETER_NUMBER_SAMPLE_POINTS );
          const voltageConnection = circuitLayerNode!.getVoltageConnection( samplePoint );

          // For debugging, depict the points where the sampling happens
          if ( CCKCQueryParameters.showVoltmeterSamplePoints ) {

            // Note, these get erased when changing between lifelike/schematic
            this.circuitLayerNode!.addChild( new Rectangle( -1, -1, 2, 2, {
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
          const voltage = this.circuitLayerNode!.circuit.getVoltageBetweenConnections( redConnection, blackConnection, false );
          voltmeter.voltageProperty.value = voltage;
        }
      };
      model!.circuit.circuitChangedEmitter.addListener( updateVoltmeter );
      voltmeter.redProbePositionProperty.link( updateVoltmeter );
      voltmeter.blackProbePositionProperty.link( updateVoltmeter );
    }
    else {
      this.dragHandler = null;
    }

    // When rendered as an icon, the touch area should span the bounds (no gaps between probes and body)
    if ( providedOptions.isIcon ) {
      this.touchArea = this.bounds.copy();
      this.mouseArea = this.bounds.copy();
      this.cursor = 'pointer';
    }
  }

  /**
   * Forward a drag from the toolbox to the play area node.
   * @param {SceneryEvent} event
   * @public
   */
  startDrag( event: any ) {
    this.dragHandler!.press( event );
  }
}

// @public {number}
VoltmeterNode.PROBE_ANGLE = PROBE_ANGLE;

circuitConstructionKitCommon.register( 'VoltmeterNode', VoltmeterNode );
export default VoltmeterNode;
