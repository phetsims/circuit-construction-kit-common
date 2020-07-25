// Copyright 2019-2020, University of Colorado Boulder

/**
 * IO type for ClearDynamicsButton.  TODO(phet-io): This shares a lot of code with TrashButtonIO
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import validate from '../../../axon/js/validate.js';
import CouldNotYetDeserializeError from '../../../tandem/js/CouldNotYetDeserializeError.js';
import ObjectIO from '../../../tandem/js/types/ObjectIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

class ClearDynamicsButtonIO extends ObjectIO {

  // @public
  static toStateObject( trashButton ) {
    validate( trashButton, this.validator );
    return {
      circuitElementID: trashButton.circuitElement ? trashButton.circuitElement.tandem.phetioID : null
    };
  }

  /**
   * @override
   * @param {Object} stateObject - see ClearDynamicsButtonIO.toStateObject
   * @returns {Array.<*>}
   * @public
   */
  static stateToArgsForConstructor( stateObject ) {
    if ( stateObject.circuitElementID === null ) {
      return [ null ];
    }
    if ( phet.phetio.phetioEngine.hasPhetioObject( stateObject.circuitElementID ) ) {
      return [ phet.phetio.phetioEngine.getPhetioObject( stateObject.circuitElementID ) ];
    }
    else {
      throw new CouldNotYetDeserializeError();
    }
  }
}

ClearDynamicsButtonIO.methods = {};
ClearDynamicsButtonIO.documentation = 'Button that clears the dynamics from a Capacitor or Inductor';
ClearDynamicsButtonIO.validator = { isValidValue: v => v instanceof phet.circuitConstructionKitCommon.ClearDynamicsButton };
ClearDynamicsButtonIO.typeName = 'ClearDynamicsButtonIO';
ObjectIO.validateSubtype( ClearDynamicsButtonIO );

circuitConstructionKitCommon.register( 'ClearDynamicsButtonIO', ClearDynamicsButtonIO );
export default ClearDynamicsButtonIO;