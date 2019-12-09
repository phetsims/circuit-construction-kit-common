// Copyright 2019, University of Colorado Boulder

/**
 * IO type for ClearDynamicsButton.  TODO(phet-io): This shares a lot of code with TrashButtonIO
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

  return circuitConstructionKitCommon.register( 'ClearDynamicsButtonIO', ClearDynamicsButtonIO );
} );