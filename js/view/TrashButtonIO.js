// Copyright 2019, University of Colorado Boulder

/**
 * IO type for CircuitElement
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const CouldNotYetDeserializeError = require( 'TANDEM/CouldNotYetDeserializeError' );
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  const validate = require( 'AXON/validate' );

  class TrashButtonIO extends ObjectIO {

    static toStateObject( trashButton ) {
      validate( trashButton, this.validator );
      return {
        circuitElementID: trashButton.circuitElement ? trashButton.circuitElement.tandem.phetioID : null
      };
    }

    /**
     * @override
     * @param {Object} stateObject - see TrashButtonIO.toStateObject
     * @returns {Array.<*>}
     */
    static stateObjectToArgs( stateObject ) {
      if ( stateObject.circuitElementID === null ) {
        return [ null ];
      }
      if ( phet.phetIo.phetioEngine.hasPhetioObject( stateObject.circuitElementID ) ) {
        return [
          phet.phetIo.phetioEngine.getPhetioObject( stateObject.circuitElementID )
        ];
      }
      else {
        throw new CouldNotYetDeserializeError();
      }
    }
  }

  TrashButtonIO.methods = {};
  TrashButtonIO.documentation = 'A Charged Particle';
  TrashButtonIO.validator = { isValidValue: v => v instanceof phet.circuitConstructionKitCommon.TrashButton };
  TrashButtonIO.typeName = 'TrashButtonIO';
  ObjectIO.validateSubtype( TrashButtonIO );

  return circuitConstructionKitCommon.register( 'TrashButtonIO', TrashButtonIO );
} );