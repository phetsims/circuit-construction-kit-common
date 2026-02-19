// Copyright 2016-2026, University of Colorado Boulder

/**
 * Displays the Voltmeter, which has 2 probes and detects potential differences. Exists for the life of the sim and
 * hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import DerivedStringProperty from '../../../axon/js/DerivedStringProperty.js';
import Multilink from '../../../axon/js/Multilink.js';
import type ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import type Bounds2 from '../../../dot/js/Bounds2.js';
import { toFixed } from '../../../dot/js/util/toFixed.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import AccessibleInteractiveOptions from '../../../scenery-phet/js/accessibility/AccessibleInteractiveOptions.js';
import AccessibleDraggableOptions from '../../../scenery-phet/js/accessibility/grab-drag/AccessibleDraggableOptions.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import SoundKeyboardDragListener from '../../../scenery-phet/js/SoundKeyboardDragListener.js';
import WireNode from '../../../scenery-phet/js/WireNode.js';
import HighlightFromNode from '../../../scenery/js/accessibility/HighlightFromNode.js';
import InteractiveHighlighting from '../../../scenery/js/accessibility/voicing/InteractiveHighlighting.js';
import DragListener from '../../../scenery/js/listeners/DragListener.js';
import { type PressListenerEvent } from '../../../scenery/js/listeners/PressListener.js';
import Image from '../../../scenery/js/nodes/Image.js';
import { ImageableImage } from '../../../scenery/js/nodes/Imageable.js';
import Node, { type NodeOptions } from '../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import ParallelDOM from '../../../scenery/js/accessibility/pdom/ParallelDOM.js';
import Color from '../../../scenery/js/util/Color.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import Tandem from '../../../tandem/js/Tandem.js';
import probeBlack_png from '../../mipmaps/probeBlack_png.js';
import probeRed_png from '../../mipmaps/probeRed_png.js';
import voltmeterBody_png from '../../mipmaps/voltmeterBody_png.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import CCKCUtils from '../CCKCUtils.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import type CircuitConstructionKitModel from '../model/CircuitConstructionKitModel.js';
import type Voltmeter from '../model/Voltmeter.js';
import type CircuitNode from './CircuitNode.js';
import VoltmeterProbeNodeAttachmentKeyboardListener from './input/VoltmeterProbeNodeAttachmentKeyboardListener.js';
import ProbeTextNode from './ProbeTextNode.js';

const voltageStringProperty = CircuitConstructionKitCommonFluent.voltageStringProperty;

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

// Local classes with InteractiveHighlighting for the draggable components
class InteractiveHighlightingRectangle extends InteractiveHighlighting( Rectangle ) {}

const InteractiveHighlightingImage = InteractiveHighlighting( Image );

/**
 * The body node for the voltmeter, with typed properties for identification in hit testing.
 */
export class VoltmeterBodyNode extends InteractiveHighlightingImage {
  public readonly isVoltmeterBodyNode = true;
  public readonly voltmeter: Voltmeter;

  public constructor( image: ImageableImage, voltmeter: Voltmeter, options?: NodeOptions ) {
    super( image, options );
    this.voltmeter = voltmeter;
  }
}

type SelfOptions = {
  visibleBoundsProperty?: ReadOnlyProperty<Bounds2> | null;
  showResultsProperty?: ReadOnlyProperty<boolean>;
  showPhetioIndex?: boolean;
};
type VoltmeterNodeOptions = SelfOptions & NodeOptions;

export default class VoltmeterNode extends InteractiveHighlighting( Node ) {
  private readonly circuitNode: CircuitNode | null;
  public readonly voltmeter: Voltmeter;
  public readonly bodyNode: Node;
  public readonly redProbeNode: Rectangle | InteractiveHighlightingRectangle;
  public readonly blackProbeNode: Rectangle | InteractiveHighlightingRectangle;

  // so events can be forwarded from the toolbox
  private readonly dragHandler: DragListener | null;
  public static readonly PROBE_ANGLE = PROBE_ANGLE;

