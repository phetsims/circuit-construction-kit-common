// Copyright 2019, University of Colorado Boulder

/**
 * IO type for Vertex
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import validate from '../../../axon/js/validate.js';
import Vector2IO from '../../../dot/js/Vector2IO.js';
import ObjectIO from '../../../tandem/js/types/ObjectIO.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

class VertexIO extends ObjectIO {

  /**
   * @param {Vertex} vertex
   * @returns {Object}
   * @override
   */
  static toStateObject( vertex ) {
    validate( vertex, this.validator );
    return {
      position: Vector2IO.toStateObject( vertex.positionProperty.value )
    };
  }

  static fromStateObject( stateObject ) {
    return { position: Vector2IO.fromStateObject( stateObject.position ) };
  }

  /**
   * @override
   * @param {Object} state - see VertexIO.toStateObject
   * @returns {Array.<*>}
   */
  static stateToArgsForConstructor( state ) {
    return [ state.position ];
  }
}

VertexIO.documentation = 'A vertex';
VertexIO.validator = { isValidValue: v => v instanceof phet.circuitConstructionKitCommon.Vertex };
VertexIO.typeName = 'VertexIO';
ObjectIO.validateSubtype( VertexIO );

circuitConstructionKitCommon.register( 'VertexIO', VertexIO );
export default VertexIO;