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
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @constructor
   */
  function Vertex( x, y ) {
    this.positionProperty = new Property( new Vector2( x, y ) );
  }

  return inherit( Object, Vertex, {
    get position() {
      return this.positionProperty.value;
    }
  } );
} );