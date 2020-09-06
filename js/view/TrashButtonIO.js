// Copyright 2019-2020, University of Colorado Boulder

/**
 * IO Type for Trash Button
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import validate from '../../../axon/js/validate.js';
import CouldNotYetDeserializeError from '../../../tandem/js/CouldNotYetDeserializeError.js';
import ObjectIO from '../../../tandem/js/types/ObjectIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

class TrashButtonIO extends ObjectIO {

  /**
   * @param {TrashButton} trashButton
   * @returns {Object}
   * @public
   */
  static toStateObject( trashButton ) {
    validate( trashButton, this.validator );
    return {
      circuitElementID: trashButton.circuitElement ? trashButton.circuitElement.tandem.phetioID : null
    };
  }

  /**
   * @param {Object} stateObject
   * @returns {Object}
   * @public
   */
  static fromStateObject( stateObject ) {
    if ( stateObject.circuitElementID === null ) {
      return { circuitElement: null };
    }
    if ( phet.phetio.phetioEngine.hasPhetioObject( stateObject.circuitElementID ) ) {
      return { circuitElement: phet.phetio.phetioEngine.getPhetioObject( stateObject.circuitElementID ) };
    }
    else {
      throw new CouldNotYetDeserializeError();
    }
  }

  /**
   * @override
   * @param {Object} stateObject - see TrashButtonIO.toStateObject
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

TrashButtonIO.methods = {};
TrashButtonIO.documentation = 'Button that disposes a Circuit Element';
TrashButtonIO.validator = { isValidValue: v => v instanceof phet.circuitConstructionKitCommon.TrashButton };
TrashButtonIO.typeName = 'TrashButtonIO';
ObjectIO.validateIOType( TrashButtonIO );

circuitConstructionKitCommon.register( 'TrashButtonIO', TrashButtonIO );
export default TrashButtonIO;