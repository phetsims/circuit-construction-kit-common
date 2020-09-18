// Copyright 2019-2020, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */

import EnumerationIO from '../../../phet-core/js/EnumerationIO.js';
import IOType from '../../../tandem/js/types/IOType.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElementIO from './CircuitElementIO.js';
import Resistor from './Resistor.js';

const ResistorIO = new IOType( 'ResistorIO', {
  isValidValue: v => v instanceof phet.circuitConstructionKitCommon.Resistor,
  supertype: CircuitElementIO,
  toStateObject: resistor => {
    const stateObject = CircuitElementIO.toStateObject( resistor );
    stateObject.resistorType = EnumerationIO( Resistor.ResistorType ).toStateObject( resistor.resistorType );
    return stateObject;
  },
  stateToArgsForConstructor( stateObject ) {
    const args = CircuitElementIO.stateToArgsForConstructor( stateObject );
    args.push( EnumerationIO( Resistor.ResistorType ).fromStateObject( stateObject.resistorType ) );
    return args;
  }
} );

circuitConstructionKitCommon.register( 'ResistorIO', ResistorIO );
export default ResistorIO;