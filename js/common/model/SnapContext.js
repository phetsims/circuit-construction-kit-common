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

    // Wires are a flexible length and hence the start and end junctions can be treated independently
    // EXCEPT FOR not being able to attach to the same terminal
    startDragWire: function( event, wire ) {},
    dragWire: function( event, wire ) {
      this.dragWireTerminal( event, wire, wire.startTerminalPosition );
      this.dragWireTerminal( event, wire, wire.endTerminalPosition );
    },
    endDragWire: function( event, wire ) {},

    dragWireTerminal: function( event, wire, wireTerminalPosition ) {
      this.wireTerminalDragged( wire, wireTerminalPosition );
    },

    wireTerminalDragged: function( wire, terminalPositionProperty ) {
      this.circuit.wireTerminalDragged( wire, terminalPositionProperty );
    },

    // @public
    connect: function( wire1, terminalPositionProperty1, wire2, terminalPositionProperty2 ) {
      this.circuit.connect( wire1, terminalPositionProperty1, wire2, terminalPositionProperty2 );
    },

    // @public
    getAvailableTargets: function( wire, terminalPositionProperty ) {
      var targets = [];

      var components = this.circuit.wires.getArray().concat( this.circuit.batteries.getArray() ).concat( this.circuit.lightBulbs.getArray() );
      for ( var i = 0; i < components.length; i++ ) {
        var circuitWire = components[ i ];
        if ( wire !== circuitWire ) {

          var closeEnough1 = terminalPositionProperty.get().distance( circuitWire.startTerminalPositionProperty.get() ) < distanceThreshold;
          var isConnected1 = this.circuit.isConnected( circuitWire, circuitWire.startTerminalPositionProperty, wire, terminalPositionProperty );
          var wouldOverlap1 = this.circuit.wouldOverlap( circuitWire, circuitWire.startTerminalPositionProperty, wire, terminalPositionProperty );
          if ( closeEnough1 && !isConnected1 && !wouldOverlap1 ) {
            targets.push( {
              branch: circuitWire,
              terminalPositionProperty: circuitWire.startTerminalPositionProperty
            } );
          }

          var closeEnough2 = terminalPositionProperty.get().distance( circuitWire.endTerminalPositionProperty.get() ) < distanceThreshold;
          var isConnected2 = this.circuit.isConnected( circuitWire, circuitWire.endTerminalPositionProperty, wire, terminalPositionProperty );
          var wouldOverlap2 = this.circuit.wouldOverlap( circuitWire, circuitWire.endTerminalPositionProperty, wire, terminalPositionProperty );
          if ( closeEnough2 && !isConnected2 && !wouldOverlap2 ) {
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