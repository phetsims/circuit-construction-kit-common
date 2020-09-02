// Copyright 2019-2020, University of Colorado Boulder

/**
 * IO Type for Vertex
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
   * @public
   */
  static toStateObject( vertex ) {
    validate( vertex, this.validator );
    return {
      position: Vector2IO.toStateObject( vertex.positionProperty.value )
    };
  }

  /**
   * @override
   * @param {Object} stateObject - see VertexIO.toStateObject
   * @returns {Array.<*>}
   * @public
   */
  static stateToArgsForConstructor( stateObject ) {
    return [ Vector2IO.fromStateObject( stateObject.position ) ];
  }
}

VertexIO.documentation = 'A vertex';
VertexIO.validator = { isValidValue: v => v instanceof phet.circuitConstructionKitCommon.Vertex };
VertexIO.typeName = 'VertexIO';
ObjectIO.validateSubtype( VertexIO );

circuitConstructionKitCommon.register( 'VertexIO', VertexIO );
export default VertexIO;