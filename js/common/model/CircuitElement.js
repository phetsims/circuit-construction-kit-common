// Copyright 2015, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   *
   * @constructor
   */
  function CircuitElement( startVertex, endVertex, propertySetMap ) {
    assert && assert( startVertex !== endVertex, 'vertices must be different' );
    PropertySet.call( this, _.extend( {
      startVertex: startVertex,
      endVertex: endVertex,
      current: 0
    }, propertySetMap ) );

    // TODO: Derived properties for startPosition and endPosition, to encapsulate the
    // TODO: matter of switching vertices.??
  }

  return inherit( PropertySet, CircuitElement, {
    getOppositeVertex: function( vertex ) {
      assert && assert( this.containsVertex( vertex ), 'Missing vertex' );
      if ( this.startVertex === vertex ) {
        return this.endVertex;
      }
      else {
        return this.startVertex;
      }
    },
    containsVertex: function( vertex ) {
      return this.startVertex === vertex || this.endVertex === vertex;
    },

    /**
     * Connect the vertices, merging vertex2 into vertex1 and deleting vertex2
     * @param {Vertex} vertex1
     * @param {Vertex} vertex2
     * @public
     */
    connectCircuitElement: function( vertex1, vertex2 ) {
      if ( this.startVertex === vertex2 ) {
        this.startVertex = vertex1;
      }
      if ( this.endVertex === vertex2 ) {
        this.endVertex = vertex1;
      }
      assert && assert( this.startVertex !== this.endVertex, 'vertices must be different' );
    },

    hasBothVertices: function( vertex1, vertex2 ) {
      return (this.startVertex === vertex1 && this.endVertex === vertex2) ||
             (this.startVertex === vertex2 && this.endVertex === vertex1);
    },
    toStateObjectWithVertexIndices: function( getVertexIndex ) {
      return {
        startVertex: getVertexIndex( this.startVertex ),
        endVertex: getVertexIndex( this.endVertex )
      };
    }
  } );
} );