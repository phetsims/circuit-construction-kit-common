// Copyright 2019-2020, University of Colorado Boulder

/**
 * IO Type for CircuitElement
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import CouldNotYetDeserializeError from '../../../tandem/js/CouldNotYetDeserializeError.js';
import IOType from '../../../tandem/js/types/IOType.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

const CircuitElementIO = new IOType( 'CircuitElementIO', {
  isValidValue: v => v instanceof phet.circuitConstructionKitCommon.CircuitElement,
  documentation: 'A Circuit Element, such as battery, resistor or wire',

  // @public
  toStateObject( circuitElement ) {
    return {
      startVertexID: circuitElement.startVertexProperty.value.tandem.phetioID,
      endVertexID: circuitElement.endVertexProperty.value.tandem.phetioID
    };
  },

  /**
   * @override
   * @param {Object} stateObject - see CircuitElementIO.toStateObject
   * @returns {Array.<*>}
   * @public
   */
  stateToArgsForConstructor( stateObject ) {
    if ( phet.phetio.phetioEngine.hasPhetioObject( stateObject.startVertexID ) &&
         phet.phetio.phetioEngine.hasPhetioObject( stateObject.endVertexID ) ) {
      return [
        phet.phetio.phetioEngine.getPhetioObject( stateObject.startVertexID ),
        phet.phetio.phetioEngine.getPhetioObject( stateObject.endVertexID )
      ];
    }
    else {
      throw new CouldNotYetDeserializeError();
    }
  }
} );

circuitConstructionKitCommon.register( 'CircuitElementIO', CircuitElementIO );
export default CircuitElementIO;