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
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @constructor
   */
  function Vertex( x, y ) {
    PropertySet.call( this, {
      position: new Vector2( x, y ), // Where the vertex is and is shown
      //snapped: false, // True if the vertex is showing a proposed connection at a different location
      unsnappedPosition: new Vector2( x, y ) // Where the vertex would be if it hadn't snapped
    } );
  }

  return inherit( PropertySet, Vertex );
} );