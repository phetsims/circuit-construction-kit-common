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
      endVertex: endVertex
    }, propertySetMap ) );

    // TODO: Derived properties for startPosition and endPosition, to encapsulate the
    // TODO: matter of switching vertices.??

    // ???
    //this.startPositionProperty = new DerivedProperty( [ this.startVertexProperty ], function() {} );
  }

  return inherit( PropertySet, CircuitElement, {

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
    }
  } );
} );