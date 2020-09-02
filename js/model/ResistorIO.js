// Copyright 2019-2020, University of Colorado Boulder

/**
 * IO Type for CircuitElement
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import validate from '../../../axon/js/validate.js';
import EnumerationIO from '../../../phet-core/js/EnumerationIO.js';
import ObjectIO from '../../../tandem/js/types/ObjectIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElementIO from './CircuitElementIO.js';
import Resistor from './Resistor.js';

class ResistorIO extends CircuitElementIO {

  // @public
  static toStateObject( resistor ) {
    validate( resistor, this.validator );
    const stateObject = CircuitElementIO.toStateObject( resistor );
    stateObject.resistorType = EnumerationIO( Resistor.ResistorType ).toStateObject( resistor.resistorType );
    return stateObject;
  }

  /**
   * @override
   * @param {Object} stateObject - see ResistorIO.toStateObject
   * @returns {Array.<*>}
   * @public
   */
  static stateToArgsForConstructor( stateObject ) {
    const args = CircuitElementIO.stateToArgsForConstructor( stateObject );
    args.push( EnumerationIO( Resistor.ResistorType ).fromStateObject( stateObject.resistorType ) );
    return args;
  }
}

ResistorIO.methods = {};
ResistorIO.documentation = 'A resistor';
ResistorIO.validator = { isValidValue: v => v instanceof phet.circuitConstructionKitCommon.Resistor };
ResistorIO.typeName = 'ResistorIO';
ObjectIO.validateSubtype( ResistorIO );

circuitConstructionKitCommon.register( 'ResistorIO', ResistorIO );
export default ResistorIO;