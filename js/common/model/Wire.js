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
  function Wire() {
    PropertySet.call( this, {
      startTerminalPosition: new Vector2(),
      endTerminalPosition: new Vector2( 100, 100 ),
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