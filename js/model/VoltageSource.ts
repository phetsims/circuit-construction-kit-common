// Copyright 2015-2023, University of Colorado Boulder

/**
 * Base class for ACVoltage and Battery, which both supply a voltage across the Vertex instances.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import Property from '../../../axon/js/Property.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import FixedCircuitElement, { FixedCircuitElementOptions } from './FixedCircuitElement.js';
import Vertex from './Vertex.js';
import PowerDissipatedProperty from './PowerDissipatedProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';

type SelfOptions = {
  initialOrientation?: 'right' | 'left';
  voltage?: number;
  voltagePropertyOptions?: {
    range?: Range;
    tandem?: Tandem;
    phetioFeatured?: boolean;
  };
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

  /**
   * @param startVertex - one of the battery vertices
   * @param endVertex - the other battery vertex
   * @param internalResistanceProperty - the resistance of the battery
   * @param length - the length of the battery in view coordinates
   * @param tandem
   * @param [providedOptions]
   */
  public constructor( startVertex: Vertex, endVertex: Vertex, internalResistanceProperty: Property<number>, length: number, tandem: Tandem, providedOptions?: VoltageSourceOptions ) {
    assert && assert( internalResistanceProperty, 'internalResistanceProperty should be defined' );
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
    super( startVertex, endVertex, length, tandem, options );

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

    this.initialOrientation = options.initialOrientation;
  }

  /**
   * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
   */
  public override dispose(): void {
    this.voltageProperty.dispose();
    this.powerDissipatedProperty.dispose();
    this.powerGeneratedProperty.dispose();
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