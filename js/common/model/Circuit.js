// Copyright 2015-2016, University of Colorado Boulder

/**
 * A collection of circuit elements in the play area, not necessarily connected.  (For instance it could be 2 logical
 * circuits).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var MNACircuit = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/modified-nodal-analysis/MNACircuit' );
  var Property = require( 'AXON/Property' );
  var Emitter = require( 'AXON/Emitter' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Vertex' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Wire' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Battery' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/LightBulb' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Resistor' );

  // constants
  var SNAP_RADIUS = 30;

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

    // Re-solve the circuit when voltages or resistances change.
    var solve = function() {
      circuit.solve();
    };

    this.wires.addItemAddedListener( function( wire ) { wire.resistanceProperty.lazyLink( solve ); } );
    this.wires.addItemRemovedListener( function( wire ) { wire.resistanceProperty.unlink( solve ); } );

    this.batteries.addItemAddedListener( function( battery ) { battery.voltageProperty.lazyLink( solve ); } );
    this.batteries.addItemRemovedListener( function( battery ) { battery.voltageProperty.unlink( solve ); } );

    this.resistors.addItemAddedListener( function( resistor ) { resistor.resistanceProperty.lazyLink( solve ); } );
    this.resistors.addItemRemovedListener( function( resistor ) { resistor.resistanceProperty.unlink( solve ); } );

    this.lightBulbs.addItemAddedListener( function( lightBulb ) { lightBulb.resistanceProperty.lazyLink( solve ); } );
    this.lightBulbs.addItemRemovedListener( function( lightBulb ) { lightBulb.resistanceProperty.unlink( solve ); } );

    // Keep track of which terminals are connected to other terminals
    // This is redundant (connections tracked in the elements above), but a central point for
    // observing creation/deletion of vertices for showing VertexNodes
    // @public (read-only, elements-read-only)
    this.vertices = new ObservableArray();

    // When a new circuit element is added to a circuit, it has two unconnected vertices
    var addVertices = function( circuitElement ) {

      // Vertices may already exist for a Circuit when loading
      if ( circuit.vertices.indexOf( circuitElement.startVertex ) < 0 ) {
        circuit.vertices.add( circuitElement.startVertex );
      }

      if ( circuit.vertices.indexOf( circuitElement.endVertex ) < 0 ) {
        circuit.vertices.add( circuitElement.endVertex );
      }

      assert && assert( circuit.vertices.indexOf( circuitElement.startVertex ) >= 0, 'start vertex should appear in the list' );
      assert && assert( circuit.vertices.indexOf( circuitElement.endVertex ) >= 0, 'end vertex should appear in the list' );
      circuit.solve();
    };
    this.wires.addItemAddedListener( addVertices );
    this.batteries.addItemAddedListener( addVertices );
    this.lightBulbs.addItemAddedListener( addVertices );
    this.resistors.addItemAddedListener( addVertices );

    // After the circuit physics is recomputed in solve(), some listeners need to update themselves, such as
    // the voltmeter and ammeter
    this.circuitChangedEmitter = new Emitter();

    // Some actions only take place after an item has been dropped
    this.circuitElementDroppedEmitter = new Emitter();

    var circuitChangedEmitterFunction = function() {
      circuit.circuitChangedEmitter.emit();
    };
    circuit.vertices.addItemAddedListener( function( vertex ) {

      // Observe the change in location of the vertices, to update the ammeter and voltmeter
      vertex.positionProperty.link( circuitChangedEmitterFunction );

      var filtered = circuit.vertices.filter( function( candidateVertex ) {
        return vertex === candidateVertex;
      } );
      assert && assert( filtered.length === 1, 'should only have one copy of each vertex' );
    } );

    // Stop watching the vertex positions for updating the voltmeter and ammeter
    circuit.vertices.addItemRemovedListener( function( vertex ) {
      assert && assert( vertex.positionProperty.hasListener( circuitChangedEmitterFunction ), 'should have had the listener' );
      vertex.positionProperty.unlink( circuitChangedEmitterFunction );
      assert && assert(
        !vertex.positionProperty.hasListener( circuitChangedEmitterFunction ),
        'Listener should have been removed'
      );
    } );

    // Keep track of the last circuit element the user manipulated, for showing additional controls
    this.selectedCircuitElementProperty = new Property( null );
  }

  return inherit( Object, Circuit, {
    get circuitElements() {
      return []
        .concat( this.wires.getArray() )
        .concat( this.batteries.getArray() )
        .concat( this.lightBulbs.getArray() )
        .concat( this.resistors.getArray() );
    },
    clear: function() {
      this.selectedCircuitElementProperty.reset();

      this.wires.clear();
      this.batteries.clear();
      this.lightBulbs.clear();
      this.resistors.clear();

      this.vertices.clear();

      // Update the physics
      this.solve();
    },

    /**
     * @param {Vertex} vertex
     */
    cutVertex: function( vertex ) {
      var neighborCircuitElements = this.getNeighborCircuitElements( vertex );
      if ( neighborCircuitElements.length === 0 ) {

        // No need to cut a solo vertex
        return;
      }
      if ( neighborCircuitElements.length === 1 && vertex.draggable ) {

        // No need to cut an edge vertex, unless it is a single interactive wire connected to an undraggable vertex.
        // This case appears in a black box when the user attached a wire to a black box interface vertex
        return;
      }
      for ( var i = 0; i < neighborCircuitElements.length; i++ ) {
        var circuitElement = neighborCircuitElements[ i ];
        var options = {
          draggable: circuitElement.interactive
        };
        var newVertex = new Vertex( vertex.position.x, vertex.position.y, options );
        circuitElement.replaceVertex( vertex, newVertex );
        this.vertices.add( newVertex );

        // Bump the vertices away from each other
        var vertexGroup = this.findAllFixedVertices( newVertex );
        var oppositeVertex = circuitElement.getOppositeVertex( newVertex );
        var translation = oppositeVertex.position.minus( newVertex.position ).normalized().timesScalar( 30 );
        for ( var j = 0; j < vertexGroup.length; j++ ) {
          var v = vertexGroup[ j ];
          if ( v.draggable ) {
            v.position = v.position.plus( translation );
            v.unsnappedPosition = v.position;
          }
        }
      }

      // Don't remove black box interface vertices
      if ( vertex.draggable ) {
        this.vertices.remove( vertex );
      }

      // Update the physics
      this.solve();
    },

    isSingle: function( circuitElement ) {
      return this.getNeighborCircuitElements( circuitElement.startVertex ).length === 1 &&
             this.getNeighborCircuitElements( circuitElement.endVertex ).length === 1;
    },

    remove: function( circuitElement ) {
      this.cutVertex( circuitElement.startVertex );
      this.cutVertex( circuitElement.endVertex );
      var list = circuitElement instanceof Battery ? this.batteries :
                 circuitElement instanceof Resistor ? this.resistors :
                 circuitElement instanceof Wire ? this.wires :
                 circuitElement instanceof LightBulb ? this.lightBulbs :
                 null;
      list.remove( circuitElement );
      this.vertices.remove( circuitElement.startVertex );
      this.vertices.remove( circuitElement.endVertex );

      // Clear the selected element property so that the Edit panel for the element will disappear
      if ( this.selectedCircuitElementProperty.get() === circuitElement ) {
        this.selectedCircuitElementProperty.set( null );
      }

      // Update the physics
      this.solve();
    },

    /**
     * @param {Vertex} vertex
     * @returns {Array}
     */
    getNeighborCircuitElements: function( vertex ) {
      var neighbors = [];
      var circuitElements = this.getCircuitElements();
      for ( var i = 0; i < circuitElements.length; i++ ) {
        if ( circuitElements[ i ].containsVertex( vertex ) ) {
          neighbors.push( circuitElements[ i ] );
        }
      }
      return neighbors;
    },

    hasOneNeighbor: function( vertex ) {
      return this.getNeighborCircuitElements( vertex ).length === 1;
    },

    // Duplicates work with the above method to avoid allocations.
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

    areVerticesConnected: function( vertex1, vertex2 ) {
      var vertexGroup = this.findAllConnectedVertices( vertex1 );
      return vertexGroup.indexOf( vertex2 ) >= 0;
    },

    // @public
    solve: function() {
      // console.log( JSON.stringify( this.toStateObject(), null, 2 ) );

      var circuit = this;

      // the index of vertex corresponds to position in list.
      var batteries = this.batteries.map( function( battery ) {
        return {
          node0: circuit.vertices.indexOf( battery.startVertex ),
          node1: circuit.vertices.indexOf( battery.endVertex ),
          voltage: battery.voltage,
          circuitElement: battery
        };
      } );

      var resistors = this.resistors.map( function( resistor ) {
        return {
          node0: circuit.vertices.indexOf( resistor.startVertex ),
          node1: circuit.vertices.indexOf( resistor.endVertex ),
          resistance: resistor.resistance,
          circuitElement: resistor
        };
      } );
      var wires = this.wires.map( function( wire ) {
        return {
          node0: circuit.vertices.indexOf( wire.startVertex ),
          node1: circuit.vertices.indexOf( wire.endVertex ),
          resistance: wire.resistance,
          circuitElement: wire
        };
      } );
      var bulbs = this.lightBulbs.map( function( lightBulb ) {
        return {
          node0: circuit.vertices.indexOf( lightBulb.startVertex ),
          node1: circuit.vertices.indexOf( lightBulb.endVertex ),
          resistance: lightBulb.resistance,
          circuitElement: lightBulb
        };
      } );

      var resistorAdapters = resistors.getArray().concat( wires.getArray() ).concat( bulbs.getArray() );

      var solution = new MNACircuit( batteries.getArray(), resistorAdapters, [] ).solve();

      // Apply the node voltages to the vertices
      for ( var i = 0; i < this.vertices.length; i++ ) {

        // For unconnected vertices, such as for the black box, they may not have an entry in the matrix, so just mark them
        // as zero.
        var v = typeof solution.nodeVoltages[ i ] === 'number' ? solution.nodeVoltages[ i ] : 0;
        this.vertices.get( i ).voltage = v;
      }

      // Apply the branch currents
      for ( i = 0; i < solution.elements.length; i++ ) {
        solution.elements[ i ].circuitElement.current = solution.elements[ i ].currentSolution;
      }

      // For resistors with r!==0, we must use Ohm's Law to compute the current
      for ( i = 0; i < resistorAdapters.length; i++ ) {
        var resistorAdapter = resistorAdapters[ i ];
        if ( resistorAdapter.resistance !== 0 ) {
          var voltage = solution.nodeVoltages[ resistorAdapter.node1 ] - solution.nodeVoltages[ resistorAdapter.node0 ];
          var current = -voltage / resistorAdapter.resistance;
          resistorAdapter.circuitElement.current = current;
        }
      }

      this.circuitChangedEmitter.emit();
    },

    /**
     * Connect the vertices, merging vertex2 into vertex1 and deleting vertex2
     * @param {Vertex} vertex1
     * @param {Vertex} vertex2
     * @public
     */
    connect: function( vertex1, vertex2 ) {

      assert && assert( vertex1.attachable && vertex2.attachable, 'both vertices should be attachable' );

      // Keep the black box vertices
      if ( vertex1.draggable && !vertex2.draggable ) {
        this.connect( vertex2, vertex1 );
      }
      else {
        var circuitElements = this.getCircuitElements();
        for ( var i = 0; i < circuitElements.length; i++ ) {
          circuitElements[ i ].connectCircuitElement( vertex1, vertex2 );
          if ( circuitElements[ i ].containsVertex( vertex1 ) ) {
            circuitElements[ i ].connectedEmitter.emit();
          }
        }
        this.vertices.remove( vertex2 );
        assert && assert( !vertex2.positionProperty.hasListeners(), 'Removed vertex should not have any listeners' );

        // Update the physics
        this.solve();
      }
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
     * Find the neighbor vertices when looking at the given group of circuit elements
     * @param {Vertex} vertex
     * @param {Array.<CircuitElement>} circuitElements
     * @returns {Array.<Vertex>}
     * @private
     */
    getNeighbors: function( vertex, circuitElements ) {
      var neighbors = [];
      for ( var i = 0; i < circuitElements.length; i++ ) {
        var circuitElement = circuitElements[ i ];
        if ( circuitElement.containsVertex( vertex ) ) {
          neighbors.push( circuitElement.getOppositeVertex( vertex ) );
        }
      }
      return neighbors;
    },

    /**
     * Find the subgraph where all vertices are connected by any kind of (non-infinite resistance) connections
     * @param {Vertex} vertex
     */
    findAllConnectedVertices: function( vertex ) {
      return this.searchVertices( vertex, this.circuitElements );
    },

    /**
     * Find the subgraph where all vertices are connected, given the list of traversible circuit elements
     * @param {Vertex} vertex
     * @param {Array.<CircuitElement>} circuitElements
     * @returns {Array.<Vertex>}
     */
    searchVertices: function( vertex, circuitElements ) {
      assert && assert( this.vertices.indexOf( vertex ) >= 0, 'Vertex wasn\'t in the model' );
      var fixedVertices = [];
      var toVisit = [ vertex ];
      var visited = [];
      while ( toVisit.length > 0 ) {

        // Find the neighbors joined by a FixedLengthCircuitElement, not a stretchy Wire
        var currentVertex = toVisit.pop();

        // If we haven't visited it before, then explore it
        if ( visited.indexOf( currentVertex ) < 0 ) {
          var neighbors = this.getNeighbors( currentVertex, circuitElements );

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
     * Find the subgraph where all vertices are connected by FixedLengthCircuitElements, not stretchy wires.
     * @param {Vertex} vertex
     */
    findAllFixedVertices: function( vertex ) {
      return this.searchVertices( vertex, this.getFixedLengthCircuitElements() );
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
        return vertex.unsnappedPosition.distance( candidateVertex.position ) < SNAP_RADIUS;
      } );

      // (4) a vertex must be attachable. Some black box vertices are not attachable, such as vertices hidden in the box
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        return candidateVertex.attachable;
      } );

      // (5) Reject any matches that result in circuit elements sharing a pair of vertices, which would cause
      // the wires to lay across one another
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {

        // if something else is already snapping to candidateVertex, then we cannot snap to it as well.
        // check the neighbor vertices
        for ( var i = 0; i < circuit.vertices.length; i++ ) {
          var circuitVertex = circuit.vertices.get( i );
          var adjacent = circuit.isVertexAdjacent( circuitVertex, vertex );

          // If the adjacent vertex has the same position as the candidate vertex, that means it is already "snapped"
          // there and hence another vertex should not snap there at the same time.
          if ( adjacent && circuitVertex.position.equals( candidateVertex.position ) ) {
            return false;
          }
        }
        return true;
      } );

      // (5) a vertex cannot be connected to its own fixed subgraph (no wire)
      var fixedGroup = this.findAllFixedVertices( vertex );
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        for ( var i = 0; i < fixedGroup.length; i++ ) {
          if ( fixedGroup[ i ] === candidateVertex ) {
            return false;
          }
        }
        return true;
      } );

      if ( candidateVertices.length === 0 ) {
        return null;
      }
      else {

        // Find the closest match
        var sorted = _.sortBy( candidateVertices.getArray(), function( candidateVertex ) {
          return vertex.unsnappedPosition.distance( candidateVertex.position );
        } );
        return sorted[ 0 ];
      }
    },

    toStateObject: function() {
      var circuit = this;
      var getVertexIndex = function( vertex ) {
        var vertexIndex = circuit.vertices.indexOf( vertex );
        assert && assert( vertexIndex >= 0, 'vertex should have an index' );
        return vertexIndex;
      };

      /**
       * @param {ObservableArray.<CircuitElement>} circuitElements
       * @returns {Array}
       */
      var getArray = function( circuitElements ) {
        return circuitElements.map( function( element ) {
          return element.toStateObjectWithVertexIndices( getVertexIndex );
        } ).getArray();
      };
      return {
        wires: getArray( this.wires ),
        batteries: getArray( this.batteries ),
        lightBulbs: getArray( this.lightBulbs ),
        resistors: getArray( this.resistors ),
        vertices: this.vertices.map( function( vertex ) {

          var v = {
            x: vertex.position.x,
            y: vertex.position.y
          };

          // Include any non-default options
          var defaults = Vertex.DEFAULTS;

          // Capture all non-default values for vertex options, if any
          var options = {};
          if ( vertex.attachable !== defaults.attachable ) {
            options.attachable = vertex.attachable;
          }
          if ( vertex.draggable !== defaults.draggable ) {
            options.draggable = vertex.draggable;
          }
          if ( _.keys( options ).length > 0 ) {
            v.options = options;
          }

          return v;
        } ).getArray()
      };
    },
    loadFromCircuitStruct: function( circuitStruct ) {
      this.clear();
      circuitStruct.vertices.forEach( this.vertices.add.bind( this.vertices ) );
      circuitStruct.wires.forEach( this.wires.add.bind( this.wires ) );
      circuitStruct.batteries.forEach( this.batteries.add.bind( this.batteries ) );
      circuitStruct.resistors.forEach( this.vertices.add.bind( this.vertices ) );
      circuitStruct.lightBulbs.forEach( this.lightBulbs.add.bind( this.lightBulbs ) );
    }
  } );
} );