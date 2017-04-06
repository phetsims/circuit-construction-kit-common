// Copyright 2015-2017, University of Colorado Boulder

/**
 * A collection of circuit elements in the play area, not necessarily connected.  (For instance it could be 2 disjoint
 * circuits).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var ModifiedNodalAnalysisCircuit = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/ModifiedNodalAnalysisCircuit' );
  var Property = require( 'AXON/Property' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Emitter = require( 'AXON/Emitter' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Vertex' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Wire' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Battery' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/LightBulb' );
  var Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Switch' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Resistor' );
  var ChargeLayout = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/ChargeLayout' );
  var ChargeAnimator = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/ChargeAnimator' );
  var Vector2 = require( 'DOT/Vector2' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/FixedLengthCircuitElement' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );

  // phet-io modules
  var TString = require( 'ifphetio!PHET_IO/types/TString' );
  var TNumber = require( 'ifphetio!PHET_IO/types/TNumber' );

  // constants
  var SNAP_RADIUS = 30; // For two vertices to join together, they must be this close, in view coordinates
  var BUMP_AWAY_RADIUS = 20; // If two vertices are too close together after one is released, and they could not be
                             // joined then bump them apart so they do not look connected.

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function Circuit( tandem ) {
    var self = this;

    this.wireResistivityProperty = new Property( CircuitConstructionKitConstants.DEFAULT_RESISTIVITY, {
      tandem: tandem.createTandem( 'wireResistivityProperty' ),
      phetioValueType: TNumber
    } );

    // @public - The different types of CircuitElement the circuit may contain, including Wire, Battery, Switch, Resistor,
    // LightBulb.
    this.circuitElements = new ObservableArray();

    // Keep track of which terminals are connected to other terminals.  The vertices are also referenced in the
    // CircuitElements above--this ObservableArray is a a central point for observing creation/deletion of vertices for
    // showing VertexNodes
    // @public (read-only)
    this.vertices = new ObservableArray();

    // @public (read-only) - the charges in the circuit
    this.charges = new ObservableArray();

    // @public (read-only) - whether to show charges or conventional current
    var currentTypes = [ 'electrons', 'conventional' ];
    this.currentTypeProperty = new Property( currentTypes[ 0 ], {
      validValues: currentTypes,
      tandem: tandem.createTandem( 'currentTypeProperty' ),
      phetioValueType: TString
    } );

    this.currentTypeProperty.lazyLink( function() {

      // Mark everything as dirty and relayout charges
      self.circuitElements.forEach( function( circuitElement ) {
        circuitElement.chargeLayoutDirty = true;
      } );
      self.layoutChargesInDirtyCircuitElements();
    } );

    // @public (read-only) - whether the current should be displayed
    this.showCurrentProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'showCurrentProperty' )
    } );

    // @private - create the charges in new circuits
    this.chargeLayout = new ChargeLayout( this );

    // @private - move the charges with speed proportional to current
    this.chargeAnimator = new ChargeAnimator( this );

    // Re-solve the circuit when voltages or resistances change.
    var solve = function() { self.solve(); };

    // Solve the circuit when any of the circuit element attributes change.
    this.circuitElements.addItemAddedListener( function( circuitElement ) {
      circuitElement.getCircuitProperties().forEach( function( property ) {
        property.lazyLink( solve );
      } );
    } );
    this.circuitElements.addItemRemovedListener( function( circuitElement ) {
      circuitElement.getCircuitProperties().forEach( function( property ) {
        property.unlink( solve );
      } );
    } );

    // When a new circuit element is added to a circuit, it has two unconnected vertices
    this.circuitElements.addItemAddedListener( function( circuitElement ) {

      // Vertices may already exist for a Circuit when loading
      if ( !self.vertices.contains( circuitElement.startVertexProperty.get() ) ) {
        self.vertices.add( circuitElement.startVertexProperty.get() );
      }

      if ( !self.vertices.contains( circuitElement.endVertexProperty.get() ) ) {
        self.vertices.add( circuitElement.endVertexProperty.get() );
      }
    } );

    // When any vertex moves, relayout all charges within the fixed-length connected component, see #100
    this.circuitElements.addItemAddedListener( function( circuitElement ) {
      circuitElement.chargeLayoutDirty = true;

      var updateCharges = function() {
        var circuitElements = self.findAllConnectedCircuitElements( circuitElement.startVertexProperty.get() );

        for ( var i = 0; i < circuitElements.length; i++ ) {
          circuitElements[ i ].chargeLayoutDirty = true;
        }
      };
      circuitElement.vertexMovedEmitter.addListener( updateCharges );
      circuitElement.moveToFrontEmitter.addListener( updateCharges );
      self.solve();
    } );
    this.circuitElements.addItemRemovedListener( function( circuitElement ) {
      self.charges.removeAll( self.getChargesInCircuitElement( circuitElement ) );
      self.solve(); // Explicit call to solve since it is possible to remove a CircuitElement without removing any vertices.
    } );

    // When a Charge is removed from the list, dispose it
    this.charges.addItemRemovedListener( function( charge ) {
      charge.dispose();
    } );

    // After the circuit physics is recomputed in solve(), some listeners need to update themselves, such as
    // the voltmeter and ammeter
    this.circuitChangedEmitter = new Emitter();

    // Some actions only take place after an item has been dropped
    this.vertexDroppedEmitter = new Emitter();

    // This Emitter signifies that a component has been modified (for example, with the CircuitElementEditPanel)
    this.componentEditedEmitter = new Emitter();

    var emitCircuitChanged = function() {
      self.circuitChangedEmitter.emit();
    };
    self.vertices.addItemAddedListener( function( vertex ) {

      // Observe the change in location of the vertices, to update the ammeter and voltmeter
      vertex.positionProperty.link( emitCircuitChanged );

      var filtered = self.vertices.filter( function( candidateVertex ) {
        return vertex === candidateVertex;
      } );
      assert && assert( filtered.length === 1, 'should only have one copy of each vertex' );
    } );

    // Stop watching the vertex positions for updating the voltmeter and ammeter
    self.vertices.addItemRemovedListener( function( vertex ) {
      assert && assert( vertex.positionProperty.hasListener( emitCircuitChanged ), 'should have had the listener' );
      vertex.positionProperty.unlink( emitCircuitChanged );
      assert && assert( !vertex.positionProperty.hasListener( emitCircuitChanged ), 'Listener should have been removed' );
    } );

    // Keep track of the last circuit element the user manipulated, for showing additional controls
    // TODO: Will a11y track this?
    this.selectedCircuitElementProperty = new Property( null );

    // Actions that will be invoked during the step function
    this.stepActions = [];

    // When any vertex is dropped, check all vertices for intersection.  If any overlap, move them apart.
    this.vertexDroppedEmitter.addListener( function() {
      self.stepActions.push( function() {

        // Enumerate all pairs of vertices
        var pairs = [];
        for ( var i = 0; i < self.vertices.length; i++ ) {
          for ( var k = i + 1; k < self.vertices.length; k++ ) {
            pairs.push( { v1: self.vertices.get( i ), v2: self.vertices.get( k ) } );
          }
        }
        if ( pairs.length > 0 ) {

          // Find the closest pair
          var distance = function( pair ) {
            return pair.v2.unsnappedPositionProperty.get().distance( pair.v1.unsnappedPositionProperty.get() );
          };
          var minPair = _.minBy( pairs, distance );
          var minDistance = distance( minPair );

          // If the pair is too close, then bump one vertex away from each other.
          if ( minDistance < BUMP_AWAY_RADIUS ) {
            self.moveVerticesApart( minPair.v1, minPair.v2 );
          }
        }
      } );
    } );

    // @public - for creating vertex tandems
    this.vertexGroupTandem = tandem.createGroupTandem( 'vertices' );
  }

  circuitConstructionKitCommon.register( 'Circuit', Circuit );

  return inherit( Object, Circuit, {

    /**
     * When over Vertex is released or bumped over another Vertex, move them apart so they don't appear connected.
     * @param {Vertex} v1
     * @param {Vertex} v2
     * @private
     */
    moveVerticesApart: function( v1, v2 ) {

      var v1Neighbors = this.getAllNeighborVertices( v1 );
      var v2Neighbors = this.getAllNeighborVertices( v2 );

      if ( v1Neighbors.length === 1 && !v1.blackBoxInterfaceProperty.get() ) {
        this.rotateSingleVertex( v1, v1Neighbors[ 0 ] );
      }
      else if ( v2Neighbors.length === 1 && !v2.blackBoxInterfaceProperty.get() ) {
        this.rotateSingleVertex( v2, v2Neighbors[ 0 ] );
      }
      else {
        // TODO: rotate the entire group unless they have a fixed connection other than the pivot?
        // Or translate if not part of the same fixed subgroup?
      }
    },

    /**
     * When two Vertices are dropped/bumped too close together, move one away by rotating it.
     * @param {Vertex} vertex - the vertex to rotate
     * @param {Vertex} pivotVertex - the vertex to rotate about
     * @private
     */
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

    /**
     * Rotate the given Vertex about the specified Vertex by the given angle
     * @param {Vertex} vertex - the vertex which will be rotated
     * @param {Vertex} pivotVertex - the origin about which the vertex will rotate
     * @param {number} deltaAngle - angle in radians to rotate
     * @private
     */
    rotateSingleVertexByAngle: function( vertex, pivotVertex, deltaAngle ) {
      var position = vertex.positionProperty.get();
      var pivotPosition = pivotVertex.positionProperty.get();

      var distanceFromVertex = position.distance( pivotPosition );
      var angle = position.minus( pivotPosition ).angle();

      var newPosition = pivotPosition.plus( Vector2.createPolar( distanceFromVertex, angle + deltaAngle ) );
      vertex.unsnappedPositionProperty.set( newPosition );
      vertex.positionProperty.set( newPosition );
    },

    /**
     * Determine the distance to the closest Vertex
     * @param {Vertex} vertex
     * @return {number} - distance to nearest other Vertex in view coordinates
     * @private
     */
    closestDistanceToOtherVertex: function( vertex ) {
      var closestDistance = null;
      for ( var i = 0; i < this.vertices.length; i++ ) {
        var v = this.vertices.get( i );
        if ( v !== vertex ) {
          var distance = v.positionProperty.get().distance( vertex.positionProperty.get() );
          if ( closestDistance === null || distance < closestDistance ) {
            closestDistance = distance;
          }
        }
      }
      return closestDistance;
    },

    /**
     * Remove all elements from the circuit.
     * @public
     */
    clear: function() {

      this.selectedCircuitElementProperty.reset();

      // Vertices must be cleared from the black box screen--it's not handled by clearing the circuit elements
      // TODO: Unify these implementations
      if ( window.phetBlackBoxStudy ) {

        // clear references, do not dispose because some items get added back in the black box.
        this.circuitElements.clear();

        this.vertices.clear();

        // Update the physics
        this.solve();
      }
      else {

        // Dispose of elements
        while ( this.circuitElements.length > 0 ) {
          this.remove( this.circuitElements.get( 0 ) );
        }
        assert && assert( this.vertices.length === 0, 'vertices should have been removed with circuit elements cleared' );
      }
    },

    /**
     * Split the Vertex into two separate vertices.
     * @param {Vertex} vertex - the vertex to be cut.
     * @public
     */
    cutVertex: function( vertex ) {
      var neighborCircuitElements = this.getNeighborCircuitElements( vertex );
      if ( neighborCircuitElements.length === 0 ) {

        // No need to cut a solo vertex
        return;
      }
      for ( var i = 0; i < neighborCircuitElements.length; i++ ) {
        var circuitElement = neighborCircuitElements[ i ];
        if ( circuitElement.interactiveProperty.get() ) {
          var options = {
            draggable: true,
            interactive: true,
            attachable: true,
            blackBoxInterface: false,
            insideTrueBlackBox: false,
            tandem: this.vertexGroupTandem.createNextTandem()
          };
          var newVertex = new Vertex( vertex.positionProperty.get().x, vertex.positionProperty.get().y, options );

          // Add the new vertex to the model first so that it can be updated in subsequent calls
          this.vertices.add( newVertex );

          circuitElement.replaceVertex( vertex, newVertex );

          // Bump the vertices away from each other
          var vertexGroup = this.findAllFixedVertices( newVertex );
          var oppositeVertex = circuitElement.getOppositeVertex( newVertex );
          var translation = oppositeVertex.positionProperty.get().minus( newVertex.positionProperty.get() ).normalized().timesScalar( 30 );
          for ( var j = 0; j < vertexGroup.length; j++ ) {
            var v = vertexGroup[ j ];

            // Only translate vertices that are movable and not connected to the black box interface by fixed length elements
            if ( v.draggableProperty.get() && !this.hasFixedConnectionToBlackBoxInterfaceVertex( v ) ) {
              v.positionProperty.set( v.positionProperty.get().plus( translation ) );
              v.unsnappedPositionProperty.set( v.positionProperty.get() );
            }
          }
        }
      }

      if ( !vertex.blackBoxInterfaceProperty.get() ) {
        this.vertices.remove( vertex );
      }

      // Update the physics
      this.solve();
    },

    /**
     * Returns true if the given vertex has a fixed connection to a black box interface vertex.
     * @param {Vertex} v
     * @return {boolean}
     * @private
     */
    hasFixedConnectionToBlackBoxInterfaceVertex: function( v ) {
      var vertices = this.findAllFixedVertices( v );
      return _.filter( vertices, function( v ) {
          return v.blackBoxInterfaceProperty.get();
        } ).length > 0;
    },

    /**
     * Returns true if the CircuitElement is not connected to any other CircuitElement.
     * @param {CircuitElement} circuitElement
     * @return {boolean}
     * @public
     */
    isSingle: function( circuitElement ) {
      return this.getNeighborCircuitElements( circuitElement.startVertexProperty.get() ).length === 1 &&
             this.getNeighborCircuitElements( circuitElement.endVertexProperty.get() ).length === 1;
    },

    /**
     * When removing a CircuitElement, also remove its start/end Vertex if it can be removed.
     * @param {Vertex} vertex
     * @private
     */
    removeCircuitElementVertex: function( vertex ) {
      if ( this.getNeighborCircuitElements( vertex ).length === 0 && !vertex.blackBoxInterfaceProperty.get() ) {
        this.vertices.remove( vertex );
      }
    },

    /**
     * Remove the given CircuitElement and its Vertex instances from the Circuit
     * @param {CircuitElement} circuitElement
     * @public
     */
    remove: function( circuitElement ) {

      // Remove the circuit element itself
      this.circuitElements.remove( circuitElement );

      // Delete orphaned vertices
      this.removeCircuitElementVertex( circuitElement.startVertexProperty.get() );
      this.removeCircuitElementVertex( circuitElement.endVertexProperty.get() );

      // Clear the selected element property so that the Edit panel for the element will disappear
      if ( this.selectedCircuitElementProperty.get() === circuitElement ) {
        this.selectedCircuitElementProperty.set( null );
      }

      circuitElement.dispose();
    },

    /**
     * Get all of the CircuitElements that contain the given Vertex.
     * @param {Vertex} vertex
     * @returns {CircuitElement[]}
     * @public
     */
    getNeighborCircuitElements: function( vertex ) {
      return this.circuitElements.filter( function( circuitElement ) {
        return circuitElement.containsVertex( vertex );
      } ).getArray();
    },

    /**
     * Gets the number of CircuitElements connected to the specified Vertex
     * @param {Vertex} vertex
     * @return {number}
     * @public
     */
    countCircuitElements: function( vertex ) {
      return this.circuitElements.count( function( circuitElement ) {
        return circuitElement.containsVertex( vertex );
      } );
    },

    /**
     * Determines whether the specified Vertices are connected through any arbitrary connections.
     * @param {Vertex} vertex1
     * @param {Vertex} vertex2
     * @return {boolean}
     * @public
     */
    areVerticesConnected: function( vertex1, vertex2 ) {
      var connectedVertices = this.findAllConnectedVertices( vertex1 );
      return connectedVertices.indexOf( vertex2 ) >= 0;
    },

    /**
     * Solve for the unknown currents and voltages of the circuit using Modified Nodal Analysis.  The solved values
     * are set to the CircuitElements and Vertices.
     * @public
     */
    solve: function() {

      var self = this;

      var toStateObject = function( circuitElement ) {
        return _.extend( {
          node0: self.vertices.indexOf( circuitElement.startVertexProperty.get() ),
          node1: self.vertices.indexOf( circuitElement.endVertexProperty.get() ),
          circuitElement: circuitElement
        }, circuitElement.attributesToStateObject() );
      };

      // the index of vertex corresponds to position in list.
      var batteries = this.circuitElements.filter( function( b ) {return b instanceof Battery;} );
      var resistors = this.circuitElements.filter( function( b ) {return !(b instanceof Battery);} );

      var batteryAdapters = batteries.map( toStateObject ).getArray();
      var resistorAdapters = resistors.map( toStateObject ).getArray();

      var solution = new ModifiedNodalAnalysisCircuit( batteryAdapters, resistorAdapters, [] ).solve();

      // Apply the node voltages to the vertices
      for ( var i = 0; i < this.vertices.length; i++ ) {

        // For unconnected vertices, such as for the black box, they may not have an entry in the matrix, so just mark
        // them as zero.
        var v = typeof solution.nodeVoltages[ i ] === 'number' ? solution.nodeVoltages[ i ] : 0;
        this.vertices.get( i ).voltageProperty.set( v );
      }

      // Apply the currents through the CircuitElements
      for ( i = 0; i < solution.elements.length; i++ ) {
        solution.elements[ i ].circuitElement.currentProperty.set( solution.elements[ i ].currentSolution );
      }

      // For resistors with r>0, Ohm's Law gives the current
      for ( i = 0; i < resistorAdapters.length; i++ ) {
        var resistorAdapter = resistorAdapters[ i ];
        if ( resistorAdapter.resistance !== 0 ) {
          var voltage = solution.nodeVoltages[ resistorAdapter.node1 ] - solution.nodeVoltages[ resistorAdapter.node0 ];
          var current = -voltage / resistorAdapter.resistance;
          resistorAdapter.circuitElement.currentProperty.set( current );
        }
      }

      this.circuitChangedEmitter.emit();
    },

    /**
     * Connect the vertices, merging oldVertex into vertex1 and deleting oldVertex
     * @param {Vertex} targetVertex
     * @param {Vertex} oldVertex
     * @public
     */
    connect: function( targetVertex, oldVertex ) {
      assert && assert( targetVertex.attachableProperty.get() && oldVertex.attachableProperty.get(), 'both vertices should be attachable' );

      // Keep the black box vertices
      if ( oldVertex.blackBoxInterfaceProperty.get() ) {
        assert && assert( !targetVertex.blackBoxInterfaceProperty.get(), 'cannot attach black box interface vertex to black box interface vertex' );
        this.connect( oldVertex, targetVertex );
      }
      else {
        this.circuitElements.forEach( function( circuitElement ) {
          if ( circuitElement.containsVertex( oldVertex ) ) {
            circuitElement.replaceVertex( oldVertex, targetVertex );
            circuitElement.connectedEmitter.emit();
          }
        } );
        this.vertices.remove( oldVertex );
        assert && assert( !oldVertex.positionProperty.hasListeners(), 'Removed vertex should not have any listeners' );

        // Update the physics
        this.solve();

        // Make sure the solder is displayed in the correct z-order
        targetVertex.relayerEmitter.emit();
      }
    },

    /**
     * Move forward in time
     * @param {number} dt - the elapsed time in seconds
     */
    step: function( dt ) {

      // Invoke any scheduled actions
      this.stepActions.forEach( function( stepAction ) {stepAction();} );
      this.stepActions.length = 0;

      // Move the charges
      this.chargeAnimator.step( dt );
    },

    /**
     * When a circuit element is marked as dirty (such as when it changed length or moved), it needs to have
     * the charges repositioned, so they will be equally spaced internally and spaced well compared to neighbor
     * elements.
     * @public
     */
    layoutChargesInDirtyCircuitElements: function() {
      var self = this;
      this.circuitElements.forEach( function( circuitElement ) {
        self.chargeLayout.layoutCharges( circuitElement );
      } );
    },

    /**
     * Determine if one Vertex is adjacent to another Vertex.  The only way for two vertices to be adjacent is for them
     * to be the start/end of a single CircuitElement
     * @param {Vertex} a
     * @param {Vertex} b
     * @return {boolean}
     * @private
     */
    isVertexAdjacent: function( a, b ) {

      // A vertex cannot be adjacent to itself.
      if ( a === b ) {
        return false;
      }

      return this.circuitElements.anyElementMatchesPredicate( function( circuitElement ) {
        return circuitElement.containsBothVertices( a, b );
      } );
    },

    /**
     * Find the neighbor vertices within the given group of circuit elements
     * @param {Vertex} vertex
     * @param {CircuitElement[]} circuitElements - the group of CircuitElements within which to look for neighbors
     * @returns {Vertex[]}
     * @private
     */
    getNeighborVerticesInGroup: function( vertex, circuitElements ) {
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
     * Get an array of all the vertices adjacent to the specified Vertex.
     * @param {Vertex} vertex - the vertex to get neighbors for
     * @return {Vertex[]}
     * @private
     */
    getAllNeighborVertices: function( vertex ) {
      var neighborCircuitElements = this.getNeighborCircuitElements( vertex );
      return this.getNeighborVerticesInGroup( vertex, neighborCircuitElements );
    },

    /**
     * Get a list of all circuit elements that can reach the specified vertex.
     * @param {Vertex} vertex
     * @returns {CircuitElement[]}
     * @private
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
     * Find the subgraph where all vertices are connected by any kind of CircuitElements
     * @param {Vertex} vertex
     * @public
     */
    findAllConnectedVertices: function( vertex ) {
      return this.searchVertices( vertex, this.circuitElements.getArray(), function() {return true;} );
    },

    /**
     * Find the subgraph where all vertices are connected, given the list of traversible circuit elements
     * @param {Vertex} vertex
     * @param {CircuitElement[]} circuitElements
     * @param {Function} okToVisit - rule that determines which vertices are OK to visit
     * @returns {Vertex[]}
     * @private
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
          var neighbors = this.getNeighborVerticesInGroup( currentVertex, circuitElements );

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
     * Get the charges that are in the specified circuit element.
     * @param {CircuitElement} circuitElement
     * @returns {Charge[]}
     * @public
     */
    getChargesInCircuitElement: function( circuitElement ) {
      return this.charges.getArray().filter( function( charge ) { return charge.circuitElement === circuitElement; } );
    },

    /**
     * Find the subgraph where all vertices are connected by FixedLengthCircuitElements, not stretchy wires.
     * @param {Vertex} vertex
     * @param {Function} [okToVisit] - rule that determines which vertices are OK to visit
     * @return {Vertex[]}
     * @public
     */
    findAllFixedVertices: function( vertex, okToVisit ) {
      var fixedCircuitElements = this.circuitElements.filter( function( circuitElement ) {
        return circuitElement instanceof FixedLengthCircuitElement;
      } ).getArray();
      return this.searchVertices( vertex, fixedCircuitElements, okToVisit || function() {return true;} );
    },

    /**
     * A vertex has been dragged, is it a candidate for joining with other vertices?  If so, return the candidate
     * vertex.  Otherwise, return null.
     * @param {Vertex} vertex - the dragged vertex
     * @param {string} mode - the application mode 'test' | 'explore' | undefined
     * @param {Bounds2} blackBoxBounds - the bounds of the black box, if there is one
     * @returns {Vertex} - the vertex it will be able to connect to, if dropped
     * @public
     */
    getDropTarget: function( vertex, mode, blackBoxBounds ) {
      var self = this;

      if ( mode === 'test' ) {
        assert && assert( blackBoxBounds, 'bounds should be provided for build mode' );
      }

      // Rules for a vertex connecting to another vertex.
      // (1) A vertex may not connect to an adjacent vertex.
      var candidateVertices = this.vertices.filter( function( candidateVertex ) {
        return !self.isVertexAdjacent( vertex, candidateVertex );
      } );

      // (2) A vertex cannot connect to itself
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        return candidateVertex !== vertex;
      } );

      // (3) a vertex must be within SNAP_RADIUS (screen coordinates) of the other vertex
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        return vertex.unsnappedPositionProperty.get().distance( candidateVertex.positionProperty.get() ) < SNAP_RADIUS;
      } );

      // (4) a vertex must be attachable. Some black box vertices are not attachable, such as vertices hidden in the box
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        return candidateVertex.attachableProperty.get();
      } );

      // (5) Reject any matches that result in circuit elements sharing a pair of vertices, which would cause
      // the wires to lay across one another (one vertex was already shared)
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {

        // if something else is already snapping to candidateVertex, then we cannot snap to it as well.
        // check the neighbor vertices
        for ( var i = 0; i < self.vertices.length; i++ ) {
          var circuitVertex = self.vertices.get( i );
          var adjacent = self.isVertexAdjacent( circuitVertex, vertex );

          // If the adjacent vertex has the same position as the candidate vertex, that means it is already "snapped"
          // there and hence another vertex should not snap there at the same time.
          if ( adjacent && circuitVertex.positionProperty.get().equals( candidateVertex.positionProperty.get() ) ) {
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
        if ( candidateVertex.blackBoxInterfaceProperty.get() ) {
          return true;
        }
        var neighbors = self.getNeighborCircuitElements( candidateVertex );
        for ( var i = 0; i < neighbors.length; i++ ) {
          var neighbor = neighbors[ i ];
          var oppositeVertex = neighbor.getOppositeVertex( candidateVertex );

          // is another node proposing a match to that node?
          for ( var k = 0; k < self.vertices.length; k++ ) {
            var v = self.vertices.get( k );
            if ( neighbor instanceof Wire && v !== vertex && v !== oppositeVertex && v.positionProperty.get().equals( oppositeVertex.positionProperty.get() ) ) {
              return false;
            }
          }
        }
        return true;
      } );

      // (8) a wire vertex cannot double connect to an object, creating a tiny short circuit
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        var candidateNeighbors = self.getAllNeighborVertices( candidateVertex );
        var myNeighbors = self.getAllNeighborVertices( vertex );
        var intersection = _.intersection( candidateNeighbors, myNeighbors );
        return intersection.length === 0;
      } );

      // (9) When in Black Box "build" mode (i.e. building inside the black box), a vertex user cannot connect to
      // a black box interface vertex if its other vertices would be outside of the black box.  See #136
      if ( mode === 'test' ) {
        var fixedVertices2 = this.findAllFixedVertices( vertex );
        candidateVertices = candidateVertices.filter( function( candidateVertex ) {

          // Don't connect to vertices that might have sneaked outside of the black box, say by a rotation.
          if ( !candidateVertex.blackBoxInterfaceProperty.get() && !blackBoxBounds.containsPoint( candidateVertex.positionProperty.get() ) ) {
            return false;
          }

          // How far the vertex would be moved if it joined to the candidate
          var delta = candidateVertex.positionProperty.get().minus( vertex.positionProperty.get() );

          if ( candidateVertex.blackBoxInterfaceProperty.get() || blackBoxBounds.containsPoint( candidateVertex.positionProperty.get() ) ) {
            for ( var i = 0; i < fixedVertices2.length; i++ ) {
              var connectedVertex = fixedVertices2[ i ];
              if ( connectedVertex.blackBoxInterfaceProperty.get() ) {

                // OK for black box interface vertex to be slightly outside the box
              }
              else if ( connectedVertex !== vertex && !blackBoxBounds.containsPoint( connectedVertex.positionProperty.get().plus( delta ) ) &&

                        // exempt wires connected outside of the black box, which are flagged as un-attachable in
                        // build mode, see #141
                        connectedVertex.attachableProperty.get() ) {
                return false;
              }
            }
          }
          else {
            return true;
          }
          return true;
        } );

        // a vertex must be attachable. Some black box vertices are not attachable, such as vertices hidden in the box
        candidateVertices = candidateVertices.filter( function( candidateVertex ) {
          return !candidateVertex.outerWireStub;
        } );
      }

      if ( candidateVertices.length === 0 ) {
        return null;
      }
      else {

        // Find the closest match
        var sorted = _.sortBy( candidateVertices.getArray(), function( candidateVertex ) {
          return vertex.unsnappedPositionProperty.get().distance( candidateVertex.positionProperty.get() );
        } );
        return sorted[ 0 ];
      }
    },

    /**
     * Reset the Circuit to its initial state.
     * @public
     */
    reset: function() {
      this.clear();
      this.showCurrentProperty.reset();
      this.currentTypeProperty.reset();
    },

    /**
     * Convert the Circuit to a state object which can be serialized or printed.
     * @public
     */
    toStateObject: function() {
      var self = this;
      var getVertexIndex = function( vertex ) {
        var vertexIndex = self.vertices.indexOf( vertex );
        assert && assert( vertexIndex >= 0, 'vertex should have an index' );
        return vertexIndex;
      };

      /**
       * @param {ObservableArray.<CircuitElement>} circuitElements
       * @returns {Array}
       */
      var getArray = function( circuitElements ) {
        return circuitElements.map( function( element ) {
          return _.extend( {
            startVertex: getVertexIndex( element.startVertexProperty.get() ),
            endVertex: getVertexIndex( element.endVertexProperty.get() ),
          }, element.attributesToStateObject() );
        } ).getArray();
      };
      return {

        // TODO: better save state that matches circuit structure
        wires: getArray( this.circuitElements.filter( function( c ) {return c instanceof Wire;} ) ),
        batteries: getArray( this.circuitElements.filter( function( c ) {return c instanceof Battery;} ) ),
        lightBulbs: getArray( this.circuitElements.filter( function( c ) {return c instanceof LightBulb;} ) ),
        resistors: getArray( this.circuitElements.filter( function( c ) {return c instanceof Resistor;} ) ),
        switches: getArray( this.circuitElements.filter( function( c ) {return c instanceof Switch;} ) ),
        vertices: this.vertices.map( function( vertex ) {

          var v = {
            x: vertex.positionProperty.get().x,
            y: vertex.positionProperty.get().y
          };

          // Include any non-default options
          var defaults = Vertex.DEFAULTS;

          // Capture all non-default values for vertex options, if any
          var options = {};
          if ( vertex.attachableProperty.get() !== defaults.attachable ) {
            options.attachable = vertex.attachableProperty.get();
          }
          if ( vertex.draggableProperty.get() !== defaults.draggable ) {
            options.draggable = vertex.draggableProperty.get();
          }
          if ( _.keys( options ).length > 0 ) {
            v.options = options;
          }

          return v;
        } ).getArray()
      };
    },

    /**
     * Load the state of a CircuitStruct into this Circuit
     * @param {CircuitStruct} circuitStruct
     * @public
     */
    loadFromCircuitStruct: function( circuitStruct ) {
      var self = this;
      this.clear();
      circuitStruct.vertices.forEach( this.vertices.add.bind( this.vertices ) );
      var addCircuitElement = function( circuitElement ) {
        self.circuitElements.add( circuitElement );
      };
      circuitStruct.wires.forEach( addCircuitElement );
      circuitStruct.switches.forEach( addCircuitElement );
      circuitStruct.batteries.forEach( addCircuitElement );
      circuitStruct.resistors.forEach( addCircuitElement );
      circuitStruct.lightBulbs.forEach( addCircuitElement );
    }
  } );
} );