// Copyright 2015, University of Colorado Boulder

/**
 * A Vertex indicates the end of one or more CircuitElements.
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
   * @param {number} x - position (screen coordinates) in x
   * @param {number} y - position (screen coordinates) in y
   * @param options
   * @constructor
   */
  function Vertex( x, y, options ) {
    options = _.extend( {
      interactive: true, // {boolean} whether the vertex can be dragged, false for Black Box elements
      blackBoxInterface: false // {boolean} whether the vertex is on the edge of a black box
    }, options );
    PropertySet.call( this, {

      // {Vertex2} Where the vertex is and is shown
      position: new Vector2( x, y ),

      // {Vector2} Where the vertex would be if it hadn't snapped for a proposed connection
      unsnappedPosition: new Vector2( x, y ),

      // {number} Relative voltage of the node, determined by Circuit.solve
      voltage: 0,

      // @public - after the user taps on a vertex it becomes selected, highlighting it and showing a 'cut' button
      // Multiple vertices can be selected on an iPad, unlike CircuitElements, which can only have one vertex selected
      // at a time.
      selected: false,

      // @public - Vertices on the black box interface persist between build/investigate, and cannot be moved/deleted
      blackBoxInterface: options.blackBoxInterface,

      // @public - whether the Vertex can be dragged or moved by dragging another part of the circuit
      // must be observable.  When two vertices are joined in Circuit.connect, non-interactivity propagates
      // TODO: I am considering renaming this to blackBoxInternal for clarity
      interactive: options.interactive
    } );
  }

  return inherit( PropertySet, Vertex );
} );