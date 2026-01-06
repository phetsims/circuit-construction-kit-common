// Copyright 2015-2025, University of Colorado Boulder

/**
 * Base class for ACVoltage and Battery, which both supply a voltage across the Vertex instances.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import type Property from '../../../axon/js/Property.js';
import type { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import type Range from '../../../dot/js/Range.js';
import affirm from '../../../perennial-alias/js/browser-and-node/affirm.js';
import optionize from '../../../phet-core/js/optionize.js';
import type IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import type PickOptional from '../../../phet-core/js/types/PickOptional.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import BooleanIO from '../../../tandem/js/types/BooleanIO.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

// Constants for fire display
const FIRE_THRESHOLD = 15; // Beyond this number of amps, flammable CircuitElements catch on fire
const FIRE_RESISTANCE_THRESHOLD = 1E-8; // Minimum resistance required for fire to display
import type CircuitElementType from './CircuitElementType.js';
import FixedCircuitElement, { type FixedCircuitElementOptions } from './FixedCircuitElement.js';
import PowerDissipatedProperty from './PowerDissipatedProperty.js';
import type Vertex from './Vertex.js';

type SelfOptions = {
  initialOrientation?: 'right' | 'left';
  voltage?: number;
  voltagePropertyOptions?: {
    range?: Range;
  } & PickOptional<FixedCircuitElement, 'phetioFeatured' | 'tandem'>;
};
export type VoltageSourceOptions = SelfOptions & FixedCircuitElementOptions;

export default abstract class VoltageSource extends FixedCircuitElement {

  // the voltage of the battery in volts
  public readonly voltageProperty: NumberProperty;

  // the internal resistance of the battery
  public readonly internalResistanceProperty: Property<number>;

  // track which way the battery "button" (plus side) was facing the initial state so
  // the user can only create a certain number of "left" or "right" batteries from the toolbox.
  // @readonly
  public initialOrientation: 'right' | 'left';
  private powerDissipatedProperty: PowerDissipatedProperty;
  private powerGeneratedProperty: TReadOnlyProperty<number>;

  // Whether this voltage source is on fire (high current with sufficient resistance)
  public readonly isOnFireProperty: TReadOnlyProperty<boolean>;

  /**
   * @param type
   * @param startVertex - one of the battery vertices
   * @param endVertex - the other battery vertex
   * @param internalResistanceProperty - the resistance of the battery
   * @param length - the length of the battery in view coordinates
   * @param tandem
   * @param [providedOptions]
   */
  protected constructor( type: CircuitElementType, startVertex: Vertex, endVertex: Vertex, internalResistanceProperty: Property<number>, length: number, tandem: Tandem, providedOptions?: VoltageSourceOptions ) {
    affirm( internalResistanceProperty, 'internalResistanceProperty should be defined' );
    const options = optionize<VoltageSourceOptions, SelfOptions, FixedCircuitElementOptions>()( {
      initialOrientation: 'right',
      voltage: 9.0,
      isFlammable: true,
      numberOfDecimalPlaces: 1,
      voltagePropertyOptions: {
        tandem: tandem.createTandem( 'voltageProperty' ),
        phetioFeatured: true
      }
    }, providedOptions );
    super( type, startVertex, endVertex, length, tandem, options );

    this.voltageProperty = new NumberProperty( options.voltage, options.voltagePropertyOptions );

    this.internalResistanceProperty = internalResistanceProperty;

    this.powerDissipatedProperty = new PowerDissipatedProperty( this.currentProperty, internalResistanceProperty, tandem.createTandem( 'powerDissipatedProperty' ) );
    this.powerGeneratedProperty = new DerivedProperty(
      [ this.currentProperty, this.voltageProperty ],
      ( current, voltage ) => Math.abs( current * voltage ), {
        tandem: tandem.createTandem( 'powerGeneratedProperty' ),
        phetioValueType: NumberIO,
        phetioHighFrequency: true,
        phetioFeatured: true
      } );

    // Fire shows when |current| >= FIRE_THRESHOLD and the element has resistance >= FIRE_RESISTANCE_THRESHOLD
    this.isOnFireProperty = new DerivedProperty(
      [ this.currentProperty, this.internalResistanceProperty ],
      ( current, resistance ) => Math.abs( current ) >= FIRE_THRESHOLD && resistance >= FIRE_RESISTANCE_THRESHOLD, {
        tandem: tandem.createTandem( 'isOnFireProperty' ),
        phetioValueType: BooleanIO,
        phetioFeatured: true
      } );

    this.initialOrientation = options.initialOrientation;
  }

  /**
   * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
   */
  public override dispose(): void {
    this.voltageProperty.dispose();
    this.powerDissipatedProperty.dispose();
    this.powerGeneratedProperty.dispose();
    this.isOnFireProperty.dispose();
    super.dispose();
  }

  /**
   * Get the properties so that the circuit can be solved when changed.
   */
  public getCircuitProperties(): Property<IntentionalAny>[] {
    return [ this.voltageProperty ];
  }
}

circuitConstructionKitCommon.register( 'VoltageSource', VoltageSource );