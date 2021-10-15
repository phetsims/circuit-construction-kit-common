// Copyright 2015-2021, University of Colorado Boulder

/**
 * Base class for ACVoltage and Battery, which both supply a voltage across the Vertex instances.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import FixedCircuitElement from './FixedCircuitElement.js';
import Vertex from './Vertex.js';

type VoltageSourceOptions = {
  initialOrientation: string, // TODO: enum
  voltage: number,
  voltagePropertyOptions: {
    tandem: Tandem
  }
};

abstract class VoltageSource extends FixedCircuitElement {
  readonly voltageProperty: NumberProperty;
  readonly internalResistanceProperty: Property<number>;
  protected initialOrientation: string; // TODO: enum

  /**
   * @param {Vertex} startVertex - one of the battery vertices
   * @param {Vertex} endVertex - the other battery vertex
   * @param {Property.<number>} internalResistanceProperty - the resistance of the battery
   * @param {number} length - the length of the battery in view coordinates
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( startVertex: Vertex, endVertex: Vertex, internalResistanceProperty: Property<number>, length: number, tandem: Tandem, options?: Partial<VoltageSourceOptions> ) {
    assert && assert( internalResistanceProperty, 'internalResistanceProperty should be defined' );
    const filledOptions = merge( {
      initialOrientation: 'right',
      voltage: 9.0,
      isFlammable: true,
      numberOfDecimalPlaces: 1,
      voltagePropertyOptions: {
        tandem: tandem.createTandem( 'voltageProperty' )
      }
    }, options ) as VoltageSourceOptions;
    super( startVertex, endVertex, length, tandem, filledOptions );

    // @public {NumberProperty} - the voltage of the battery in volts
    this.voltageProperty = new NumberProperty( filledOptions.voltage, filledOptions.voltagePropertyOptions );

    // @public {Property.<number>} the internal resistance of the battery
    this.internalResistanceProperty = internalResistanceProperty;

    // @public (read-only) {string} - track which way the battery "button" (plus side) was facing the initial state so
    // the user can only create a certain number of "left" or "right" batteries from the toolbox.
    this.initialOrientation = filledOptions.initialOrientation;
  }

  /**
   * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
   * @public
   */
  dispose() {
    this.voltageProperty.dispose();
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
export {VoltageSourceOptions};
export default VoltageSource;