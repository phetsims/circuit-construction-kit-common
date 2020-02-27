// Copyright 2019, University of Colorado Boulder

/**
 * IO type for Trash Button
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import validate from '../../../axon/js/validate.js';
import CouldNotYetDeserializeError from '../../../tandem/js/CouldNotYetDeserializeError.js';
import ObjectIO from '../../../tandem/js/types/ObjectIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

class TrashButtonIO extends ObjectIO {

  static toStateObject( trashButton ) {
    validate( trashButton, this.validator );
    return {
      circuitElementID: trashButton.circuitElement ? trashButton.circuitElement.tandem.phetioID : null
    };
  }

  static fromStateObject( stateObject ) {
    if ( stateObject.circuitElementID === null ) {
      return { circuitElement: null };
    }
    if ( phet.phetIo.phetioEngine.hasPhetioObject( stateObject.circuitElementID ) ) {
      return { circuitElement: phet.phetIo.phetioEngine.getPhetioObject( stateObject.circuitElementID ) };
    }
    else {
      throw new CouldNotYetDeserializeError();
    }
  }

  /**
   * @override
   * @param {Object} state - see TrashButtonIO.toStateObject
   * @returns {Array.<*>}
   */
  static stateToArgsForConstructor( state ) {
    return [ state.circuitElement ];
  }
}

TrashButtonIO.methods = {};
TrashButtonIO.documentation = 'Button that disposes a Circuit Element';
TrashButtonIO.validator = { isValidValue: v => v instanceof phet.circuitConstructionKitCommon.TrashButton };
TrashButtonIO.typeName = 'TrashButtonIO';
ObjectIO.validateSubtype( TrashButtonIO );

circuitConstructionKitCommon.register( 'TrashButtonIO', TrashButtonIO );
export default TrashButtonIO;