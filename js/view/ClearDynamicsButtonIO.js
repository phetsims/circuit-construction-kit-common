// Copyright 2019, University of Colorado Boulder

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
   * @param {Object} state - see ClearDynamicsButtonIO.toStateObject
   * @returns {Array.<*>}
   */
  static stateToArgsForConstructor( state ) {
    return [ state.circuitElement ];
  }
}

ClearDynamicsButtonIO.methods = {};
ClearDynamicsButtonIO.documentation = 'Button that clears the dynamics from a Capacitor or Inductor';
ClearDynamicsButtonIO.validator = { isValidValue: v => v instanceof phet.circuitConstructionKitCommon.ClearDynamicsButton };
ClearDynamicsButtonIO.typeName = 'ClearDynamicsButtonIO';
ObjectIO.validateSubtype( ClearDynamicsButtonIO );

circuitConstructionKitCommon.register( 'ClearDynamicsButtonIO', ClearDynamicsButtonIO );
export default ClearDynamicsButtonIO;