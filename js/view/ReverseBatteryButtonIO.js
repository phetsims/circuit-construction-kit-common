// Copyright 2019-2020, University of Colorado Boulder

/**
 * IO Type for Battery Reverse Button.  TODO(phet-io): This shares a lot of code with TrashButtonIO
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import validate from '../../../axon/js/validate.js';
import CouldNotYetDeserializeError from '../../../tandem/js/CouldNotYetDeserializeError.js';
import ObjectIO from '../../../tandem/js/types/ObjectIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

class ReverseBatteryButtonIO extends ObjectIO {

  /**
   * @param {ReverseBatteryButton} reverseBatteryButton
   * @returns {Object}
   * @public
   */
  static toStateObject( reverseBatteryButton ) {
    validate( reverseBatteryButton, this.validator );
    return {
      circuitElementID: reverseBatteryButton.circuitElement ? reverseBatteryButton.circuitElement.tandem.phetioID : null
    };
  }

  /**
   * @override
   * @param {Object} stateObject - see ReverseBatteryButtonIO.toStateObject
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

ReverseBatteryButtonIO.methods = {};
ReverseBatteryButtonIO.documentation = 'Button that disposes a Circuit Element';
ReverseBatteryButtonIO.validator = { isValidValue: v => v instanceof phet.circuitConstructionKitCommon.ReverseBatteryButton };
ReverseBatteryButtonIO.typeName = 'ReverseBatteryButtonIO';
ObjectIO.validateIOType( ReverseBatteryButtonIO );

circuitConstructionKitCommon.register( 'ReverseBatteryButtonIO', ReverseBatteryButtonIO );
export default ReverseBatteryButtonIO;