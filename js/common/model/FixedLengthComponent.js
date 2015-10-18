// Copyright 2002-2015, University of Colorado Boulder

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
      startTerminalPosition: new Vector2(),
      angle: 0
    }, propertySetMap ) );

    this.addDerivedProperty(
      'endTerminalPosition',
      [ 'startTerminalPosition', 'angle' ],
      function( startTerminalPosition, angle ) {
        return startTerminalPosition.plus( Vector2.createPolar( length, angle ) );
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