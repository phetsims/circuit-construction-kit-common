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
    PropertySet.call( this, _.extend( {
      startVertex: startVertex,
      endVertex: endVertex
    }, propertySetMap ) );

    // TODO: Derived properties for startPosition and endPosition, to encapsulate the
    // TODO: matter of switching vertices.
  }

  return inherit( PropertySet, CircuitElement, {
    hasBothVertices: function( vertex1, vertex2 ) {
      return (this.startVertex === vertex1 && this.endVertex === vertex2) ||
             (this.startVertex === vertex2 && this.endVertex === vertex1);
    }
  } );
} );