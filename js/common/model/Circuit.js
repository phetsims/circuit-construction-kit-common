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
    // @public (read-only, elements-read-only)
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

    circuit.vertices.addItemAddedListener( function( vertex ) {
      var filtered = circuit.vertices.filter( function( candidateVertex ) {
        return vertex === candidateVertex;
      } );
      assert && assert( filtered.length === 1, 'should only have one copy of each vertex' );
    } );
  }

  return inherit( Object, Circuit, {

    countCircuitElements: function( vertex ) {
      var edgeCount = 0;
      var circuitElements = this.getCircuitElements();
      for ( var i = 0; i < circuitElements.length; i++ ) {
        if ( circuitElements[ i ].containsVertex( vertex ) ) {
          edgeCount++;
        }
      }
      return edgeCount;
    },

    // @public
    solve: function() {

      // These are just to keep lint from complaining, so that we can load these dependencies into the module system
      // for qunit tests
      new OOCircuit().solve();
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

    /**
     * Connect the vertices, merging vertex2 into vertex1 and deleting vertex2
     * @param {Vertex} vertex1
     * @param {Vertex} vertex2
     * @public
     */
    connect: function( vertex1, vertex2 ) {
      var circuitElements = this.getCircuitElements();
      for ( var i = 0; i < circuitElements.length; i++ ) {
        circuitElements[ i ].connectCircuitElement( vertex1, vertex2 );
      }
      this.vertices.remove( vertex2 );
      assert && assert( !vertex2.positionProperty.hasListeners(), 'Removed vertex should not have any listeners' );
    },

    // The only way for two vertices to be adjacent is for them to be the start/end of a single CircuitElement
    isVertexAdjacent: function( a, b ) {
      var circuitElements = this.getCircuitElements();
      for ( var i = 0; i < circuitElements.length; i++ ) {
        if ( circuitElements[ i ].hasBothVertices( a, b ) ) {
          return true;
        }
      }
      return false;
    },

    getCircuitElements: function() {
      return this.getFixedLengthCircuitElements().concat( this.wires.getArray() );
    },

    getFixedLengthCircuitElements: function() {
      return this.batteries.getArray().concat( this.lightBulbs.getArray() ).concat( this.resistors.getArray() );
    },

    /**
     * Find all adjacent vertices connected to the specified vertex by a fixed length component.
     * @param {Vertex} vertex
     */
    getFixedNeighbors: function( vertex ) {
      var circuitElements = this.getFixedLengthCircuitElements();
      var fixedNeighbors = [];
      for ( var i = 0; i < circuitElements.length; i++ ) {
        var circuitElement = circuitElements[ i ];
        if ( circuitElement.containsVertex( vertex ) ) {
          fixedNeighbors.push( circuitElement.getOppositeVertex( vertex ) );
        }
      }
      return fixedNeighbors;
    },

    /**
     * Find the subgraph where all vertices are connected by FixedLengthComponents, not stretchy wires.
     * @param {Vertex} vertex
     */
    findAllFixedVertices: function( vertex ) {
      var fixedVertices = [];
      var toVisit = [ vertex ];
      var visited = [];
      while ( toVisit.length > 0 ) {

        // Find the neighbors joined by a FixedLengthComponent, not a stretchy Wire
        var currentVertex = toVisit.pop();

        // If we haven't visited it before, then explore it
        if ( visited.indexOf( currentVertex ) < 0 ) {
          var neighbors = this.getFixedNeighbors( currentVertex );

          for ( var i = 0; i < neighbors.length; i++ ) {
            var neighbor = neighbors[ i ];

            // If the node was already visited, don't visit again
            if ( visited.indexOf( neighbor ) < 0 && toVisit.indexOf( neighbor ) < 0 ) {
              toVisit.push( neighbor );
            }
          }
        }
        if ( fixedVertices.indexOf( currentVertex ) < 0 ) {
          fixedVertices.push( currentVertex );
        }
        if ( visited.indexOf( currentVertex ) < 0 ) {
          visited.push( currentVertex );
        }
      }
      return fixedVertices;
    },

    /**
     * A vertex has been dragged, is it a candidate for joining with other vertices?  If so, return the candidate
     * vertex.  Otherwise, return null.
     * @param {Vertex} vertex
     * @returns {Vertex}
     * @public
     */
    getDropTarget: function( vertex ) {
      var circuit = this;

      // Rules for a vertex connecting to another vertex.
      // (1) A vertex may not connect to an adjacent vertex.
      var candidateVertices = this.vertices.filter( function( candidateVertex ) {
        return !circuit.isVertexAdjacent( vertex, candidateVertex );
      } );

      // (2) A vertex cannot connect to itself
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        return candidateVertex !== vertex;
      } );

      // (3) a vertex must be within 100px (screen coordinates) of the other vertex
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        return vertex.position.distance( candidateVertex.position ) < 100;
      } );
      if ( candidateVertices.length === 0 ) {
        return null;
      }
      else {

        // Find the closest match
        var sorted = _.sortBy( candidateVertices.getArray(), function( candidateVertex ) {
          return vertex.position.distance( candidateVertex.position );
        } );
        return sorted[ 0 ];
      }
    }
  } );
} );