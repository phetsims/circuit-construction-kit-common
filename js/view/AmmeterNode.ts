// Copyright 2016-2023, University of Colorado Boulder

/**
 * The user interface component with a single probe which reads current values from Wires (not from Vertex or
 * FixedCircuitElement instances). Exists for the life of the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import ProbeNode from '../../../scenery-phet/js/ProbeNode.js';
import WireNode from '../../../scenery-phet/js/WireNode.js';
import { Color, DragListener, Image, Node, NodeOptions, Rectangle, Text, PressListenerEvent } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ammeterBody_png from '../../images/ammeterBody_png.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCUtils from '../CCKCUtils.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import ProbeTextNode from './ProbeTextNode.js';
import Ammeter from '../model/Ammeter.js';
import CircuitNode from './CircuitNode.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Property from '../../../axon/js/Property.js';
import ammeterReadoutTypeProperty from './ammeterReadoutTypeProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
import StringIO from '../../../tandem/js/types/StringIO.js';

const currentStringProperty = CircuitConstructionKitCommonStrings.currentStringProperty;

// constants
// measurements for the cubic curve for the wire nodes
const BODY_LEAD_Y = -30; // in model=view coordinates
const PROBE_LEAD_Y = 15; // in model=view coordinates
const HANDLE_WIDTH = 50;

// overall scale factor for the body and probe
const SCALE_FACTOR = 0.5;

// unsigned measurements for the circles on the voltmeter body image, for where the probe wires connect
const PROBE_CONNECTION_POINT_DY = 8;
type SelfOptions = {
  isIcon?: boolean;
  visibleBoundsProperty?: Property<Bounds2> | null;
  showResultsProperty?: BooleanProperty;
  blackBoxStudy?: boolean;
  showPhetioIndex?: boolean;
};
type AmmeterNodeOptions = SelfOptions & NodeOptions;

export default class AmmeterNode extends Node {
  private readonly probeNode: ProbeNode;

  // the model associated with this view
  public readonly ammeter: Ammeter;

  // so events can be forwarded from the toolbox
  private readonly dragHandler: DragListener | null;

  /**
   * @param ammeter
   * @param circuitNode - for getting the currents, or null if rendering an icon
   * @param [providedOptions]
   */
  public constructor( ammeter: Ammeter, circuitNode: CircuitNode | null, providedOptions?: AmmeterNodeOptions ) {
    const options = optionize<AmmeterNodeOptions, SelfOptions, NodeOptions>()( {

      // true if it will be used as a toolbox icon
      isIcon: false,

      // allowable drag bounds in view coordinates
      visibleBoundsProperty: null,

      // For some CCK Black Box modes, when the user makes a change, the results are hidden
      showResultsProperty: new BooleanProperty( true ),

      // For the black box study, there is a different current threshold in the readout
      blackBoxStudy: false,

      showPhetioIndex: false,

      phetioVisiblePropertyInstrumented: false,

      tandem: Tandem.REQUIRED
    }, providedOptions );
    const tandem = options.tandem;

    // if the AmmeterNode is an icon, do not instrument the details of the children
    const tandemForChildren = options.isIcon ? Tandem.OPT_OUT : tandem;

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

    const currentReadoutProperty = new DerivedProperty( [
        ammeter.currentProperty,
        ammeterReadoutTypeProperty,
        CircuitConstructionKitCommonStrings.currentUnitsStringProperty
      ],
      current => CCKCUtils.createCurrentReadout( current, options.blackBoxStudy ), {
        tandem: tandemForChildren.createTandem( 'probeReadoutText' ).createTandem( Text.STRING_PROPERTY_TANDEM_NAME ),
        phetioValueType: StringIO
      } );

    const probeTextProperty = new DerivedProperty( [ currentStringProperty ], currentString =>
        options.showPhetioIndex ? currentString + ' ' + ammeter.phetioIndex : currentString, {
        tandem: tandemForChildren.createTandem( 'probeTitleText' ).createTandem( Text.STRING_PROPERTY_TANDEM_NAME ),
        phetioValueType: StringIO
      }
    );

    const probeTextNode = new ProbeTextNode(
      currentReadoutProperty, options.showResultsProperty, probeTextProperty,

      // No need for an extra level of nesting in the tandem tree, since that is just an implementation detail
      // and not a feature
      tandemForChildren, {
        centerX: ammeterBody_png.width / 2,
        centerY: ammeterBody_png.height / 2 + 7 // adjust for the top notch design
      } );

    const bodyNode = new Image( ammeterBody_png, {
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

    assert && assert( !options.hasOwnProperty( 'children' ), 'children will be supplied by AmmeterNode' );

    options.children = [ bodyNode, wireNode, probeNode ];

    super( options );

    this.probeNode = probeNode;
    this.ammeter = ammeter;

    const alignProbeToBody = () => {
      if ( ammeter.isDraggingProbesWithBodyProperty.get() ) {

        const constrain = ( pt: Vector2 ) => options.visibleBoundsProperty ?
                                             options.visibleBoundsProperty.value.eroded( CCKCConstants.DRAG_BOUNDS_EROSION ).closestPointTo( pt ) :
                                             pt;

        ammeter.probePositionProperty.set( constrain( ammeter.bodyPositionProperty.value.plusXY( 40, -80 ) ) );
      }
    };

    // When the body position changes, update the body node and the wire
    ammeter.bodyPositionProperty.link( bodyPosition => {
      bodyNode.centerTop = bodyPosition;
      wireBodyPositionProperty.value = bodyNode.centerTop.plusXY( 0, PROBE_CONNECTION_POINT_DY );
      alignProbeToBody();
    } );

    // When the probe position changes, update the probe node and the wire
    ammeter.probePositionProperty.link( probePosition => {
      this.probeNode.centerTop = probePosition;
      wireProbePositionProperty.value = this.probeNode.centerBottom;
    } );

    if ( !options.isIcon ) {

      // Show the ammeter in the play area when dragged from toolbox
      ammeter.isActiveProperty.linkAttribute( this, 'visible' );
      ammeter.isActiveProperty.link( alignProbeToBody );

      const erodedDragBoundsProperty = new DerivedProperty( [ options.visibleBoundsProperty! ], visibleBounds => {
        return visibleBounds.eroded( CCKCConstants.DRAG_BOUNDS_EROSION );
      } );

      const probeDragHandler = new DragListener( {
        positionProperty: ammeter.probePositionProperty,
        useParentOffset: true,
        tandem: tandemForChildren.createTandem( 'probeDragHandler' ),
        start: () => this.moveToFront(),
        dragBoundsProperty: erodedDragBoundsProperty
      } );

      this.dragHandler = new DragListener( {
        useParentOffset: true,
        positionProperty: ammeter.bodyPositionProperty,
        tandem: tandemForChildren.createTandem( 'dragListener' ),
        start: () => this.moveToFront(),
        end: function() {
          ammeter.droppedEmitter.emit( bodyNode.globalBounds );

          // After dropping in the play area the probes move independently of the body
          ammeter.isDraggingProbesWithBodyProperty.set( false );
        },

        // adds support for zoomed coordinate frame, see
        // https://github.com/phetsims/circuit-construction-kit-common/issues/301
        targetNode: this,

        dragBoundsProperty: erodedDragBoundsProperty
      } );
      bodyNode.addInputListener( this.dragHandler );
      erodedDragBoundsProperty.link( erodedDragBounds => {
        ammeter.bodyPositionProperty.value = erodedDragBounds.closestPointTo( ammeter.bodyPositionProperty.value );
        ammeter.probePositionProperty.value = erodedDragBounds.closestPointTo( ammeter.probePositionProperty.value );
      } );
      this.probeNode.addInputListener( probeDragHandler );

      /**
       * Detection for ammeter probe + circuit intersection is done in the view since view bounds are used
       */
      const updateAmmeter = () => {

        // Skip work when ammeter is not out, to improve performance.
        if ( ammeter.isActiveProperty.get() ) {
          const ammeterConnection = circuitNode!.getCurrent( this.probeNode );
          ammeter.setConnectionAndCurrent( ammeterConnection );
        }
      };
      circuitNode!.circuit.circuitChangedEmitter.addListener( updateAmmeter );
      ammeter.probePositionProperty.link( updateAmmeter );
    }
    else {
      this.dragHandler = null;
    }

    // When rendered as an icon, the touch area should span the bounds (no gaps between probes and body)
    if ( options.isIcon ) {
      this.touchArea = this.bounds.copy();
      this.mouseArea = this.bounds.copy();
      this.cursor = 'pointer';
    }

    this.addLinkedElement( ammeter, {
      tandem: tandemForChildren.createTandem( 'ammeter' )
    } );
  }

  /**
   * Forward a drag from the toolbox to the play area node.
   */
  public startDrag( event: PressListenerEvent ): void {
    this.dragHandler && this.dragHandler.press( event );
  }
}

circuitConstructionKitCommon.register( 'AmmeterNode', AmmeterNode );