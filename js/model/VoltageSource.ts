// Copyright 2015-2022, University of Colorado Boulder

/**
 * Base class for ACVoltage and Battery, which both supply a voltage across the Vertex instances.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import Property from '../../../axon/js/Property.js';
import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import FixedCircuitElement, { FixedCircuitElementOptions } from './FixedCircuitElement.js';
import Vertex from './Vertex.js';
import PowerDissipatedProperty from './PowerDissipatedProperty.js';
import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';

export type VoltageSourceOptions = {
  initialOrientation?: string; // TODO: enum
  voltage?: number;
  voltagePropertyOptions?: {
    range?: Range;
    tandem?: Tandem;
  };
} & FixedCircuitElementOptions;

export default abstract class VoltageSource extends FixedCircuitElement {
  readonly voltageProperty: NumberProperty;

  // the internal resistance of the battery
  readonly internalResistanceProperty: Property<number>;

  // track which way the battery "button" (plus side) was facing the initial state so
  // the user can only create a certain number of "left" or "right" batteries from the toolbox.
  // @readonly
  initialOrientation: string; // TODO: enum
  powerDissipatedProperty: PowerDissipatedProperty;
  powerGeneratedProperty: DerivedProperty<number, [ current: number, voltage: number ]>;

  /**
   * @param {Vertex} startVertex - one of the battery vertices
   * @param {Vertex} endVertex - the other battery vertex
   * @param {Property.<number>} internalResistanceProperty - the resistance of the battery
   * @param {number} length - the length of the battery in view coordinates
   * @param {Tandem} tandem
   * @param {Object} [providedOptions]
   */
  constructor( startVertex: Vertex, endVertex: Vertex, internalResistanceProperty: Property<number>, length: number, tandem: Tandem, providedOptions?: VoltageSourceOptions ) {
    assert && assert( internalResistanceProperty, 'internalResistanceProperty should be defined' );
    const options = merge( {
      initialOrientation: 'right',
      voltage: 9.0,
      isFlammable: true,
      numberOfDecimalPlaces: 1,
      voltagePropertyOptions: {
        tandem: tandem.createTandem( 'voltageProperty' )
      }
    }, providedOptions );
    super( startVertex, endVertex, length, tandem, options );

    // @public {NumberProperty} - the voltage of the battery in volts
    this.voltageProperty = new NumberProperty( options.voltage, options.voltagePropertyOptions );

    this.internalResistanceProperty = internalResistanceProperty;

    this.powerDissipatedProperty = new PowerDissipatedProperty( this.currentProperty, internalResistanceProperty, tandem.createTandem( 'powerDissipatedProperty' ) );
    this.powerGeneratedProperty = new DerivedProperty(
      [ this.currentProperty, this.voltageProperty ],
      ( current, voltage ) => Math.abs( current * voltage ), {
        tandem: tandem.createTandem( 'powerGeneratedProperty' ),
        phetioType: DerivedProperty.DerivedPropertyIO( NumberIO )
      } );

    this.initialOrientation = options.initialOrientation;
  }

  /**
   * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
   * @public
   */
  dispose() {
    this.voltageProperty.dispose();
    this.powerDissipatedProperty.dispose();
    this.powerGeneratedProperty.dispose();
    super.dispose();
  }

  /**
   * Get the properties so that the circuit can be solved when changed.
   * @returns {Property.<*>[]}
   * @override
   * @public
   */
  getCircuitProperties() {
    return [ this.voltageProperty ];
  }
}

circuitConstructionKitCommon.register( 'VoltageSource', VoltageSource );