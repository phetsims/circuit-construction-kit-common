// Copyright 2019-2020, University of Colorado Boulder

/**
 * IO type for CircuitElement
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import validate from '../../../axon/js/validate.js';
import EnumerationIO from '../../../phet-core/js/EnumerationIO.js';
import CouldNotYetDeserializeError from '../../../tandem/js/CouldNotYetDeserializeError.js';
import ObjectIO from '../../../tandem/js/types/ObjectIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Resistor from './Resistor.js';

class ResistorIO extends ObjectIO {

  // @public
  static toStateObject( resistor ) {
    validate( resistor, this.validator );
    return {
      startVertexID: resistor.startVertexProperty.value.tandem.phetioID,
      endVertexID: resistor.endVertexProperty.value.tandem.phetioID,
      resistorType: EnumerationIO( Resistor.ResistorType ).toStateObject( resistor.resistorType )
    };
  }

  /**
   * @override
   * @param {Object} stateObject - see ResistorIO.toStateObject
   * @returns {Array.<*>}
   * @public
   */
  static stateToArgsForConstructor( stateObject ) {
    if ( phet.phetio.phetioEngine.hasPhetioObject( stateObject.startVertexID ) &&
         phet.phetio.phetioEngine.hasPhetioObject( stateObject.endVertexID ) ) {
      return [
        phet.phetio.phetioEngine.getPhetioObject( stateObject.startVertexID ),
        phet.phetio.phetioEngine.getPhetioObject( stateObject.endVertexID ),
        EnumerationIO( Resistor.ResistorType ).fromStateObject( stateObject.resistorType )
      ];
    }
    else {
      throw new CouldNotYetDeserializeError();
    }
  }
}

ResistorIO.methods = {};
ResistorIO.documentation = 'A resistor';
ResistorIO.validator = { isValidValue: v => v instanceof phet.circuitConstructionKitCommon.Resistor };
ResistorIO.typeName = 'ResistorIO';
ObjectIO.validateSubtype( ResistorIO );

circuitConstructionKitCommon.register( 'ResistorIO', ResistorIO );
export default ResistorIO;