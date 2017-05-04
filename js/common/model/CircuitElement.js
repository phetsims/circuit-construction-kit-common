// Copyright 2015-2017, University of Colorado Boulder

/**
 * CircuitElement is the base class for all elements that can be part of a circuit, including:
 * Wire, Resistor, Battery, LightBulb, Switch.  It has a start vertex and end vertex and a model for its own current.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Emitter = require( 'AXON/Emitter' );

  // phet-io modules
  var TObject = require( 'ifphetio!PHET_IO/types/TObject' );

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

    // @public (read-only) track the time of creation so it can't be dropped in the toolbox for 0.5 seconds
    // see https://github.com/phetsims/circuit-construction-kit-common/issues/244
    this.creationTime = phet.joist.elapsedTime;

    options = _.extend( {
      canBeDroppedInToolbox: true, // In the CCK: Basics intro screen, CircuitElements cannot be dropped into the toolbox
      interactive: true // In CCK: Black Box Study, CircuitElements in the black box cannot be manipulated
    }, options );

    // @public (read-only) - whether it is possible to drop the CircuitElement in the toolbox
    this.canBeDroppedInToolbox = options.canBeDroppedInToolbox;

    // @public (read-only) - the Vertex at the origin of the CircuitElement
    this.startVertexProperty = new Property( startVertex );

    // @public (read-only) - the Vertex at the end of the CircuitElement
    this.endVertexProperty = new Property( endVertex );

    // @public (read-only) - the flowing current, in amps.
    this.currentProperty = new NumberProperty( 0 );

    // @public (read-only) - whether the CircuitElement is being dragged across the toolbox
    this.isOverToolboxProperty = new BooleanProperty( false );

    // @public (read-only) - true if the CircuitElement can be edited and dragged
    this.interactiveProperty = new BooleanProperty( options.interactive );

    // @public - whether the circuit element is inside the true black box, not inside the user-created black box, on
    // the interface or outside of the black box
    this.insideTrueBlackBoxProperty = new BooleanProperty( false );

    // @public - true if the charge layout must be updated
    this.chargeLayoutDirty = true;

    // @public (read-only) - indicate when this CircuitElement has been connected to another CircuitElement
    this.connectedEmitter = new Emitter();

    // @public (read-only) - indicate when the CircuitElement has been moved to the front in z-ordering
    this.moveToFrontEmitter = new Emitter();

    // @public (read-only) - indicate when an adjacent Vertex has moved to front, so that the corresponding Node can
    // move to front too
    this.vertexSelectedEmitter = new Emitter();

    // @public (read-only) - indicate when either Vertex has moved
    this.vertexMovedEmitter = new Emitter();

    // @public (read-only) - indicate when the circuit element has started being dragged, when it is created in the toolbox
    this.startDragEmitter = new Emitter();

    // @public (read-only) - indicate when the circuit element has been disposed
    this.disposeEmitter = new Emitter();

    // @public (read-only) - the voltage at the end vertex minus the voltage at the start vertex
    // name voltageDifferenceProperty so it doesn't clash with voltageProperty in Battery subclass
    this.voltageDifferenceProperty = new Property();

    // Signify that a Vertex moved
    var vertexMoved = function() {
      self.vertexMovedEmitter.emit();
    };

    var vertexVoltageChanged = function() {
      self.voltageDifferenceProperty.set(
        self.endVertexProperty.get().voltageProperty.get() -
        self.startVertexProperty.get().voltageProperty.get()
      );
    };

    /**
     * When the start or end Vertex changes, move the listener from the old Vertex to the new one
     * @param {Vertex} vertex - the new vertex
     * @param {Vertex} oldVertex - the previous vertex
     */
    var linkVertex = function( vertex, oldVertex ) {
      oldVertex.positionProperty.unlink( vertexMoved );
      vertex.positionProperty.link( vertexMoved );

      oldVertex.voltageProperty.unlink( vertexVoltageChanged );
      vertex.voltageProperty.link( vertexVoltageChanged );

      if ( !oldVertex.positionProperty.get().equals( vertex.positionProperty.get() ) ) {
        self.vertexMovedEmitter.emit();
      }
    };
    this.startVertexProperty.get().positionProperty.link( vertexMoved );
    this.endVertexProperty.get().positionProperty.link( vertexMoved );
    this.startVertexProperty.get().voltageProperty.link( vertexVoltageChanged );
    this.endVertexProperty.get().voltageProperty.link( vertexVoltageChanged );
    this.startVertexProperty.lazyLink( linkVertex );
    this.endVertexProperty.lazyLink( linkVertex );

    // @private - for debugging
    this.disposed = false;

    this.disposeCircuitElement = function() {
      assert && assert( !self.disposed, 'Was already disposed' );
      self.disposed = true;

      self.startVertexProperty.unlink( linkVertex );
      self.endVertexProperty.unlink( linkVertex );

      self.startVertexProperty.get().positionProperty.unlink( vertexMoved );
      self.endVertexProperty.get().positionProperty.unlink( vertexMoved );

      self.disposeEmitter.emit();
    };

    // @public (read-only by clients, writable-by-subclasses) the distance the charges must take to get to the other
    // side of the component. This is typically the distance between vertices, but not for light bulbs.  This value is
    // constant, except for wires which can have their length changed.
    this.chargePathLength = chargePathLength;

    tandem.addInstance( this, TObject );
  }

  circuitConstructionKitCommon.register( 'CircuitElement', CircuitElement );

  return inherit( Object, CircuitElement, {

    /**
     * Release resources associated with this CircuitElement, called when it will no longer be used.
     * @public
     */
    dispose: function() {
      this.disposeCircuitElement();
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
      assert && assert( newVertex !== startVertex && newVertex !== endVertex, 'The new vertex shouldn\'t already be in the circuit element.' );

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
     * @returns {Vector2} the position in view coordinates
     * @public
     */
    getPositionAndAngle: function( distanceAlongWire ) {
      var startPosition = this.startVertexProperty.get().positionProperty.get();
      var endPosition = this.endVertexProperty.get().positionProperty.get();
      return {
        position: startPosition.blend( endPosition, distanceAlongWire / this.chargePathLength ),
        angle: endPosition.minus( startPosition ).angle()
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
     * @returns {Property[]}
     * @public
     */
    getCircuitProperties: function() {
      assert && assert( false, 'getCircuitProperties must be implemented in subclass' );
    },

    /**
     * Return the indices of the vertices, for debugging.
     * @public
     * @returns {[number,number]}
     */
    get indices() {
      return [ this.startVertexProperty.get().index, this.endVertexProperty.get().index ];
    }
  } );
} );