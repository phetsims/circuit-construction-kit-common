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
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Emitter = require( 'AXON/Emitter' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Property = require( 'AXON/Property' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var CircuitConstructionKitCommonQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonQueryParameters' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  var ChargeAnimator = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ChargeAnimator' );
  var ChargeLayout = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ChargeLayout' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedLengthCircuitElement' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  var ModifiedNodalAnalysisCircuit = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisCircuit' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  var Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Vertex' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );
  var Vector2 = require( 'DOT/Vector2' );
  var inherit = require( 'PHET_CORE/inherit' );

  // phet-io modules
  var TNumber = require( 'ifphetio!PHET_IO/types/TNumber' );
  var TObject = require( 'ifphetio!PHET_IO/types/TObject' );
  var TString = require( 'ifphetio!PHET_IO/types/TString' );

  // constants
  var CURRENT_TYPES = [ 'electrons', 'conventional' ];
  var SNAP_RADIUS = 30; // For two vertices to join together, they must be this close, in view coordinates
  var BUMP_AWAY_RADIUS = 20; // If two vertices are too close together after one is released, and they could not be
                             // joined then bump them apart so they do not look connected.

  var trueFunction = function() {return true;}; // Lower cased so IDEA doesn't think it is a constructor

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function Circuit( tandem ) {
    var self = this;

    // @public {NumberProperty} - All wires share the same resistivity, which is defined by
    // resistance = resistivity * length. On the Lab Screen, there is a wire resistivity control
    this.wireResistivityProperty = new NumberProperty( CircuitConstructionKitCommonConstants.DEFAULT_RESISTIVITY, {
      tandem: tandem.createTandem( 'wireResistivityProperty' ),
      phetioValueType: TNumber()
    } );

    // @public {NumberProperty} - All batteries share a single internal resistance value, which can be edited with
    // a control on the Lab Screen
    this.batteryResistanceProperty = new NumberProperty( CircuitConstructionKitCommonConstants.DEFAULT_BATTERY_RESISTANCE, {
      tandem: tandem.createTandem( 'batteryResistanceProperty' ),
      phetioValueType: TNumber()
    } );

    // @public {ObservableArray.<CircuitElement>} - The different types of CircuitElement the circuit may
    // contain, including Wire, Battery, Switch, Resistor, LightBulb, etc.
    this.circuitElements = new ObservableArray();

    // @public {ObservableArray.<Vertex>} - Keep track of which terminals are connected to other terminals.
    // The vertices are also referenced in the CircuitElements above--this ObservableArray is a a central point for
    // observing creation/deletion of vertices for showing VertexNodes
    this.vertices = new ObservableArray();

    // @public {ObservableArray.<Charge>} - the charges in the circuit
    this.charges = new ObservableArray();

    // @public {Property.<string>} - whether to show charges or conventional current
    this.currentTypeProperty = new Property( CircuitConstructionKitCommonQueryParameters.currentType, {
      validValues: CURRENT_TYPES,
      tandem: tandem.createTandem( 'currentTypeProperty' ),
      phetioValueType: TString
    } );

    // When the current type changes, mark everything as dirty and relayout charges
    this.currentTypeProperty.lazyLink( function() {
      self.relayoutAllCharges();
    } );

    // @public {BooleanProperty} - whether the current should be displayed
    this.showCurrentProperty = new BooleanProperty( CircuitConstructionKitCommonQueryParameters.showCurrent, {
      tandem: tandem.createTandem( 'showCurrentProperty' )
    } );

    // @private {ChargeLayout} - create the charges in new circuits
    this.chargeLayout = new ChargeLayout( this );

    // @private {ChargeAnimator} - move the charges with speed proportional to current
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

      // Delete orphaned vertices
      self.removeCircuitElementVertex( circuitElement.startVertexProperty.get() );
      self.removeCircuitElementVertex( circuitElement.endVertexProperty.get() );

      // Clear the selected element property so that the Edit panel for the element will disappear
      if ( self.selectedCircuitElementProperty.get() === circuitElement ) {
        self.selectedCircuitElementProperty.set( null );
      }

      circuitElement.getCircuitProperties().forEach( function( property ) {
        property.unlink( solve );
      } );

      circuitElement.dispose();
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

      // Only update when wires change since they are the only components that change their length
      if ( circuitElement instanceof Wire ) {
        circuitElement.lengthProperty.link( updateCharges );
        circuitElement.disposeEmitter.addListener( function() {
          circuitElement.lengthProperty.unlink( updateCharges );
        } );
      }

      circuitElement.moveToFrontEmitter.addListener( updateCharges );
      self.solve();
    } );
    this.circuitElements.addItemRemovedListener( function( circuitElement ) {
      self.charges.removeAll( self.getChargesInCircuitElement( circuitElement ) );

      // Explicit call to solve since it is possible to remove a CircuitElement without removing any vertices.
      self.solve();
    } );

    // When a Charge is removed from the list, dispose it
    this.charges.addItemRemovedListener( function( charge ) {
      charge.dispose();
    } );

    // @public (read-only) {Emitter} After the circuit physics is recomputed in solve(), some listeners need to update
    // themselves, such as the voltmeter and ammeter
    this.circuitChangedEmitter = new Emitter();

    // @public (read-only) {Emitter} - Some actions only take place after an item has been dropped
    this.vertexDroppedEmitter = new Emitter();

    // @public (read-only) {Emitter} - signifies that a component has been modified (for example, with the
    // CircuitElementEditPanel)
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

      // if one vertex becomes selected, deselect the other vertices and circuit elements
      var vertexSelectedPropertyListener = function( selected ) {
        if ( selected ) {
          self.vertices.forEach( function( v ) {
            if ( v !== vertex ) {
              v.selectedProperty.set( false );
            }
          } );
          self.selectedCircuitElementProperty.set( null );
        }
      };
      vertex.vertexSelectedPropertyListener = vertexSelectedPropertyListener;
      vertex.selectedProperty.link( vertexSelectedPropertyListener );
    } );

    // Stop watching the vertex positions for updating the voltmeter and ammeter
    self.vertices.addItemRemovedListener( function( vertex ) {
      assert && assert( vertex.positionProperty.hasListener( emitCircuitChanged ), 'should have had the listener' );
      vertex.positionProperty.unlink( emitCircuitChanged );
      assert && assert( !vertex.positionProperty.hasListener( emitCircuitChanged ), 'Listener should be removed' );
      vertex.selectedProperty.unlink( vertex.vertexSelectedPropertyListener );
      vertex.vertexSelectedPropertyListener = null;
    } );

    // @public {Property.<CircuitElement>} - Keep track of the last circuit element the user manipulated, for showing
    // additional controls. Once this simulation is instrumented for a11y, the focus property can be used to track this.
    // Note that vertex selection is done via Vertex.selectedProperty.  These strategies can be unified when we
    // work on a11y
    this.selectedCircuitElementProperty = new Property( null, {
      tandem: tandem.createTandem( 'selectedCircuitElementProperty' ),
      phetioValueType: TObject
    } );

    this.selectedCircuitElementProperty.link( function( selectedCircuitElement ) {

      // When a circuit element is selected, deselect all the vertices
      if ( selectedCircuitElement ) {
        self.vertices.forEach( function( vertex ) {vertex.selectedProperty.set( false );} );
      }
    } );

    // @private {Function[]} - Actions that will be invoked during the step function
    this.stepActions = [];

    // When any vertex is dropped, check it and its neighbors for overlap.  If any overlap, move them apart.
    this.vertexDroppedEmitter.addListener( function( vertex ) {
      self.stepActions.push( function() {

        // Collect nearest vertices 
        var neighbors = self.getNeighboringVertices( vertex );

        // Also consider the vertex being dropped for comparison with neighbors
        neighbors.push( vertex );
        var pairs = [];
        neighbors.forEach( function( neighbor ) {
          self.vertices.forEach( function( vertex ) {

            // Make sure nodes are different
            if ( neighbor !== vertex ) {

              // Add to the list to be checked
              pairs.push( { v1: neighbor, v2: vertex } );
            }
          } );
        } );
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

    this.batteryResistanceProperty.link( solve );

    // @public (read-only) - for creating tandems
    this.vertexGroupTandem = tandem.createGroupTandem( 'vertices' );
    this.wireGroupTandem = tandem.createGroupTandem( 'wires' );
    this.resistorGroupTandem = tandem.createGroupTandem( 'resistors' );
    this.seriesAmmeterGroupTandem = tandem.createGroupTandem( 'seriesAmmeters' );
    this.switchGroupTandem = tandem.createGroupTandem( 'switches' );
    this.coinGroupTandem = tandem.createGroupTandem( 'coins' );
    this.eraserGroupTandem = tandem.createGroupTandem( 'erasers' );
    this.pencilGroupTandem = tandem.createGroupTandem( 'pencils' );
    this.handGroupTandem = tandem.createGroupTandem( 'hands' );
    this.dogGroupTandem = tandem.createGroupTandem( 'dogs' );
    this.dollarBillGroupTandem = tandem.createGroupTandem( 'dollarBills' );
    this.paperClipGroupTandem = tandem.createGroupTandem( 'paperClips' );
    this.rightBatteryTandemGroup = tandem.createGroupTandem( 'rightBatteries' );
    this.lightBulbGroupTandem = tandem.createGroupTandem( 'lightBulbs' );
  }

  circuitConstructionKitCommon.register( 'Circuit', Circuit );

  return inherit( Object, Circuit, {

    /**
     * When over Vertex is released or bumped over another Vertex, rotate one away so it doesn't appear connected.
     * @param {Vertex} v1
     * @param {Vertex} v2
     * @private
     */
    moveVerticesApart: function( v1, v2 ) {
      var v1Neighbors = this.getNeighboringVertices( v1 );
      var v2Neighbors = this.getNeighboringVertices( v2 );

      if ( v1Neighbors.length === 1 && !v1.blackBoxInterfaceProperty.get() ) {
        this.bumpAwaySingleVertex( v1, v1Neighbors[ 0 ] );
      }
      else if ( v2Neighbors.length === 1 && !v2.blackBoxInterfaceProperty.get() ) {
        this.bumpAwaySingleVertex( v2, v2Neighbors[ 0 ] );
      }
    },

    /**
     * Update the position of all charges.
     * @public
     */
    relayoutAllCharges: function() {
      this.circuitElements.getArray().forEach( function( circuitElement ) {
        circuitElement.chargeLayoutDirty = true;
      } );
      this.layoutChargesInDirtyCircuitElements();
    },

    /**
     * When two Vertices are dropped/bumped too close together, move away the pre-existing one by rotating or
     * translating it.
     *
     * @param {Vertex} vertex - the vertex to rotate
     * @param {Vertex} pivotVertex - the vertex to rotate about
     * @private
     */
    bumpAwaySingleVertex: function( vertex, pivotVertex ) {
      var distance = vertex.positionProperty.value.distance( pivotVertex.positionProperty.value );

      // If the vertices are too close, they must be translated way
      if ( distance < BUMP_AWAY_RADIUS ) {

        var difference = pivotVertex.positionProperty.value.minus( vertex.positionProperty.value );

        // Support when vertex is on the pivot, mainly for fuzz testing.  In that case, just move directly to the right
        if ( difference.magnitude() === 0 ) {
          difference = new Vector2( 1, 0 );
        }

        var delta = difference.normalized().times( -SNAP_RADIUS * 1.5 );
        this.translateVertexGroup( vertex, delta );
      }
      else {

        // Other vertices should be rotated away, which handles non-stretchy components well. For small components like
        // batteries (which are around 100 view units long), rotate Math.PI/4. Longer components don't need to rotate
        // by such a large angle because the arc length will be proportionately longer,
        // see https://github.com/phetsims/circuit-construction-kit-common/issues/344
        var searchAngle = Math.PI / 4 * 100 / distance;
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
     * @returns {number} - distance to nearest other Vertex in view coordinates
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
          this.circuitElements.remove( this.circuitElements.get( 0 ) );
        }
        assert && assert( this.vertices.length === 0, 'vertices should have been removed' );
      }
    },

    /**
     * Split the Vertex into separate vertices.
     * @param {Vertex} vertex - the vertex to be cut.
     * @public
     */
    cutVertex: function( vertex ) {
      var self = this;
      var neighborCircuitElements = this.getNeighborCircuitElements( vertex );
      if ( neighborCircuitElements.length <= 1 ) {

        // No need to cut a solo vertex
        return;
      }

      // Only move interactive circuit elements
      neighborCircuitElements = neighborCircuitElements.filter( function( circuitElement ) {
        return circuitElement.interactiveProperty.get();
      } );

      var getTranslations = function() {
        var translations = [];
        for ( var i = 0; i < neighborCircuitElements.length; i++ ) {
          var circuitElement = neighborCircuitElements[ i ];
          var oppositeVertex = circuitElement.getOppositeVertex( vertex );
          var translation = oppositeVertex.positionProperty.get().minus( vertex.positionProperty.get() )
            .normalized()
            .timesScalar( 30 );
          translations.push( translation );
        }
        return translations;
      };

      // Track where they would go if they moved toward their opposite vertices
      var translations = getTranslations();
      var angles = translations.map( function( t ) {return t.angle();} );

      if ( neighborCircuitElements.length > 2 ) {

        // Reorder elements based on angle so they don't cross over when spread out
        neighborCircuitElements = _.sortBy( neighborCircuitElements, function( n ) {
          var index = neighborCircuitElements.indexOf( n );
          return angles[ index ];
        } );

        // Get the angles in the corrected order
        translations = getTranslations();
        angles = translations.map( function( t ) {return t.angle();} );
      }

      var separation = Math.PI * 2 / neighborCircuitElements.length;
      var results = [];

      var center = angles.reduce( function( a, b ) {return a + b;}, 0 ) / angles.length;

      // Move vertices away from cut vertex so that wires don't overlap
      if ( neighborCircuitElements.length === 2 ) {

        var ax = Vector2.createPolar( 30, center - separation / neighborCircuitElements.length );
        var bx = Vector2.createPolar( 30, center + separation / neighborCircuitElements.length );

        var da = angles[ 0 ] - center;

        results = da < 0 ? [ ax, bx ] : [ bx, ax ];
      }
      else {

        var distance = neighborCircuitElements.length <= 5 ? 30 : neighborCircuitElements.length * 30 / 5;
        neighborCircuitElements.forEach( function( circuitElement, k ) {
          results.push( Vector2.createPolar( distance, separation * k + angles[ 0 ] ) );
        } );
      }

      neighborCircuitElements.forEach( function( circuitElement, i ) {

        var newVertex = new Vertex( vertex.positionProperty.get().x, vertex.positionProperty.get().y, {
          tandem: self.vertexGroupTandem.createNextTandem()
        } );

        // Add the new vertex to the model first so that it can be updated in subsequent calls
        self.vertices.add( newVertex );

        circuitElement.replaceVertex( vertex, newVertex );

        // Bump the vertices away from the original vertex
        self.translateVertexGroup( newVertex, results[ i ] );
      } );

      if ( !vertex.blackBoxInterfaceProperty.get() ) {
        this.vertices.remove( vertex );
      }

      // Update the physics
      this.solve();
    },

    /**
     * Translate all vertices connected to the mainVertex by FixedLengthCircuitElements by the given distance
     *
     * Note: do not confuse this with CircuitLayerNode.translateVertexGroup which proposes connections while dragging
     *
     * @param {Vertex} mainVertex - the vertex whose group will be translated
     * @param {Vector2} delta - the vector by which to move the vertex group
     * @private
     */
    translateVertexGroup: function( mainVertex, delta ) {
      var vertexGroup = this.findAllFixedVertices( mainVertex );

      for ( var j = 0; j < vertexGroup.length; j++ ) {
        var vertex = vertexGroup[ j ];

        // Only translate vertices that are movable and not connected to the black box interface by FixedLength elements
        if ( vertex.draggableProperty.get() && !this.hasFixedConnectionToBlackBoxInterfaceVertex( vertex ) ) {
          vertex.setPosition( vertex.positionProperty.value.plus( delta ) );
        }
      }
    },

    /**
     * Returns true if the given vertex has a fixed connection to a black box interface vertex.
     * @param {Vertex} v
     * @returns {boolean}
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
     * @returns {boolean}
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
     * Get all of the CircuitElements that contain the given Vertex.
     * @param {Vertex} vertex
     * @returns {CircuitElement[]}
     * @public
     */
    getNeighborCircuitElements: function( vertex ) {
      return this.circuitElements.getArray().filter( function( circuitElement ) {
        return circuitElement.containsVertex( vertex );
      } );
    },

    /**
     * Gets the number of CircuitElements connected to the specified Vertex
     * @param {Vertex} vertex
     * @returns {number}
     * @public
     */
    countCircuitElements: function( vertex ) {
      return this.circuitElements.count( function( circuitElement ) {
        return circuitElement.containsVertex( vertex );
      } );
    },

    /**
     * Determines whether the specified Vertices are electrically connected through any arbitrary connections.  An
     * open switch breaks the connection.
     * @param {Vertex} vertex1
     * @param {Vertex} vertex2
     * @returns {boolean}
     * @public
     */
    areVerticesElectricallyConnected: function( vertex1, vertex2 ) {
      var connectedVertices = this.searchVertices( vertex1, function( startVertex, circuitElement ) {

          // If the circuit element has a closed property (like a Switch), it is only OK to traverse if the element is
          // closed.
          if ( circuitElement.closedProperty ) {
            return circuitElement.closedProperty.get();
          }
          else {

            // Everything else is traversible
            return true;
          }
        }
      );
      return connectedVertices.indexOf( vertex2 ) >= 0;
    },

    /**
     * Solve for the unknown currents and voltages of the circuit using Modified Nodal Analysis.  The solved values
     * are set to the CircuitElements and Vertices.
     * @public
     */
    solve: function() {

      // Must run the solver even if there is only 1 battery, because it solves for the voltage difference between
      // the vertices
      var self = this;

      var toStateObject = function( circuitElement ) {

        // the index of vertex corresponds to position in list.
        return _.extend( {
          node0: self.vertices.indexOf( circuitElement.startVertexProperty.get() ),
          node1: self.vertices.indexOf( circuitElement.endVertexProperty.get() ),
          circuitElement: circuitElement
        }, circuitElement.attributesToStateObject() );
      };

      var batteries = this.circuitElements.getArray().filter( function( b ) {return b instanceof Battery;} );
      var resistors = this.circuitElements.getArray().filter( function( b ) {return !(b instanceof Battery);} );

      // introduce a synthetic vertex for each battery to model internal resistance
      var resistorAdapters = resistors.map( toStateObject );
      var batteryAdapters = [];

      var nextSyntheticVertexIndex = self.vertices.length;
      for ( var k = 0; k < batteries.length; k++ ) {
        var battery = batteries[ k ];

        // add a voltage source from startVertex to syntheticVertex
        batteryAdapters.push( {
          node0: self.vertices.indexOf( battery.startVertexProperty.value ),
          node1: nextSyntheticVertexIndex,
          voltage: battery.voltageProperty.value,
          circuitElement: battery
        } );

        // add a resistor from syntheticVertex to endVertex
        resistorAdapters.push( {
          node0: nextSyntheticVertexIndex,
          node1: self.vertices.indexOf( battery.endVertexProperty.value ),
          resistance: battery.internalResistanceProperty.value,
          circuitElement: battery
        } );

        // Prepare for next battery, if any
        nextSyntheticVertexIndex++;
      }

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
      assert && assert( targetVertex.attachableProperty.get() && oldVertex.attachableProperty.get(),
        'both vertices should be attachable' );

      // Keep the black box vertices
      if ( oldVertex.blackBoxInterfaceProperty.get() ) {
        assert && assert( !targetVertex.blackBoxInterfaceProperty.get(), 'cannot attach black box interface vertex ' +
                                                                         'to black box interface vertex' );
        this.connect( oldVertex, targetVertex );
      }
      else {
        this.circuitElements.getArray().forEach( function( circuitElement ) {
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
     * @public
     */
    step: function( dt ) {

      // Invoke any scheduled actions
      this.stepActions.forEach( function( stepAction ) {stepAction();} );
      this.stepActions.length = 0;

      // Move the charges
      this.chargeAnimator.step( dt );

      this.circuitElements.getArray().forEach( function( circuitElement ) {
        circuitElement.step && circuitElement.step();
      } );
    },

    /**
     * When a circuit element is marked as dirty (such as when it changed length or moved), it needs to have
     * the charges repositioned, so they will be equally spaced internally and spaced well compared to neighbor
     * elements.
     * @public
     */
    layoutChargesInDirtyCircuitElements: function() {
      var self = this;
      this.circuitElements.getArray().forEach( function( circuitElement ) {
        self.chargeLayout.layoutCharges( circuitElement );
      } );
    },

    /**
     * Determine if one Vertex is adjacent to another Vertex.  The only way for two vertices to be adjacent is for them
     * to be the start/end of a single CircuitElement
     * @param {Vertex} a
     * @param {Vertex} b
     * @returns {boolean}
     * @private
     */
    isVertexAdjacent: function( a, b ) {

      // A vertex cannot be adjacent to itself.
      if ( a === b ) {
        return false;
      }

      return !!this.circuitElements.find( function( circuitElement ) {
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
     * @returns {Vertex[]}
     * @private
     */
    getNeighboringVertices: function( vertex ) {
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
      return this.searchVertices( vertex, trueFunction );
    },

    /**
     * Find the subgraph where all vertices are connected, given the list of traversible circuit elements
     * @param {Vertex} vertex
     * @param {function} okToVisit - (startVertex:Vertex,circuitElement:CircuitElement,endVertex:Vertex)=>boolean, rule
     *                             - that determines which vertices are OK to visit
     * @returns {Vertex[]}
     * @private
     */
    searchVertices: function( vertex, okToVisit ) {
      assert && assert( this.vertices.indexOf( vertex ) >= 0, 'Vertex wasn\'t in the model' );

      var fixedVertices = [];
      var toVisit = [ vertex ];
      var visited = [];
      while ( toVisit.length > 0 ) {

        // Find the neighbors joined by a FixedLengthCircuitElement, not a stretchy Wire
        var currentVertex = toVisit.pop();

        // If we haven't visited it before, then explore it
        if ( visited.indexOf( currentVertex ) < 0 ) {

          var neighborCircuitElements = this.getNeighborCircuitElements( currentVertex );

          for ( var i = 0; i < neighborCircuitElements.length; i++ ) {
            var neighborCircuitElement = neighborCircuitElements[ i ];
            var neighborVertex = neighborCircuitElement.getOppositeVertex( currentVertex );

            // If the node was already visited, don't visit again
            if ( visited.indexOf( neighborVertex ) < 0 &&
                 toVisit.indexOf( neighborVertex ) < 0 &&

                 okToVisit( currentVertex, neighborCircuitElement, neighborVertex ) ) {
              toVisit.push( neighborVertex );
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
     * @param {function} [okToVisit] - (startVertex:Vertex,circuitElement:CircuitElement,endVertex:Vertex)=>boolean,
     *                               - rule that determines which vertices are OK to visit
     * @returns {Vertex[]}
     * @public
     */
    findAllFixedVertices: function( vertex, okToVisit ) {
      return this.searchVertices( vertex, function( startVertex, circuitElement, endVertex ) {
        if ( okToVisit ) {
          return circuitElement instanceof FixedLengthCircuitElement && okToVisit( startVertex, circuitElement, endVertex );
        }
        else {
          return circuitElement instanceof FixedLengthCircuitElement;
        }
      } );
    },

    /**
     * Returns the selected Vertex or null if none is selected
     * @returns {Vertex|null}
     */
    getSelectedVertex: function() {
      var selectedVertex = _.find( this.vertices.getArray(), function( vertex ) {
        return vertex.selectedProperty.get();
      } );
      return selectedVertex || null;
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
      var candidateVertices = this.vertices.getArray().filter( function( candidateVertex ) {
        return !self.isVertexAdjacent( vertex, candidateVertex );
      } );
      if ( candidateVertices.length === 0 ) {return null;}  // Avoid additional work if possible to improve performance

      // (2) A vertex cannot connect to itself
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        return candidateVertex !== vertex;
      } );
      if ( candidateVertices.length === 0 ) {return null;}

      // (3) a vertex must be within SNAP_RADIUS (screen coordinates) of the other vertex
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        return vertex.unsnappedPositionProperty.get().distance( candidateVertex.positionProperty.get() ) < SNAP_RADIUS;
      } );
      if ( candidateVertices.length === 0 ) {return null;}

      // (4) a vertex must be attachable. Some black box vertices are not attachable, such as vertices hidden in the box
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        return candidateVertex.attachableProperty.get();
      } );
      if ( candidateVertices.length === 0 ) {return null;}

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
      if ( candidateVertices.length === 0 ) {return null;}

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
      if ( candidateVertices.length === 0 ) {return null;}

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
            if ( neighbor instanceof Wire &&
                 v !== vertex &&
                 v !== oppositeVertex && v.positionProperty.get().equals( oppositeVertex.positionProperty.get() ) ) {
              return false;
            }
          }
        }
        return true;
      } );
      if ( candidateVertices.length === 0 ) {return null;}

      // (8) a wire vertex cannot double connect to an object, creating a tiny short circuit
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        var candidateNeighbors = self.getNeighboringVertices( candidateVertex );
        var myNeighbors = self.getNeighboringVertices( vertex );
        var intersection = _.intersection( candidateNeighbors, myNeighbors );
        return intersection.length === 0;
      } );

      // (9) When in Black Box "build" mode (i.e. building inside the black box), a vertex user cannot connect to
      // a black box interface vertex if its other vertices would be outside of the black box.  See #136
      if ( mode === 'test' ) {
        var fixedVertices2 = this.findAllFixedVertices( vertex );
        candidateVertices = candidateVertices.filter( function( candidateVertex ) {

          // Don't connect to vertices that might have sneaked outside of the black box, say by a rotation.
          if ( !candidateVertex.blackBoxInterfaceProperty.get() &&
               !blackBoxBounds.containsPoint( candidateVertex.positionProperty.get() ) ) {
            return false;
          }

          // How far the vertex would be moved if it joined to the candidate
          var delta = candidateVertex.positionProperty.get().minus( vertex.positionProperty.get() );

          if ( candidateVertex.blackBoxInterfaceProperty.get() ||
               blackBoxBounds.containsPoint( candidateVertex.positionProperty.get() ) ) {
            for ( var i = 0; i < fixedVertices2.length; i++ ) {
              var connectedVertex = fixedVertices2[ i ];
              if ( connectedVertex.blackBoxInterfaceProperty.get() ) {

                // OK for black box interface vertex to be slightly outside the box
              }
              else if ( connectedVertex !== vertex &&
                        !blackBoxBounds.containsPoint( connectedVertex.positionProperty.get().plus( delta ) ) &&

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
      if ( candidateVertices.length === 0 ) {return null;}

      // Find the closest match
      var sorted = _.sortBy( candidateVertices, function( candidateVertex ) {
        return vertex.unsnappedPositionProperty.get().distance( candidateVertex.positionProperty.get() );
      } );
      return sorted[ 0 ];
    },

    /**
     * Flip the given CircuitElement
     * @param {CircuitElement} circuitElement - the circuit element to flip
     */
    flip: function( circuitElement ) {
      var startVertex = circuitElement.startVertexProperty.value;
      var endVertex = circuitElement.endVertexProperty.value;
      circuitElement.startVertexProperty.value = endVertex;
      circuitElement.endVertexProperty.value = startVertex;

      // Layout the charges in the circuitElement but nowhere else, since that creates a discontinuity in the motion
      circuitElement.chargeLayoutDirty = true;
      this.layoutChargesInDirtyCircuitElements();
      this.solve();
    },

    /**
     * Reset the Circuit to its initial state.
     * @public
     */
    reset: function() {
      this.clear();
      this.showCurrentProperty.reset();
      this.currentTypeProperty.reset();
      this.wireResistivityProperty.reset();
      this.batteryResistanceProperty.reset();
      this.chargeAnimator.reset();
    },

    /**
     * Convert the Circuit to a state object which can be serialized or printed.
     * @public
     */
    toStateObject: function() {
      console.log( 'This should only be running in phet-io mode' );
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
        return circuitElements.getArray().map( function( element ) {
          return _.extend( {
            startVertex: getVertexIndex( element.startVertexProperty.get() ),
            endVertex: getVertexIndex( element.endVertexProperty.get() )
          }, element.attributesToStateObject() );
        } );
      };
      return {

        // TODO (phet-io): better save state that matches circuit structure
        // Return an array of CircuitElement that indicate their type
        wires: getArray( this.circuitElements.filter( function( c ) {return c instanceof Wire;} ) ),
        batteries: getArray( this.circuitElements.filter( function( c ) {return c instanceof Battery;} ) ),
        lightBulbs: getArray( this.circuitElements.filter( function( c ) {return c instanceof LightBulb;} ) ),
        resistors: getArray( this.circuitElements.filter( function( c ) {return c instanceof Resistor;} ) ),
        switches: getArray( this.circuitElements.filter( function( c ) {return c instanceof Switch;} ) ),
        vertices: this.vertices.getArray().map( function( vertex ) {
          return {
            x: vertex.positionProperty.get().x,
            y: vertex.positionProperty.get().y,
            options: {
              attachable: vertex.attachableProperty.get(),
              draggable: vertex.draggableProperty.get()
            }
          };
        } )
      };
    }
  } );
} );
