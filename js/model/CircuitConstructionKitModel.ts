// Copyright 2015-2022, University of Colorado Boulder

/**
 * Contains circuit, voltmeter, ammeter and properties to indicate what mode the model is in. This exists for the life
 * of the sim and hence does not need a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import Property from '../../../axon/js/Property.js';
import NumberProperty, { RangedProperty } from '../../../axon/js/NumberProperty.js';
import Utils from '../../../dot/js/Utils.js';
import Range from '../../../dot/js/Range.js';
import Stopwatch from '../../../scenery-phet/js/Stopwatch.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import ZoomButtonGroup from '../view/ZoomButtonGroup.js';
import Ammeter from './Ammeter.js';
import Circuit from './Circuit.js';
import Voltmeter from './Voltmeter.js';
import ZoomAnimation from './ZoomAnimation.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import CircuitElementViewType from './CircuitElementViewType.js';
import LightBulb from './LightBulb.js';
import InteractionMode from './InteractionMode.js';
import ZoomLevel from './ZoomLevel.js';
import optionize from '../../../phet-core/js/optionize.js';
import TEmitter from '../../../axon/js/TEmitter.js';

type CircuitConstructionKitModelOptions = {
  blackBoxStudy?: boolean;
  revealing?: boolean;
};

export default class CircuitConstructionKitModel {
  private zoomAnimation: ZoomAnimation | null;
  public readonly viewTypeProperty: Property<CircuitElementViewType>;

  // whether the carousel shows real bulbs
  private readonly addRealBulbsProperty: BooleanProperty;

  // contains CircuitElements, Vertices, etc.
  public readonly circuit: Circuit;

  // created statically and indexed starting at 1 for human-readability for PhET-iO
  public readonly voltmeters: Voltmeter[];

  // created statically and indexed starting at 1 for human-readability for PhET-iO
  public readonly ammeters: Ammeter[];
  public readonly isValueDepictionEnabledProperty: BooleanProperty;

  // true if the labels in the toolbox should be shown
  public readonly showLabelsProperty: BooleanProperty;

  // true if the values in the toolbox should be shown
  public readonly showValuesProperty: BooleanProperty;
  public readonly selectedZoomProperty: RangedProperty;

  // the animated value of the zoom level
  public readonly currentZoomProperty: NumberProperty;

  // True if the simulation is playing, controlled by the TimeControlNode
  public readonly isPlayingProperty: BooleanProperty;

  // whether the user is in the CircuitConstructionKitModel.InteractionMode.EXPLORE or CircuitConstructionKitModel.InteractionMode.TEST mode
  public readonly modeProperty: EnumerationProperty<InteractionMode>;

  // true when the user is holding down the reveal button and the answer (inside the black box) is showing
  public readonly revealingProperty: BooleanProperty;

  // bounds of the black box, if any.  Set by subclass in Black Box Study. Specifically, filled in by the
  // BlackBoxSceneView after the black box node is created and positioned
  public readonly blackBoxBounds: Bounds2 | null;
  public readonly stopwatch: Stopwatch;

  // Indicates when the model has updated, some views need to update accordingly
  public readonly stepEmitter: TEmitter<[ number ]>;
  private readonly zoomProperty: EnumerationProperty<ZoomLevel>;

  private constructor( includeACElements: boolean, includeLabElements: boolean, tandem: Tandem, providedOptions?: CircuitConstructionKitModelOptions ) {

    const options = optionize<CircuitConstructionKitModelOptions>()( {

      // Determines whether electrons can be shown.  In black box, electrons can only be shown when the user reveals
      // the answer by pressing the reveal answer button.
      revealing: true,
      blackBoxStudy: false
    }, providedOptions );

    // animation for the zoom level or null if not animating
    this.zoomAnimation = null;

    // whether to show lifelike or schematic representations
    this.viewTypeProperty = new EnumerationProperty( CircuitElementViewType.LIFELIKE, {
      tandem: tandem.createTandem( 'viewTypeProperty' )
    } );

    this.addRealBulbsProperty = new BooleanProperty( CCKCQueryParameters.addRealBulbs, {
      tandem: includeLabElements ? tandem.createTandem( 'addRealBulbsProperty' ) : Tandem.OPT_OUT
    } );

    const circuitTandem = tandem.createTandem( 'circuit' );
    this.circuit = new Circuit( this.viewTypeProperty, this.addRealBulbsProperty, circuitTandem, {
      blackBoxStudy: options.blackBoxStudy,
      includeLabElements: includeLabElements,
      includeACElements: includeACElements
    } );

    const metersTandem = tandem.createTandem( 'meters' );
    this.voltmeters = [
      new Voltmeter( metersTandem.createTandem( 'voltmeter1' ), 1 ),
      new Voltmeter( metersTandem.createTandem( 'voltmeter2' ), 2 )
    ];

    this.ammeters = [
      new Ammeter( metersTandem.createTandem( 'ammeter1' ), 1 ),
      new Ammeter( metersTandem.createTandem( 'ammeter2' ), 2 )
    ];

    const blackBoxStudyTandem = options.blackBoxStudy ? tandem.createTandem( 'blackBoxStudy' ) : Tandem.OPT_OUT;
    this.isValueDepictionEnabledProperty = new BooleanProperty(
      !CCKCQueryParameters.showDepictValuesToggleButton, {
        tandem: blackBoxStudyTandem.createTandem( 'isValueDepictionEnabledProperty' ),
        phetioDocumentation: 'whether the light bulb brightness and ammeter/voltmeter readouts, charges, flame, etc. can be seen'
      } );

    this.showLabelsProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'showLabelsProperty' )
    } );

    this.showValuesProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'showValuesProperty' )
    } );

    // Scaling applied to the circuit node so the user can zoom out and make larger circuits.
    // 0 = zoomed out fully, 1 = zoomed in fully.  This NumberProperty is an implementation detail necessary to wire up
    // to MagnifyingGlassZoomButton
    this.selectedZoomProperty = new NumberProperty( 1, {
      tandem: tandem.createTandem( 'selectedZoomProperty' ),
      range: new Range( 0, 1 ),
      validValues: [ 0, 1 ],
      phetioDocumentation: 'Zoom level for the sim.  0=zoomed out, 1=zoomed in (magnified)'
    } ).asRanged();

    // For PhET-iO: Use an enumeration pattern for the API
    this.zoomProperty = new EnumerationProperty( ZoomLevel.NORMAL, {
      tandem: tandem.createTandem( 'zoomProperty' ),
      phetioDocumentation: 'Selected zoom level for the simulation'
    } );
    this.selectedZoomProperty.lazyLink( selectedZoom => this.zoomProperty.set( selectedZoom === 0 ? ZoomLevel.ZOOMED_OUT : ZoomLevel.NORMAL ) );
    this.zoomProperty.lazyLink( zoom => this.selectedZoomProperty.set( zoom === ZoomLevel.ZOOMED_OUT ? 0 : 1 ) );

    this.currentZoomProperty = new NumberProperty( this.selectedZoomProperty.get() );

    this.selectedZoomProperty.lazyLink( ( newValue: number ) => {
      if ( phet.joist.sim.isSettingPhetioStateProperty.value ) {
        this.currentZoomProperty.value = newValue === 0 ? ZoomButtonGroup.ZOOMED_OUT : ZoomButtonGroup.ZOOMED_IN;
      }
      else {
        this.zoomAnimation = new ZoomAnimation( this.currentZoomProperty.get(), newValue, ( delta: number ) => {
          const proposedZoomValue = this.currentZoomProperty.value + delta;
          const boundedValue = Utils.clamp( proposedZoomValue, ZoomButtonGroup.ZOOMED_OUT, ZoomButtonGroup.ZOOMED_IN );
          this.currentZoomProperty.value = boundedValue;
        } );
      }
    } );

    this.isPlayingProperty = new BooleanProperty( true, {
      tandem: includeACElements ? tandem.createTandem( 'isPlayingProperty' ) : Tandem.OPT_OUT,
      phetioFeatured: true
    } );

    this.modeProperty = new EnumerationProperty( InteractionMode.EXPLORE, {
      tandem: blackBoxStudyTandem.createTandem( 'modeProperty' ),
      phetioDocumentation: 'For Circuit Construction Kit: Black Box Study'
    } );

    // When the user manipulates something, hide the readouts, see
    // https://github.com/phetsims/circuit-construction-kit/issues/130
    // The following cases result in hiding the readouts:
    // 1. More components are dragged out of the toolbox
    // 2. Any vertex is broken
    // 3. Component voltage/resistance is edited
    // 4. A component within a circuit is deleted, see
    // https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/16
    // However, the simulation should not pause when switching between "Explore" and "Test" and "Reveal" in the black
    // box study sim
    const modeChanging = false;

    // TODO (black-box-study): started/endedCallbacksForChangedEmitters don't exist anymore. Rewrite if commented back in.
    // this.modeProperty.startedCallbacksForChangedEmitter.addListener( function() {
    //   modeChanging = true;
    // } );
    // this.modeProperty.endedCallbacksForChangedEmitter.addListener( function() {
    //   modeChanging = false;
    // } );
    if ( CCKCQueryParameters.showDepictValuesToggleButton ) {

      // TODO (black-box-study) fix this
      const pause = () => {
        if ( !modeChanging ) {
          this.isValueDepictionEnabledProperty.value = false;
        }
      };
      this.circuit.vertexGroup.elementCreatedEmitter.addListener( pause );
      this.circuit.vertexGroup.elementDisposedEmitter.addListener( pause );
      this.circuit.componentEditedEmitter.addListener( pause );
      this.circuit.circuitElements.lengthProperty.link( pause );
    }

    // Broad channel for PhET-iO that signifies a change in the circuit. Wrapper listeners can call get state after circuit
    // changes to obtain the new circuit.
    const circuitChangedEmitter = new Emitter( {
      tandem: circuitTandem.createTandem( 'circuitChangedEmitter' ),
      phetioDocumentation: 'Emits when any circuit model parameter or topology has changed',
      phetioReadOnly: true
    } );

    const emitCircuitChanged = () => circuitChangedEmitter.emit();
    this.circuit.vertexGroup.elementCreatedEmitter.addListener( emitCircuitChanged );
    this.circuit.vertexGroup.elementDisposedEmitter.addListener( emitCircuitChanged );
    this.circuit.componentEditedEmitter.addListener( emitCircuitChanged );

    // When the simulation pauses and resumes, clear the time scaling factor (so it doesn't show a stale value)
    this.isValueDepictionEnabledProperty.link( () => this.circuit.chargeAnimator.timeScaleRunningAverage.clear() );

    // When the view changes between schematic/lifelike, update the electron paths (because the LightBulb has a different
    // charge path depending on the view
    this.viewTypeProperty.link( () => {

      // First update the length of the light bulbs
      this.circuit.circuitElements.forEach( circuitElement => {
        if ( circuitElement instanceof LightBulb ) {
          circuitElement.updatePathLength();
        }
      } );

      // Then position the electrons in the new paths
      this.circuit.relayoutAllCharges();
    } );

    this.revealingProperty = new BooleanProperty( options.revealing, {
      tandem: blackBoxStudyTandem.createTandem( 'revealingProperty' ),
      phetioDocumentation: 'For Circuit Construction Kit: Black Box Study'
    } );

    this.blackBoxBounds = null;

    this.stopwatch = new Stopwatch( {
      tandem: includeACElements ? tandem.createTandem( 'stopwatch' ) : Tandem.OPT_OUT
    } );

    this.stepEmitter = new Emitter( {
      parameters: [ { valueType: 'number' } ]
    } );
  }

  public stepSingleStep(): void {

    // 6/60 = 0.1 second, run over multiple steps to maintain smooth curves in the charts
    _.times( 6, () => this.stepOnce( 1 / 60 ) );
    this.circuit.layoutChargesInDirtyCircuitElements();
  }

  /**
   * Step forward one step, whether automatically or when the step button is pressed.
   */
  private stepOnce( dt: number ): void {

    // Only move charges if the simulation is not paused.
    this.isValueDepictionEnabledProperty.value && this.circuit.step( dt );
    this.stopwatch.step( dt );
    this.stepEmitter.emit( dt );
  }

  /**
   * Update the circuit and zoom level when the simulation clock steps.
   * @param dt - elapsed time in seconds
   */
  public step( dt: number ): void {

    // If the step is large, it probably means that the screen was hidden for a while, so just ignore it.
    // see https://github.com/phetsims/circuit-construction-kit-common/issues/476
    if ( dt >= CCKCConstants.MAX_DT ) {
      return;
    }

    if ( this.zoomAnimation ) {
      const animationRatio = this.zoomAnimation.step( dt );
      if ( animationRatio >= 1 ) {
        this.zoomAnimation = null;
      }
    }

    if ( this.isPlayingProperty.value || this.circuit.dirty ) {
      this.stepOnce( this.isPlayingProperty.value ? 1 / 60 : CCKCConstants.PAUSED_DT );
    }

    this.circuit.layoutChargesInDirtyCircuitElements();
  }

  /**
   * Reset the circuit.
   */
  public reset(): void {
    this.isValueDepictionEnabledProperty.reset();
    this.showLabelsProperty.reset();
    this.showValuesProperty.reset();
    this.modeProperty.reset();
    this.circuit.reset();
    this.voltmeters.forEach( voltmeter => voltmeter.reset() );
    this.ammeters.forEach( ammeter => ammeter.reset() );
    this.viewTypeProperty.reset();
    this.currentZoomProperty.reset();
    this.selectedZoomProperty.reset();
    this.stopwatch.reset();
    this.isPlayingProperty.reset();
    this.addRealBulbsProperty.reset();

    // cancel any animation in progress, including (but not limited to) one that may have just been caused by reset
    this.zoomAnimation = null;
  }
}

circuitConstructionKitCommon.register( 'CircuitConstructionKitModel', CircuitConstructionKitModel );