// Copyright 2015, University of Colorado Boulder

/**
 * One scene for the black box screen, which focuses on a single black box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var CircuitConstructionKitBasicsModel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/CircuitConstructionKitBasicsModel' );
  var Circuit = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Circuit' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @constructor
   */
  function BlackBoxSceneModel( trueBlackBoxCircuit ) {

    CircuitConstructionKitBasicsModel.call( this, {
      mode: 'investigate' // or 'build'
    }, {
      circuit: new Circuit()
    } );
    var userBlackBoxCircuit = new Circuit();
    var circuit = this.circuit;

    var removeBlackBoxContents = function( blackBoxCircuit ) {

      circuit.wires.removeAll( blackBoxCircuit.wires.getArray() );
      circuit.lightBulbs.removeAll( blackBoxCircuit.lightBulbs.getArray() );
      circuit.resistors.removeAll( blackBoxCircuit.resistors.getArray() );
      circuit.batteries.removeAll( blackBoxCircuit.batteries.getArray() );

      // Remove the vertices but not those on the black box interface
      for ( var i = 0; i < blackBoxCircuit.vertices.length; i++ ) {
        var vertex = blackBoxCircuit.vertices.get( i );
        if ( !vertex.blackBoxInterface ) {
          circuit.vertices.remove( vertex );
        }
      }
      circuit.solve();
    };
    var addBlackBoxContents = function( blackBoxCircuit ) {
      // Add the vertices, but only if not already added
      for ( var i = 0; i < blackBoxCircuit.vertices.length; i++ ) {
        var vertex = blackBoxCircuit.vertices.get( i );
        if ( circuit.vertices.indexOf( vertex ) === -1 ) {
          circuit.vertices.add( vertex );
        }
      }
      circuit.wires.addAll( blackBoxCircuit.wires.getArray() );
      circuit.resistors.addAll( blackBoxCircuit.resistors.getArray() );
      circuit.batteries.addAll( blackBoxCircuit.batteries.getArray() );
      circuit.lightBulbs.addAll( blackBoxCircuit.lightBulbs.getArray() );
      circuit.solve();
    };

    this.modeProperty.link( function( mode ) {

      // When switching to build mode, remove all of the black box circuitry
      // TODO: how to keep the external vertices?
      if ( mode === 'build' ) {

        removeBlackBoxContents( trueBlackBoxCircuit );
        addBlackBoxContents( userBlackBoxCircuit );
      }
      else {
        removeBlackBoxContents( userBlackBoxCircuit );
        addBlackBoxContents( trueBlackBoxCircuit );
      }
    } );
  }

  return inherit( CircuitConstructionKitBasicsModel, BlackBoxSceneModel );
} );