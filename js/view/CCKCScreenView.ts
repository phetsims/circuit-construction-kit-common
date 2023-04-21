// Copyright 2015-2023, University of Colorado Boulder

/**
 * Node that represents a single scene or screen, with a circuit, toolbox, sensors, etc. Exists for the life of the sim
 * and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Multilink from '../../../axon/js/Multilink.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import ScreenView, { ScreenViewOptions } from '../../../joist/js/ScreenView.js';
import optionize from '../../../phet-core/js/optionize.js';
import PlayPauseButton from '../../../scenery-phet/js/buttons/PlayPauseButton.js';
import ResetAllButton from '../../../scenery-phet/js/buttons/ResetAllButton.js';
import StopwatchNode from '../../../scenery-phet/js/StopwatchNode.js';
import TimeControlNode from '../../../scenery-phet/js/TimeControlNode.js';
import { AlignBox, AlignGroup, KeyboardListener, KeyboardUtils, Node, VBox } from '../../../scenery/js/imports.js';
import { CarouselItem } from '../../../sun/js/Carousel.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import CircuitConstructionKitModel from '../model/CircuitConstructionKitModel.js';
import SeriesAmmeter from '../model/SeriesAmmeter.js';
import AdvancedAccordionBox from './AdvancedAccordionBox.js';
import AmmeterNode from './AmmeterNode.js';
import ChargeSpeedThrottlingReadoutNode from './ChargeSpeedThrottlingReadoutNode.js';
import CircuitElementEditContainerNode from './CircuitElementEditContainerNode.js';
import CircuitElementNode from './CircuitElementNode.js';
import CircuitElementToolbox, { CircuitElementToolboxOptions } from './CircuitElementToolbox.js';
import CircuitNode from './CircuitNode.js';
import CurrentChartNode from './CurrentChartNode.js';
import DisplayOptionsPanel from './DisplayOptionsPanel.js';
import SensorToolbox from './SensorToolbox.js';
import ViewRadioButtonGroup from './ViewRadioButtonGroup.js';
import VoltageChartNode from './VoltageChartNode.js';
import VoltmeterNode from './VoltmeterNode.js';
import CCKCZoomButtonGroup from './CCKCZoomButtonGroup.js';
import FixedCircuitElementNode from './FixedCircuitElementNode.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import CCKCUtils from '../CCKCUtils.js';
import Vertex from '../model/Vertex.js';
import CircuitElement from '../model/CircuitElement.js';

const batteryResistanceStringProperty = CircuitConstructionKitCommonStrings.batteryResistanceStringProperty;
const sourceResistanceStringProperty = CircuitConstructionKitCommonStrings.sourceResistanceStringProperty;

// constants
const VERTICAL_MARGIN = CCKCConstants.VERTICAL_MARGIN;

// Match margins with the carousel page control and spacing
const HORIZONTAL_MARGIN = CCKCConstants.HORIZONTAL_MARGIN;

// Group for aligning the content in the panels and accordion boxes.  This is a class variable instead of an
// instance variable so the control panels will have the same width across all screens,
// see https://github.com/phetsims/circuit-construction-kit-dc/issues/9
const CONTROL_PANEL_ALIGN_GROUP = new AlignGroup( {

  // Elements should have the same widths but not constrained to have the same heights
  matchVertical: false
} );

// Support accessibility for deleting selected circuit elements, but don't support broader tab navigation until it
// is complete
document.addEventListener( 'keydown', event => {

  if ( KeyboardUtils.isKeyEvent( event, KeyboardUtils.KEY_TAB ) ) {
    event.preventDefault();
  }
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

    super( { tandem: tandem } );

    this.model = model;

    // TODO (black-box-study): change background color to gray when isValueDepictionEnabledProperty goes false

    // contains parts of the circuit that should be shown behind the controls
    this.circuitNodeBackLayer = new Node();

    this.circuitNode = new CircuitNode(
      model.circuit, this, tandem.createTandem( 'circuitNode' )
    );

    const meterNodesTandem = tandem.createTandem( 'meterNodes' );

    const voltmeterNodes = model.voltmeters.map( voltmeter => {
      const voltmeterNode = new VoltmeterNode( voltmeter, model, this.circuitNode, {
        tandem: meterNodesTandem.createTandem( `voltmeterNode${voltmeter.phetioIndex}` ),
        showResultsProperty: model.isValueDepictionEnabledProperty,
        visibleBoundsProperty: this.circuitNode.visibleBoundsInCircuitCoordinateFrameProperty,
        showPhetioIndex: options.showMeterPhetioIndex
      } );
      voltmeter.droppedEmitter.addListener( bodyNodeGlobalBounds => {
        const bodyNodeBoundsEroded = CCKCUtils.getDropItemHitBoxForBounds( bodyNodeGlobalBounds );
        if ( bodyNodeBoundsEroded.intersectsBounds( this.sensorToolbox.globalBounds ) ) {
          voltmeter.isActiveProperty.value = false;
        }
      } );
      return voltmeterNode;
    } );

    const ammeterNodes = model.ammeters.map( ammeter => {
      const ammeterNode = new AmmeterNode( ammeter, this.circuitNode, {
        tandem: model.isShowNoncontactAmmeters ? meterNodesTandem.createTandem( `ammeterNode${ammeter.phetioIndex}` ) : Tandem.OPT_OUT,
        showResultsProperty: model.isValueDepictionEnabledProperty,
        visibleBoundsProperty: this.circuitNode.visibleBoundsInCircuitCoordinateFrameProperty,
        blackBoxStudy: options.blackBoxStudy,
        showPhetioIndex: options.showMeterPhetioIndex
      } );
      ammeter.droppedEmitter.addListener( bodyNodeGlobalBounds => {
        const bodyNodeBoundsEroded = CCKCUtils.getDropItemHitBoxForBounds( bodyNodeGlobalBounds );
        if ( bodyNodeBoundsEroded.intersectsBounds( this.sensorToolbox.globalBounds ) ) {
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
      tandem.createTandem( 'viewRadioButtonGroup' ), {
        maxWidth: this.circuitElementToolbox.carousel.backgroundWidth
      }
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

    // The center between the left toolbox and the right control panels
    const playAreaCenterXProperty = new NumberProperty( 0 );

    const circuitElementEditContainerNode = new CircuitElementEditContainerNode(
      model.circuit,
      this.visibleBoundsProperty,
      model.modeProperty,
      playAreaCenterXProperty,
      tandem.createTandem( 'circuitElementEditContainerNode' ), {
        showPhaseShiftControl: options.showPhaseShiftControl
      }
    );

    this.addChild( circuitElementEditContainerNode );

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
      [ this.visibleBoundsProperty, toolboxContainer.localBoundsProperty ],
      ( visibleBounds: Bounds2 ) => {
        toolboxContainer.left = visibleBounds.left + HORIZONTAL_MARGIN;
        toolboxContainer.top = visibleBounds.top + VERTICAL_MARGIN;

        // Float the resetAllButton to the bottom right
        options.showResetAllButton && resetAllButton && resetAllButton.mutate( {
          right: visibleBounds.right - HORIZONTAL_MARGIN,
          bottom: visibleBounds.bottom - VERTICAL_MARGIN
        } );

        timeControlNode && timeControlNode.mutate( {
          left: controlPanelVBox.left,
          bottom: visibleBounds.bottom - VERTICAL_MARGIN
        } );

        if ( Number.isFinite( toolboxContainer.right ) ) {
          zoomButtonGroup.right = toolboxContainer.right;
        }
        else {
          zoomButtonGroup.left = visibleBounds.left + HORIZONTAL_MARGIN;
        }
        zoomButtonGroup.bottom = visibleBounds.bottom - VERTICAL_MARGIN;

        // Center some things between the panels, but gracefully accommodate when phet-io has made them disappear
        const leftEdge = this.circuitElementToolbox.bounds.isEmpty() ? visibleBounds.left : this.circuitElementToolbox.right;
        const rightEdge = controlPanelVBox.bounds.isEmpty() ? visibleBounds.right : controlPanelVBox.left;

        playAreaCenterXProperty.value = ( leftEdge + rightEdge ) / 2;

        chargeSpeedThrottlingReadoutNode.mutate( {
          centerX: playAreaCenterXProperty.value,
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
    Tandem.PHET_IO_ENABLED && phet.phetio.phetioEngine.phetioStateEngine.stateSetEmitter.addListener( () => {
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

    // Add a global key listener on a nested Node since having a listener on the root would make pickable:null things
    // into pickable: true and hence block input, see https://github.com/phetsims/circuit-construction-kit-common/issues/985
    this.addChild( new Node( {
      inputListeners: [ new KeyboardListener( {
        keys: [ 'delete', 'backspace' ],
        global: true,
        callback: ( event, listener ) => {

          // prevent default so 'backspace' and 'delete' don't navigate back a page in Firefox, see
          // https://github.com/phetsims/circuit-construction-kit-common/issues/307
          event?.domEvent?.preventDefault();

          // Double guard to work around errors in fuzzing
          const selection = this.circuitNode.circuit.selectionProperty.value;
          if ( this.circuitNode.vertexCutButton.inputEnabled && selection instanceof Vertex ) {
            this.circuitNode.circuit.cutVertex( this.circuitNode.circuit.getSelectedVertex()! );
          }
          else if ( selection instanceof CircuitElement ) {

            const circuitElement = selection;

            // Only permit deletion when not being dragged, see https://github.com/phetsims/circuit-construction-kit-common/issues/414
            if ( !circuitElement.startVertexProperty.value.isDragged && !circuitElement.endVertexProperty.value.isDragged ) {

              // Only permit deletion if the circuit element is marked as disposable
              if ( circuitElement.isDisposableProperty.value ) {
                this.circuitNode.circuit.disposeCircuitElement( circuitElement );
              }
            }
          }
        }
      } ) ]
    } ) );
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

    return isSingle && overToolbox && circuitElement.isDisposableProperty.value;
  }
}

circuitConstructionKitCommon.register( 'CCKCScreenView', CCKCScreenView );