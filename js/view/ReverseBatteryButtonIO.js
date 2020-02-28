// Copyright 2019-2020, University of Colorado Boulder

/**
 * IO type for Battery Reverse Button.  TODO(phet-io): This shares a lot of code with TrashButtonIO
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import validate from '../../../axon/js/validate.js';
import CouldNotYetDeserializeError from '../../../tandem/js/CouldNotYetDeserializeError.js';
import ObjectIO from '../../../tandem/js/types/ObjectIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

class ReverseBatteryButtonIO extends ObjectIO {

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
   * @param {Object} state - see ReverseBatteryButtonIO.toStateObject
   * @returns {Array.<*>}
   */
  static stateToArgsForConstructor( state ) {
    return [ state.circuitElement ];
  }
}

ReverseBatteryButtonIO.methods = {};
ReverseBatteryButtonIO.documentation = 'Button that disposes a Circuit Element';
ReverseBatteryButtonIO.validator = { isValidValue: v => v instanceof phet.circuitConstructionKitCommon.ReverseBatteryButton };
ReverseBatteryButtonIO.typeName = 'ReverseBatteryButtonIO';
ObjectIO.validateSubtype( ReverseBatteryButtonIO );

circuitConstructionKitCommon.register( 'ReverseBatteryButtonIO', ReverseBatteryButtonIO );
export default ReverseBatteryButtonIO;