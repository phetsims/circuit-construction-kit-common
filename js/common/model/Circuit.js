// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * A collection of circuit elements in the play area, not necessarily connected.  (For instance it could be 2 logical
 * circuits).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var MNACircuit = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/modified-nodal-analysis/MNACircuit' );
  var Property = require( 'AXON/Property' );
  var Emitter = require( 'AXON/Emitter' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/Vertex' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/Wire' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/Battery' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/LightBulb' );
  var Switch = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/Switch' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/Resistor' );
  var ConstantDensityLayout = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/ConstantDensityLayout' );
  var ConstantDensityPropagator = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/ConstantDensityPropagator' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var SNAP_RADIUS = 30;

  /**
   *
   * @constructor
   */
  function Circuit( tandem ) {
    var circuit = this;
    this.wires = new ObservableArray();
    this.switches = new ObservableArray();
    this.batteries = new ObservableArray();
    this.lightBulbs = new ObservableArray();
    this.resistors = new ObservableArray();

    this.showElectronsProperty = new Property( false, {
      tandem: tandem.createTandem( 'showElectronsProperty' )
    } );
    this.electrons = new ObservableArray();

    this.constantDensityLayout = new ConstantDensityLayout( this );
    this.constantDensityPropagator = new ConstantDensityPropagator( this );

    // Re-solve the circuit when voltages or resistances change.
    var solve = function() {
      circuit.solve();
    };

    this.wires.addItemAddedListener( function( wire ) { wire.resistanceProperty.lazyLink( solve ); } );
    this.wires.addItemRemovedListener( function( wire ) { wire.resistanceProperty.unlink( solve ); } );

    this.switches.addItemAddedListener( function( switchModel ) { switchModel.resistanceProperty.lazyLink( solve ); } );
    this.switches.addItemRemovedListener( function( switchModel ) { switchModel.resistanceProperty.unlink( solve ); } );

    this.batteries.addItemAddedListener( function( battery ) { battery.voltageProperty.lazyLink( solve ); } );
    this.batteries.addItemRemovedListener( function( battery ) { battery.voltageProperty.unlink( solve ); } );

    this.resistors.addItemAddedListener( function( resistor ) { resistor.resistanceProperty.lazyLink( solve ); } );
    this.resistors.addItemRemovedListener( function( resistor ) { resistor.resistanceProperty.unlink( solve ); } );

    this.lightBulbs.addItemAddedListener( function( lightBulb ) { lightBulb.resistanceProperty.lazyLink( solve ); } );
    this.lightBulbs.addItemRemovedListener( function( lightBulb ) { lightBulb.resistanceProperty.unlink( solve ); } );

    this.switches.addItemAddedListener( function( switchModel ) { switchModel.closedProperty.lazyLink( solve ); } );
    this.switches.addItemRemovedListener( function( switchModel ) { switchModel.closedProperty.unlink( solve ); } );

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
    this.switches.addItemAddedListener( addVertices );
    this.batteries.addItemAddedListener( addVertices );
    this.lightBulbs.addItemAddedListener( addVertices );
    this.resistors.addItemAddedListener( addVertices );

    var addElectrons = function( circuitElement ) {
      circuit.constantDensityLayout.layoutElectrons( circuitElement );

      // When any vertex moves, relayout all electrons within the fixed-length connected component, see #100
      var updateElectrons = function() {
        var circuitElements = circuit.findAllConnectedCircuitElements( circuitElement.startVertex );

        for ( var i = 0; i < circuitElements.length; i++ ) {
          circuit.constantDensityLayout.layoutElectrons( circuitElements[ i ] );
        }
      };
      circuitElement.vertexMovedEmitter.addListener( updateElectrons );
      circuitElement.moveToFrontEmitter.addListener( updateElectrons );
    };
    var removeElectrons = function( circuitElement ) {
      circuit.electrons.removeAll( circuit.getElectronsInCircuitElement( circuitElement ) );
    };
    this.wires.addItemAddedListener( addElectrons );
    this.switches.addItemAddedListener( addElectrons );
    this.batteries.addItemAddedListener( addElectrons );
    this.lightBulbs.addItemAddedListener( addElectrons );
    this.resistors.addItemAddedListener( addElectrons );

    this.wires.addItemRemovedListener( removeElectrons );
    this.switches.addItemRemovedListener( removeElectrons );
    this.batteries.addItemRemovedListener( removeElectrons );
    this.lightBulbs.addItemRemovedListener( removeElectrons );
    this.resistors.addItemRemovedListener( removeElectrons );

    // After the circuit physics is recomputed in solve(), some listeners need to update themselves, such as
    // the voltmeter and ammeter
    this.circuitChangedEmitter = new Emitter();

    // Some actions only take place after an item has been dropped
    this.vertexDroppedEmitter = new Emitter();

    // Pass-through events
    this.componentEditedEmitter = new Emitter();

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

    // When any vertex is dropped, check all vertices for intersection.  If any overlap, move them apart.
    this.vertexDroppedEmitter.addListener( function() {

      // TODO: schedule in the step() function or with phet timers
      setTimeout( function() {
        for ( var i = 0; i < circuit.vertices.length; i++ ) {
          var v1 = circuit.vertices.get( i );
          for ( var k = 0; k < circuit.vertices.length; k++ ) {
            var v2 = circuit.vertices.get( k );
            if ( i !== k ) {
              if ( v2.unsnappedPosition.distance( v1.unsnappedPosition ) < 20 ) {
                circuit.moveVerticesApart( v1, v2 );
                return; // Don't handle the same pair twice  // TODO: perhaps cycle several times until reaching a stable state
              }
            }
          }
        }
      }, 100 );
    } );
  }

  circuitConstructionKit.register( 'Circuit', Circuit );

  return inherit( Object, Circuit, {
    containsVertex: function( vertex ) {
      return this.vertices.indexOf( vertex ) >= 0;
    },

    // Two vertices were too close to each other, move them apart.
    moveVerticesApart: function( v1, v2 ) {

      // are they in the same fixed subgroup
      var v1Group = this.findAllFixedVertices( v1 );
      if ( v1Group.indexOf( v2 ) >= 0 || true ) { // TODO: Treat wires the same as fixed length components here?

        var v1Neighbors = this.getNeighborVertices( v1 );
        var v2Neighbors = this.getNeighborVertices( v2 );

        if ( v1Neighbors.length === 1 && !v1.blackBoxInterface ) {
          this.rotateSingleVertex( v1, v1Neighbors[ 0 ] );
        }
        else if ( v2Neighbors.length === 1 && !v2.blackBoxInterface ) {
          this.rotateSingleVertex( v2, v2Neighbors[ 0 ] );
        }
        else {
          // TODO: rotate the entire group unless they have a fixed connection other than the pivot?
        }
      }
      else {
        // ok to translate
      }
    },
    get circuitElements() {
      return []
        .concat( this.wires.getArray() )
        .concat( this.switches.getArray() )
        .concat( this.batteries.getArray() )
        .concat( this.lightBulbs.getArray() )
        .concat( this.resistors.getArray() );
    },

    // Rotate away from other vertices, not toward them.
    rotateSingleVertex: function( vertex, pivotVertex ) {
      var searchAngle = Math.PI / 4;
      this.rotateSingleVertexByAngle( vertex, pivotVertex, searchAngle );
      var distance1 = this.closestDistanceToOtherVertex( vertex );
      this.rotateSingleVertexByAngle( vertex, pivotVertex, -2 * searchAngle );
      var distance2 = this.closestDistanceToOtherVertex( vertex );
      if ( distance2 > distance1 ) {
        // keep it, we're good.
      }
      else {

        // go back to the best spot
        this.rotateSingleVertexByAngle( vertex, pivotVertex, 2 * searchAngle );
      }
    },

    rotateSingleVertexByAngle: function( vertex, pivotVertex, deltaAngle ) {
      var distanceFromVertex = vertex.position.distance( pivotVertex.position );
      var angle = vertex.position.minus( pivotVertex.position ).angle();

      var newPosition = pivotVertex.position.plus( Vector2.createPolar( distanceFromVertex, angle + deltaAngle ) );
      vertex.unsnappedPosition = newPosition;
      vertex.position = newPosition;
    },

    closestDistanceToOtherVertex: function( vertex ) {
      var closestDistance = null;
      for ( var i = 0; i < this.vertices.length; i++ ) {
        var v = this.vertices.get( i );
        if ( v !== vertex ) {
          var distance = v.position.distance( vertex.position );
          if ( closestDistance === null || distance < closestDistance ) {
            closestDistance = distance;
          }
        }
      }
      return closestDistance;
    },

    clear: function() {
      this.selectedCircuitElementProperty.reset();

      this.wires.clear();
      this.switches.clear();
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
      for ( var i = 0; i < neighborCircuitElements.length; i++ ) {
        var circuitElement = neighborCircuitElements[ i ];
        if ( circuitElement.interactive ) {
          var options = {
            draggable: true,
            interactive: true,
            attachable: true,
            blackBoxInterface: false,
            insideTrueBlackBox: false
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

            // Only translate vertices that are movable and not connected to the black box interface by fixed length elements
            if ( v.draggable && !this.hasFixedConnectionToBlackBoxInterfaceVertex( v ) ) {
              v.position = v.position.plus( translation );
              v.unsnappedPosition = v.position;
            }
          }
        }
      }

      if ( !vertex.blackBoxInterface ) {
        this.vertices.remove( vertex );
      }

      // Update the physics
      this.solve();
    },

    hasFixedConnectionToBlackBoxInterfaceVertex: function( v ) {
      var vertices = this.findAllFixedVertices( v );
      return _.filter( vertices, function( v ) {return v.blackBoxInterface;} ).length > 0;
    },

    isSingle: function( circuitElement ) {
      return this.getNeighborCircuitElements( circuitElement.startVertex ).length === 1 &&
             this.getNeighborCircuitElements( circuitElement.endVertex ).length === 1;
    },

    remove: function( circuitElement ) {
      var list = circuitElement instanceof Battery ? this.batteries :
                 circuitElement instanceof Resistor ? this.resistors :
                 circuitElement instanceof Wire ? this.wires :
                 circuitElement instanceof LightBulb ? this.lightBulbs :
                 circuitElement instanceof Switch ? this.switches :
                 null;
      list.remove( circuitElement );

      // Delete orphaned vertices
      if ( this.getNeighborCircuitElements( circuitElement.startVertex ).length === 0 && !circuitElement.startVertex.blackBoxInterface ) {
        this.vertices.remove( circuitElement.startVertex );
      }

      if ( this.getNeighborCircuitElements( circuitElement.endVertex ).length === 0 && !circuitElement.endVertex.blackBoxInterface ) {
        this.vertices.remove( circuitElement.endVertex );
      }

      circuitElement.dispose();

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

      var toObject = function( circuitElement ) {
        return {
          node0: circuit.vertices.indexOf( circuitElement.startVertex ),
          node1: circuit.vertices.indexOf( circuitElement.endVertex ),
          circuitElement: circuitElement
        };
      };

      // the index of vertex corresponds to position in list.
      var batteries = this.batteries.map( function( battery ) {
        return _.extend( toObject( battery ), { voltage: battery.voltage } );
      } );
      var resistors = this.resistors.map( function( resistor ) {
        return _.extend( toObject( resistor ), { resistance: resistor.resistance } );
      } );
      var wires = this.wires.map( function( wire ) {
        return _.extend( toObject( wire ), { resistance: wire.resistance } );
      } );
      var bulbs = this.lightBulbs.map( function( lightBulb ) {
        return _.extend( toObject( lightBulb ), { resistance: lightBulb.resistance } );
      } );
      // TODO: correct modeling of switch topology?  Match with voltmeter/ammeter.
      var switches = this.switches.map( function( switchModel ) {
        return _.extend( toObject( switchModel ), { resistance: switchModel.resistance } );
      } );

      var resistorAdapters = resistors.getArray().concat( wires.getArray() ).concat( bulbs.getArray() ).concat( switches.getArray() );

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
      if ( vertex2.blackBoxInterface ) {
        assert && assert( !vertex1.blackBoxInterface, 'cannot attach black box interface vertex to black box interface vertex' );
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

    step: function( dt ) {
      this.constantDensityPropagator.step( dt );
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
      return this.getFixedLengthCircuitElements().concat( this.wires.getArray() ).concat( this.switches.getArray() );
    },

    getFixedLengthCircuitElements: function() {
      return this.batteries.getArray().concat( this.lightBulbs.getArray() ).concat( this.resistors.getArray() );
    },

    /**
     * Find the neighbor vertices when looking at the given group of circuit elements
     * @param {Vertex} vertex
     * @param {CircuitElement[]} circuitElements
     * @returns {Vertex[]}
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

    getNeighborVertices: function( vertex ) {
      var neighborCircuitElements = this.getNeighborCircuitElements( vertex );
      return this.getNeighbors( vertex, neighborCircuitElements );
    },

    /**
     * Get a list of all circuit elements that can reach the specified vertex.
     * @param {Vertex} vertex
     * @returns {CircuitElement[]}
     */
    findAllConnectedCircuitElements: function( vertex ) {
      var allConnectedVertices = this.findAllConnectedVertices( vertex );
      var circuitElements = [];
      for ( var i = 0; i < allConnectedVertices.length; i++ ) {
        var neighborCircuitElements = this.getNeighborCircuitElements( allConnectedVertices[ i ] );
        for ( var k = 0; k < neighborCircuitElements.length; k++ ) {
          var neighborCircuitElement = neighborCircuitElements[ k ];
          if ( circuitElements.indexOf( neighborCircuitElement ) === -1 ) {
            circuitElements.push( neighborCircuitElement );
          }
        }
      }
      return circuitElements;
    },

    /**
     * Find the subgraph where all vertices are connected by any kind of (non-infinite resistance) connections
     * @param {Vertex} vertex
     */
    findAllConnectedVertices: function( vertex ) {
      return this.searchVertices( vertex, this.circuitElements, function() {return true;} );
    },

    /**
     * Find the subgraph where all vertices are connected, given the list of traversible circuit elements
     * @param {Vertex} vertex
     * @param {Array.<CircuitElement>} circuitElements
     * @param {Function} okToVisit - rule that determines which vertices are OK to visit
     * @returns {Vertex[]}
     */
    searchVertices: function( vertex, circuitElements, okToVisit ) {
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
            if ( visited.indexOf( neighbor ) < 0 && toVisit.indexOf( neighbor ) < 0 && okToVisit( currentVertex, neighbor ) ) {
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
     *
     * @param {CircuitElement} circuitElement
     * @returns {Array}
     */
    getElectronsInCircuitElement: function( circuitElement ) {
      return this.electrons.filter( function( electron ) { return electron.circuitElement === circuitElement; } ).getArray();
    },

    /**
     * Find the subgraph where all vertices are connected by FixedLengthCircuitElements, not stretchy wires.
     * @param {Vertex} vertex
     * @param {Function} [okToVisit] - rule that determines which vertices are OK to visit
     * @return {Vertex[]}
     */
    findAllFixedVertices: function( vertex, okToVisit ) {
      return this.searchVertices( vertex, this.getFixedLengthCircuitElements(), okToVisit || function() {return true;} );
    },

    /**
     * A vertex has been dragged, is it a candidate for joining with other vertices?  If so, return the candidate
     * vertex.  Otherwise, return null.
     * @param {Vertex} vertex - the dragged vertex
     * @param {string} mode - the application mode 'build' | 'investigate' | undefined
     * @param {Bounds2} blackBoxBounds - the bounds of the black box, if there is one
     * @returns {Vertex} - the vertex it will be able to connect to, if dropped
     * @public
     */
    getDropTarget: function( vertex, mode, blackBoxBounds ) {
      console.log( blackBoxBounds.top );
      var circuit = this;

      if ( mode === 'build' ) {
        assert && assert( blackBoxBounds, 'bounds should be provided for build mode' );
      }

      // Rules for a vertex connecting to another vertex.
      // (1) A vertex may not connect to an adjacent vertex.
      var candidateVertices = this.vertices.filter( function( candidateVertex ) {
        return !circuit.isVertexAdjacent( vertex, candidateVertex );
      } );

      // (2) A vertex cannot connect to itself
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        return candidateVertex !== vertex;
      } );

      // (3) a vertex must be within SNAP_RADIUS (screen coordinates) of the other vertex
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        return vertex.unsnappedPosition.distance( candidateVertex.position ) < SNAP_RADIUS;
      } );

      // (4) a vertex must be attachable. Some black box vertices are not attachable, such as vertices hidden in the box
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        return candidateVertex.attachable;
      } );

      // (5) Reject any matches that result in circuit elements sharing a pair of vertices, which would cause
      // the wires to lay across one another (one vertex was already shared)
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

      // (6) a vertex cannot be connected to its own fixed subgraph (no wire)
      var fixedVertices = this.findAllFixedVertices( vertex );
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        for ( var i = 0; i < fixedVertices.length; i++ ) {
          if ( fixedVertices[ i ] === candidateVertex ) {
            return false;
          }
        }
        return true;
      } );

      // (7) a wire vertex cannot connect if its neighbor is already proposing a connection
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {

        // You can always attach to a black box interface
        if ( candidateVertex.blackBoxInterface ) {
          return true;
        }
        var neighbors = circuit.getNeighborCircuitElements( candidateVertex );
        for ( var i = 0; i < neighbors.length; i++ ) {
          var neighbor = neighbors[ i ];
          var oppositeVertex = neighbor.getOppositeVertex( candidateVertex );

          // is another node proposing a match to that node?
          for ( var k = 0; k < circuit.vertices.length; k++ ) {
            var v = circuit.vertices.get( k );
            if ( neighbor instanceof Wire && v !== vertex && v !== oppositeVertex && v.position.equals( oppositeVertex.position ) ) {
              return false;
            }
          }
        }
        return true;
      } );

      // (8) a wire vertex cannot double connect to an object, creating a tiny short circuit
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        var candidateNeighbors = circuit.getNeighborVertices( candidateVertex );
        var myNeighbors = circuit.getNeighborVertices( vertex );
        var intersection = _.intersection( candidateNeighbors, myNeighbors );
        return intersection.length === 0;
      } );

      // (9) When in Black Box "build" mode (i.e. building inside the black box), a vertex user cannot connect to
      // a black bax interface vertex if its other vertices would be outside of the black box.  See #136
      if ( mode === 'build' ) {
        var connectedVertices = this.findAllConnectedVertices( vertex );
        candidateVertices = candidateVertices.filter( function( candidateVertex ) {

          // Don't connect to vertices that might have sneaked outside of the black box, say by a rotation.
          if ( !candidateVertex.blackBoxInterface && !blackBoxBounds.containsPoint( candidateVertex.position ) ) {
            return false;
          }

          if ( candidateVertex.blackBoxInterface || blackBoxBounds.containsPoint( candidateVertex.position ) ) {
            for ( var i = 0; i < connectedVertices.length; i++ ) {
              var connectedVertex = connectedVertices[ i ];
              if ( connectedVertex.blackBoxInterface ) {

                // OK for black box interface vertex to be slightly outside the box
              }
              else if ( connectedVertex !== vertex && !blackBoxBounds.containsPoint( connectedVertex.position ) ) {
                return false;
              }
            }
          }
          else {
            return true;
          }
          return true;
        } );
      }

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
        switches: getArray( this.switches ),
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
      circuitStruct.switches.forEach( this.switches.add.bind( this.switches ) );
      circuitStruct.batteries.forEach( this.batteries.add.bind( this.batteries ) );
      circuitStruct.resistors.forEach( this.vertices.add.bind( this.vertices ) );
      circuitStruct.lightBulbs.forEach( this.lightBulbs.add.bind( this.lightBulbs ) );
    }
  } );
} );