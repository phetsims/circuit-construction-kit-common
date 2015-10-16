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

  // constants
  var distanceThreshold = 100;

  /**
   *
   * @constructor
   */
  function SnapContext( circuit ) {

    // @private
    this.circuit = circuit;
  }

  return inherit( Object, SnapContext, {
    getAvailableTargets: function( wire, terminalPositionProperty ) {
      var targets = [];
      for ( var i = 0; i < this.circuit.wires.length; i++ ) {
        var circuitWire = this.circuit.wires.get( i );
        if ( wire !== circuitWire ) {

          if ( terminalPositionProperty.get().distance( circuitWire.startTerminalPositionProperty.get() ) < distanceThreshold ) {
            targets.push( {
              branch: circuitWire,
              terminalPositionProperty: circuitWire.startTerminalPositionProperty
            } );
          }

          if ( terminalPositionProperty.get().distance( circuitWire.endTerminalPositionProperty.get() ) < distanceThreshold ) {
            targets.push( {
              branch: circuitWire,
              terminalPositionProperty: circuitWire.endTerminalPositionProperty
            } );
          }
        }
      }
      return targets;
    }
  } );
} );