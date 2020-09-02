// Copyright 2019-2020, University of Colorado Boulder

/**
 * IO Type for CircuitElement
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import validate from '../../../axon/js/validate.js';
import CouldNotYetDeserializeError from '../../../tandem/js/CouldNotYetDeserializeError.js';
import ObjectIO from '../../../tandem/js/types/ObjectIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

class CircuitElementIO extends ObjectIO {

  // @public
  static toStateObject( circuitElement ) {
    validate( circuitElement, this.validator );
    return {
      startVertexID: circuitElement.startVertexProperty.value.tandem.phetioID,
      endVertexID: circuitElement.endVertexProperty.value.tandem.phetioID
    };
  }

  /**
   * @override
   * @param {Object} stateObject - see CircuitElementIO.toStateObject
   * @returns {Array.<*>}
   * @public
   */
  static stateToArgsForConstructor( stateObject ) {
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
}

CircuitElementIO.methods = {};
CircuitElementIO.documentation = 'A Circuit Element, such as battery, resistor or wire';
CircuitElementIO.validator = { isValidValue: v => v instanceof phet.circuitConstructionKitCommon.CircuitElement };
CircuitElementIO.typeName = 'CircuitElementIO';
ObjectIO.validateSubtype( CircuitElementIO );

circuitConstructionKitCommon.register( 'CircuitElementIO', CircuitElementIO );
export default CircuitElementIO;