// Copyright 2015, University of Colorado Boulder

/**
 * A collection of circuit components in the play area, not necessarily connected.  (For instance it could be 2 logical
 * circuits).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var SnapContext = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/SnapContext' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Vertex' );
  var OOCircuit = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/modified-nodal-analysis/OOCircuit' );

  /**
   *
   * @constructor
   */
  function Circuit() {
    var circuit = this;
    this.wires = new ObservableArray();
    this.batteries = new ObservableArray();
    this.lightBulbs = new ObservableArray();
    this.resistors = new ObservableArray();

    // Keep track of which terminals are connected to other terminals
    // This is redundant (connections tracked in the elements above), but a central point for
    // observing creation/deletion of vertices for showing VertexNodes
    this.vertices = new ObservableArray();

    // When a new component is added to a circuit, it has two unconnected vertices
    var addVertices = function( circuitElement ) {
      circuit.vertices.add( circuitElement.startVertex );
      circuit.vertices.add( circuitElement.endVertex );
    };
    this.wires.addItemAddedListener( addVertices );
    this.batteries.addItemAddedListener( addVertices );
    this.lightBulbs.addItemAddedListener( addVertices );
    this.resistors.addItemAddedListener( addVertices );
  }

  return inherit( Object, Circuit, {

    // @public
    solve: function() {

      // These are just to keep lint from complaining, so that we can load these dependencies into the module system
      // for qunit tests
      new OOCircuit().solve();
    },

    // @public
    wireTerminalDragged: function( wire, terminalPositionProperty ) {
      for ( var i = 0; i < this.vertices.getArray().length; i++ ) {
        var vertex = this.vertices.getArray()[ i ];
        if ( vertex.isConnectedTo( wire, terminalPositionProperty ) ) {
          vertex.setPosition( terminalPositionProperty.get() );
        }
      }
    },

    // If the proposed vertex was made, would the wires overlap?  If so, do not allow them to connect.
    wouldOverlap: function( wire1, terminalPositionProperty1, wire2, terminalPositionProperty2 ) {
      return this.isConnected(
        wire1, wire1.getOppositeTerminalPositionProperty( terminalPositionProperty1 ),
        wire2, wire2.getOppositeTerminalPositionProperty( terminalPositionProperty2 )
      );
    },

    isConnected: function( wire1, terminalPositionProperty1, wire2, terminalPositionProperty2 ) {

      // see if any pre-existing vertices will work
      for ( var i = 0; i < this.vertices.getArray().length; i++ ) {
        var vertex = this.vertices.getArray()[ i ];
        if ( vertex.isConnectedTo( wire1, terminalPositionProperty1 ) && vertex.isConnectedTo( wire2, terminalPositionProperty2 ) ) {
          return true;
        }
      }
    },

    // @public
    connect: function( wire1, terminalPositionProperty1, wire2, terminalPositionProperty2 ) {

      var connected = false;

      // see if any pre-existing vertices will work
      for ( var i = 0; i < this.vertices.getArray().length; i++ ) {
        var vertex = this.vertices.getArray()[ i ];
        if ( vertex.isConnectedTo( wire1, terminalPositionProperty1 ) ) {
          vertex.addBranch( wire2, terminalPositionProperty2 );
          connected = true;
          break;
        }
        else if ( vertex.isConnectedTo( wire2, terminalPositionProperty2 ) ) {
          vertex.addBranch( wire1, terminalPositionProperty1 );
          connected = true;
          break;
        }
      }
      if ( !connected ) {
        this.vertices.add( new Vertex()
          .addBranch( wire1, terminalPositionProperty1 )
          .addBranch( wire2, terminalPositionProperty2 )
        );
      }
    },

    // @public
    getSnapContext: function() {
      return new SnapContext( this );
    }
  } );
} );