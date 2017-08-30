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
  var CurrentType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CurrentType' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedLengthCircuitElement' );
  var InteractionMode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/InteractionMode' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  var ModifiedNodalAnalysisCircuit = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisCircuit' );
  var ModifiedNodalAnalysisCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisCircuitElement' );
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
  var SNAP_RADIUS = 30; // For two vertices to join together, they must be this close, in view coordinates
  var BUMP_AWAY_RADIUS = 20; // If two vertices are too close together after one is released, and they could not be
                             // joined then bump them apart so they do not look connected.

  var trueFunction = _.constant( true ); // Lower cased so IDEA doesn't think it is a constructor

  /**
   * Given a CircuitElement, call its update function (if it has one).
   * @param {CircuitElement} circuitElement
   */
  var UPDATE_IF_PRESENT = function( circuitElement ) {
    circuitElement.update && circuitElement.update();
  };

  /**
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function Circuit( tandem, options ) {
    var self = this;

    options = _.extend( { blackBoxStudy: false }, options );
    this.blackBoxStudy = options.blackBoxStudy;

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

    // @public {Property.<CurrentType>} - whether to show charges or conventional current
    this.currentTypeProperty = new Property( CircuitConstructionKitCommonQueryParameters.currentType, {
      validValues: CurrentType.VALUES,
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

    // @public {ChargeAnimator} - move the charges with speed proportional to current
    this.chargeAnimator = new ChargeAnimator( this );

    // Re-solve the circuit when voltages or resistances change.
    var solveListener = this.solve.bind( this );

    // Solve the circuit when any of the circuit element attributes change.
    this.circuitElements.addItemAddedListener( function( circuitElement ) {
      circuitElement.getCircuitProperties().forEach( function( property ) {
        property.lazyLink( solveListener );
      } );

      // When a new circuit element is added to a circuit, it has two unconnected vertices

      // Vertices may already exist for a Circuit when loading
      self.addVertexIfNew( circuitElement.startVertexProperty.get() );
      self.addVertexIfNew( circuitElement.endVertexProperty.get() );

      // When any vertex moves, relayout all charges within the fixed-length connected component, see #100
      circuitElement.chargeLayoutDirty = true;

      var updateCharges = function() {
        self.markAllConnectedCircuitElementsDirty( circuitElement.startVertexProperty.get() );
      };

      // For circuit elements that can change their length, make sure to update charges when the length changes.
      if ( circuitElement.lengthProperty ) {
        circuitElement.lengthProperty.link( updateCharges );
        circuitElement.disposeEmitter.addListener( function() {
          circuitElement.lengthProperty.unlink( updateCharges );
        } );
      }

      self.solve();
    } );
    this.circuitElements.addItemRemovedListener( function( circuitElement ) {

      // Delete orphaned vertices
      self.removeVertexIfOrphaned( circuitElement.startVertexProperty.get() );
      self.removeVertexIfOrphaned( circuitElement.endVertexProperty.get() );

      // Clear the selected element property so that the Edit panel for the element will disappear
      if ( self.selectedCircuitElementProperty.get() === circuitElement ) {
        self.selectedCircuitElementProperty.set( null );
      }

      circuitElement.getCircuitProperties().forEach( function( property ) {
        property.unlink( solveListener );
      } );

      circuitElement.dispose();

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

      // Sanity checks for the listeners
      assert && assert( vertex.positionProperty.hasListener( emitCircuitChanged ), 'should have had the listener' );
      vertex.positionProperty.unlink( emitCircuitChanged );

      // More sanity checks for the listeners
      assert && assert( !vertex.positionProperty.hasListener( emitCircuitChanged ), 'Listener should be removed' );

      vertex.selectedProperty.unlink( vertex.vertexSelectedPropertyListener );
      vertex.vertexSelectedPropertyListener = null;
    } );

    // @public {Property.<CircuitElement|null>} - When the user taps on a CircuitElement, it becomes selected and
    // highlighted, and shows additional controls at the bottom of the screen. When the sim launches or when the user
    // taps away from a selected circuit element, the selection is `null`.  Once this simulation is instrumented
    // for a11y, the focus property can be used to track this. Note that vertex selection is done via
    // Vertex.selectedProperty.  These strategies can be unified when we work on a11y.
    this.selectedCircuitElementProperty = new Property( null, {
      tandem: tandem.createTandem( 'selectedCircuitElementProperty' ),
      phetioValueType: TObject
    } );

    this.selectedCircuitElementProperty.link( function( selectedCircuitElement ) {

      // When a circuit element is selected, deselect all the vertices
      if ( selectedCircuitElement ) {
        self.vertices.forEach( function( vertex ) { vertex.selectedProperty.set( false ); } );
      }
    } );

    // @private {function[]} - Actions that will be invoked during the step function
    this.stepActions = [];

    // When any vertex is dropped, check it and its neighbors for overlap.  If any overlap, move them apart.
    this.vertexDroppedEmitter.addListener( function( vertex ) {
      self.stepActions.push( function() {

        // Collect adjacent vertices
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

    this.batteryResistanceProperty.link( solveListener );

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

      // When vertex v1 is too close (but not connected) to v2, we choose vertex v3 as a reference point for moving
      // vertex v1 (or vice versa).
      if ( v1Neighbors.length === 1 && !v1.blackBoxInterfaceProperty.get() ) {
        this.bumpAwaySingleVertex( v1, v1Neighbors[ 0 ] ); // Arbitrarily choose 0th neighbor to move away from
      }
      else if ( v2Neighbors.length === 1 && !v2.blackBoxInterfaceProperty.get() ) {
        this.bumpAwaySingleVertex( v2, v2Neighbors[ 0 ] ); // Arbitrarily choose 0th neighbor to move away from
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

      // If the vertices are too close, they must be translated away
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

        //REVIEW: How is this branch ever triggered? Only source is from moveVerticesApart, which is only called
        //REVIEW: if ( minDistance < BUMP_AWAY_RADIUS ), which SEEMS for most cases (given moveVerticesApart logic)
        //REVIEW: to exclude this from being run. Not sure I understand why, as it IS being called.
        //REVIEW^(samreid): When vertex v1 is too close (but not connected) to v2, we choose vertex v3 as a reference
        //REVIEW^(samreid): point for moving vertex v1.  v3 may be closer or further to v1 than v2 was.
        //REVIEW^(samreid): I tried to refine the comments above, let me know if I can add anything else to help.

        // Other vertices should be rotated away, which handles non-stretchy components well. For small components like
        // batteries (which are around 100 view units long), rotate Math.PI/4. Longer components don't need to rotate
        // by such a large angle because the arc length will be proportionately longer,
        // see https://github.com/phetsims/circuit-construction-kit-common/issues/344
        var searchAngle = Math.PI / 4 * 100 / distance;
        this.rotateSingleVertexByAngle( vertex, pivotVertex, searchAngle );
        var distance1 = this.closestDistanceToOtherVertex( vertex );
        this.rotateSingleVertexByAngle( vertex, pivotVertex, -2 * searchAngle );
        var distance2 = this.closestDistanceToOtherVertex( vertex );
        if ( distance2 <= distance1 ) {

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
      if ( this.blackBoxStudy ) {

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

      /**
       * Function that identifies where vertices would go if pulled toward their neighbors
       * @returns {Array}
       */
      var getTranslations = function() {
        return neighborCircuitElements.map( function( circuitElement ) {
          return circuitElement.getOppositeVertex( vertex ).positionProperty.get()
            .minus( vertex.positionProperty.get() )
            .withMagnitude( 30 );
        } );
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
        angles = translations.map( function( t ) { return t.angle(); } );
      }

      var separation = Math.PI * 2 / neighborCircuitElements.length;
      var results = [];

      //REVIEW: _.sum( angles ) / angles.length
      var center = angles.reduce( function( a, b ) { return a + b; }, 0 ) / angles.length;

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

        var newVertex = new Vertex( vertex.positionProperty.get(), {
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
     * @param {Vertex} vertex
     * @returns {boolean}
     * @private
     */
    hasFixedConnectionToBlackBoxInterfaceVertex: function( vertex ) {
      var fixedVertices = this.findAllFixedVertices( vertex );
      return _.some( fixedVertices, function( fixedVertex ) {
        return fixedVertex.blackBoxInterfaceProperty.get();
      } );
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
    removeVertexIfOrphaned: function( vertex ) {
      if ( this.getNeighborCircuitElements( vertex ).length === 0 && !vertex.blackBoxInterfaceProperty.get() ) {
        this.vertices.remove( vertex );
      }
    },

    /**
     * Add the given vertex if it doesn't already belong to the circuit.
     * @param {Vertex} vertex
     * @private
     */
    addVertexIfNew: function( vertex ) {
      if ( !this.vertices.contains( vertex ) ) {
        this.vertices.add( vertex );
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

      var batteries = this.circuitElements.getArray().filter( function( b ) { return b instanceof Battery; } );
      var resistors = this.circuitElements.getArray().filter( function( b ) { return !( b instanceof Battery ); } );

      // introduce a synthetic vertex for each battery to model internal resistance
      var resistorAdapters = resistors.map( function( circuitElement ) {
        return new ModifiedNodalAnalysisCircuitElement(
          self.vertices.indexOf( circuitElement.startVertexProperty.get() ), // the index of vertex corresponds to position in list.
          self.vertices.indexOf( circuitElement.endVertexProperty.get() ),
          circuitElement,
          circuitElement.resistanceProperty.value
        );
      } );
      var batteryAdapters = [];

      var nextSyntheticVertexIndex = self.vertices.length;
      batteries.forEach( function( battery ) {

        // add a voltage source from startVertex to syntheticVertex
        batteryAdapters.push( new ModifiedNodalAnalysisCircuitElement(
          self.vertices.indexOf( battery.startVertexProperty.value ),
          nextSyntheticVertexIndex,
          battery,
          battery.voltageProperty.value
        ) );

        // add a resistor from syntheticVertex to endVertex
        resistorAdapters.push( new ModifiedNodalAnalysisCircuitElement(
          nextSyntheticVertexIndex,
          self.vertices.indexOf( battery.endVertexProperty.value ),
          battery,
          battery.internalResistanceProperty.value
        ) );

        // Prepare for next battery, if any
        nextSyntheticVertexIndex++;
      } );

      var solution = new ModifiedNodalAnalysisCircuit( batteryAdapters, resistorAdapters, [] ).solve();

      // Apply the node voltages to the vertices
      this.vertices.getArray().forEach( function( vertex, i ) {

        // Unconnected vertices like those in the black box may not have an entry in the matrix, so mark them as zero.
        vertex.voltageProperty.set( solution.nodeVoltages[ i ] || 0 );
      } );

      // Apply the currents through the CircuitElements
      solution.elements.forEach( function( element ) {
        element.circuitElement.currentProperty.set( element.currentSolution );
      } );

      // For resistors with r>0, Ohm's Law gives the current.  For components with no resistance (like closed switch or
      // 0-resistance battery), the current is given by the matrix solution.
      resistorAdapters.forEach( function( resistorAdapter ) {
        if ( resistorAdapter.value !== 0 ) {
          resistorAdapter.circuitElement.currentProperty.set( solution.getCurrentForResistor( resistorAdapter ) );
        }
      } );

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
      this.stepActions.forEach( function( stepAction ) { stepAction(); } );
      this.stepActions.length = 0;

      // Move the charges
      this.chargeAnimator.step( dt );

      //REVIEW: This pattern seems necessary (to avoid copying), but:
      //REVIEW: (a) you're creating function closures here but avoiding an array copy. Should we ditch the closures?
      //REVIEW: (b) I'd REALLY like to see a safe way to do this, that sets assertions to ensure there wasn't a
      //REVIEW: concurrent modification. Maybe forEachVolatile or some other name that adds assertion checks, but
      //REVIEW: production runtime is fast (and doesn't require the extra ugly getArray() all over the place).
      //REVIEW^(samreid): CircuitElement.update cannot modify the list of circuit elements, so concurrent modification
      //REVIEW^(samreid): is not an issue in this case.  I moved the closure out, will that help?
      //REVIEW^(samreid): Should this become an axon issue for further discussion?  I agree the .getArray() are unwieldy
      //REVIEW^(samreid): but not sure about adding forEachVolatile (or *volatile for many methods).
      //REVIEW^(samreid): Did we decide it will be impossible to remove the copies in ObservableArray? (basically making everything volatile?)
      this.circuitElements.getArray().forEach( UPDATE_IF_PRESENT );
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

      return this.circuitElements.some( function( circuitElement ) {
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
     * Marks all connected circuit elements as dirty (so electrons will be layed out again), called when any wire length is changed.
     * @param {Vertex} vertex
     * @private
     */
    markAllConnectedCircuitElementsDirty: function( vertex ) {
      var allConnectedVertices = this.findAllConnectedVertices( vertex );

      // This is called many times while dragging a wire vertex, so for loops (as opposed to functional style) are used
      // to avoid garbage
      for ( var i = 0; i < allConnectedVertices.length; i++ ) {
        var neighborCircuitElements = this.getNeighborCircuitElements( allConnectedVertices[ i ] );
        for ( var k = 0; k < neighborCircuitElements.length; k++ ) {

          // Note the same circuit element may be marked dirty twice, but this does not cause any problems.
          neighborCircuitElements[ k ].chargeLayoutDirty = true;
        }
      }
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

        fixedVertices.push( currentVertex ); // Allow duplicates, will be _.uniq before return

        // O(n^2) to search for duplicates as we go, if this becomes a performance bottleneck we may wish to find a better
        // way to deduplicate, perhaps Set or something like that
        if ( visited.indexOf( currentVertex ) < 0 ) {
          visited.push( currentVertex );
        }
      }
      return _.uniq( fixedVertices );
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
          //REVIEW: Prefer your previous check to look for a lengthProperty than an instanceof lookup?
          //REVIEW^(samreid): type check seems preferable to checking for the lack of a property (my opinion), let me know your thoughts
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

    getDropTarget1: function( vertex, mode, blackBoxBounds ) {
      var self = this;

      if ( mode === InteractionMode.TEST ) {
        assert && assert( blackBoxBounds, 'bounds should be provided for build mode' );
      }

      //REVIEW*: docs probably indicate this function gets called once per frame dragging.
      //REVIEW*: This filters an AWFUL LOT. In a row. I honestly can't think of a reason NOT to combine the filters
      //REVIEW*: into one filter function. Won't have to duplicate zero-length checks, and it should be at least as
      //REVIEW*: fast.

      // Rules for a vertex connecting to another vertex.
      // (1) A vertex may not connect to an adjacent vertex.
      var candidateVertices = this.vertices.getArray().filter( function( candidateVertex ) {
        return !self.isVertexAdjacent( vertex, candidateVertex );
      } );
      if ( candidateVertices.length === 0 ) { return null;}  // Avoid additional work if possible to improve performanc e

      // (2) A vertex cannot connect to itself
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        return candidateVertex !== vertex;
      } );
      if ( candidateVertices.length === 0 ) { return null; }

      // (3) a vertex must be within SNAP_RADIUS (screen coordinates) of the other vertex
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        return vertex.unsnappedPositionProperty.get().distance( candidateVertex.positionProperty.get() ) < SNAP_RADIUS;
      } );
      if ( candidateVertices.length === 0 ) { return null; }

      // (4) a vertex must be attachable. Some black box vertices are not attachable, such as vertices hidden in the box
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        return candidateVertex.attachableProperty.get();
      } );
      if ( candidateVertices.length === 0 ) { return null; }

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
      if ( candidateVertices.length === 0 ) { return null; }

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
      if ( candidateVertices.length === 0 ) { return null; }

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
      if ( candidateVertices.length === 0 ) { return null; }

      // (8) a wire vertex cannot double connect to an object, creating a tiny short circuit
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        var candidateNeighbors = self.getNeighboringVertices( candidateVertex );
        var myNeighbors = self.getNeighboringVertices( vertex );
        var intersection = _.intersection( candidateNeighbors, myNeighbors );
        return intersection.length === 0;
      } );

      // (9) When in Black Box "build" mode (i.e. building inside the black box), a vertex user cannot connect to
      // a black box interface vertex if its other vertices would be outside of the black box.  See #136
      if ( mode === InteractionMode.TEST ) {
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
      if ( candidateVertices.length === 0 ) { return null; }

      // Find the closest match
      var sorted = _.sortBy( candidateVertices, function( candidateVertex ) {
        return vertex.unsnappedPositionProperty.get().distance( candidateVertex.positionProperty.get() );
      } );
      return sorted[ 0 ];
    },
    getDropTarget2: function( vertex, mode, blackBoxBounds ) {
      var self = this;

      if ( mode === InteractionMode.TEST ) {
        assert && assert( blackBoxBounds, 'bounds should be provided for build mode' );
      }

      //REVIEW*: docs probably indicate this function gets called once per frame dragging.
      //REVIEW*: This filters an AWFUL LOT. In a row. I honestly can't think of a reason NOT to combine the filters
      //REVIEW*: into one filter function. Won't have to duplicate zero-length checks, and it should be at least as
      //REVIEW*: fast.

      // Rules for a vertex connecting to another vertex.
      var candidateVertices = this.vertices.getArray().filter( function( candidateVertex ) {

        // (1) A vertex may not connect to an adjacent vertex.
        if ( self.isVertexAdjacent( vertex, candidateVertex ) ) {
          return false;
        }

        return true;
      } );

      // (2) A vertex cannot connect to itself
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        return candidateVertex !== vertex;
      } );
      if ( candidateVertices.length === 0 ) { return null; }

      // (3) a vertex must be within SNAP_RADIUS (screen coordinates) of the other vertex
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        return vertex.unsnappedPositionProperty.get().distance( candidateVertex.positionProperty.get() ) < SNAP_RADIUS;
      } );
      if ( candidateVertices.length === 0 ) { return null; }

      // (4) a vertex must be attachable. Some black box vertices are not attachable, such as vertices hidden in the box
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        return candidateVertex.attachableProperty.get();
      } );
      if ( candidateVertices.length === 0 ) { return null; }

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
      if ( candidateVertices.length === 0 ) { return null; }

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
      if ( candidateVertices.length === 0 ) { return null; }

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
      if ( candidateVertices.length === 0 ) { return null; }

      // (8) a wire vertex cannot double connect to an object, creating a tiny short circuit
      candidateVertices = candidateVertices.filter( function( candidateVertex ) {
        var candidateNeighbors = self.getNeighboringVertices( candidateVertex );
        var myNeighbors = self.getNeighboringVertices( vertex );
        var intersection = _.intersection( candidateNeighbors, myNeighbors );
        return intersection.length === 0;
      } );

      // (9) When in Black Box "build" mode (i.e. building inside the black box), a vertex user cannot connect to
      // a black box interface vertex if its other vertices would be outside of the black box.  See #136
      if ( mode === InteractionMode.TEST ) {
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
      if ( candidateVertices.length === 0 ) { return null; }

      // Find the closest match
      var sorted = _.sortBy( candidateVertices, function( candidateVertex ) {
        return vertex.unsnappedPositionProperty.get().distance( candidateVertex.positionProperty.get() );
      } );
      return sorted[ 0 ];
    },

    /**
     * A vertex has been dragged, is it a candidate for joining with other vertices?  If so, return the candidate
     * vertex.  Otherwise, return null.
     * @param {Vertex} vertex - the dragged vertex
     * @param {InteractionMode} mode - the application mode InteractionMode.TEST | InteractionMode.EXPLORE
     * @param {Bounds2|undefined} blackBoxBounds - the bounds of the black box, if there is one
     * @returns {Vertex|null} - the vertex it will be able to connect to, if dropped or null if no connection is available
     * @public
     */
    getDropTarget: function( vertex, mode, blackBoxBounds ) {
      var a = this.getDropTarget1( vertex, mode, blackBoxBounds );
      var b = this.getDropTarget2( vertex, mode, blackBoxBounds );
      if ( a !== b ) {
        throw new Error( 'problems' );
      }

      return b;
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
          return {
            startVertex: getVertexIndex( element.startVertexProperty.get() ),
            endVertex: getVertexIndex( element.endVertexProperty.get() )

            //REVIEW: Do these TODOs not need to be finished for the initial release?
            //REVIEW^(samreid): Correct, my recommendation is to postpone work on TODOS classified as phet-io or black-box-study which will not be
            //REVIEW^(samreid): invoked in the initial release
            // TODO(phet-io): include other circuit-element-specific data for save/load.  Save code should be adjacent
            // TODO(phet-io): to load code.  If there's a lot of cross-file or shared attributes, it would be helpful to doc.
            // TODO(phet-io): Presumably toStateObject() should be a method, and fromStateObject( ... ) should be a static method on the circuit element?
          };
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
