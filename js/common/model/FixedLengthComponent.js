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
  function FixedLengthComponent( length, startVertex, endVertex, propertySetMap ) {
    PropertySet.call( this, _.extend( {
      angle: 0, // rotation in radians
      startVertex: startVertex,
      endVertex: endVertex
    }, propertySetMap ) );

    // TODO: Derived properties for startPosition and endPosition, to encapsulate the
    // TODO: matter of switching vertices.
  }

  return inherit( PropertySet, FixedLengthComponent, {
    // TODO: Will we need getOppositeVertex?
    //getOppositeTerminalPositionProperty: function( terminalPositionProperty ) {
    //  assert && assert( terminalPositionProperty === this.startTerminalPositionProperty ||
    //                    terminalPositionProperty === this.endTerminalPositionProperty );
    //
    //  return terminalPositionProperty === this.startTerminalPositionProperty ?
    //         this.endTerminalPositionProperty :
    //         this.startTerminalPositionProperty;
    //}
  } );
} );