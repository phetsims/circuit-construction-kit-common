// Copyright 2016-2019, University of Colorado Boulder

/**
 * CircuitElement is the base class for all elements that can be part of a circuit, including:
 * Wire, Resistor, Battery, LightBulb, Switch.  It has a start vertex and end vertex and a model for its own current.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Emitter = require( 'AXON/Emitter' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const PhetioObject = require( 'TANDEM/PhetioObject' );
  const Property = require( 'AXON/Property' );
  const Vector2 = require( 'DOT/Vector2' );

  // variables
  let index = 0;

  class CircuitElement extends PhetioObject {

    /**
     * @param {Vertex} startVertex
     * @param {Vertex} endVertex
     * @param {number} chargePathLength
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( startVertex, endVertex, chargePathLength, tandem, options ) {
      assert && assert( startVertex !== endVertex, 'startVertex cannot be the same as endVertex' );
      assert && assert( typeof chargePathLength === 'number', 'charge path length should be a number' );
      assert && assert( chargePathLength > 0, 'charge path length must be positive' );

      options = _.extend( {
        canBeDroppedInToolbox: true, // In the CCK: Basics intro screen, CircuitElements can't be dropped into the toolbox
        interactive: true, // In CCK: Black Box Study, CircuitElements in the black box cannot be manipulated
        isSizeChangedOnViewChange: true,
        insideTrueBlackBox: false,
        isMetallic: false, // Metallic items can have their voltage read directly (unshielded)
        isFlammable: false,
        tandem: tandem
      }, options );

      super( options );

      // @public (read-only) {number} unique identifier for looking up corresponding views
      this.id = index++;

      // @public (read-only) {number} track the time of creation so it can't be dropped in the toolbox for 0.5 seconds
      // see https://github.com/phetsims/circuit-construction-kit-common/issues/244
      this.creationTime = phet.joist.elapsedTime;

      // @public (read-only) flammable circuit elements can catch on fire
      this.isFlammable = options.isFlammable;

      // @public (read-only) metallic circuit elements behave like exposed wires--sensor values can be read directly on the
      // resistor. For instance, coins and paper clips and wires are metallic and can have their values read directly.
      this.isMetallic = options.isMetallic;

      // @public (read-only) {boolean} - whether the size changes when changing from lifelike/schematic, used to determine
      // whether the highlight region should be changed.  True for everything except the switch.
      this.isSizeChangedOnViewChange = options.isSizeChangedOnViewChange;

      // @public (read-only) {number} - whether it is possible to drop the CircuitElement in the toolbox
      this.canBeDroppedInToolbox = options.canBeDroppedInToolbox;

      // @public {Property.<Vertex>} - the Vertex at the origin of the CircuitElement, may change when CircuitElements are
      // connected
      this.startVertexProperty = new Property( startVertex );

      // @public {Property.<Vertex>} - the Vertex at the end of the CircuitElement, may change when CircuitElements are
      // connected
      this.endVertexProperty = new Property( endVertex );

      // @public {NumberProperty} - the flowing current, in amps.
      this.currentProperty = new NumberProperty( 0 );

      // @public (read-only) {BooleanProperty} - true if the CircuitElement can be edited and dragged
      this.interactiveProperty = new BooleanProperty( options.interactive );

      // @public {BooleanProperty} - whether the circuit element is inside the true black box, not inside the user-created
      // black box, on the interface or outside of the black box
      this.insideTrueBlackBoxProperty = new BooleanProperty( options.insideTrueBlackBox );

      // @public {boolean} - true if the charge layout must be updated (each element is visited every frame to check this)
      this.chargeLayoutDirty = true;

      // @public (read-only) {Emitter} - indicate when this CircuitElement has been connected to another CircuitElement
      this.connectedEmitter = new Emitter();

      // @public (read-only) {Emitter} - indicate when the CircuitElement has been moved to the front in z-ordering
      this.moveToFrontEmitter = new Emitter();

      // @public (read-only) {Emitter} - indicate when an adjacent Vertex has moved to front, so that the corresponding
      // Node can move to front too
      this.vertexSelectedEmitter = new Emitter();

      // @public (read-only) {Emitter} - indicate when either Vertex has moved
      this.vertexMovedEmitter = new Emitter();

      // @public (read-only) {Emitter} - indicate when the circuit element has started being dragged, when it is created
      // in the toolbox
      this.startDragEmitter = new Emitter();

      // @public (read-only) {Emitter} - indicate when the circuit element has been disposed
      this.disposeEmitter = new Emitter();

      // @private {function} - Signify that a Vertex moved
      this.vertexMovedListener = this.emitVertexMoved.bind( this );

      // @private {function} - stored for disposal
      this.linkVertexListener = this.linkVertex.bind( this );

      this.startPositionProperty.link( this.vertexMovedListener );
      this.endPositionProperty.link( this.vertexMovedListener );
      this.startVertexProperty.lazyLink( this.linkVertexListener );
      this.endVertexProperty.lazyLink( this.linkVertexListener );

      // @public (read-only by clients, writable-by-subclasses) {number} the distance the charges must take to get to the
      // other side of the component. This is typically the distance between vertices, but not for light bulbs.  This
      // value is constant, except for (a) wires which can have their length changed and (b) LightBulbs whose path
      // length changes when switching between LIFELIKE |SCHEMATIC
      this.chargePathLength = chargePathLength;

      // The ammeter update is called after items are disposed but before corresponding views are disposed, so we must
      // take care not to display current for any items that are pending deletion.
      // See https://github.com/phetsims/circuit-construction-kit-common/issues/418
      this.circuitElementDisposed = false;
    }

    /**
     * When the start or end Vertex changes, move the listener from the old Vertex to the new one
     * @private
     * @param {Vertex} newVertex - the new vertex
     * @param {Vertex} oldVertex - the previous vertex
     */
    linkVertex( newVertex, oldVertex ) {

      // These guards prevent errors from the bad transient state caused by the Circuit.flip causing the same Vertex
      // to be both start and end at the same time.
      if ( oldVertex.positionProperty.hasListener( this.vertexMovedListener ) ) {
        oldVertex.positionProperty.unlink( this.vertexMovedListener );
      }
      if ( !newVertex.positionProperty.hasListener( this.vertexMovedListener ) ) {
        newVertex.positionProperty.lazyLink( this.vertexMovedListener );
      }

      if ( !oldVertex.positionProperty.get().equals( newVertex.positionProperty.get() ) ) {
        this.vertexMovedEmitter.emit();
      }
    }

    /**
     * Convenience method to get the start vertex position Property
     * @returns {Property.<Vector2>}
     * @public
     */
    get startPositionProperty() {
      return this.startVertexProperty.get().positionProperty;
    }

    /**
     * Convenience method to get the end vertex position Property
     * @returns {Property.<Vector2>}
     * @public
     */
    get endPositionProperty() {
      return this.endVertexProperty.get().positionProperty;
    }

    /**
     * Signify that a vertex has moved.
     * @private
     */
    emitVertexMoved() {

      // We are (hopefully!) in the middle of updating both vertices and we (hopefully!) will receive another callback
      // shortly with the correct values for both startPosition and endPosition
      // See https://github.com/phetsims/circuit-construction-kit-common/issues/413
      // if ( assert && this.isFixedCircuitElement && this.startPositionProperty.value.equals( this.endPositionProperty.value ) ) {
      //   assert && timer.setTimeout( function() {
      //     assert && assert( !this.startPositionProperty.value.equals( this.endPositionProperty.value ), 'vertices cannot be in the same spot' );
      //   }, 0 );
      // }
      this.vertexMovedEmitter.emit();
    }

    /**
     * Release resources associated with this CircuitElement, called when it will no longer be used.
     * @public
     */
    dispose() {
      assert && assert( !this.circuitElementDisposed, 'circuit element was already disposed' );
      this.circuitElementDisposed = true;

      // Notify about intent to dispose first because dispose listeners may need to access state
      this.disposeEmitter.emit();
      this.disposeEmitter.removeAllListeners();

      this.startVertexProperty.unlink( this.linkVertexListener );
      this.endVertexProperty.unlink( this.linkVertexListener );

      this.startPositionProperty.hasListener( this.vertexMovedListener ) && this.startPositionProperty.unlink( this.vertexMovedListener );
      this.endPositionProperty.hasListener( this.vertexMovedListener ) && this.endPositionProperty.unlink( this.vertexMovedListener );

      super.dispose();
    }

    /**
     * Replace one of the vertices with a new one, when CircuitElements are connected.
     * @param {Vertex} oldVertex - the vertex which will be replaced.
     * @param {Vertex} newVertex - the vertex which will take the place of oldVertex.
     * @public
     */
    replaceVertex( oldVertex, newVertex ) {
      const startVertex = this.startVertexProperty.get();
      const endVertex = this.endVertexProperty.get();

      assert && assert( oldVertex !== newVertex, 'Cannot replace with the same vertex' );
      assert && assert( oldVertex === startVertex || oldVertex === endVertex, 'Cannot replace a nonexistent vertex' );
      assert && assert( newVertex !== startVertex && newVertex !== endVertex, 'The new vertex shouldn\'t already be ' +
                                                                              'in the circuit element.' );

      if ( oldVertex === startVertex ) {
        this.startVertexProperty.set( newVertex );
      }
      else {
        this.endVertexProperty.set( newVertex );
      }
    }

    /**
     * Gets the Vertex on the opposite side of the specified Vertex
     * @param {Vertex} vertex
     * @public
     */
    getOppositeVertex( vertex ) {
      assert && assert( this.containsVertex( vertex ), 'Missing vertex' );
      if ( this.startVertexProperty.get() === vertex ) {
        return this.endVertexProperty.get();
      }
      else {
        return this.startVertexProperty.get();
      }
    }

    /**
     * Returns whether this CircuitElement contains the specified Vertex as its startVertex or endVertex.
     * @param {Vertex} vertex - the vertex to check for
     * @returns {boolean}
     * @public
     */
    containsVertex( vertex ) {
      return this.startVertexProperty.get() === vertex || this.endVertexProperty.get() === vertex;
    }

    /**
     * Returns true if this CircuitElement contains both Vertex instances.
     * @param {Vertex} vertex1
     * @param {Vertex} vertex2
     * @returns {boolean}
     * @public
     */
    containsBothVertices( vertex1, vertex2 ) {
      return this.containsVertex( vertex1 ) && this.containsVertex( vertex2 );
    }

    /**
     * Updates the given matrix with the position and angle at the specified location along the element.
     * @param {number} distanceAlongWire - the scalar distance from one endpoint to another.
     * @param {Matrix3} matrix to be updated with the position and angle, so that garbage isn't created each time
     * @public
     */
    updateMatrixForPoint( distanceAlongWire, matrix ) {
      const startPosition = this.startPositionProperty.get();
      const endPosition = this.endPositionProperty.get();
      const translation = startPosition.blend( endPosition, distanceAlongWire / this.chargePathLength );
      assert && assert( !isNaN( translation.x ), 'x should be a number' );
      assert && assert( !isNaN( translation.y ), 'y should be a number' );
      const angle = Vector2.getAngleBetweenVectors( startPosition, endPosition );
      assert && assert( !isNaN( angle ), 'angle should be a number' );
      matrix.setToTranslationRotationPoint( translation, angle );
    }

    /**
     * Returns true if this CircuitElement contains the specified scalar location.
     * @param {number} scalarLocation
     * @returns {boolean}
     * @public
     */
    containsScalarLocation( scalarLocation ) {
      return scalarLocation >= 0 && scalarLocation <= this.chargePathLength;
    }

    /**
     * Get all Property instances that influence the circuit dynamics.
     * @abstract must be specified by the subclass
     * @returns {Property.<*>[]}
     * @public
     */
    getCircuitProperties() {
      assert && assert( false, 'getCircuitProperties must be implemented in subclass' );
    }

    /**
     * Get the midpoint between the vertices.  Used for dropping circuit elements into the toolbox.
     * @returns {Vector2}
     * @public
     */
    getMidpoint() {
      const start = this.startVertexProperty.value.positionProperty.get();
      const end = this.endVertexProperty.value.positionProperty.get();
      return start.average( end );
    }

    /**
     * Get all intrinsic properties of this object, which can be used to load it at a later time.
     * @returns {Object}
     * @public
     */
    toIntrinsicStateObject() {
      return { tandemName: this.tandem.tail };
    }

  }

  return circuitConstructionKitCommon.register( 'CircuitElement', CircuitElement );
} );