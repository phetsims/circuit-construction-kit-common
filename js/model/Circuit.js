// Copyright 2015-2020, University of Colorado Boulder

/**
 * A collection of circuit elements in the play area, not necessarily connected.  (For instance it could be 2 disjoint
 * circuits). This exists for the life of the sim and hence does not need a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ACVoltage = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ACVoltage' );
  const Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Capacitor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Capacitor' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const CCKCQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCQueryParameters' );
  const Charge = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Charge' );
  const ChargeAnimator = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ChargeAnimator' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const CircuitElementIO = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElementIO' );
  const CurrentType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CurrentType' );
  const Dog = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Dog' );
  const DynamicCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/DynamicCircuitElement' );
  const Emitter = require( 'AXON/Emitter' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const EnumerationProperty = require( 'AXON/EnumerationProperty' );
  const FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );
  const Fuse = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Fuse' );
  const Inductor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Inductor' );
  const LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  const merge = require( 'PHET_CORE/merge' );
  const ModifiedNodalAnalysisAdapter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisAdapter' );
  const NullableIO = require( 'TANDEM/types/NullableIO' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const ObservableArrayIO = require( 'AXON/ObservableArrayIO' );
  const PhetioGroup = require( 'TANDEM/PhetioGroup' );
  const PhetioGroupIO = require( 'TANDEM/PhetioGroupIO' );
  const Property = require( 'AXON/Property' );
  const PropertyIO = require( 'AXON/PropertyIO' );
  const ReferenceIO = require( 'TANDEM/types/ReferenceIO' );
  const Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  const Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Vertex' );
  const VertexIO = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/VertexIO' );
  const Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );

  // constants
  const SNAP_RADIUS = 30; // For two vertices to join together, they must be this close, in view coordinates
  const BUMP_AWAY_RADIUS = 20; // If two vertices are too close together after one is released, and they could not be
  // joined then bump them apart so they do not look connected.

  const BATTERY_LENGTH = CCKCConstants.BATTERY_LENGTH;
  const WIRE_LENGTH = CCKCConstants.WIRE_LENGTH;

  const trueFunction = _.constant( true ); // Lower cased so IDEA doesn't think it is a constructor

  class Circuit {

    /**
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( viewTypeProperty, tandem, options ) {
      this.viewTypeProperty = viewTypeProperty;

      options = merge( { blackBoxStudy: false }, options );
      this.blackBoxStudy = options.blackBoxStudy;

      // @public {NumberProperty} - All wires share the same resistivity, which is defined by
      // resistance = resistivity * length. On the Lab Screen, there is a wire resistivity control
      this.wireResistivityProperty = new NumberProperty( CCKCConstants.DEFAULT_RESISTIVITY, {
        tandem: tandem.createTandem( 'wireResistivityProperty' )
      } );

      // @public {NumberProperty} - All batteries share a single internal resistance value, which can be edited with
      // a control on the Lab Screen
      this.sourceResistanceProperty = new NumberProperty( CCKCConstants.DEFAULT_BATTERY_RESISTANCE, {
        tandem: tandem.createTandem( 'sourceResistanceProperty' )
      } );

      // @public {ObservableArray.<CircuitElement>} - The different types of CircuitElement the circuit may
      // contain, including Wire, Battery, Switch, Resistor, LightBulb, etc.
      this.circuitElements = new ObservableArray( {
        phetioState: true,
        phetioType: ObservableArrayIO( ReferenceIO ),
        tandem: tandem.createTandem( 'circuitElements' )
      } );

      // @public {ObservableArray.<Charge>} - the charges in the circuit
      this.charges = new ObservableArray();

      // @public {Property.<CurrentType>} - whether to show charges or conventional current
      this.currentTypeProperty = new EnumerationProperty( CurrentType, CCKCQueryParameters.currentType, {
        tandem: tandem.createTandem( 'currentTypeProperty' )
      } );

      // When the current type changes, mark everything as dirty and relayout charges
      this.currentTypeProperty.lazyLink( () => this.relayoutAllCharges() );

      // @public {BooleanProperty} - whether the current should be displayed
      this.showCurrentProperty = new BooleanProperty( CCKCQueryParameters.showCurrent, {
        tandem: tandem.createTandem( 'showCurrentProperty' )
      } );

      // @public (read-only) elapsed time for the circuit model
      this.timeProperty = new NumberProperty( 0 );

      // @public {ChargeAnimator} - move the charges with speed proportional to current
      this.chargeAnimator = new ChargeAnimator( this );

      // Mark as dirty when voltages or resistances change.
      const markDirtyListener = this.markDirty.bind( this );

      // Solve the circuit when any of the circuit element attributes change.
      this.circuitElements.addItemAddedListener( circuitElement => {
        circuitElement.getCircuitProperties().forEach( property => property.lazyLink( markDirtyListener ) );

        // When any vertex moves, relayout all charges within the fixed-length connected component, see #100
        circuitElement.chargeLayoutDirty = true;

        const updateCharges = () => this.markAllConnectedCircuitElementsDirty( circuitElement.startVertexProperty.get() );

        // For circuit elements that can change their length, make sure to update charges when the length changes.
        if ( circuitElement.lengthProperty ) {
          circuitElement.lengthProperty.link( updateCharges );
          circuitElement.disposeEmitterCircuitElement.addListener( () => circuitElement.lengthProperty.unlink( updateCharges ) );
        }

        this.markDirty();
      } );
      this.circuitElements.addItemRemovedListener( circuitElement => {

        // Delete orphaned vertices
        this.removeVertexIfOrphaned( circuitElement.startVertexProperty.get() );
        this.removeVertexIfOrphaned( circuitElement.endVertexProperty.get() );

        // Clear the selected element property so that the Edit panel for the element will disappear
        if ( this.selectedCircuitElementProperty.get() === circuitElement ) {
          this.selectedCircuitElementProperty.set( null );
        }

        circuitElement.getCircuitProperties().forEach( property => property.unlink( markDirtyListener ) );
        this.charges.removeAll( this.getChargesInCircuitElement( circuitElement ) );
        this.markDirty();
      } );

      // When a Charge is removed from the list, dispose it
      this.charges.addItemRemovedListener( charge => charge.dispose() );

      // @public (read-only) {Emitter} After the circuit physics is recomputed in solve(), some listeners need to update
      // themselves, such as the voltmeter and ammeter
      this.circuitChangedEmitter = new Emitter();

      // @public (read-only) {Emitter} - Some actions only take place after an item has been dropped
      this.vertexDroppedEmitter = new Emitter( { parameters: [ { valueType: Vertex } ] } );

      // @public (read-only) {Emitter} - signifies that a component has been modified (for example, with the
      // CircuitElementNumberControl)
      this.componentEditedEmitter = new Emitter();

      const emitCircuitChanged = () => this.circuitChangedEmitter.emit();

      this.vertexGroup = new PhetioGroup( ( tandem, position ) => {
        return new Vertex( position, {
          tandem: tandem,
          phetioType: VertexIO
        } );
      }, [ new Vector2( -1000, 0 ) ], {
        phetioType: PhetioGroupIO( VertexIO ),
        tandem: tandem.createTandem( 'vertexGroup' )
      } );

      this.vertexGroup.addMemberCreatedListener( vertex => {

        // Observe the change in location of the vertices, to update the ammeter and voltmeter
        vertex.positionProperty.link( emitCircuitChanged );

        const filtered = this.vertexGroup.filter( candidateVertex => vertex === candidateVertex );
        assert && assert( filtered.length === 1, 'should only have one copy of each vertex' );

        // if one vertex becomes selected, deselect the other vertices and circuit elements
        const vertexSelectedPropertyListener = selected => {
          if ( selected ) {
            this.vertexGroup.forEach( v => {
              if ( v !== vertex ) {
                v.selectedProperty.set( false );
              }
            } );
            this.selectedCircuitElementProperty.set( null );
          }
        };
        vertex.vertexSelectedPropertyListener = vertexSelectedPropertyListener;
        vertex.selectedProperty.link( vertexSelectedPropertyListener );
      } );

      // Stop watching the vertex positions for updating the voltmeter and ammeter
      this.vertexGroup.addMemberDisposedListener( vertex => {

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
        phetioType: PropertyIO( NullableIO( ReferenceIO ) )
      } );

      this.selectedCircuitElementProperty.link( selectedCircuitElement => {

        // When a circuit element is selected, deselect all the vertices
        if ( selectedCircuitElement ) {
          this.vertexGroup.forEach( vertex => vertex.selectedProperty.set( false ) );
        }
      } );

      // @private {function[]} - Actions that will be invoked during the step function
      this.stepActions = [];

      // When any vertex is dropped, check it and its neighbors for overlap.  If any overlap, move them apart.
      this.vertexDroppedEmitter.addListener( vertex => {
        this.stepActions.push( () => {

          // Collect adjacent vertices
          const neighbors = this.getNeighboringVertices( vertex );

          // Also consider the vertex being dropped for comparison with neighbors
          neighbors.push( vertex );
          const pairs = [];
          neighbors.forEach( neighbor => {
            this.vertexGroup.forEach( vertex => {

              // Make sure nodes are different
              if ( neighbor !== vertex ) {

                // Add to the list to be checked
                pairs.push( { v1: neighbor, v2: vertex } );
              }
            } );
          } );
          if ( pairs.length > 0 ) {

            // Find the closest pair
            const distance = pair => pair.v2.unsnappedPositionProperty.get().distance( pair.v1.unsnappedPositionProperty.get() );
            const minPair = _.minBy( pairs, distance );
            const minDistance = distance( minPair );

            // If the pair is too close, then bump one vertex away from each other (but only if both are not user controlled)
            if ( minDistance < BUMP_AWAY_RADIUS && !minPair.v1.isDragged && !minPair.v2.isDragged ) {
              this.moveVerticesApart( minPair.v1, minPair.v2 );
            }
          }
        } );
      } );

      this.sourceResistanceProperty.link( markDirtyListener );

      // @public (read-only) - for creating tandems
      // TODO(phet-io): Convert to group pattern?
      this.resistorGroupTandem = tandem.createGroupTandem( 'resistors' );
      this.seriesAmmeterGroupTandem = tandem.createGroupTandem( 'seriesAmmeters' );
      this.coinGroupTandem = tandem.createGroupTandem( 'coins' );
      this.eraserGroupTandem = tandem.createGroupTandem( 'erasers' );
      this.pencilGroupTandem = tandem.createGroupTandem( 'pencils' );
      this.handGroupTandem = tandem.createGroupTandem( 'hands' );
      this.dogGroupTandem = tandem.createGroupTandem( 'dogs' );
      this.dollarBillGroupTandem = tandem.createGroupTandem( 'dollarBills' );
      this.paperClipGroupTandem = tandem.createGroupTandem( 'paperClips' );

      // Create vertices for the API validated/baseline circuit elements.  These are not present in the vertexGroup and
      // hence not transmitted in the state.
      const createVertices = length => {
        const startPosition = new Vector2( -1000, 0 );
        return [ new Vertex( startPosition ), new Vertex( startPosition.plusXY( length, 0 ) ) ];
      };

      this.wireGroup = new PhetioGroup( ( tandem, startVertex, endVertex ) => {
        return new Wire( startVertex, endVertex, this.wireResistivityProperty, tandem );
      }, () => createVertices( WIRE_LENGTH ), {
        phetioType: PhetioGroupIO( CircuitElementIO ),
        tandem: tandem.createTandem( 'wireGroup' )
      } );

      this.batteryGroup = new PhetioGroup( ( tandem, startVertex, endVertex ) => {
        return new Battery( startVertex, endVertex, this.sourceResistanceProperty, Battery.BatteryType.NORMAL,
          tandem );
      }, () => createVertices( BATTERY_LENGTH ), {
        phetioType: PhetioGroupIO( CircuitElementIO ),
        tandem: tandem.createTandem( 'batteryGroup' )
      } );

      this.highVoltageBatteryGroup = new PhetioGroup( ( tandem, startVertex, endVertex ) => {
        return new Battery( startVertex, endVertex, this.sourceResistanceProperty, Battery.BatteryType.HIGH_VOLTAGE,
          tandem, {
            voltage: 1000
          } );
      }, () => createVertices( BATTERY_LENGTH ), {
        phetioType: PhetioGroupIO( CircuitElementIO ),
        tandem: tandem.createTandem( 'highVoltageBatteryGroup' ),
        phetioDynamicElementName: 'battery'
      } );

      this.acVoltageGroup = new PhetioGroup( ( tandem, startVertex, endVertex ) => {
        return new ACVoltage( startVertex, endVertex, this.sourceResistanceProperty, tandem );
      }, () => createVertices( CCKCConstants.AC_VOLTAGE_LENGTH ), {
        phetioType: PhetioGroupIO( CircuitElementIO ),
        tandem: tandem.createTandem( 'acVoltageGroup' )
      } );

      this.resistorGroup = new PhetioGroup(
        ( tandem, startVertex, endVertex, resistorType ) => resistorType === Resistor.ResistorType.DOG ?
                                                            new Dog( startVertex, endVertex, tandem ) :
                                                            new Resistor( startVertex, endVertex, resistorType, tandem ),
        () => {
          const argumentArray = createVertices( Resistor.ResistorType.RESISTOR.length );
          argumentArray.push( Resistor.ResistorType.RESISTOR );
          return argumentArray;
        }, {
          phetioType: PhetioGroupIO( CircuitElementIO ),
          tandem: tandem.createTandem( 'resistorGroup' )
        } );

      this.fuseGroup = new PhetioGroup(
        ( tandem, startVertex, endVertex ) => new Fuse( startVertex, endVertex, tandem ),
        () => createVertices( CCKCConstants.FUSE_LENGTH ), {
          phetioType: PhetioGroupIO( CircuitElementIO ),
          tandem: tandem.createTandem( 'fuseGroup' )
        } );

      this.capacitorGroup = new PhetioGroup(
        ( tandem, startVertex, endVertex ) => new Capacitor( startVertex, endVertex, tandem ),
        () => createVertices( CCKCConstants.CAPACITOR_LENGTH ), {
          phetioType: PhetioGroupIO( CircuitElementIO ),
          tandem: tandem.createTandem( 'capacitorGroup' )
        } );

      this.inductorGroup = new PhetioGroup(
        ( tandem, startVertex, endVertex ) => new Inductor( startVertex, endVertex, tandem ),
        () => createVertices( CCKCConstants.INDUCTOR_LENGTH ), {
          phetioType: PhetioGroupIO( CircuitElementIO ),
          tandem: tandem.createTandem( 'inductorGroup' )
        } );

      this.switchGroup = new PhetioGroup(
        ( tandem, startVertex, endVertex ) => new Switch( startVertex, endVertex, tandem ),
        () => createVertices( CCKCConstants.SWITCH_LENGTH ), {
          phetioType: PhetioGroupIO( CircuitElementIO ),
          tandem: tandem.createTandem( 'switchGroup' )
        } );

      this.lightBulbGroup = new PhetioGroup( ( tandem, startVertex, endVertex ) => {
        return new LightBulb( startVertex, endVertex, CCKCConstants.DEFAULT_RESISTANCE, this.viewTypeProperty, tandem );
      }, () => createVertices( 100 ), {
        phetioType: PhetioGroupIO( CircuitElementIO ),
        tandem: tandem.createTandem( 'lightBulbGroup' )
      } );

      this.groups = [
        this.wireGroup,
        this.batteryGroup,
        this.highVoltageBatteryGroup,
        this.acVoltageGroup,
        this.resistorGroup,
        this.fuseGroup,
        this.capacitorGroup,
        this.inductorGroup,
        this.switchGroup,
        this.lightBulbGroup
      ];

      // @private {boolean} - whether physical characteristics have changed and warrant solving for currents and voltages
      this.dirty = false;
    }

    /**
     * @param {CircuitElement} circuitElement
     * @public
     */
    disposeCircuitElement( circuitElement ) {
      this.circuitElements.remove( circuitElement );

      // Find the corresponding group that contains the circuitElement and dispose it.
      this.groups.forEach( group => group.contains( circuitElement ) && group.disposeMember( circuitElement ) );
    }

    /**
     * Create a pair of vertices to be used for a new CircuitElement
     * @param {Vector2} position - the position of the center of the CircuitElement
     * @param {number} length - the distance between the vertices
     * @returns {Vertex[]} with 2 elements
     * @private
     */
    createVertexPairArray( position, length ) {
      return [
        this.createVertex( position.plusXY( -length / 2, 0 ) ),
        this.createVertex( position.plusXY( length / 2, 0 ) )
      ];
    }

    /**
     * Create a Vertex at the specified location, convenience function for creating the vertices for CircuitElements.
     * @param {Vector2} position - the position of the Vertex in view = model coordinates
     * @returns {Vertex}
     * @private
     */
    createVertex( position ) {
      return this.vertexGroup.createNextMember( position );
    }

    /**
     * When over Vertex is released or bumped over another Vertex, rotate one away so it doesn't appear connected.
     * @param {Vertex} v1
     * @param {Vertex} v2
     * @private
     */
    moveVerticesApart( v1, v2 ) {
      const v1Neighbors = this.getNeighboringVertices( v1 );
      const v2Neighbors = this.getNeighboringVertices( v2 );

      // When vertex v1 is too close (but not connected) to v2, we choose vertex v3 as a reference point for moving
      // vertex v1 (or vice versa).
      if ( v1Neighbors.length === 1 && !v1.blackBoxInterfaceProperty.get() ) {
        this.bumpAwaySingleVertex( v1, v1Neighbors[ 0 ] ); // Arbitrarily choose 0th neighbor to move away from
      }
      else if ( v2Neighbors.length === 1 && !v2.blackBoxInterfaceProperty.get() ) {
        this.bumpAwaySingleVertex( v2, v2Neighbors[ 0 ] ); // Arbitrarily choose 0th neighbor to move away from
      }
    }

    /**
     * Update the position of all charges.
     * @public
     */
    relayoutAllCharges() {
      this.circuitElements.getArray().forEach( circuitElement => {circuitElement.chargeLayoutDirty = true;} );
      this.layoutChargesInDirtyCircuitElements();
    }

    /**
     * When two Vertices are dropped/bumped too close together, move away the pre-existing one by rotating or
     * translating it.
     *
     * @param {Vertex} vertex - the vertex to rotate
     * @param {Vertex} pivotVertex - the vertex to rotate about
     * @private
     */
    bumpAwaySingleVertex( vertex, pivotVertex ) {
      const distance = vertex.positionProperty.value.distance( pivotVertex.positionProperty.value );

      // If the vertices are too close, they must be translated away
      if ( distance < BUMP_AWAY_RADIUS ) {

        let difference = pivotVertex.positionProperty.value.minus( vertex.positionProperty.value );

        // Support when vertex is on the pivot, mainly for fuzz testing.  In that case, just move directly to the right
        if ( difference.magnitude === 0 ) {
          difference = new Vector2( 1, 0 );
        }

        const delta = difference.normalized().times( -SNAP_RADIUS * 1.5 );
        this.translateVertexGroup( vertex, delta );
      }
      else {

        // Other vertices should be rotated away, which handles non-stretchy components well. For small components like
        // batteries (which are around 100 view units long), rotate Math.PI/4. Longer components don't need to rotate
        // by such a large angle because the arc length will be proportionately longer,
        // see https://github.com/phetsims/circuit-construction-kit-common/issues/344
        const searchAngle = Math.PI / 4 * 100 / distance;
        this.rotateSingleVertexByAngle( vertex, pivotVertex, searchAngle );
        const distance1 = this.closestDistanceToOtherVertex( vertex );
        this.rotateSingleVertexByAngle( vertex, pivotVertex, -2 * searchAngle );
        const distance2 = this.closestDistanceToOtherVertex( vertex );
        if ( distance2 <= distance1 ) {

          // go back to the best spot
          this.rotateSingleVertexByAngle( vertex, pivotVertex, 2 * searchAngle );
        }
      }
    }

    /**
     * Rotate the given Vertex about the specified Vertex by the given angle
     * @param {Vertex} vertex - the vertex which will be rotated
     * @param {Vertex} pivotVertex - the origin about which the vertex will rotate
     * @param {number} deltaAngle - angle in radians to rotate
     * @private
     */
    rotateSingleVertexByAngle( vertex, pivotVertex, deltaAngle ) {
      const position = vertex.positionProperty.get();
      const pivotPosition = pivotVertex.positionProperty.get();

      const distanceFromVertex = position.distance( pivotPosition );
      const angle = position.minus( pivotPosition ).angle;

      const newPosition = pivotPosition.plus( Vector2.createPolar( distanceFromVertex, angle + deltaAngle ) );
      vertex.unsnappedPositionProperty.set( newPosition );
      vertex.positionProperty.set( newPosition );
    }

    /**
     * Determine the distance to the closest Vertex
     * @param {Vertex} vertex
     * @returns {number} - distance to nearest other Vertex in view coordinates
     * @private
     */
    closestDistanceToOtherVertex( vertex ) {
      let closestDistance = null;
      for ( let i = 0; i < this.vertexGroup.length; i++ ) {
        const v = this.vertexGroup.array[ i ];
        if ( v !== vertex ) {
          const distance = v.positionProperty.get().distance( vertex.positionProperty.get() );
          if ( closestDistance === null || distance < closestDistance ) {
            closestDistance = distance;
          }
        }
      }
      return closestDistance;
    }

    /**
     * Remove all elements from the circuit.
     * @public
     */
    clear() {

      this.selectedCircuitElementProperty.reset();

      // Vertices must be cleared from the black box screen--it's not handled by clearing the circuit elements
      if ( this.blackBoxStudy ) {

        // clear references, do not dispose because some items get added back in the black box.
        this.circuitElements.clear();

        this.vertexGroup.clear();
        this.markDirty();
      }
      else {

        // Dispose of elements
        while ( this.circuitElements.length > 0 ) {
          const circuitElement = this.circuitElements.get( 0 );
          this.circuit.disposeCircuitElement( circuitElement );
          this.removeVertexIfOrphaned( circuitElement.startVertexProperty.value );
          this.removeVertexIfOrphaned( circuitElement.endVertexProperty.value );
        }
        assert && assert( this.vertexGroup.length === 0, 'vertices should have been removed' );
      }
    }

    /**
     * Split the Vertex into separate vertices.
     * @param {Vertex} vertex - the vertex to be cut.
     * @public
     */
    cutVertex( vertex ) {

      // Only permit cutting a non-dragged vertex, see https://github.com/phetsims/circuit-construction-kit-common/issues/414
      if ( vertex.isDragged ) {
        return;
      }
      let neighborCircuitElements = this.getNeighborCircuitElements( vertex );
      if ( neighborCircuitElements.length <= 1 ) {

        // No need to cut a solo vertex
        return;
      }

      // Only move interactive circuit elements
      neighborCircuitElements = neighborCircuitElements.filter( circuitElement => circuitElement.interactiveProperty.get() );

      /**
       * Function that identifies where vertices would go if pulled toward their neighbors
       * @returns {Array}
       */
      const getTranslations = () =>
        neighborCircuitElements.map( circuitElement => {
          const oppositePosition = circuitElement.getOppositeVertex( vertex ).positionProperty.get();
          const position = vertex.positionProperty.get();
          let delta = oppositePosition.minus( position );

          // If the vertices were at the same position, move them randomly.  See https://github.com/phetsims/circuit-construction-kit-common/issues/405
          if ( delta.magnitude === 0 ) {
            delta = Vector2.createPolar( 1, phet.joist.random.nextDouble() * Math.PI * 2 );
          }
          return delta.withMagnitude( 30 );
        } );

      // Track where they would go if they moved toward their opposite vertices
      let translations = getTranslations();
      let angles = translations.map( t => t.angle );

      if ( neighborCircuitElements.length > 2 ) {

        // Reorder elements based on angle so they don't cross over when spread out
        neighborCircuitElements = _.sortBy( neighborCircuitElements, n => {
          const index = neighborCircuitElements.indexOf( n );
          return angles[ index ];
        } );

        // Get the angles in the corrected order
        translations = getTranslations();
        angles = translations.map( t => t.angle );
      }

      const separation = Math.PI * 2 / neighborCircuitElements.length;
      let results = [];

      const center = _.sum( angles ) / angles.length;

      // Move vertices away from cut vertex so that wires don't overlap
      if ( neighborCircuitElements.length === 2 ) {

        const ax = Vector2.createPolar( 30, center - separation / neighborCircuitElements.length );
        const bx = Vector2.createPolar( 30, center + separation / neighborCircuitElements.length );

        const da = angles[ 0 ] - center;

        results = da < 0 ? [ ax, bx ] : [ bx, ax ];
      }
      else {
        const distance = neighborCircuitElements.length <= 5 ? 30 : neighborCircuitElements.length * 30 / 5;
        neighborCircuitElements.forEach( ( circuitElement, k ) => {
          results.push( Vector2.createPolar( distance, separation * k + angles[ 0 ] ) );
        } );
      }

      neighborCircuitElements.forEach( ( circuitElement, i ) => {

        // Add the new vertex to the model first so that it can be updated in subsequent calls
        const newVertex = this.vertexGroup.createNextMember( vertex.positionProperty.get() );

        circuitElement.replaceVertex( vertex, newVertex );

        // Bump the vertices away from the original vertex
        this.translateVertexGroup( newVertex, results[ i ] );
      } );

      if ( !vertex.blackBoxInterfaceProperty.get() ) {
        this.vertexGroup.disposeMember( vertex );
      }
      this.markDirty();
    }

    /**
     * Translate all vertices connected to the mainVertex by FixedCircuitElements by the given distance
     *
     * Note: do not confuse this with CircuitLayerNode.translateVertexGroup which proposes connections while dragging
     *
     * @param {Vertex} mainVertex - the vertex whose group will be translated
     * @param {Vector2} delta - the vector by which to move the vertex group
     * @private
     */
    translateVertexGroup( mainVertex, delta ) {
      const vertexGroup = this.findAllFixedVertices( mainVertex );

      for ( let j = 0; j < vertexGroup.length; j++ ) {
        const vertex = vertexGroup[ j ];

        // Only translate vertices that are movable and not connected to the black box interface by FixedLength elements
        if ( vertex.draggableProperty.get() && !this.hasFixedConnectionToBlackBoxInterfaceVertex( vertex ) ) {
          vertex.setPosition( vertex.positionProperty.value.plus( delta ) );
        }
      }
    }

    /**
     * Returns true if the given vertex has a fixed connection to a black box interface vertex.
     * @param {Vertex} vertex
     * @returns {boolean}
     * @private
     */
    hasFixedConnectionToBlackBoxInterfaceVertex( vertex ) {
      const fixedVertices = this.findAllFixedVertices( vertex );
      return _.some( fixedVertices, fixedVertex => fixedVertex.blackBoxInterfaceProperty.get() );
    }

    /**
     * Returns true if the CircuitElement is not connected to any other CircuitElement.
     * @param {CircuitElement} circuitElement
     * @returns {boolean}
     * @public
     */
    isSingle( circuitElement ) {
      return this.getNeighborCircuitElements( circuitElement.startVertexProperty.get() ).length === 1 &&
             this.getNeighborCircuitElements( circuitElement.endVertexProperty.get() ).length === 1;
    }

    /**
     * When removing a CircuitElement, also remove its start/end Vertex if it can be removed.
     * @param {Vertex} vertex
     * @private
     */
    removeVertexIfOrphaned( vertex ) {
      if (
        this.getNeighborCircuitElements( vertex ).length === 0 &&
        !vertex.blackBoxInterfaceProperty.get() &&
        !vertex.isDisposed
      ) {
        this.vertexGroup.disposeMember( vertex );
      }
    }

    /**
     * Get all of the CircuitElements that contain the given Vertex.
     * @param {Vertex} vertex
     * @returns {CircuitElement[]}
     * @public
     */
    getNeighborCircuitElements( vertex ) {
      return this.circuitElements.getArray().filter( circuitElement => circuitElement.containsVertex( vertex ) );
    }

    /**
     * Gets the number of CircuitElements connected to the specified Vertex
     * @param {Vertex} vertex
     * @returns {number}
     * @public
     */
    countCircuitElements( vertex ) {
      return this.circuitElements.count( circuitElement => circuitElement.containsVertex( vertex ) );
    }

    /**
     * Gets the voltage between two points.  Computed in the view because view coordinates are used in the computation.
     * @param {VoltageConnection} redConnection
     * @param {VoltageConnection} blackConnection
     * @param {boolean} revealing - whether the black box is in "reveal" model
     * @returns {number|null}
     *
     * @public
     */
    getVoltageBetweenConnections( redConnection, blackConnection, revealing ) {

      if ( redConnection === null || blackConnection === null ) {
        return null;
      }
      else if ( !this.areVerticesElectricallyConnected( redConnection.vertex, blackConnection.vertex ) ) {

        // Voltmeter probes each hit things but they were not connected to each other through the circuit.
        return null;
      }
      else if ( redConnection.vertex.insideTrueBlackBoxProperty.get() && !revealing ) {

        // Cannot read values inside the black box, unless "reveal" is being pressed
        return null;
      }
      else if ( blackConnection.vertex.insideTrueBlackBoxProperty.get() && !revealing ) {

        // Cannot read values inside the black box, unless "reveal" is being pressed
        return null;
      }
      else {
        return redConnection.voltage - blackConnection.voltage;
      }
    }

    /**
     * Determines whether the specified Vertices are electrically connected through any arbitrary connections.  An
     * open switch breaks the connection.
     * @param {Vertex} vertex1
     * @param {Vertex} vertex2
     * @returns {boolean}
     * @public
     */
    areVerticesElectricallyConnected( vertex1, vertex2 ) {
      const connectedVertices = this.searchVertices( vertex1, ( startVertex, circuitElement ) => {

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
    }

    /**
     * When some physical characteristic has changed, we must recompute the voltages and currents.  Mark as
     * dirty and compute in step if anything has changed.
     * @public
     */
    markDirty() {
      this.dirty = true;
    }

    /**
     * Connect the vertices, merging oldVertex into vertex1 and deleting oldVertex
     * @param {Vertex} targetVertex
     * @param {Vertex} oldVertex
     * @public
     */
    connect( targetVertex, oldVertex ) {
      assert && assert( targetVertex.attachableProperty.get() && oldVertex.attachableProperty.get(),
        'both vertices should be attachable' );

      // Keep the black box vertices
      if ( oldVertex.blackBoxInterfaceProperty.get() ) {
        assert && assert( !targetVertex.blackBoxInterfaceProperty.get(), 'cannot attach black box interface vertex ' +
                                                                         'to black box interface vertex' );
        this.connect( oldVertex, targetVertex );
      }
      else {
        this.circuitElements.getArray().forEach( circuitElement => {
          if ( circuitElement.containsVertex( oldVertex ) ) {
            circuitElement.replaceVertex( oldVertex, targetVertex );
            circuitElement.connectedEmitter.emit();
          }
        } );
        this.vertexGroup.disposeMember( oldVertex );
        assert && assert( !oldVertex.positionProperty.hasListeners(), 'Removed vertex should not have any listeners' );
        this.markDirty();

        // Make sure the solder is displayed in the correct z-order
        targetVertex.relayerEmitter.emit();
      }
    }

    /**
     * Move forward in time
     * @param {number} dt - the elapsed time in seconds
     * @public
     */
    step( dt ) {

      // Invoke any scheduled actions
      this.stepActions.forEach( stepAction => stepAction() );
      this.stepActions.length = 0;

      // Move the charges
      this.chargeAnimator.step( dt );

      // Move forward time
      this.timeProperty.value += dt;

      // Update the
      const circuitElementsArray = this.circuitElements.getArray();
      const stepElements = circuitElementsArray.filter( element => element.step );
      const dynamicElements = circuitElementsArray.filter( element => element instanceof DynamicCircuitElement );
      stepElements.forEach( element => element.step( this.timeProperty.value, dt, this ) );

      if ( this.dirty || stepElements.length > 0 || dynamicElements.length > 0 ) {
        ModifiedNodalAnalysisAdapter.solveModifiedNodalAnalysis( this, dt );
        this.dirty = false;
        this.circuitChangedEmitter.emit();
      }
    }

    /**
     * When a circuit element is marked as dirty (such as when it changed length or moved), it needs to have
     * the charges repositioned, so they will be equally spaced internally and spaced well compared to neighbor
     * elements.
     * @public
     */
    layoutChargesInDirtyCircuitElements() {
      this.circuitElements.forEach( circuitElement => this.layoutCharges( circuitElement ) );
    }

    /**
     * Determine if one Vertex is adjacent to another Vertex.  The only way for two vertices to be adjacent is for them
     * to be the start/end of a single CircuitElement
     * @param {Vertex} a
     * @param {Vertex} b
     * @returns {boolean}
     * @private
     */
    isVertexAdjacent( a, b ) {

      // A vertex cannot be adjacent to itself.
      if ( a === b ) {
        return false;
      }

      return this.circuitElements.some( circuitElement => circuitElement.containsBothVertices( a, b ) );
    }

    /**
     * Find the neighbor vertices within the given group of circuit elements
     * @param {Vertex} vertex
     * @param {CircuitElement[]} circuitElements - the group of CircuitElements within which to look for neighbors
     * @returns {Vertex[]}
     * @private
     */
    getNeighborVerticesInGroup( vertex, circuitElements ) {
      const neighbors = [];
      for ( let i = 0; i < circuitElements.length; i++ ) {
        const circuitElement = circuitElements[ i ];
        if ( circuitElement.containsVertex( vertex ) ) {
          neighbors.push( circuitElement.getOppositeVertex( vertex ) );
        }
      }
      return neighbors;
    }

    /**
     * Get an array of all the vertices adjacent to the specified Vertex.
     * @param {Vertex} vertex - the vertex to get neighbors for
     * @returns {Vertex[]}
     * @private
     */
    getNeighboringVertices( vertex ) {
      const neighborCircuitElements = this.getNeighborCircuitElements( vertex );
      return this.getNeighborVerticesInGroup( vertex, neighborCircuitElements );
    }

    /**
     * Marks all connected circuit elements as dirty (so electrons will be layed out again), called when any wire length is changed.
     * @param {Vertex} vertex
     * @private
     */
    markAllConnectedCircuitElementsDirty( vertex ) {
      const allConnectedVertices = this.findAllConnectedVertices( vertex );

      // This is called many times while dragging a wire vertex, so for loops (as opposed to functional style) are used
      // to avoid garbage
      for ( let i = 0; i < allConnectedVertices.length; i++ ) {
        const neighborCircuitElements = this.getNeighborCircuitElements( allConnectedVertices[ i ] );
        for ( let k = 0; k < neighborCircuitElements.length; k++ ) {

          // Note the same circuit element may be marked dirty twice, but this does not cause any problems.
          neighborCircuitElements[ k ].chargeLayoutDirty = true;
        }
      }
    }

    /**
     * Find the subgraph where all vertices are connected by any kind of CircuitElements
     * @param {Vertex} vertex
     * @public
     */
    findAllConnectedVertices( vertex ) {
      return this.searchVertices( vertex, trueFunction );
    }

    /**
     * Find the subgraph where all vertices are connected, given the list of traversible circuit elements
     * @param {Vertex} vertex
     * @param {function} okToVisit - (startVertex:Vertex,circuitElement:CircuitElement,endVertex:Vertex)=>boolean, rule
     *                             - that determines which vertices are OK to visit
     * @returns {Vertex[]}
     * @private
     */
    searchVertices( vertex, okToVisit ) {

      const fixedVertices = [];
      const toVisit = [ vertex ];
      const visited = [];
      while ( toVisit.length > 0 ) {

        // Find the neighbors joined by a FixedCircuitElement, not a stretchy Wire
        const currentVertex = toVisit.pop();

        // If we haven't visited it before, then explore it
        if ( visited.indexOf( currentVertex ) < 0 ) {

          const neighborCircuitElements = this.getNeighborCircuitElements( currentVertex );

          for ( let i = 0; i < neighborCircuitElements.length; i++ ) {
            const neighborCircuitElement = neighborCircuitElements[ i ];
            const neighborVertex = neighborCircuitElement.getOppositeVertex( currentVertex );

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
    }

    /**
     * Get the charges that are in the specified circuit element.
     * @param {CircuitElement} circuitElement
     * @returns {Charge[]}
     * @public
     */
    getChargesInCircuitElement( circuitElement ) {
      return this.charges.getArray().filter( charge => charge.circuitElement === circuitElement );
    }

    /**
     * Find the subgraph where all vertices are connected by FixedCircuitElements, not stretchy wires.
     * @param {Vertex} vertex
     * @param {function} [okToVisit] - (startVertex:Vertex,circuitElement:CircuitElement,endVertex:Vertex)=>boolean,
     *                               - rule that determines which vertices are OK to visit
     * @returns {Vertex[]}
     * @public
     */
    findAllFixedVertices( vertex, okToVisit ) {
      return this.searchVertices( vertex, ( startVertex, circuitElement, endVertex ) => {
        if ( okToVisit ) {
          return circuitElement instanceof FixedCircuitElement && okToVisit( startVertex, circuitElement, endVertex );
        }
        else {
          return circuitElement instanceof FixedCircuitElement;
        }
      } );
    }

    /**
     * Returns the selected Vertex or null if none is selected
     * @returns {Vertex|null}
     */
    getSelectedVertex() {
      const selectedVertex = _.find( this.vertexGroup.array, vertex => vertex.selectedProperty.get() );
      return selectedVertex || null;
    }

    /**
     * A vertex has been dragged, is it a candidate for joining with other vertices?  If so, return the candidate
     * vertex.  Otherwise, return null.
     * @param {Vertex} vertex - the dragged vertex
     * @param {InteractionMode} mode - the application mode Circuit.InteractionMode.TEST | Circuit.InteractionMode.EXPLORE
     * @param {Bounds2|undefined} blackBoxBounds - the bounds of the black box, if there is one
     * @returns {Vertex|null} - the vertex it will be able to connect to, if dropped or null if no connection is available
     * @public
     */
    getDropTarget( vertex, mode, blackBoxBounds ) {

      if ( mode === Circuit.InteractionMode.TEST ) {
        assert && assert( blackBoxBounds, 'bounds should be provided for build mode' );
      }

      // Rules for a vertex connecting to another vertex.
      let candidateVertices = this.vertexGroup.filter( candidateVertex => {

        // (1) A vertex may not connect to an adjacent vertex.
        if ( this.isVertexAdjacent( vertex, candidateVertex ) ) {
          return false;
        }

        // (2) A vertex cannot connect to itself
        if ( candidateVertex === vertex ) {
          return false;
        }

        // (2.5) cannot connect to something that is dragging
        if ( candidateVertex.isDragged ) {
          return false;
        }

        // (3) a vertex must be within SNAP_RADIUS (screen coordinates) of the other vertex
        if ( !( vertex.unsnappedPositionProperty.get().distance( candidateVertex.positionProperty.get() ) < SNAP_RADIUS ) ) {
          return false;
        }

        // (4) a vertex must be attachable. Some black box vertices are not attachable, such as vertices hidden in the box
        if ( !candidateVertex.attachableProperty.get() ) {
          return false;
        }

        // (5) Reject any matches that result in circuit elements sharing a pair of vertices, which would cause
        // the wires to lay across one another (one vertex was already shared)

        // if something else is already snapping to candidateVertex, then we cannot snap to it as well.
        // check the neighbor vertices
        for ( let i = 0; i < this.vertexGroup.length; i++ ) {
          const circuitVertex = this.vertexGroup.array[ i ];
          const adjacent = this.isVertexAdjacent( circuitVertex, vertex );

          // If the adjacent vertex has the same position as the candidate vertex, that means it is already "snapped"
          // there and hence another vertex should not snap there at the same time.
          if ( adjacent && circuitVertex.positionProperty.get().equals( candidateVertex.positionProperty.get() ) ) {
            return false;
          }
        }

        const fixedVertices = this.findAllFixedVertices( vertex );

        // (6) a vertex cannot be connected to its own fixed subgraph (no wire)
        for ( let i = 0; i < fixedVertices.length; i++ ) {
          if ( fixedVertices[ i ] === candidateVertex ) {
            return false;
          }
        }

        // (7) a wire vertex cannot connect if its neighbor is already proposing a connection
        // You can always attach to a black box interface
        if ( !candidateVertex.blackBoxInterfaceProperty.get() ) {
          const neighbors = this.getNeighborCircuitElements( candidateVertex );
          for ( let i = 0; i < neighbors.length; i++ ) {
            const neighbor = neighbors[ i ];
            const oppositeVertex = neighbor.getOppositeVertex( candidateVertex );

            // is another node proposing a match to that node?
            for ( let k = 0; k < this.vertexGroup.length; k++ ) {
              const v = this.vertexGroup.array[ k ];
              if ( neighbor instanceof Wire &&
                   v !== vertex &&
                   v !== oppositeVertex &&
                   v.positionProperty.get().equals( oppositeVertex.positionProperty.get() ) &&
                   v.isDragged
              ) {
                return false;
              }
            }
          }
        }

        // (8) a wire vertex cannot double connect to an object, creating a tiny short circuit
        const candidateNeighbors = this.getNeighboringVertices( candidateVertex );
        const myNeighbors = this.getNeighboringVertices( vertex );
        const intersection = _.intersection( candidateNeighbors, myNeighbors );
        if ( intersection.length !== 0 ) {
          return false;
        }

        // All tests passed, it's OK for connection
        return true;
      } );

      // TODO (black-box-study): integrate rule (9) with the other rules above
      // (9) When in Black Box "build" mode (i.e. building inside the black box), a vertex user cannot connect to
      // a black box interface vertex if its other vertices would be outside of the black box.  See #136
      if ( mode === Circuit.InteractionMode.TEST ) {
        const fixedVertices2 = this.findAllFixedVertices( vertex );
        candidateVertices = candidateVertices.filter( candidateVertex => {

          // Don't connect to vertices that might have sneaked outside of the black box, say by a rotation.
          if ( !candidateVertex.blackBoxInterfaceProperty.get() && !blackBoxBounds.containsPoint( candidateVertex.positionProperty.get() ) ) {
            return false;
          }

          // How far the vertex would be moved if it joined to the candidate
          const delta = candidateVertex.positionProperty.get().minus( vertex.positionProperty.get() );

          if ( candidateVertex.blackBoxInterfaceProperty.get() || blackBoxBounds.containsPoint( candidateVertex.positionProperty.get() ) ) {
            for ( let i = 0; i < fixedVertices2.length; i++ ) {
              const connectedVertex = fixedVertices2[ i ];
              if ( connectedVertex.blackBoxInterfaceProperty.get() ) {

                // OK for black box interface vertex to be slightly outside the box
              }
              else if ( connectedVertex !== vertex && !blackBoxBounds.containsPoint( connectedVertex.positionProperty.get().plus( delta ) ) &&

                        // exempt wires connected outside of the black box, which are flagged as un-attachable in build mode, see #141
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
        candidateVertices = candidateVertices.filter( candidateVertex => !candidateVertex.outerWireStub );
      }
      if ( candidateVertices.length === 0 ) { return null; }

      // Find the closest match
      const sorted = _.sortBy( candidateVertices, candidateVertex =>
        vertex.unsnappedPositionProperty.get().distance( candidateVertex.positionProperty.get() )
      );
      return sorted[ 0 ];
    }

    /**
     * Flip the given CircuitElement
     * @param {CircuitElement} circuitElement - the circuit element to flip
     */
    flip( circuitElement ) {
      const startVertex = circuitElement.startVertexProperty.value;
      const endVertex = circuitElement.endVertexProperty.value;
      circuitElement.startVertexProperty.value = endVertex;
      circuitElement.endVertexProperty.value = startVertex;

      // Layout the charges in the circuitElement but nowhere else, since that creates a discontinuity in the motion
      circuitElement.chargeLayoutDirty = true;
      this.layoutChargesInDirtyCircuitElements();
      this.markDirty();
    }

    /**
     * Creates and positions charges in the specified circuit element.
     * @param {CircuitElement} circuitElement - the circuit element within which the charges will be updated
     * @public
     */
    layoutCharges( circuitElement ) {

      // Avoid unnecessary work to improve performance
      if ( circuitElement.chargeLayoutDirty ) {

        circuitElement.chargeLayoutDirty = false;

        // Identify charges that were already in the branch.
        const charges = this.getChargesInCircuitElement( circuitElement );

        // put charges 1/2 separation from the edge so it will match up with adjacent components
        const offset = CCKCConstants.CHARGE_SEPARATION / 2;
        const lastChargePosition = circuitElement.chargePathLength - offset;
        const firstChargePosition = offset;
        const lengthForCharges = lastChargePosition - firstChargePosition;

        // Utils.roundSymmetric leads to charges too far apart when N=2
        const numberOfCharges = Math.ceil( lengthForCharges / CCKCConstants.CHARGE_SEPARATION );

        // compute distance between adjacent charges
        const spacing = lengthForCharges / ( numberOfCharges - 1 );

        for ( let i = 0; i < numberOfCharges; i++ ) {

          // If there is a single particle, show it in the middle of the component, otherwise space equally
          const chargePosition = numberOfCharges === 1 ?
                                 ( firstChargePosition + lastChargePosition ) / 2 :
                                 i * spacing + offset;

          const desiredCharge = this.currentTypeProperty.get() === CurrentType.ELECTRONS ? -1 : +1;

          if ( charges.length > 0 &&
               charges[ 0 ].charge === desiredCharge &&
               charges[ 0 ].circuitElement === circuitElement &&
               charges[ 0 ].visibleProperty === this.showCurrentProperty ) {

            const c = charges.shift(); // remove 1st element, since it's the charge we checked in the guard
            c.circuitElement = circuitElement;
            c.distance = chargePosition;
            c.updatePositionAndAngle();
          }
          else {

            // nothing suitable in the pool, create something new
            const charge = new Charge( circuitElement, chargePosition, this.showCurrentProperty, desiredCharge );
            this.charges.add( charge );
          }
        }

        // Any charges that did not get recycled should be removed
        this.charges.removeAll( charges );
      }
    }

    /**
     * Reset the Circuit to its initial state.
     * @public
     */
    reset() {
      this.clear();
      this.showCurrentProperty.reset();
      this.currentTypeProperty.reset();
      this.wireResistivityProperty.reset();
      this.sourceResistanceProperty.reset();
      this.chargeAnimator.reset();
      this.selectedCircuitElementProperty.reset();
    }
  }

  // Enumeration for the different types of interaction:
  // EXPLORE (used for open-ended exploration)
  // TEST (when testing out a black box circuit)
  Circuit.InteractionMode = Enumeration.byKeys( [ 'EXPLORE', 'TEST' ] );

  return circuitConstructionKitCommon.register( 'Circuit', Circuit );
} );