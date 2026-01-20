// Copyright 2015-2026, University of Colorado Boulder

/**
 * Node that represents a single scene or screen, with a circuit, toolbox, sensors, etc. Exists for the life of the sim
 * and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Multilink from '../../../axon/js/Multilink.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import type Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import ScreenView, { type ScreenViewOptions } from '../../../joist/js/ScreenView.js';
import optionize from '../../../phet-core/js/optionize.js';
import type StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import PlayPauseButton from '../../../scenery-phet/js/buttons/PlayPauseButton.js';
import ResetAllButton from '../../../scenery-phet/js/buttons/ResetAllButton.js';
import StopwatchNode from '../../../scenery-phet/js/StopwatchNode.js';
import TimeControlNode from '../../../scenery-phet/js/TimeControlNode.js';
import { getPDOMFocusedNode } from '../../../scenery/js/accessibility/pdomFocusProperty.js';
import HotkeyData from '../../../scenery/js/input/HotkeyData.js';
import AlignGroup from '../../../scenery/js/layout/constraints/AlignGroup.js';
import AlignBox from '../../../scenery/js/layout/nodes/AlignBox.js';
import VBox from '../../../scenery/js/layout/nodes/VBox.js';
import KeyboardListener from '../../../scenery/js/listeners/KeyboardListener.js';
import Node from '../../../scenery/js/nodes/Node.js';
import { type CarouselItem } from '../../../sun/js/Carousel.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
import phetioStateSetEmitter from '../../../tandem/js/phetioStateSetEmitter.js';
import Tandem from '../../../tandem/js/Tandem.js';
import cut_mp3 from '../../sounds/cut_mp3.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import CCKCUtils from '../CCKCUtils.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import type CircuitConstructionKitModel from '../model/CircuitConstructionKitModel.js';
import CircuitElement from '../model/CircuitElement.js';
import SeriesAmmeter from '../model/SeriesAmmeter.js';
import Vertex from '../model/Vertex.js';
import AdvancedAccordionBox from './AdvancedAccordionBox.js';
import AmmeterNode, { AmmeterBodyNode } from './AmmeterNode.js';
import CCKCZoomButtonGroup from './CCKCZoomButtonGroup.js';
import ChargeSpeedThrottlingReadoutNode from './ChargeSpeedThrottlingReadoutNode.js';
import CircuitElementEditContainerNode from './CircuitElementEditContainerNode.js';
import CircuitElementNode from './CircuitElementNode.js';
import CircuitElementToolbox, { type CircuitElementToolboxOptions } from './CircuitElementToolbox.js';
import CircuitNode from './CircuitNode.js';
import CurrentChartNode from './CurrentChartNode.js';
import CCKCScreenSummaryContent from './description/CCKCScreenSummaryContent.js';
import DisplayOptionsPanel from './DisplayOptionsPanel.js';
import FixedCircuitElementNode from './FixedCircuitElementNode.js';
import SensorToolbox from './SensorToolbox.js';
import VertexNode from './VertexNode.js';
import ViewRadioButtonGroup from './ViewRadioButtonGroup.js';
import VoltageChartNode from './VoltageChartNode.js';
import VoltmeterNode, { VoltmeterBodyNode } from './VoltmeterNode.js';

const batteryResistanceStringProperty = CircuitConstructionKitCommonFluent.batteryResistanceStringProperty;
const sourceResistanceStringProperty = CircuitConstructionKitCommonFluent.sourceResistanceStringProperty;

// constants
const VERTICAL_MARGIN = CCKCConstants.VERTICAL_MARGIN;

// Match margins with the carousel page control and spacing
const HORIZONTAL_MARGIN = CCKCConstants.HORIZONTAL_MARGIN;

const cutSoundPlayer = new SoundClip( cut_mp3 );
soundManager.addSoundGenerator( cutSoundPlayer );

// Group for aligning the content in the panels and accordion boxes.  This is a class variable instead of an
// instance variable so the control panels will have the same width across all screens,
// see https://github.com/phetsims/circuit-construction-kit-dc/issues/9
const CONTROL_PANEL_ALIGN_GROUP = new AlignGroup( {

  // Elements should have the same widths but not constrained to have the same heights
  matchVertical: false
} );

type SelfOptions = {
  showResetAllButton?: boolean;
  circuitElementToolboxOptions: CircuitElementToolboxOptions;
  showSeriesAmmeters?: boolean;
  showTimeControls?: boolean;
  showAdvancedControls?: boolean;
  showCharts?: boolean;
  blackBoxStudy?: boolean;
  showStopwatchCheckbox?: boolean;
  showPhaseShiftControl?: boolean;
  hasACandDCVoltageSources?: boolean;
  showMeterPhetioIndex?: boolean;
};
export type CCKCScreenViewOptions = SelfOptions & StrictOmit<ScreenViewOptions, 'tandem'>;

export default class CCKCScreenView extends ScreenView {
  public readonly model: CircuitConstructionKitModel;
  public readonly circuitNodeBackLayer: Node;
  protected readonly circuitNode: CircuitNode;
  private readonly chartNodes: ( VoltageChartNode | CurrentChartNode )[];
  private readonly voltageChartNode1: VoltageChartNode | null;
  private readonly voltageChartNode2: VoltageChartNode | null;
  private readonly currentChartNode1: CurrentChartNode | null;
  private readonly currentChartNode2: CurrentChartNode | null;
  protected readonly circuitElementToolbox: CircuitElementToolbox;
  public readonly sensorToolbox: SensorToolbox;
  private readonly viewRadioButtonGroup: ViewRadioButtonGroup;
  private readonly displayOptionsPanel: DisplayOptionsPanel;
  private readonly advancedAccordionBox: AdvancedAccordionBox | null;
  private stopwatchNodePositionDirty: boolean;
  public readonly circuitElementEditContainerNode: CircuitElementEditContainerNode;
  public readonly showAdvancedControls: boolean;

  /**
   * @param model
   * @param circuitElementToolItems - to be shown in the carousel
   * @param tandem
   * @param [providedOptions]
   */
  protected constructor( model: CircuitConstructionKitModel, circuitElementToolItems: CarouselItem[], tandem: Tandem, providedOptions?: CCKCScreenViewOptions ) {

    const options = optionize<CCKCScreenViewOptions, SelfOptions, StrictOmit<ScreenViewOptions, 'tandem'>>()( {

      // When used as a scene, the reset all button is suppressed here, added in the screen so that it may reset all
      // scenes (including but not limited to this one).
      showResetAllButton: true,

      /* SEE ALSO OPTIONS IN CircuitElementToolbox*/

      showSeriesAmmeters: false,
      showTimeControls: false,
      showAdvancedControls: true,
      showCharts: false,
      blackBoxStudy: false,
      showStopwatchCheckbox: false,
      showPhaseShiftControl: false,
      hasACandDCVoltageSources: false, // determines the string shown in the AdvancedAccordionBox
      showMeterPhetioIndex: false
    }, providedOptions );

    super( {
      tandem: tandem
    } );

    this.model = model;

    // TODO (black-box-study): change background color to gray when isValueDepictionEnabledProperty goes false https://github.com/phetsims/tasks/issues/1129

    // contains parts of the circuit that should be shown behind the controls
    this.circuitNodeBackLayer = new Node();

    this.circuitNode = new CircuitNode(
      model.circuit, this, tandem.createTandem( 'circuitNode' )
    );

    const meterNodesTandem = tandem.createTandem( 'meterNodes' );

    const voltmeterNodes = model.voltmeters.map( voltmeter => {
      const voltmeterNode = new VoltmeterNode( voltmeter, model, this.circuitNode, false, {
        tandem: meterNodesTandem.createTandem( `voltmeterNode${voltmeter.phetioIndex}` ),
        phetioFeatured: true,
        showResultsProperty: model.isValueDepictionEnabledProperty,
        visibleBoundsProperty: this.circuitNode.visibleBoundsInCircuitCoordinateFrameProperty,
        showPhetioIndex: options.showMeterPhetioIndex
      } );
      voltmeter.droppedEmitter.addListener( bodyNodeGlobalBounds => {
        const bodyNodeBoundsEroded = CCKCUtils.getDropItemHitBoxForBounds( bodyNodeGlobalBounds );
        const isToolboxVisible = !!this.sensorToolbox.getTrails().find( trail => trail.isVisible() );
        if ( isToolboxVisible && bodyNodeBoundsEroded.intersectsBounds( this.sensorToolbox.globalBounds ) ) {
          voltmeter.isActiveProperty.value = false;
        }
      } );
      return voltmeterNode;
    } );

    const ammeterNodes = model.ammeters.map( ammeter => {
      const ammeterNode = new AmmeterNode( ammeter, model, this.circuitNode, {
        tandem: model.isShowNoncontactAmmeters ? meterNodesTandem.createTandem( `ammeterNode${ammeter.phetioIndex}` ) : Tandem.OPT_OUT,
        phetioFeatured: true,
        showResultsProperty: model.isValueDepictionEnabledProperty,
        visibleBoundsProperty: this.circuitNode.visibleBoundsInCircuitCoordinateFrameProperty,
        blackBoxStudy: options.blackBoxStudy,
        showPhetioIndex: options.showMeterPhetioIndex
      } );
      ammeter.droppedEmitter.addListener( bodyNodeGlobalBounds => {
        const bodyNodeBoundsEroded = CCKCUtils.getDropItemHitBoxForBounds( bodyNodeGlobalBounds );
        const isToolboxVisible = !!this.sensorToolbox.getTrails().find( trail => trail.isVisible() );
        if ( isToolboxVisible && bodyNodeBoundsEroded.intersectsBounds( this.sensorToolbox.globalBounds ) ) {
          ammeter.isActiveProperty.value = false;
        }
      } );
      return ammeterNode;
    } );

    this.chartNodes = [];

    // Optionally initialize the chart nodes
    if ( options.showCharts ) {

      const createVoltageChartNode = ( tandemName: string ) => {
        const voltageChartNode = new VoltageChartNode( this.circuitNode, model.circuit.timeProperty,
          this.circuitNode.visibleBoundsInCircuitCoordinateFrameProperty, {
            tandem: meterNodesTandem.createTandem( tandemName )
          }
        );
        voltageChartNode.initializeBodyDragListener( this );
        return voltageChartNode;
      };
      const createCurrentChartNode = ( tandemName: string ) => {
        const currentChartNode = new CurrentChartNode( this.circuitNode, model.circuit.timeProperty,
          this.circuitNode.visibleBoundsInCircuitCoordinateFrameProperty, {
            tandem: meterNodesTandem.createTandem( tandemName )
          }
        );
        currentChartNode.initializeBodyDragListener( this );
        return currentChartNode;
      };

      this.voltageChartNode1 = createVoltageChartNode( 'voltageChartNode1' );
      this.voltageChartNode2 = createVoltageChartNode( 'voltageChartNode2' );

      this.currentChartNode1 = createCurrentChartNode( 'currentChartNode1' );
      this.currentChartNode2 = createCurrentChartNode( 'currentChartNode2' );

      this.chartNodes.push( this.voltageChartNode1, this.voltageChartNode2, this.currentChartNode1, this.currentChartNode2 );
    }
    else {
      this.voltageChartNode1 = null;
      this.voltageChartNode2 = null;

      this.currentChartNode1 = null;
      this.currentChartNode2 = null;
    }

    // Toolbox from which CircuitElements can be dragged
    this.circuitElementToolbox = new CircuitElementToolbox(
      model.viewTypeProperty,
      circuitElementToolItems,
      tandem.createTandem( 'circuitElementToolbox' ),
      options.circuitElementToolboxOptions
    );

    // so that subclasses can add a layout circuit element near it
    this.sensorToolbox = new SensorToolbox(
      CONTROL_PANEL_ALIGN_GROUP,
      this.circuitNode,
      voltmeterNodes,
      ammeterNodes,
      [ this.voltageChartNode1!, this.voltageChartNode2! ],
      [ this.currentChartNode1!, this.currentChartNode2! ],
      tandem.createTandem( 'sensorToolbox' ), {
        showSeriesAmmeters: options.showSeriesAmmeters,
        showNoncontactAmmeters: model.isShowNoncontactAmmeters,
        showCharts: options.showCharts,
        visiblePropertyOptions: {
          phetioFeatured: true
        }
      } );

    this.viewRadioButtonGroup = new ViewRadioButtonGroup(
      model.viewTypeProperty,
      tandem.createTandem( 'viewRadioButtonGroup' )
    );
    this.viewRadioButtonGroup.mutate( {
      scale: this.circuitElementToolbox.carousel.backgroundWidth /
             this.viewRadioButtonGroup.width * options.circuitElementToolboxOptions.carouselScale
    } );

    this.displayOptionsPanel = new DisplayOptionsPanel(
      CONTROL_PANEL_ALIGN_GROUP,
      model.circuit.showCurrentProperty,
      model.circuit.currentTypeProperty,
      model.showValuesProperty,
      model.showLabelsProperty,
      model.stopwatch,
      options.showStopwatchCheckbox,
      tandem.createTandem( 'displayOptionsPanel' )
    );

    this.advancedAccordionBox = options.showAdvancedControls ? new AdvancedAccordionBox(
      model.circuit,
      CONTROL_PANEL_ALIGN_GROUP,
      options.hasACandDCVoltageSources ? sourceResistanceStringProperty : batteryResistanceStringProperty,
      tandem.createTandem( 'advancedAccordionBox' ), {
        showRealBulbsCheckbox: !options.hasACandDCVoltageSources
      }
    ) : null;

    this.addChild( this.circuitNodeBackLayer );

    // Reset All button
    let resetAllButton: ResetAllButton | null = null;
    if ( options.showResetAllButton ) {
      resetAllButton = new ResetAllButton( {
        tandem: tandem.createTandem( 'resetAllButton' ),
        listener: () => {
          model.reset();
          this.reset();
        }
      } );
      this.addChild( resetAllButton );
    }

    const toolboxContainer = new VBox( {
      align: 'right',
      spacing: 5,
      children: [
        this.circuitElementToolbox,
        this.viewRadioButtonGroup
      ]
    } );
    this.addChild( toolboxContainer );

    const controlPanelVBox = new VBox( {
      spacing: VERTICAL_MARGIN,
      children: options.showAdvancedControls ?
        [ this.displayOptionsPanel, this.sensorToolbox, this.advancedAccordionBox! ] :
        [ this.displayOptionsPanel, this.sensorToolbox ]
    } );

    const box = new AlignBox( controlPanelVBox, {
      xAlign: 'right',
      yAlign: 'top',
      xMargin: HORIZONTAL_MARGIN,
      yMargin: VERTICAL_MARGIN
    } );
    this.visibleBoundsProperty.linkAttribute( box, 'alignBounds' );

    this.addChild( box );
    this.addChild( this.circuitNode );

    const chargeSpeedThrottlingReadoutNode = new ChargeSpeedThrottlingReadoutNode(
      model.circuit.chargeAnimator.timeScaleProperty,
      model.circuit.showCurrentProperty,
      model.isValueDepictionEnabledProperty
    );
    this.addChild( chargeSpeedThrottlingReadoutNode );

    // Properties for positioning the edit panel between the zoom button group and time control
    const zoomButtonGroupRightProperty = new NumberProperty( 0 );
    const timeControlLeftProperty = new NumberProperty( 0 );

    const circuitElementEditContainerNode = new CircuitElementEditContainerNode(
      this.circuitNode,
      this.visibleBoundsProperty,
      model.modeProperty,
      zoomButtonGroupRightProperty,
      timeControlLeftProperty,
      tandem.createTandem( 'circuitElementEditContainerNode' ), {
        showPhaseShiftControl: options.showPhaseShiftControl
      }
    );

    this.addChild( circuitElementEditContainerNode );

    this.circuitElementEditContainerNode = circuitElementEditContainerNode;

    // The voltmeter and ammeter are rendered with the circuit node so they will scale up and down with the circuit
    voltmeterNodes.forEach( voltmeterNode => this.circuitNode.sensorLayer.addChild( voltmeterNode ) );
    ammeterNodes.forEach( ammeterNode => this.circuitNode.sensorLayer.addChild( ammeterNode ) );
    this.chartNodes.forEach( chartNode => this.circuitNode.sensorLayer.addChild( chartNode ) );

    // Create the zoom button group
    const zoomButtonGroup = new CCKCZoomButtonGroup( model.zoomLevelProperty, {
      tandem: tandem.createTandem( 'zoomButtonGroup' ),
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    } );
    zoomButtonGroup.mutate( {
      scale: this.circuitElementToolbox.carousel.backgroundWidth /
             zoomButtonGroup.width * options.circuitElementToolboxOptions.carouselScale
    } );

    // Add the optional Play/Pause button
    if ( CCKCQueryParameters.showDepictValuesToggleButton ) {
      const playPauseButton = new PlayPauseButton( model.isValueDepictionEnabledProperty, {
        tandem: tandem.createTandem( 'playPauseButton' ),
        baseColor: '#33ff44' // the default blue fades into the background too much
      } );
      this.addChild( playPauseButton );
      this.visibleBoundsProperty.link( ( visibleBounds: Bounds2 ) => {

        // Float the playPauseButton to the bottom left
        playPauseButton.mutate( {
          left: visibleBounds.left + VERTICAL_MARGIN,
          bottom: visibleBounds.bottom - VERTICAL_MARGIN - zoomButtonGroup.height - VERTICAL_MARGIN
        } );
      } );
    }

    let timeControlNode: TimeControlNode | null = null;
    if ( options.showTimeControls ) {
      timeControlNode = new TimeControlNode( model.isPlayingProperty, {
        tandem: tandem.createTandem( 'timeControlNode' ),
        playPauseStepButtonOptions: {
          stepForwardButtonOptions: {
            listener: () => model.stepSingleStep()
          }
        }
      } );
      this.addChild( timeControlNode );
    }

    // Add it in front of everything (should never be obscured by a CircuitElement)
    this.addChild( zoomButtonGroup );

    Multilink.multilink(
      [ this.visibleBoundsProperty, toolboxContainer.localBoundsProperty, controlPanelVBox.localBoundsProperty ],
      ( visibleBounds: Bounds2 ) => {
        toolboxContainer.left = visibleBounds.left + HORIZONTAL_MARGIN;
        toolboxContainer.top = visibleBounds.top + VERTICAL_MARGIN;

        // Float the resetAllButton to the bottom right
        options.showResetAllButton && resetAllButton && resetAllButton.mutate( {
          right: visibleBounds.right - HORIZONTAL_MARGIN,
          bottom: visibleBounds.bottom - VERTICAL_MARGIN
        } );

        // isFinite() checks from https://github.com/phetsims/circuit-construction-kit-ac/issues/31
        if ( timeControlNode ) {
          timeControlNode.bottom = visibleBounds.bottom - VERTICAL_MARGIN;
          if ( controlPanelVBox.bounds.isFinite() ) {
            timeControlNode.left = controlPanelVBox.left;
          }
          else if ( resetAllButton && resetAllButton.bounds.isFinite() ) {
            timeControlNode.right = resetAllButton.left;
          }
        }

        if ( Number.isFinite( toolboxContainer.right ) ) {
          zoomButtonGroup.right = toolboxContainer.right;
        }
        else {
          zoomButtonGroup.left = visibleBounds.left + HORIZONTAL_MARGIN;
        }
        zoomButtonGroup.bottom = visibleBounds.bottom - VERTICAL_MARGIN;

        // Update the properties for positioning the edit panel between zoom buttons and time control
        zoomButtonGroupRightProperty.value = zoomButtonGroup.right;

        // Use time control left edge if available, otherwise fall back to control panel left edge
        const rightEdge = controlPanelVBox.bounds.isEmpty() ? visibleBounds.right : controlPanelVBox.left;
        timeControlLeftProperty.value = timeControlNode && timeControlNode.bounds.isFinite() ? timeControlNode.left : rightEdge;

        // Center charge speed readout between the panels
        const leftEdge = this.circuitElementToolbox.bounds.isEmpty() ? visibleBounds.left : this.circuitElementToolbox.right;
        chargeSpeedThrottlingReadoutNode.mutate( {
          centerX: ( leftEdge + rightEdge ) / 2,
          bottom: visibleBounds.bottom - 100 // so it doesn't overlap the component controls
        } );
      } );

    // Center the circuit node so that zooms will remain centered.
    this.circuitNode.setTranslation( this.layoutBounds.centerX, this.layoutBounds.centerY );
    this.circuitNodeBackLayer.setTranslation( this.layoutBounds.centerX, this.layoutBounds.centerY );

    // Continuously zoom in and out as the current zoom interpolates, and update when the visible bounds change
    Multilink.multilink( [ model.animatedZoomScaleProperty, this.visibleBoundsProperty ], ( currentZoom, visibleBounds ) => {
      this.circuitNode.setScaleMagnitude( currentZoom );
      this.circuitNodeBackLayer.setScaleMagnitude( currentZoom );
      this.circuitNode.updateTransform( visibleBounds );
    } );

    // When a Vertex is dropped and the CircuitElement is over the CircuitElementToolbox, the CircuitElement will go back
    // into the toolbox
    this.model.circuit.vertexDroppedEmitter.addListener( vertex => {

      const neighbors = this.model.circuit.getNeighborCircuitElements( vertex );
      if ( neighbors.length === 1 ) {
        const circuitElement = neighbors[ 0 ];
        const circuitElementNode = this.circuitNode.getCircuitElementNode( circuitElement );

        if ( this.canNodeDropInToolbox( circuitElementNode ) ) {
          this.model.circuit.disposeCircuitElement( circuitElement );
        }
      }
    } );

    // Re-render after setting state
    phetioStateSetEmitter.addListener( () => {
      this.step( 1 / 60 );
    } );

    // note whether the stopwatch should be repositioned when selected.  Otherwise it remembers its position
    this.stopwatchNodePositionDirty = true;

    if ( options.showStopwatchCheckbox ) {
      const stopwatchNode = new StopwatchNode( model.stopwatch, {
        dragBoundsProperty: this.visibleBoundsProperty,
        right: controlPanelVBox.left - HORIZONTAL_MARGIN,
        numberDisplayOptions: {
          numberFormatter: StopwatchNode.createRichTextNumberFormatter( {
            numberOfDecimalPlaces: 1
          } )
        },
        tandem: tandem.createTandem( 'stopwatchNode' )
      } );
      this.addChild( stopwatchNode );

      // Show the StopwatchNode when the checkbox is checked
      model.stopwatch.isVisibleProperty.link( isVisible => {
        if ( isVisible && this.stopwatchNodePositionDirty ) {

          // Compute bounds lazily now that everything is attached to the scene graph
          model.stopwatch.positionProperty.value = new Vector2(
            controlPanelVBox.left - stopwatchNode.width - 10,

            // center the text are vertically on the checkbox, so the non-draggable buttons aren't right next to the checkbox
            this.globalToLocalBounds( this.displayOptionsPanel.stopwatchCheckbox!.globalBounds ).centerY - stopwatchNode.height * 0.2
          );
          this.stopwatchNodePositionDirty = false;
        }
      } );
    }

    model.stepEmitter.addListener( dt => this.stepOnce( dt ) );

    KeyboardListener.createGlobal( this, {
      keyStringProperties: CCKCScreenView.DELETE_HOTKEY_DATA.keyStringProperties,
      fire: event => {

        // prevent default so 'backspace' and 'delete' don't navigate back a page in Firefox, see
        // https://github.com/phetsims/circuit-construction-kit-common/issues/307
        event?.preventDefault();

        // By default, delete the focused node
        let nodeToDelete = getPDOMFocusedNode();

        // However, if no node is focused, but a node is selected, then it should be deleted instead (this is the case for mouse/touch)
        if ( !( nodeToDelete instanceof VertexNode ) && !( nodeToDelete instanceof CircuitElementNode ) ) {
          const selected = this.circuitNode.circuit.selectionProperty.value;
          if ( selected instanceof Vertex ) {
            nodeToDelete = this.circuitNode.getVertexNode( selected );
          }
          else if ( selected instanceof CircuitElement ) {
            nodeToDelete = this.circuitNode.getCircuitElementNode( selected );
          }
        }

        if ( nodeToDelete instanceof VertexNode ) {
          if ( nodeToDelete.vertex.isCuttableProperty.value ) {
            const newVertices = this.circuitNode.circuit.cutVertex( nodeToDelete.vertex );
            cutSoundPlayer.play(); // Same sound as CutButton

            if ( newVertices.length > 0 ) {

              // Focus the first new vertex that was created by the cut operation
              const newVertexNode = this.circuitNode.getVertexNode( newVertices[ 0 ] );
              newVertexNode.focus();
            }
          }
        }
        else if ( nodeToDelete instanceof CircuitElementNode ) {
          const circuitElement = nodeToDelete.circuitElement;

          // Only permit deletion when not being dragged, see https://github.com/phetsims/circuit-construction-kit-common/issues/414
          if ( !circuitElement.startVertexProperty.value.isDragged && !circuitElement.endVertexProperty.value.isDragged ) {

            // Only permit deletion if the circuit element is marked as disposable
            if ( circuitElement.isDisposableProperty.value ) {
              this.circuitNode.circuit.disposeCircuitElement( circuitElement );

              // Play the "whoosh" eraser sound when using the keyboard to delete a Circuit Element, like we do in the CCKCTrashButton
              sharedSoundPlayers.get( 'erase' ).play();

              // Move focus to another circuit element
              if ( this.circuitNode.circuit.circuitElements.length > 0 ) {
                const anotherCircuitElementNode = this.circuitNode.getCircuitElementNode( this.circuitNode.circuit.circuitElements[ 0 ] );
                anotherCircuitElementNode.focus();
              }
              else {

                // If there are no more circuit elements, move focus to the 1st item in the circuit element toolbox, if there is one
                this.circuitElementToolbox.carousel.focus();
              }
            }
          }
        }

        // Return voltmeter to toolbox when delete/backspace is pressed on the body (not the probes)
        else if ( nodeToDelete instanceof VoltmeterBodyNode ) {
          nodeToDelete.voltmeter.isActiveProperty.value = false;
          this.sensorToolbox.voltmeterToolNode.focus();
        }

        // Return ammeter to toolbox when delete/backspace is pressed on the body (not the probes)
        else if ( nodeToDelete instanceof AmmeterBodyNode ) {
          nodeToDelete.ammeter.isActiveProperty.value = false;
          this.sensorToolbox.ammeterToolNode.focus();
        }
      }
    } );

    this.pdomPlayAreaNode.pdomOrder = [
      this.circuitNode,
      toolboxContainer
    ];

    this.pdomControlAreaNode.pdomOrder = [
      controlPanelVBox,
      this.viewRadioButtonGroup,
      zoomButtonGroup,
      resetAllButton
    ];

    this.showAdvancedControls = options.showAdvancedControls;
    this.screenSummaryContent = new CCKCScreenSummaryContent( model, this );

    KeyboardListener.createGlobal( this, {
      keyStringProperties: CCKCScreenView.FOCUS_TOOLBOX_HOTKEY_DATA.keyStringProperties,
      fire: event => {
        this.circuitElementToolbox.carousel.getFocusableItems()[ 0 ]?.focus();
      }
    } );

    KeyboardListener.createGlobal( this, {
      keyStringProperties: CCKCScreenView.FOCUS_CONSTRUCTION_AREA_HOTKEY_DATA.keyStringProperties,
      fire: () => {
        const circuitElements = model.circuit.circuitElementsInPDOMOrder;
        for ( let i = 0; i < circuitElements.length; i++ ) {
          const circuitElementNode = this.circuitNode.getCircuitElementNode( circuitElements[ i ] );
          if ( !circuitElementNode.isDisposed && circuitElementNode.focusable && circuitElementNode.visible && circuitElementNode.inputEnabled ) {
            circuitElementNode.focus();
            break;
          }
        }
      }
    } );

    KeyboardListener.createGlobal( this, {
      keyStringProperties: CCKCScreenView.DESELECT_CIRCUIT_ELEMENT_HOTKEY_DATA.keyStringProperties,
      fire: () => {
        const selection = model.circuit.selectionProperty.value;
        if ( selection instanceof CircuitElement ) {

          const originalFocusedNode = getPDOMFocusedNode();

          model.circuit.selectionProperty.value = null;

          // If focus was in the edit controls, then focus may be lost. In that case, restore focus to the CircuitElementNode
          if ( getPDOMFocusedNode() === null && originalFocusedNode !== null ) {
            const circuitElementNode = this.circuitNode.getCircuitElementNode( selection );
            circuitElementNode.focus();
          }
        }
      }
    } );
  }

  /**
   * Called from model steps
   */
  private stepOnce( dt: number ): void {

    // If the step is large, it probably means that the screen was hidden for a while, so just ignore it.
    // see https://github.com/phetsims/circuit-construction-kit-common/issues/476
    if ( dt >= CCKCConstants.MAX_DT ) {
      return;
    }

    this.chartNodes.forEach( chartNode => chartNode.step( this.model.circuit.timeProperty.value, dt ) );
  }

  /**
   * Move forward in time by the specified dt
   * @param dt - seconds
   */
  public override step( dt: number ): void {

    // noting from the main step
    this.circuitNode.step();

    // if the model is stepping, the charts will sample new values.  Otherwise, take a reading at the current point,
    // for updating the pen location
    if ( !this.model.isPlayingProperty.value ) {
      this.chartNodes.forEach( chartNode => chartNode.sampleLatestValue() );
    }
  }

  /**
   * Overrideable stub for resetting
   */
  private reset(): void {
    this.stopwatchNodePositionDirty = true;
    this.circuitElementToolbox.reset();
    this.circuitNode.reset();
    this.advancedAccordionBox && this.advancedAccordionBox.expandedProperty.reset();
    this.chartNodes.forEach( chartNode => chartNode.reset() );
  }

  /**
   * Return true if and only if the CircuitElementNode can be dropped in the toolbox.
   */
  public canNodeDropInToolbox( circuitElementNode: CircuitElementNode ): boolean {
    const circuitElement = circuitElementNode.circuitElement;

    // Only single (unconnected) elements can be dropped into the toolbox
    const isSingle = this.model.circuit.isSingle( circuitElement );

    const componentImage = circuitElementNode instanceof FixedCircuitElementNode ? circuitElementNode.contentNode : circuitElementNode;
    const elementNodeBounds = this.globalToLocalBounds( componentImage.globalBounds );
    const elementNodeBoundsEroded = CCKCUtils.getDropItemHitBoxForBounds( elementNodeBounds );

    // SeriesAmmeters should be dropped in the sensor toolbox
    const toolbox = circuitElement instanceof SeriesAmmeter ? this.sensorToolbox : this.circuitElementToolbox.carousel;

    const globalCarouselBounds = toolbox.localToGlobalBounds( toolbox.localBounds );
    const carouselBounds = this.globalToLocalBounds( globalCarouselBounds );

    // Detect whether eroded component image bounds intersects the toolbox bounds
    const overToolbox = carouselBounds.intersectsBounds( elementNodeBoundsEroded );

    const isToolboxVisible = !!toolbox.getTrails().find( trail => trail.isVisible() );

    return isSingle && overToolbox && isToolboxVisible && circuitElement.isDisposableProperty.value;
  }

  public static readonly DELETE_HOTKEY_DATA = new HotkeyData( {
    keys: [ 'delete', 'backspace' ],
    repoName: circuitConstructionKitCommon.name,
    keyboardHelpDialogLabelStringProperty: CircuitConstructionKitCommonFluent.keyboardHelpDialog.circuitComponentsAndTools.cutConnectionsStringProperty,
    global: true
  } );

  public static readonly EDIT_HOTKEY_DATA = new HotkeyData( {
    keys: [ 'space', 'enter' ],
    repoName: circuitConstructionKitCommon.name,
    keyboardHelpDialogLabelStringProperty: CircuitConstructionKitCommonFluent.keyboardHelpDialog.circuitComponentsAndTools.editComponentStringProperty,
    global: true
  } );

  public static readonly TOGGLE_SWITCH_HOTKEY_DATA = new HotkeyData( {
    keys: [ 'space', 'enter' ],
    repoName: circuitConstructionKitCommon.name,
    binderName: 'Toggle switch open/closed',
    global: true
  } );

  public static readonly FOCUS_TOOLBOX_HOTKEY_DATA = new HotkeyData( {
    keys: [ 'alt+t' ],
    repoName: circuitConstructionKitCommon.name,
    keyboardHelpDialogLabelStringProperty: CircuitConstructionKitCommonFluent.keyboardHelpDialog.focus.focusToolboxStringProperty,
    global: true
  } );

  public static readonly FOCUS_CONSTRUCTION_AREA_HOTKEY_DATA = new HotkeyData( {
    keys: [ 'alt+p' ],
    repoName: circuitConstructionKitCommon.name,
    keyboardHelpDialogLabelStringProperty: CircuitConstructionKitCommonFluent.keyboardHelpDialog.focus.focusConstructionAreaStringProperty,
    global: true
  } );

  public static readonly DESELECT_CIRCUIT_ELEMENT_HOTKEY_DATA = new HotkeyData( {
    keys: [ 'escape' ],
    repoName: circuitConstructionKitCommon.name,
    binderName: 'Deselect circuit element',
    global: true
  } );
}

circuitConstructionKitCommon.register( 'CCKCScreenView', CCKCScreenView );
