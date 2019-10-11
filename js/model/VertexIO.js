// Copyright 2019, University of Colorado Boulder

/**
 * IO type for Vertex
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  const validate = require( 'AXON/validate' );
  const Vector2IO = require( 'DOT/Vector2IO' );

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

    /**
     * @override
     * @param {Object} stateObject - see VertexIO.toStateObject
     * @returns {Array.<*>}
     */
    static stateObjectToArgs( stateObject ) {
      return [ Vector2IO.fromStateObject( stateObject.position ) ];
    }
  }

  VertexIO.documentation = 'A vertex';
  VertexIO.validator = { isValidValue: v => v instanceof phet.circuitConstructionKitCommon.Vertex };
  VertexIO.typeName = 'VertexIO';
  ObjectIO.validateSubtype( VertexIO );

  return circuitConstructionKitCommon.register( 'VertexIO', VertexIO );
} );