  public constructor(
    voltmeter: Voltmeter,
    model: CircuitConstructionKitModel | null,
    circuitNode: CircuitNode | null,
    isIcon: boolean,
    providedOptions?: VoltmeterNodeOptions ) {

    // Create a dynamic heading that shows "Voltmeter" when only one is active,
    // or "Voltmeter X of 2" when both are active
    const numberedHeadingProperty = model ? CircuitConstructionKitCommonFluent.a11y.voltmeterNode.accessibleHeadingNumbered.createProperty( {
      position: voltmeter.phetioIndex,
      total: model.voltmeters.length
    } ) : null;

    const accessibleHeadingProperty = model ? new DerivedStringProperty(
      [
        model.voltmeters[ 0 ].isActiveProperty,
        model.voltmeters[ 1 ].isActiveProperty,
        CircuitConstructionKitCommonFluent.a11y.voltmeterNode.accessibleHeadingStringProperty,
        numberedHeadingProperty!
      ],
      ( isActive0, isActive1, simpleHeading, numberedHeading ) => {
        const activeCount = ( isActive0 ? 1 : 0 ) + ( isActive1 ? 1 : 0 );
        return activeCount > 1 ? numberedHeading : simpleHeading;
      }
    ) : CircuitConstructionKitCommonFluent.a11y.voltmeterNode.accessibleHeadingStringProperty;

    const options = optionize<VoltmeterNodeOptions, SelfOptions, NodeOptions>()( {

      tandem: Tandem.REQUIRED,

      pickable: true,

      // Draggable bounds
      visibleBoundsProperty: null,

      // Whether values can be displayed (hidden after user makes a change in some Black Box modes).
      showResultsProperty: new BooleanProperty( true ),

      // Whether the phet-io index of the meter appears in the label
      showPhetioIndex: false,

      // Instrumentation is handled in Meter.isActiveProperty
      phetioVisiblePropertyInstrumented: false
    }, providedOptions );

    // Only add PDOM structure for non-icons (icons are just toolbox buttons)
    if ( !isIcon ) {
      options.tagName = 'div';
      options.accessibleHeading = accessibleHeadingProperty;
      options.accessibleHelpTextBehavior = ParallelDOM.HELP_TEXT_BEFORE_CONTENT;
    }

    /**
     * Creates a probe node with the specified configuration. Uses InteractiveHighlightingRectangle for
     * non-icons to support mouse/touch hover highlights.
     */
    const createProbeNode = ( color: Color, image: ImageableImage, rotation: number, imageX: number, imageY: number, accessibleName: ReadOnlyProperty<string> ): Rectangle | InteractiveHighlightingRectangle => {
      const baseProbeOptions = {
        fill: CCKCQueryParameters.showVoltmeterSamplePoints ? color : null,
        cursor: 'pointer',
        accessibleName: accessibleName,
        accessibleRoleDescription: CircuitConstructionKitCommonFluent.a11y.measurementProbe.accessibleRoleDescriptionStringProperty,
        children: [ new Image( image, {
          scale: PROBE_SCALE,
          rotation: rotation,

          // Determined empirically by showing the probe hot spot and zooming in by a factor of 2 in
          // CircuitConstructionKitModel. Will need to change if PROBE_ANGLE changes
          x: imageX,
          y: imageY
        } ) ]
      };

      const probeNodeOptions = isIcon ? baseProbeOptions : combineOptions<NodeOptions>( baseProbeOptions, AccessibleInteractiveOptions );

      // Use InteractiveHighlightingRectangle for non-icons to get hover highlights
      if ( isIcon ) {
        return new Rectangle( -2, -2, 4, 4, probeNodeOptions );
      }
      else {
        return new InteractiveHighlightingRectangle( -2, -2, 4, 4, probeNodeOptions );
      }
    };

    const blackProbeNode = createProbeNode( Color.BLACK, probeBlack_png, PROBE_ANGLE, -9.5, -5, CircuitConstructionKitCommonFluent.a11y.voltmeterNode.blackProbe.accessibleNameStringProperty );

    const redProbeNode = createProbeNode( Color.RED, probeRed_png, -PROBE_ANGLE, -11, +4, CircuitConstructionKitCommonFluent.a11y.voltmeterNode.redProbe.accessibleNameStringProperty );

    // Displays the voltage reading
    const voltageReadoutProperty = new DerivedStringProperty( [
      voltmeter.voltageProperty,
      CircuitConstructionKitCommonFluent.voltageUnitsStringProperty
    ], voltage =>
      voltage === null ? MathSymbols.NO_VALUE : CCKCUtils.createVoltageReadout( voltage ) );

    const probeTextProperty = new DerivedStringProperty( [ voltageStringProperty ], voltageString =>
      options.showPhetioIndex ? voltageString + ' ' + voltmeter.phetioIndex : voltageString
    );

    const probeTextNode = new ProbeTextNode(
      voltageReadoutProperty, options.showResultsProperty, probeTextProperty,

      // No need for an extra level of nesting in the tandem tree, since that is just an implementation detail
      // and not a feature
      options.tandem, {
        centerX: voltmeterBody_png[ 0 ].width / 2,
        centerY: voltmeterBody_png[ 0 ].height / 2
      } );

    // Create a property for the reading text (e.g., "9.00 volts" or "no reading")
    // Format the voltage value directly to avoid including the unit symbol from CCKCUtils.createVoltageReadout
    const readingTextProperty = new DerivedStringProperty(
      [
        voltmeter.voltageProperty,
        CircuitConstructionKitCommonFluent.a11y.voltmeterNode.voltageVolts.createProperty( {
          voltage: new DerivedStringProperty(
            [ voltmeter.voltageProperty ],
            voltage => voltage === null ? '' : toFixed( voltage, 2 )
          )
        } ),
        CircuitConstructionKitCommonFluent.a11y.voltmeterNode.noReadingStringProperty
      ],
      ( voltage, voltageVoltsText, noReading ) =>
        voltage === null ? noReading : voltageVoltsText
    );

    // Use VoltmeterBodyNode for non-icons to get hover highlights on the body and typed properties for hit testing
    const bodyNode = isIcon ?
                     new Image( voltmeterBody_png, {
                       scale: SCALE,
                       cursor: 'pointer',
                       children: [ probeTextNode ]
                     } ) :
                     new VoltmeterBodyNode( voltmeterBody_png, voltmeter, combineOptions<NodeOptions>( {
                       scale: SCALE,
                       cursor: 'pointer',
                       children: [ probeTextNode ],

                       accessibleName: CircuitConstructionKitCommonFluent.a11y.voltmeterNode.body.accessibleName.createProperty( { reading: readingTextProperty } ),
                       focusable: true
                     }, AccessibleDraggableOptions ) );

    /**
     * Creates a Vector2Property with a new Vector2 at the specified position.
     * @param [x]
     * @param [y]
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
    Multilink.multilink( [ voltmeter.bodyPositionProperty, voltmeter.isActiveProperty ], bodyPosition => {

      // Drag the body by the center
      bodyNode.center = bodyPosition;

      blackWireBodyPositionProperty.value = bodyNode.centerBottom.plusXY( -PROBE_CONNECTION_POINT_DX, PROBE_CONNECTION_POINT_DY );
      redWireBodyPositionProperty.value = bodyNode.centerBottom.plusXY( PROBE_CONNECTION_POINT_DX, PROBE_CONNECTION_POINT_DY );

      // When dragging out of the toolbox, the probes move with the body
      if ( voltmeter.isDraggingProbesWithBodyProperty.get() ) {
        const probeY = -30 - bodyNode.height / 2;
        const probeOffsetX = 78;

        const constrain = ( pt: Vector2 ) => options.visibleBoundsProperty ?
                                             options.visibleBoundsProperty.value.eroded( CCKCConstants.DRAG_BOUNDS_EROSION ).closestPointTo( pt ) :
                                             pt;

        voltmeter.redProbePositionProperty.set( constrain( bodyPosition.plusXY( +probeOffsetX, probeY ) ) );
        voltmeter.blackProbePositionProperty.set( constrain( bodyPosition.plusXY( -probeOffsetX, probeY ) ) );
      }
    } );

    /**
     * Creates listeners for the link function to update the probe node and wire when probe position changes.
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

    super( options );

    this.addChild( bodyNode );
    this.addChild( blackWireNode );
    this.addChild( blackProbeNode );
    this.addChild( redWireNode );
    this.addChild( redProbeNode );

    this.circuitNode = circuitNode;

    this.bodyNode = bodyNode;
    this.voltmeter = voltmeter;
    this.redProbeNode = redProbeNode;
    this.blackProbeNode = blackProbeNode;

    // For the real version (not the icon), add drag listeners and update visibility
    if ( !isIcon ) {

      // Focus highlight should only surround the body, not the probes
      bodyNode.focusHighlight = new HighlightFromNode( bodyNode );

      // Show the voltmeter when icon dragged out of the toolbox
      voltmeter.isActiveProperty.linkAttribute( this, 'visible' );

      const dragBoundsProperty = new DerivedProperty( [ options.visibleBoundsProperty! ], ( visibleBounds: Bounds2 ) => {
        return visibleBounds.eroded( CCKCConstants.DRAG_BOUNDS_EROSION );
      } );

      /**
       * Gets a drag handler for one of the probes.
       */
      const createProbeDragListener = ( positionProperty: Vector2Property, tandem: Tandem ) => {

        const probeDragListener = new DragListener( {
          positionProperty: positionProperty,
          start: () => {
            this.moveToFront();
            sharedSoundPlayers.get( 'grab' ).play();
          },
          end: () => {
            sharedSoundPlayers.get( 'release' ).play();
          },
          tandem: tandem.createTandem( 'probeDragListener' ),
          dragBoundsProperty: dragBoundsProperty
        } );
        return probeDragListener;
      };

      const createProbeKeyboardDragListener = ( positionProperty: Vector2Property ) => {
        return new SoundKeyboardDragListener( {
          positionProperty: positionProperty,
          dragBoundsProperty: dragBoundsProperty,
          start: () => this.moveToFront(),
          dragSpeed: CCKCConstants.KEYBOARD_DRAG_SPEED,
          shiftDragSpeed: CCKCConstants.SHIFT_KEYBOARD_DRAG_SPEED,
          tandem: Tandem.OPT_OUT
        } );
      };

      const redProbeDragListener = createProbeDragListener( voltmeter.redProbePositionProperty, options.tandem.createTandem( 'redProbeDragListener' ) );
      const blackProbeDragListener = createProbeDragListener( voltmeter.blackProbePositionProperty, options.tandem.createTandem( 'blackProbeDragListener' ) );

      this.redProbeNode.addInputListener( redProbeDragListener );
      this.redProbeNode.addInputListener( createProbeKeyboardDragListener( voltmeter.redProbePositionProperty ) );
      this.redProbeNode.addInputListener( new VoltmeterProbeNodeAttachmentKeyboardListener(
        this.redProbeNode,
        circuitNode!,
        voltmeter.redProbePositionProperty,
        voltmeter
      ) );

      this.blackProbeNode.addInputListener( blackProbeDragListener );
      this.blackProbeNode.addInputListener( createProbeKeyboardDragListener( voltmeter.blackProbePositionProperty ) );
      this.blackProbeNode.addInputListener( new VoltmeterProbeNodeAttachmentKeyboardListener(
        this.blackProbeNode,
        circuitNode!,
        voltmeter.blackProbePositionProperty,
        voltmeter
      ) );

      const erodedBoundsProperty = new DerivedProperty( [ options.visibleBoundsProperty! ], ( visibleBounds: Bounds2 ) => {
        return visibleBounds.eroded( CCKCConstants.DRAG_BOUNDS_EROSION );
      } );

      // TODO: Disable line below should be removed, see https://github.com/phetsims/phet-io/issues/1959
      // eslint-disable-next-line phet/tandem-name-should-match
      this.dragHandler = new DragListener( {

        positionProperty: voltmeter.bodyPositionProperty,
        tandem: options.tandem.createTandem( 'dragListener' ),
        useParentOffset: true,
        dragBoundsProperty: erodedBoundsProperty,
        start: event => {
          this.moveToFront();
          sharedSoundPlayers.get( 'grab' ).play();
        },
        end: () => {
          sharedSoundPlayers.get( 'release' ).play();
          voltmeter.droppedEmitter.emit( bodyNode.globalBounds );

          // After dropping in the play area the probes move independently of the body
          voltmeter.isDraggingProbesWithBodyProperty.set( false );
        },

        // adds support for zoomed coordinate frame, see
        // https://github.com/phetsims/circuit-construction-kit-common/issues/301
        targetNode: this
      } );
      erodedBoundsProperty.link( ( erodedBounds: Bounds2 ) => {
        voltmeter.redProbePositionProperty.set( erodedBounds.closestPointTo( voltmeter.redProbePositionProperty.value ) );
        voltmeter.blackProbePositionProperty.set( erodedBounds.closestPointTo( voltmeter.blackProbePositionProperty.value ) );
        voltmeter.bodyPositionProperty.set( erodedBounds.closestPointTo( voltmeter.bodyPositionProperty.value ) );
      } );
      bodyNode.addInputListener( this.dragHandler );

      bodyNode.addInputListener( new SoundKeyboardDragListener( {
        tandem: Tandem.OPT_OUT,

        positionProperty: voltmeter.bodyPositionProperty,

        start: () => {
          this.moveToFront();

          // For keyboard interaction, probes should not move with the body
          voltmeter.isDraggingProbesWithBodyProperty.set( false );
        },
        end: () => {
          voltmeter.droppedEmitter.emit( bodyNode.globalBounds );
        },

        dragSpeed: CCKCConstants.KEYBOARD_DRAG_SPEED,
        shiftDragSpeed: CCKCConstants.SHIFT_KEYBOARD_DRAG_SPEED
      } ) );

      /**
       * Starting at the tip, iterate down over several samples and return the first hit, if any.
       * @param probeNode
       * @param probeTip
       * @param sign - the direction the probe is rotated
       * @returns - if connected returns VoltageConnection otherwise null
       */
      const findConnection = ( probeNode: Node, probeTip: Vector2, sign: number ) => {
        const probeTipVector = Vector2.createPolar( VOLTMETER_PROBE_TIP_LENGTH, sign * VoltmeterNode.PROBE_ANGLE + Math.PI / 2 );
        const probeTipTail = probeTip.plus( probeTipVector );
        for ( let i = 0; i < VOLTMETER_NUMBER_SAMPLE_POINTS; i++ ) {
          const samplePoint = probeTip.blend( probeTipTail, i / VOLTMETER_NUMBER_SAMPLE_POINTS );
          const voltageConnection = circuitNode!.getVoltageConnection( samplePoint );

          // For debugging, depict the points where the sampling happens
          if ( CCKCQueryParameters.showVoltmeterSamplePoints ) {

            // Note, these get erased when changing between lifelike/schematic
            this.circuitNode!.addChild( new Rectangle( -1, -1, 2, 2, {
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
        if ( voltmeter.isActiveProperty.get() ) {
          const blackConnection = findConnection( blackProbeNode, voltmeter.blackProbePositionProperty.get(), +1 );
          const redConnection = findConnection( redProbeNode, voltmeter.redProbePositionProperty.get(), -1 );
          const voltage = this.circuitNode!.circuit.getVoltageBetweenConnections( redConnection, blackConnection, false );
          voltmeter.blackProbeConnectionProperty.set( blackConnection );
          voltmeter.redProbeConnectionProperty.set( redConnection );
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
    // and the VoltmeterNode itself gets the interactive highlight. For non-icons, the body and probes
    // have their own interactive highlights via InteractiveHighlightingImage/Rectangle.
    if ( isIcon ) {
      this.touchArea = this.bounds.copy();
      this.mouseArea = this.bounds.copy();
      this.cursor = 'pointer';
      this.setInteractiveHighlight( new HighlightFromNode( this ) );
    }
    else {
      // Disable on the parent VoltmeterNode since children handle their own highlights
      this.interactiveHighlightEnabled = false;
    }

    this.addLinkedElement( voltmeter, {
      tandemName: 'voltmeter'
    } );
  }

  /**
   * Forward a drag from the toolbox to the play area node.
   */
  public startDrag( event: PressListenerEvent ): void {
    this.dragHandler!.press( event );
  }
}

circuitConstructionKitCommon.register( 'VoltmeterNode', VoltmeterNode );
