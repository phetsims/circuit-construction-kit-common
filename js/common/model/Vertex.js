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
  function Vertex( x, y, options ) {
    options = _.extend( {
      interactive: true // false for Black Box elements
    }, options );
    PropertySet.call( this, {
      position: new Vector2( x, y ), // {Vertex2} Where the vertex is and is shown
      unsnappedPosition: new Vector2( x, y ), // {Vector2} Where the vertex would be if it hadn't snapped for a proposed connection
      voltage: 0, // {number} Relative voltage of the node, determined by Circuit.solve

      // @public - whether the Vertex can be dragged or moved by dragging another part of the circuit
      // must be observable.  When two vertices are joined in Circuit.connect, non-interactivity propagates
      interactive: options.interactive
    } );
  }

  return inherit( PropertySet, Vertex );
} );