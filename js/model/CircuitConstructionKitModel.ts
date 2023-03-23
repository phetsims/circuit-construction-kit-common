// Copyright 2015-2023, University of Colorado Boulder

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
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import Stopwatch from '../../../scenery-phet/js/Stopwatch.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Ammeter from './Ammeter.js';
import Circuit from './Circuit.js';
import Voltmeter from './Voltmeter.js';
import ZoomAnimation from './ZoomAnimation.js';
import Tandem from '../../../tandem/js/Tandem.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import CircuitElementViewType from './CircuitElementViewType.js';
import LightBulb from './LightBulb.js';
import InteractionMode from './InteractionMode.js';
import optionize from '../../../phet-core/js/optionize.js';
import TEmitter from '../../../axon/js/TEmitter.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Utils from '../../../dot/js/Utils.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import TModel from '../../../joist/js/TModel.js';

type CircuitConstructionKitModelOptions = {
  blackBoxStudy?: boolean;
  revealing?: boolean;
  showNoncontactAmmeters?: boolean;
};

export default class CircuitConstructionKitModel implements TModel {
  private zoomAnimation: ZoomAnimation | null;
  public readonly viewTypeProperty: Property<CircuitElementViewType>;

  // whether the carousel shows real bulbs
  public readonly addRealBulbsProperty: BooleanProperty;

  // whether to show noncontact ammeters
  public readonly isShowNoncontactAmmeters: boolean;

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

  // the index of zoomScaleProperty in the CCKConstants.ZOOM_LEVEL array
  public readonly zoomLevelProperty: NumberProperty;

  // the target zoom level of the objects in the view after zoom animation completes
  public readonly zoomScaleProperty: TReadOnlyProperty<number>;

  // the animated value of the zoom level, changes during zoom animation
  public readonly animatedZoomScaleProperty: NumberProperty;

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

  protected constructor( includeACElements: boolean, includeLabElements: boolean, tandem: Tandem, providedOptions?: CircuitConstructionKitModelOptions ) {

    const options = optionize<CircuitConstructionKitModelOptions>()( {

      // Determines whether electrons can be shown.  In black box, electrons can only be shown when the user reveals
      // the answer by pressing the reveal answer button.
      revealing: true,
      blackBoxStudy: false,
      showNoncontactAmmeters: true
    }, providedOptions );

    // animation for the zoom level or null if not animating
    this.zoomAnimation = null;

    // whether to show lifelike or schematic representations
    this.viewTypeProperty = new EnumerationProperty( CircuitElementViewType.LIFELIKE, {
      tandem: tandem.createTandem( 'viewTypeProperty' ),
      phetioFeatured: true
    } );

    this.addRealBulbsProperty = new BooleanProperty( CCKCQueryParameters.addRealBulbs, {
      tandem: includeLabElements ? tandem.createTandem( 'addRealBulbsProperty' ) : Tandem.OPT_OUT,
      phetioFeatured: true,
      hasListenerOrderDependencies: true // TODO: https://github.com/phetsims/circuit-construction-kit-common/issues/989
    } );

    this.isShowNoncontactAmmeters = options.showNoncontactAmmeters;

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
      new Ammeter( this.isShowNoncontactAmmeters ? metersTandem.createTandem( 'ammeter1' ) : Tandem.OPT_OUT, 1 ),
      new Ammeter( this.isShowNoncontactAmmeters ? metersTandem.createTandem( 'ammeter2' ) : Tandem.OPT_OUT, 2 )
    ];

    [ ...this.voltmeters, ...this.ammeters ].forEach( meter => {
      meter.isActiveProperty.link( isActive => {

        // Clear the selection when the user drags out a sensor
        if ( isActive ) {
          this.circuit.selectionProperty.value = null;
        }
      } );
    } );

    const blackBoxStudyTandem = options.blackBoxStudy ? tandem.createTandem( 'blackBoxStudy' ) : Tandem.OPT_OUT;
    this.isValueDepictionEnabledProperty = new BooleanProperty(
      !CCKCQueryParameters.showDepictValuesToggleButton, {
        tandem: blackBoxStudyTandem.createTandem( 'isValueDepictionEnabledProperty' ),
        phetioDocumentation: 'whether the light bulb brightness and ammeter/voltmeter readouts, charges, flame, etc. can be seen'
      } );

    this.showLabelsProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'showLabelsProperty' ),
      phetioFeatured: true
    } );

    this.showValuesProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'showValuesProperty' ),
      phetioFeatured: true
    } );

    assert && assert( CCKCConstants.ZOOM_SCALES.includes( 1 ), 'Zoom scales must include 1 as an option' );

    // Zoom level for scenes
    this.zoomLevelProperty = new NumberProperty( CCKCConstants.ZOOM_SCALES.indexOf( 1 ), {
      numberType: 'Integer',
      range: new Range( 0, CCKCConstants.ZOOM_SCALES.length - 1 ),
      tandem: tandem.createTandem( 'zoomLevelProperty' ),
      phetioDocumentation: 'This Property is controlled by the zoom buttons. ' +
                           'It is an integer index that tells the sim how much to scale the view. ' +
                           'Smaller values are more zoomed out. ' +
                           'See zoomScaleProperty for the actual scale value.',
      phetioFeatured: true
    } );

    // Scale factor for the current zoom level
    this.zoomScaleProperty = new DerivedProperty(
      [ this.zoomLevelProperty ],
      ( zoomLevel: number ) => CCKCConstants.ZOOM_SCALES[ zoomLevel ], {
        validValues: CCKCConstants.ZOOM_SCALES,
        tandem: tandem.createTandem( 'zoomScaleProperty' ),
        phetioValueType: NumberIO,
        phetioDocumentation: 'Scale that is applied to the view. This Property is derived from zoomLevelProperty, ' +
                             'which is controlled by the zoom buttons.'
      } );

    this.animatedZoomScaleProperty = new NumberProperty( this.zoomScaleProperty.get() );

    this.zoomScaleProperty.lazyLink( ( newValue: number ) => {
      if ( phet.joist.sim.isSettingPhetioStateProperty.value ) {
        this.animatedZoomScaleProperty.value = newValue;
      }
      else {
        this.zoomAnimation = new ZoomAnimation( this.animatedZoomScaleProperty.get(), newValue, ( delta: number ) => {
          const proposedZoomValue = this.animatedZoomScaleProperty.value + delta;
          const minZoomScale = Math.min( ...CCKCConstants.ZOOM_SCALES );
          const maxZoomScale = Math.max( ...CCKCConstants.ZOOM_SCALES );
          const boundedValue = Utils.clamp( proposedZoomValue, minZoomScale, maxZoomScale );
          this.animatedZoomScaleProperty.value = boundedValue;
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
      phetioReadOnly: true,
      phetioFeatured: true
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
      const animationComplete = this.zoomAnimation.step( dt );
      if ( animationComplete ) {
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
    this.zoomLevelProperty.reset();
    this.animatedZoomScaleProperty.reset();
    this.stopwatch.reset();
    this.isPlayingProperty.reset();
    this.addRealBulbsProperty.reset();

    // cancel any animation in progress, including (but not limited to) one that may have just been caused by reset
    this.zoomAnimation = null;
  }
}

circuitConstructionKitCommon.register( 'CircuitConstructionKitModel', CircuitConstructionKitModel );