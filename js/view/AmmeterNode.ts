// Copyright 2016-2026, University of Colorado Boulder

/**
 * The user interface component with a single probe which reads current values from Wires (not from Vertex or
 * FixedCircuitElement instances). Exists for the life of the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import DerivedStringProperty from '../../../axon/js/DerivedStringProperty.js';
import type Property from '../../../axon/js/Property.js';
import type Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import affirm from '../../../perennial-alias/js/browser-and-node/affirm.js';
import optionize from '../../../phet-core/js/optionize.js';
import AccessibleDraggableOptions from '../../../scenery-phet/js/accessibility/grab-drag/AccessibleDraggableOptions.js';
import ProbeNode from '../../../scenery-phet/js/ProbeNode.js';
import SoundKeyboardDragListener from '../../../scenery-phet/js/SoundKeyboardDragListener.js';
import WireNode from '../../../scenery-phet/js/WireNode.js';
import HighlightFromNode from '../../../scenery/js/accessibility/HighlightFromNode.js';
import InteractiveHighlighting from '../../../scenery/js/accessibility/voicing/InteractiveHighlighting.js';
import DragListener from '../../../scenery/js/listeners/DragListener.js';
import { type PressListenerEvent } from '../../../scenery/js/listeners/PressListener.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Node, { type NodeOptions } from '../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import Color from '../../../scenery/js/util/Color.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import Tandem from '../../../tandem/js/Tandem.js';
import ammeterBody_png from '../../images/ammeterBody_png.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCUtils from '../CCKCUtils.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import type Ammeter from '../model/Ammeter.js';
import ammeterReadoutTypeProperty from './ammeterReadoutTypeProperty.js';
import type CircuitNode from './CircuitNode.js';
import AmmeterProbeNodeAttachmentKeyboardListener from './input/AmmeterProbeNodeAttachmentKeyboardListener.js';
import ProbeTextNode from './ProbeTextNode.js';

const currentStringProperty = CircuitConstructionKitCommonFluent.currentStringProperty;

// constants
// measurements for the cubic curve for the wire nodes
const BODY_LEAD_Y = -30; // in model=view coordinates
const PROBE_LEAD_Y = 15; // in model=view coordinates
const HANDLE_WIDTH = 50;

// overall scale factor for the body and probe
const SCALE_FACTOR = 0.5;

// unsigned measurements for the circles on the voltmeter body image, for where the probe wires connect
const PROBE_CONNECTION_POINT_DY = 8;

// Local classes with InteractiveHighlighting for the draggable components
class InteractiveHighlightingImage extends InteractiveHighlighting( Image ) {}

class InteractiveHighlightingProbeNode extends InteractiveHighlighting( ProbeNode ) {}

type SelfOptions = {
  isIcon?: boolean;
  visibleBoundsProperty?: Property<Bounds2> | null;
  showResultsProperty?: BooleanProperty;
  blackBoxStudy?: boolean;
  showPhetioIndex?: boolean;
};
type AmmeterNodeOptions = SelfOptions & NodeOptions;

export default class AmmeterNode extends InteractiveHighlighting( Node ) {
  private readonly probeNode: ProbeNode | InteractiveHighlightingProbeNode;

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

    if ( !options.isIcon ) {
      Object.assign( options, AccessibleDraggableOptions );
    }

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

    const currentReadoutProperty = new DerivedStringProperty( [
        ammeter.currentProperty,
        ammeterReadoutTypeProperty,
        CircuitConstructionKitCommonFluent.currentUnitsStringProperty
      ],
      current => CCKCUtils.createCurrentReadout( current, options.blackBoxStudy ) );

    const probeTextProperty = new DerivedStringProperty( [ currentStringProperty ], currentString =>
      options.showPhetioIndex ? currentString + ' ' + ammeter.phetioIndex : currentString );

    const probeTextNode = new ProbeTextNode(
      currentReadoutProperty, options.showResultsProperty, probeTextProperty,

      // No need for an extra level of nesting in the tandem tree, since that is just an implementation detail
      // and not a feature
      tandemForChildren, {
        centerX: ammeterBody_png.width / 2,
        centerY: ammeterBody_png.height / 2 + 7 // adjust for the top notch design
      } );

    // Use InteractiveHighlightingImage for non-icons to get hover highlights on the body
    const bodyNode = options.isIcon ?
                     new Image( ammeterBody_png, {
                       scale: SCALE_FACTOR,
                       cursor: 'pointer',
                       children: [ probeTextNode ]
                     } ) :
                     new InteractiveHighlightingImage( ammeterBody_png, {
                       scale: SCALE_FACTOR,
                       cursor: 'pointer',
                       children: [ probeTextNode ]
                     } );

    const probeOptions = {
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
      ],
      ...( options.isIcon ? {} : AccessibleDraggableOptions )
    };

    // Use InteractiveHighlightingProbeNode for non-icons to get hover highlights on the probe
    const probeNode = options.isIcon ?
                      new ProbeNode( probeOptions ) :
                      new InteractiveHighlightingProbeNode( probeOptions );

    affirm( !options.hasOwnProperty( 'children' ), 'children will be supplied by AmmeterNode' );

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

      // Focus highlight should only surround the body, not the probe
      this.focusHighlight = new HighlightFromNode( bodyNode );

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
        start: () => {
          sharedSoundPlayers.get( 'grab' ).play();
          this.moveToFront();
        },
        dragBoundsProperty: erodedDragBoundsProperty,
        end: () => {
          sharedSoundPlayers.get( 'release' ).play();
        }
      } );

      this.dragHandler = new DragListener( {
        useParentOffset: true,
        positionProperty: ammeter.bodyPositionProperty,
        tandem: tandemForChildren.createTandem( 'dragListener' ),
        start: () => {
          sharedSoundPlayers.get( 'grab' ).play();
          this.moveToFront();
        },
        end: function() {
          ammeter.droppedEmitter.emit( bodyNode.globalBounds );

          // After dropping in the play area the probes move independently of the body
          ammeter.isDraggingProbesWithBodyProperty.set( false );

          sharedSoundPlayers.get( 'release' ).play();
        },

        // adds support for zoomed coordinate frame, see
        // https://github.com/phetsims/circuit-construction-kit-common/issues/301
        targetNode: this,

        dragBoundsProperty: erodedDragBoundsProperty
      } );
      bodyNode.addInputListener( this.dragHandler );
      this.addInputListener( new SoundKeyboardDragListener( {
        tandem: Tandem.OPT_OUT,
        positionProperty: ammeter.bodyPositionProperty,
        dragBoundsProperty: erodedDragBoundsProperty,
        start: () => {
          this.moveToFront();

          // For keyboard interaction, probes should not move with the body
          ammeter.isDraggingProbesWithBodyProperty.set( false );
        },
        end: () => {
          ammeter.droppedEmitter.emit( bodyNode.globalBounds );
        },
        dragSpeed: CCKCConstants.KEYBOARD_DRAG_SPEED,
        shiftDragSpeed: CCKCConstants.SHIFT_KEYBOARD_DRAG_SPEED
      } ) );
      erodedDragBoundsProperty.link( erodedDragBounds => {
        ammeter.bodyPositionProperty.value = erodedDragBounds.closestPointTo( ammeter.bodyPositionProperty.value );
        ammeter.probePositionProperty.value = erodedDragBounds.closestPointTo( ammeter.probePositionProperty.value );
      } );
      this.probeNode.addInputListener( probeDragHandler );
      this.probeNode.addInputListener( new SoundKeyboardDragListener( {
        positionProperty: ammeter.probePositionProperty,
        dragBoundsProperty: erodedDragBoundsProperty,
        start: () => this.moveToFront(),
        dragSpeed: CCKCConstants.KEYBOARD_DRAG_SPEED,
        shiftDragSpeed: CCKCConstants.SHIFT_KEYBOARD_DRAG_SPEED,
        tandem: Tandem.OPT_OUT
      } ) );

      this.probeNode.addInputListener( new AmmeterProbeNodeAttachmentKeyboardListener(
        this.probeNode,
        circuitNode!,
        ammeter.probePositionProperty
      ) );

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
    // and the AmmeterNode itself gets the interactive highlight. For non-icons, the body and probe
    // have their own interactive highlights via InteractiveHighlightingImage/ProbeNode.
    if ( options.isIcon ) {
      this.touchArea = this.bounds.copy();
      this.mouseArea = this.bounds.copy();
      this.cursor = 'pointer';
      this.setInteractiveHighlight( new HighlightFromNode( this ) );
    }
    else {
      // Disable on the parent AmmeterNode since children handle their own highlights
      this.interactiveHighlightEnabled = false;
    }

    this.addLinkedElement( ammeter, {
      tandemName: 'ammeter'
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
