// Copyright 2019-2020, University of Colorado Boulder

/**
 * IO type for CircuitElement
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import validate from '../../../axon/js/validate.js';
import CouldNotYetDeserializeError from '../../../tandem/js/CouldNotYetDeserializeError.js';
import ObjectIO from '../../../tandem/js/types/ObjectIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

class CircuitElementIO extends ObjectIO {

  static toStateObject( circuitElement ) {
    validate( circuitElement, this.validator );
    return {
      startVertexID: circuitElement.startVertexProperty.value.tandem.phetioID,
      endVertexID: circuitElement.endVertexProperty.value.tandem.phetioID
    };
  }

  static fromStateObject( stateObject ) {
    if ( phet.phetIo.phetioEngine.hasPhetioObject( stateObject.startVertexID ) &&
         phet.phetIo.phetioEngine.hasPhetioObject( stateObject.endVertexID ) ) {
      return {
        startVertex: phet.phetIo.phetioEngine.getPhetioObject( stateObject.startVertexID ),
        endVertex: phet.phetIo.phetioEngine.getPhetioObject( stateObject.endVertexID )
      };
    }
    else {
      throw new CouldNotYetDeserializeError();
    }
  }

  /**
   * @override
   * @param {Object} state - see CircuitElementIO.toStateObject
   * @returns {Array.<*>}
   */
  static stateToArgsForConstructor( state ) {
    return [ state.startVertex, state.endVertex ];
  }
}

CircuitElementIO.methods = {};
CircuitElementIO.documentation = 'A Circuit Element, such as battery, resistor or wire';
CircuitElementIO.validator = { isValidValue: v => v instanceof phet.circuitConstructionKitCommon.CircuitElement };
CircuitElementIO.typeName = 'CircuitElementIO';
ObjectIO.validateSubtype( CircuitElementIO );

circuitConstructionKitCommon.register( 'CircuitElementIO', CircuitElementIO );
export default CircuitElementIO;