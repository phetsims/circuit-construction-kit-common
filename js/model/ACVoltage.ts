// Copyright 2015-2022, University of Colorado Boulder

/**
 * The ACVoltage is a circuit element that provides an oscillating voltage difference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Range from '../../../dot/js/Range.js';
import optionize from '../../../phet-core/js/optionize.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Circuit from './Circuit.js';
import Vertex from './Vertex.js';
import VoltageSource from './VoltageSource.js';
import { VoltageSourceOptions } from './VoltageSource.js';

// constants

// The maximum amplitude of the oscillating voltage
const MAX_VOLTAGE = 120;

type ACVoltageSelfOptions = {};
type ACVoltageOptions = ACVoltageSelfOptions & VoltageSourceOptions;

class ACVoltage extends VoltageSource {

  // the maximum voltage, which can be controlled by the CircuitElementNumberControl
  readonly maximumVoltageProperty: NumberProperty;

  // the frequency of oscillation in Hz
  readonly frequencyProperty: NumberProperty;

  // the phase in degrees
  readonly phaseProperty: NumberProperty;

  private time: number;
  isPhaseEditableProperty: BooleanProperty;
  isFrequencyEditableProperty: BooleanProperty;
  isVoltageEditableProperty: BooleanProperty;
  static VOLTAGE_RANGE = new Range( -MAX_VOLTAGE, MAX_VOLTAGE );
  static DEFAULT_FREQUENCY = 0.5;
  static FREQUENCY_RANGE = new Range( 0.1, 2.0 );
  static MAX_VOLTAGE_RANGE = new Range( 0, MAX_VOLTAGE );

  constructor( startVertex: Vertex, endVertex: Vertex, internalResistanceProperty: Property<number>, tandem: Tandem, providedOptions?: ACVoltageOptions ) {
    assert && assert( internalResistanceProperty, 'internalResistanceProperty should be defined' );

    const options = optionize<ACVoltageOptions, ACVoltageSelfOptions, VoltageSourceOptions, 'voltage'>( {
      initialOrientation: 'right',
      voltage: 9.0,
      isFlammable: true,
      numberOfDecimalPlaces: 2,
      voltagePropertyOptions: {
        range: ACVoltage.VOLTAGE_RANGE
      }
    }, providedOptions );
    super( startVertex, endVertex, internalResistanceProperty, CCKCConstants.BATTERY_LENGTH, tandem, options );

    this.maximumVoltageProperty = new NumberProperty( options.voltage, {
      tandem: tandem.createTandem( 'maximumVoltageProperty' ),
      range: ACVoltage.MAX_VOLTAGE_RANGE
    } );

    this.frequencyProperty = new NumberProperty( ACVoltage.DEFAULT_FREQUENCY, {
      tandem: tandem.createTandem( 'frequencyProperty' ),
      range: ACVoltage.FREQUENCY_RANGE
    } );

    this.phaseProperty = new NumberProperty( 0, {
      range: new Range( -180, 180 ),
      tandem: tandem.createTandem( 'phaseProperty' ),
      units: MathSymbols.DEGREES
    } );


    // These more specific Properties are ANDed with isEditableProperty, so it works as another gate.
    this.isPhaseEditableProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isPhaseEditableProperty' )
    } );

    this.isFrequencyEditableProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isFrequencyEditableProperty' )
    } );

    this.isVoltageEditableProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isVoltageEditableProperty' )
    } );

    this.time = 0;
  }

  // Get the properties so that the circuit can be solved when changed.
  getCircuitProperties() {
    return [ this.frequencyProperty, this.phaseProperty, this.maximumVoltageProperty, ...super.getCircuitProperties() ];
  }

  // Dispose of this and PhET-iO instrumented children, so they will be unregistered.
  dispose() {
    this.maximumVoltageProperty.dispose();
    this.frequencyProperty.dispose();
    this.phaseProperty.dispose();
    super.dispose();
  }

  /**
   * @param time - total elapsed time
   * @param dt - delta between last frame and current frame
   * @param circuit
   */
  step( time: number, dt: number, circuit: Circuit ) {
    super.step( time, dt, circuit );
    this.time = time;
    this.voltageProperty.value = -this.maximumVoltageProperty.value * Math.sin( 2 * Math.PI * this.frequencyProperty.value * time + this.phaseProperty.value * Math.PI / 180 );
  }
}

circuitConstructionKitCommon.register( 'ACVoltage', ACVoltage );
export default ACVoltage;