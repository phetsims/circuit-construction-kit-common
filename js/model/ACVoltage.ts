// Copyright 2015-2021, University of Colorado Boulder

/**
 * The ACVoltage is a circuit element that provides an oscillating voltage difference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Range from '../../../dot/js/Range.js';
import merge from '../../../phet-core/js/merge.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Circuit from './Circuit.js';
import Vertex from './Vertex.js';
import VoltageSource, {VoltageSourceOptions} from './VoltageSource.js';

// constants

// The maximum amplitude of the oscillating voltage
const MAX_VOLTAGE = 120;

type ACVoltageOptions = {} & VoltageSourceOptions;

class ACVoltage extends VoltageSource {
  private readonly maximumVoltageProperty: NumberProperty;
  private readonly frequencyProperty: NumberProperty;
  private readonly phaseProperty: NumberProperty;
  private time: number;

  /**
   * @param {Vertex} startVertex - one of the battery vertices
   * @param {Vertex} endVertex - the other battery vertex
   * @param {Property.<number>} internalResistanceProperty - the resistance of the battery
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( startVertex: Vertex, endVertex: Vertex, internalResistanceProperty: Property<number>, tandem: Tandem, options?: Partial<ACVoltageOptions> ) {
    assert && assert( internalResistanceProperty, 'internalResistanceProperty should be defined' );
    const filledOptions = merge( {
      initialOrientation: 'right',
      voltage: 9.0,
      isFlammable: true,
      numberOfDecimalPlaces: 1,
      voltagePropertyOptions: {
        range: new Range( -MAX_VOLTAGE, MAX_VOLTAGE )
      }
    }, options ) as ACVoltageOptions;
    super( startVertex, endVertex, internalResistanceProperty, CCKCConstants.BATTERY_LENGTH, tandem, options );

    // @public {NumberProperty} - the maximum voltage, which can be controlled by the CircuitElementNumberControl
    this.maximumVoltageProperty = new NumberProperty( filledOptions.voltage, {
      tandem: tandem.createTandem( 'maximumVoltageProperty' ),
      range: new Range( 0, MAX_VOLTAGE )
    } );

    // @public {NumberProperty} - the frequency of oscillation in Hz
    this.frequencyProperty = new NumberProperty( 0.5, {
      tandem: tandem.createTandem( 'frequencyProperty' ),
      range: new Range( 0.1, 2.0 )
    } );

    // @public (read-only) - the phase in degrees
    this.phaseProperty = new NumberProperty( 0, {
      range: new Range( -180, 180 ),
      tandem: tandem.createTandem( 'phaseProperty' ),
      units: MathSymbols.DEGREES
    } );

    // @private
    this.time = 0;
  }

  /**
   * Get the properties so that the circuit can be solved when changed.
   * @override
   * @returns {Property.<*>[]}
   * @public
   */
  getCircuitProperties() {
    return [ this.frequencyProperty, this.phaseProperty, this.maximumVoltageProperty, ...super.getCircuitProperties() ];
  }

  /**
   * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
   * @public
   */
  dispose() {
    this.maximumVoltageProperty.dispose();
    this.frequencyProperty.dispose();
    this.phaseProperty.dispose();
    super.dispose();
  }

  /**
   * @param {number} time - total elapsed time
   * @param {number} dt - delta between last frame and current frame
   * @param {Circuit} circuit
   * @public
   */
  step( time:number, dt:number, circuit: Circuit ) {
    super.step( time, dt, circuit );
    this.time = time;
    this.voltageProperty.set(
      -this.maximumVoltageProperty.value * Math.sin( 2 * Math.PI * this.frequencyProperty.value * time + this.phaseProperty.value * Math.PI / 180 )
    );
  }
}

circuitConstructionKitCommon.register( 'ACVoltage', ACVoltage );
export default ACVoltage;