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
  function FixedLengthComponent( length, propertySetMap ) {
    PropertySet.call( this, _.extend( {
      position: new Vector2(), // The center of the component, in screen coordinates
      angle: 0 // rotation in radians
    }, propertySetMap ) );

    // Treat start and end symmetrically as derived properties
    this.addDerivedProperty( 'startTerminalPosition', [ 'position', 'angle' ],
      function( position, angle ) {
        return position.plus( Vector2.createPolar( length / 2, angle + Math.PI ) );
      } );

    this.addDerivedProperty( 'endTerminalPosition', [ 'position', 'angle' ],
      function( position, angle ) {
        return position.plus( Vector2.createPolar( length / 2, angle ) );
      } );
  }

  return inherit( PropertySet, FixedLengthComponent, {
    getOppositeTerminalPositionProperty: function( terminalPositionProperty ) {
      assert && assert( terminalPositionProperty === this.startTerminalPositionProperty ||
                        terminalPositionProperty === this.endTerminalPositionProperty );

      return terminalPositionProperty === this.startTerminalPositionProperty ?
             this.endTerminalPositionProperty :
             this.startTerminalPositionProperty;
    }
  } );
} );