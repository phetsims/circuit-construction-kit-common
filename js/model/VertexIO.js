// Copyright 2019-2020, University of Colorado Boulder

/**
 * IO Type for Vertex
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2IO from '../../../dot/js/Vector2IO.js';
import IOType from '../../../tandem/js/types/IOType.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

const VertexIO = new IOType( 'VertexIO', {
  isValidValue: v => v instanceof phet.circuitConstructionKitCommon.Vertex,
  documentation: 'A vertex',
  toStateObject: vertex => ( { position: Vector2IO.toStateObject( vertex.positionProperty.value ) } ),
  stateToArgsForConstructor: stateObject => [ Vector2IO.fromStateObject( stateObject.position ) ]
} );

circuitConstructionKitCommon.register( 'VertexIO', VertexIO );
export default VertexIO;