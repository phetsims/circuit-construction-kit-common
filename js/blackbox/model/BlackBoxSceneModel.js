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
   * @param {Circuit} trueBlackBoxCircuit
   * @constructor
   */
  function BlackBoxSceneModel( trueBlackBoxCircuit ) {

    // When loading a black box circuit, none of the vertices should be draggable
    for ( var i = 0; i < trueBlackBoxCircuit.vertices.length; i++ ) {
      trueBlackBoxCircuit.vertices.get( i ).draggable = false;

      if ( trueBlackBoxCircuit.vertices.get( i ).attachable ) {
        trueBlackBoxCircuit.vertices.get( i ).blackBoxInterface = true; // TODO: No shadow classes
      }
    }

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
        if ( !vertex.blackBoxInterface ) {
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

      // When switching to build mode, remove all of the black box circuitry and vice-versa
      if ( mode === 'build' ) {

        removeBlackBoxContents( trueBlackBoxCircuit );

        // Any draggable vertices that remain should be made unattachable and undraggable,
        // so the user cannot update the circuit outside the box
        circuit.vertices.forEach( function( vertex ) {
          if ( !vertex.blackBoxInterface ) {
            vertex.attachable = false;
            vertex.draggable = false;
            vertex.interactive = false;
          }
        } );
        circuit.circuitElements.forEach( function( circuitElement ) {
          circuitElement.interactive = false;
        } );
        addBlackBoxContents( userBlackBoxCircuit );
      }
      else {
        // move interior elements to userBlackBoxCircuit
        userBlackBoxCircuit.clear();
        circuit.vertices.forEach( function( v ) { if ( v.interactive && v.draggable ) {userBlackBoxCircuit.vertices.add( v );}} );
        circuit.wires.forEach( function( wire ) { if ( wire.interactive ) { userBlackBoxCircuit.wires.add( wire ); } } );
        circuit.batteries.forEach( function( b ) { if ( b.interactive ) { userBlackBoxCircuit.batteries.add( b ); } } );
        circuit.lightBulbs.forEach( function( bulb ) { if ( bulb.interactive ) { userBlackBoxCircuit.lightBulbs.add( bulb ); } } );
        circuit.resistors.forEach( function( r ) { if ( r.interactive ) { userBlackBoxCircuit.resistors.add( r ); } } );
        removeBlackBoxContents( userBlackBoxCircuit );

        // Any attachable vertices outside the box should become attachable and draggable
        circuit.vertices.forEach( function( vertex ) {
          if ( !vertex.blackBoxInterface ) {
            vertex.draggable = true;
            vertex.attachable = true;
            vertex.interactive = true;
          }
        } );
        circuit.circuitElements.forEach( function( circuitElement ) {
          circuitElement.interactive = true;
        } );

        addBlackBoxContents( trueBlackBoxCircuit );
      }
    } );
  }

  return inherit( CircuitConstructionKitBasicsModel, BlackBoxSceneModel );
} );