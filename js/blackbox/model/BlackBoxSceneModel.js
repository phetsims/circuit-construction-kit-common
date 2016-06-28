// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * One scene for the black box screen, which focuses on a single black box and deals with the contents of the
 * black box when the mode changes between investigate and build.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var CircuitConstructionKitModel = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/CircuitConstructionKitModel' );
  var CircuitStruct = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/CircuitStruct' );
  var CircuitConstructionKitQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT/CircuitConstructionKitQueryParameters' );

  // constants
  var showPlayPauseButton = CircuitConstructionKitQueryParameters.showPlayPauseButton;

  /**
   * @param {CircuitStruct} trueBlackBoxCircuit - the circuit inside the black box (the true one, not the user-created one)
   * @constructor
   */
  function BlackBoxSceneModel( trueBlackBoxCircuit ) {
    assert && assert( trueBlackBoxCircuit instanceof CircuitStruct, 'circuit should be CircuitStruct' );
    var blackBoxSceneModel = this;

    // When loading a black box circuit, none of the vertices should be draggable
    // TODO: Fix this in the saved/loaded data structures, not here as a post-hoc patch.
    for ( var i = 0; i < trueBlackBoxCircuit.vertices.length; i++ ) {
      trueBlackBoxCircuit.vertices[ i ].draggable = false;

      if ( trueBlackBoxCircuit.vertices[ i ].attachable ) {
        trueBlackBoxCircuit.vertices[ i ].blackBoxInterface = true;
      }
      else {
        trueBlackBoxCircuit.vertices[ i ].insideTrueBlackBox = true;
      }
    }

    // All of the circuit elements should be non-interactive
    // TODO: Fix this in the saved/loaded data structures, not here as a post-hoc patch.
    for ( i = 0; i < trueBlackBoxCircuit.circuitElements.length; i++ ) {
      var circuitElement = trueBlackBoxCircuit.circuitElements[ i ];
      circuitElement.interactive = false;
      circuitElement.insideTrueBlackBox = true;
    }

    CircuitConstructionKitModel.call( this, {

      // @public - whether the user is in the 'investigate' or 'build' mode
      mode: 'investigate',

      // @public - true when the user is holding down the reveal button and the answer (inside the black box) is showing
      revealing: false,

      // @public - true if the user has created a circuit for comparison with the black box (1+ terminal connected)
      isRevealEnabled: false,

      // @public {boolean} - changes whether the light bulb brightness and ammeter/voltmeter readouts can be seen
      running: !showPlayPauseButton
    } );

    this.revealingProperty = this.revealingProperty || null;
    this.modeProperty = this.modeProperty || null;
    this.isRevealEnabledProperty = this.isRevealEnabledProperty || null;
    this.runningProperty = this.runningProperty || null;

    // For syntax highlighting and navigation
    this.circuit = this.circuit || null;

    // @public {Bounds2} - filled in by the BlackBoxSceneView after the black box node is created and positioned
    this.blackBoxBounds = null;

    // When reveal is pressed, true black box circuit should be shown instead of the user-created circuit
    this.revealingProperty.lazyLink( function( revealing ) {
      blackBoxSceneModel.mode = revealing ? 'investigate' : 'build';
    } );

    // Keep track of what the user has built inside the black box so it may be restored.
    var userBlackBoxCircuit = new CircuitStruct( [], [], [], [], [], [] );
    var circuit = this.circuit;

    /**
     * Check whether the user built (at least part of) their own black box circuit.
     * @returns {boolean}
     */
    var userBuiltSomething = function() {
      var count = 0;
      var callback = function( element ) {
        var isConnectedToBlackBoxInterface = element.startVertex.blackBoxInterface || element.endVertex.blackBoxInterface;
        if ( element.interactive && isConnectedToBlackBoxInterface ) {
          count++;
        }
      };
      circuit.wires.forEach( callback );
      circuit.batteries.forEach( callback );
      circuit.lightBulbs.forEach( callback );
      circuit.resistors.forEach( callback );
      return count > 0;
    };

    // Enable the reveal button if the user has done something in build mode.
    circuit.circuitChangedEmitter.addListener( function() {
      var builtSomething = blackBoxSceneModel.mode === 'build' && userBuiltSomething();
      blackBoxSceneModel.isRevealEnabled = blackBoxSceneModel.revealing || builtSomething;
    } );

    // Remove the true black box contents or user-created black box contents
    var removeBlackBoxContents = function( blackBoxCircuit ) {
      circuit.wires.removeAll( blackBoxCircuit.wires );
      circuit.lightBulbs.removeAll( blackBoxCircuit.lightBulbs );
      circuit.resistors.removeAll( blackBoxCircuit.resistors );
      circuit.batteries.removeAll( blackBoxCircuit.batteries );

      // Remove the vertices but not those on the black box interface
      for ( var i = 0; i < blackBoxCircuit.vertices.length; i++ ) {
        var vertex = blackBoxCircuit.vertices[ i ];
        if ( !vertex.blackBoxInterface ) {
          circuit.vertices.remove( vertex );
        }
      }
    };

    // Add the true black box contents or user-created black box contents
    var addBlackBoxContents = function( blackBoxCircuit ) {

      // Add the vertices, but only if not already added
      for ( var i = 0; i < blackBoxCircuit.vertices.length; i++ ) {
        var vertex = blackBoxCircuit.vertices[ i ];
        if ( !vertex.blackBoxInterface ) {
          circuit.vertices.add( vertex );
        }
      }
      circuit.wires.addAll( blackBoxCircuit.wires );
      circuit.resistors.addAll( blackBoxCircuit.resistors );
      circuit.batteries.addAll( blackBoxCircuit.batteries );
      circuit.lightBulbs.addAll( blackBoxCircuit.lightBulbs );
    };

    // Logic for changing the contents of the black box when the mode changes
    // TODO: All of this logic must be re-read and re-evaluated.
    this.modeProperty.link( function( mode ) {

      // When switching to build mode, remove all of the black box circuitry and vice-versa
      if ( mode === 'build' ) {

        removeBlackBoxContents( trueBlackBoxCircuit );

        // Any draggable vertices that remain should be made unattachable and undraggable, so the user cannot update the
        // circuit outside the box
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

        // Switched to 'investigate'. Move interior elements to userBlackBoxCircuit
        userBlackBoxCircuit.clear();
        circuit.vertices.forEach( function( v ) { if ( v.interactive && v.draggable ) {userBlackBoxCircuit.vertices.push( v );}} );
        circuit.wires.forEach( function( wire ) { if ( wire.interactive ) { userBlackBoxCircuit.wires.push( wire ); } } );
        circuit.batteries.forEach( function( b ) { if ( b.interactive ) { userBlackBoxCircuit.batteries.push( b ); } } );
        circuit.lightBulbs.forEach( function( bulb ) { if ( bulb.interactive ) { userBlackBoxCircuit.lightBulbs.push( bulb ); } } );
        circuit.resistors.forEach( function( r ) { if ( r.interactive ) { userBlackBoxCircuit.resistors.push( r ); } } );
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
      circuit.solve();
    } );

    // @private - called by reset
    this.resetBlackBoxSceneModel = function() {
      addBlackBoxContents( trueBlackBoxCircuit );
      userBlackBoxCircuit.clear();
    };
  }

  circuitConstructionKit.register( 'BlackBoxSceneModel', BlackBoxSceneModel );

  return inherit( CircuitConstructionKitModel, BlackBoxSceneModel, {

    /**
     * Reset the model.
     * @overrides
     * @public
     */
    reset: function() {
      CircuitConstructionKitModel.prototype.reset.call( this );
      this.resetBlackBoxSceneModel();
    }
  } );
} );