// Copyright 2022, University of Colorado Boulder
// @author Sam Reid (PhET Interactive Simulations)

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Property from '../../../axon/js/Property.js';
import Tandem from '../../../tandem/js/Tandem.js';
import NumberIO from '../../../tandem/js/types/NumberIO.js';

class PowerProperty extends DerivedProperty<number, [ number, number ]> {
  constructor( currentProperty: Property<number>, resistanceProperty: Property<number>, tandem: Tandem ) {
    super(
      [ currentProperty, resistanceProperty ],
      ( resistance, current ) => Math.abs( current * current * resistance ), {
        units: 'W',
        tandem: tandem,
        phetioType: DerivedProperty.DerivedPropertyIO( NumberIO ),
        phetioDocumentation: 'The dissipated power in Watts'
      } );
  }
}

export default PowerProperty;