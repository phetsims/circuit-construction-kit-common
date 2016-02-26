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
  function Wire( position ) {
    PropertySet.call( this, {
      startTerminalPosition: new Vector2( position.x - 50, position.y ),
      endTerminalPosition: new Vector2( position.x + 50, position.y ),
      resistance: 0
    } );
  }

  return inherit( PropertySet, Wire, {
    getOppositeTerminalPositionProperty: function( terminalPositionProperty ) {
      assert && assert( terminalPositionProperty === this.startTerminalPositionProperty ||
                        terminalPositionProperty === this.endTerminalPositionProperty );

      return terminalPositionProperty === this.startTerminalPositionProperty ?
             this.endTerminalPositionProperty :
             this.startTerminalPositionProperty;
    }
  } );
} );