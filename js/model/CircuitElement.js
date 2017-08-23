// Copyright 2016-2017, University of Colorado Boulder

/**
 * CircuitElement is the base class for all elements that can be part of a circuit, including:
 * Wire, Resistor, Battery, LightBulb, Switch.  It has a start vertex and end vertex and a model for its own current.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Emitter = require( 'AXON/Emitter' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Property = require( 'AXON/Property' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Vector2 = require( 'DOT/Vector2' );
  var inherit = require( 'PHET_CORE/inherit' );

  // phet-io modules
  var TObject = require( 'ifphetio!PHET_IO/types/TObject' );

  var index = 0;

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {number} chargePathLength
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function CircuitElement( startVertex, endVertex, chargePathLength, tandem, options ) {
    assert && assert( startVertex !== endVertex, 'startVertex cannot be the same as endVertex' );
    assert && assert( typeof chargePathLength === 'number', 'charge path length should be a number' );
    assert && assert( chargePathLength > 0, 'charge path length must be positive' );

    var self = this;

    // @public (read-only) {string} - the tail of the Tandem for creating associated Tandems
    this.tandemName = tandem.tail;

    // @public (read-only) {number} unique identifier for looking up corresponding views
    this.id = index++;

    // @public (read-only) {number} track the time of creation so it can't be dropped in the toolbox for 0.5 seconds
    // see https://github.com/phetsims/circuit-construction-kit-common/issues/244
    this.creationTime = phet.joist.elapsedTime;

    options = _.extend( {
      canBeDroppedInToolbox: true, // In the CCK: Basics intro screen, CircuitElements can't be dropped into the toolbox
      interactive: true, // In CCK: Black Box Study, CircuitElements in the black box cannot be manipulated
      isSizeChangedOnViewChange: true
    }, options );

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
    //REVIEW: Presumably this could be initialized properly on creation? Only setters are on deserialization.
    this.insideTrueBlackBoxProperty = new BooleanProperty( false );

    // @public {boolean} - true if the charge layout must be updated
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

    // Signify that a Vertex moved
    //REVIEW: seems like it should be a method (bound to a property) for memory purposes. See notes below.
    var vertexMoved = function() {
      self.vertexMovedEmitter.emit();
    };

    /**
     * When the start or end Vertex changes, move the listener from the old Vertex to the new one
     * @param {Vertex} newVertex - the new vertex
     * @param {Vertex} oldVertex - the previous vertex
     */
      //REVIEW: Would be better as a method, so it doesn't create new function objects. Then bind it for the listeners
      //REVIEW: below (and for the dispose method)
    var linkVertex = function( newVertex, oldVertex ) {
        oldVertex.positionProperty.unlink( vertexMoved );
        newVertex.positionProperty.link( vertexMoved );

        if ( !oldVertex.positionProperty.get().equals( newVertex.positionProperty.get() ) ) {
          self.vertexMovedEmitter.emit();
        }
      };

    //REVIEW: The position properties of the vertex properties are used a ton. Maybe a getter for getStartPositionProperty()
    //REVIEW: / getEndPositionProperty() would help make things more readable?
    this.startVertexProperty.get().positionProperty.link( vertexMoved );
    this.endVertexProperty.get().positionProperty.link( vertexMoved );
    this.startVertexProperty.lazyLink( linkVertex );
    this.endVertexProperty.lazyLink( linkVertex );

    // @public (read-only by clients, writable-by-subclasses) {number} the distance the charges must take to get to the
    // other side of the component. This is typically the distance between vertices, but not for light bulbs.  This
    // value is constant, except for wires which can have their length changed.
    this.chargePathLength = chargePathLength;

    tandem.addInstance( this, TObject );

    // @private - stored for disposal
    this.linkVertex = linkVertex;

    // @private - stored for disposal
    this.vertexMoved = vertexMoved;
  }

  circuitConstructionKitCommon.register( 'CircuitElement', CircuitElement );

  return inherit( Object, CircuitElement, {

    /**
     * Release resources associated with this CircuitElement, called when it will no longer be used.
     * @public
     */
    dispose: function() {
      var linkVertex = this.linkVertex;
      var vertexMoved = this.vertexMoved;
      this.startVertexProperty.unlink( linkVertex );
      this.endVertexProperty.unlink( linkVertex );

      // TODO: how are these listeners sometimes already detached? See https://github.com/phetsims/circuit-construction-kit-dc/issues/144
      this.startVertexProperty.get().positionProperty.hasListener( vertexMoved ) && this.startVertexProperty.get().positionProperty.unlink( vertexMoved );
      this.endVertexProperty.get().positionProperty.hasListener( vertexMoved ) && this.endVertexProperty.get().positionProperty.unlink( vertexMoved );

      //REVIEW: If listeners are getting notified that something will be disposed, presumably it should be before disposing inner components?
      this.disposeEmitter.emit();
      this.disposeEmitter.removeAllListeners();

      //REVIEW(samreid): are these lines necessary?
      this.linkVertex = null;
      this.vertexMoved = null;
    },

    /**
     * Replace one of the vertices with a new one, when CircuitElements are connected.
     * @param {Vertex} oldVertex - the vertex which will be replaced.
     * @param {Vertex} newVertex - the vertex which will take the place of oldVertex.
     * @public
     */
    replaceVertex: function( oldVertex, newVertex ) {
      var startVertex = this.startVertexProperty.get();
      var endVertex = this.endVertexProperty.get();

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
    },

    /**
     * Gets the Vertex on the opposite side of the specified Vertex
     * @param {Vertex} vertex
     * @public
     */
    getOppositeVertex: function( vertex ) {
      assert && assert( this.containsVertex( vertex ), 'Missing vertex' );
      if ( this.startVertexProperty.get() === vertex ) {
        return this.endVertexProperty.get();
      }
      else {
        return this.startVertexProperty.get();
      }
    },

    /**
     * Returns whether this CircuitElement contains the specified Vertex as its startVertex or endVertex.
     * @param {Vertex} vertex - the vertex to check for
     * @returns {boolean}
     * @public
     */
    containsVertex: function( vertex ) {
      return this.startVertexProperty.get() === vertex || this.endVertexProperty.get() === vertex;
    },

    /**
     * Returns true if this CircuitElement contains both Vertex instances.
     * @param {Vertex} vertex1
     * @param {Vertex} vertex2
     * @returns {boolean}
     * @public
     */
    containsBothVertices: function( vertex1, vertex2 ) {
      return this.containsVertex( vertex1 ) && this.containsVertex( vertex2 );
    },

    /**
     * Gets the 2D Position along the CircuitElement corresponding to the given scalar distance
     * @param {number} distanceAlongWire - the scalar distance from one endpoint to another.
     * @returns {Vector2} the position in view coordinates REVIEW: Definitely not returning a Vector2.
     * REVIEW: I see no reason not to split this into two functions. Sometimes only one of the two things computed is
     * REVIEW: used, and it wouldn't require creating another temporary object.
     *
     * REVIEW: If both are needed, can we just return a Matrix that has the position/angle information (assuming
     * REVIEW: Charge switches to use a Matrix3 instead of position/angle independently)
     * @public
     */
    getPositionAndAngle: function( distanceAlongWire ) {
      var startPosition = this.startVertexProperty.get().positionProperty.get();
      var endPosition = this.endVertexProperty.get().positionProperty.get();
      return {
        position: startPosition.blend( endPosition, distanceAlongWire / this.chargePathLength ),
        angle: Vector2.getAngleBetweenVectors( startPosition, endPosition )
      };
    },

    /**
     * Returns true if this CircuitElement contains the specified scalar location.
     * @param {number} scalarLocation
     * @returns {boolean}
     * @public
     */
    containsScalarLocation: function( scalarLocation ) {
      return scalarLocation >= 0 && scalarLocation <= this.chargePathLength;
    },

    /**
     * Get all Property instances that influence the circuit dynamics.
     * @abstract must be specified by the subclass
     * @returns {Property[]} REVIEW: Type of Properties? Property.<Circuit>?
     * @public
     */
    getCircuitProperties: function() {
      assert && assert( false, 'getCircuitProperties must be implemented in subclass' );
    },

    /**
     * Get the midpoint between the vertices.  Used for dropping circuit elements into the toolbox.
     * @returns {Vector2}
     * @public
     */
    getMidpoint: function() {
      var start = this.startVertexProperty.value.positionProperty.value;
      var end = this.endVertexProperty.value.positionProperty.value;
      return start.blend( end, 0.5 );
    }
  } );
} );