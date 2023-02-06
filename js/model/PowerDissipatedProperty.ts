// Copyright 2022-2023, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
import { DerivedProperty2 } from '../../../axon/js/DerivedProperty.js';
import Property from '../../../axon/js/Property.js';
import Tandem from '../../../tandem/js/Tandem.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

export default class PowerDissipatedProperty extends DerivedProperty2<number, number, number> {
  public constructor( currentProperty: Property<number>, resistanceProperty: Property<number>, tandem: Tandem ) {
    super(
      [ currentProperty, resistanceProperty ],
      ( current, resistance ) => Math.abs( current * current * resistance ), {
        units: 'W',
        tandem: tandem,
        phetioValueType: NumberIO,
        phetioDocumentation: 'The dissipated power in Watts',
        phetioHighFrequency: true,
        phetioFeatured: true
      } );
  }
}

circuitConstructionKitCommon.register( 'PowerDissipatedProperty', PowerDissipatedProperty );