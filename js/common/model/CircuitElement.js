// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

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
  var Emitter = require( 'AXON/Emitter' );

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {number} electronPathLength
   * @param {Object} [options]
   * @constructor
   */
  function CircuitElement( startVertex, endVertex, electronPathLength, options ) {
    assert && assert( startVertex !== endVertex, 'vertices must be different' );
    assert && assert( typeof electronPathLength === 'number', 'electron path length should be a number' );
    assert && assert( electronPathLength > 0, 'electron path length must be positive' );

    var self = this;

    options = _.extend( {
      canBeDroppedInToolbox: true, // In the CCK: Basics intro screen, CircuitElements cannot be dropped into the toolbox
      interactive: true // In CCK: Black Box Study, CircuitElements in the black box cannot be manipulated
    }, options );

    // @public (read-only) - whether it is possible to drop the CircuitElement in the toolbox
    this.canBeDroppedInToolbox = options.canBeDroppedInToolbox;

    // @public (read-only) - the Vertex at the origin of the CircuitElement
    this.startVertexProperty = new Property( startVertex );
    Property.preventGetSet( this, 'startVertex' );

    // @public (read-only) - the Vertex at the end of the CircuitElement
    this.endVertexProperty = new Property( endVertex );
    Property.preventGetSet( this, 'endVertex' );

    // @public (read-only) - the flowing current, in amps.
    this.currentProperty = new Property( 0 );
    Property.preventGetSet( this, 'current' );

    // @public (read-only) - whether the CircuitElement is being dragged across the toolbox
    this.isOverToolboxProperty = new Property( false );
    Property.preventGetSet( this, 'isOverToolbox' );

    // @public (read-only) - true if the CircuitElement can be edited and dragged
    this.interactiveProperty = new Property( options.interactive );
    Property.preventGetSet( this, 'interactive' );

    // @public - whether the circuit element is inside the true black box, not inside the user-created black box, on
    // the interface or outside of the black box
    this.insideTrueBlackBoxProperty = new Property( false );
    Property.preventGetSet( this, 'insideTrueBlackBox' );

    // @public - true if the electrons must be layed out again
    this.dirty = true;

    // @public (read-only) - indicate when this CircuitElement has been connected to another CircuitElement
    this.connectedEmitter = new Emitter();

    // @public (read-only) - indicate when the CircuitElement has been moved to the front in z-ordering
    this.moveToFrontEmitter = new Emitter();

    // @public (read-only) - indicate when an adjacent Vertex has moved to front, so that the CircuitElement node can
    // move to front too
    this.vertexSelectedEmitter = new Emitter();

    // @public (read-only) - indicate when either Vertex has moved
    this.vertexMovedEmitter = new Emitter();

    /**
     * Signify that a Vertex moved
     */
    var vertexMoved = function() {
      self.vertexMovedEmitter.emit();
    };

    /**
     * When the start or end Vertex changes, move the listener from the old Vertex to the new one
     * @param {Vertex} vertex - the new vertex
     * @param {Vertex} oldVertex - the previous vertex
     */
    var linkVertex = function( vertex, oldVertex ) {
      oldVertex.positionProperty.unlink( vertexMoved );
      vertex.positionProperty.link( vertexMoved );

      if ( !oldVertex.positionProperty.get().equals( vertex.positionProperty.get() ) ) {
        self.vertexMovedEmitter.emit();
      }
    };
    this.startVertexProperty.get().positionProperty.link( vertexMoved );
    this.endVertexProperty.get().positionProperty.link( vertexMoved );
    this.startVertexProperty.lazyLink( linkVertex );
    this.endVertexProperty.lazyLink( linkVertex );

    this.disposeCircuitElement = function() {
      self.startVertexProperty.unlink( linkVertex );
      self.endVertexProperty.unlink( linkVertex );

      self.startVertexProperty.get().positionProperty.unlink( vertexMoved );
      self.endVertexProperty.get().positionProperty.unlink( vertexMoved );
    };

    // @public (writable by subclasses) the distance the electrons must take to get to the other side of the component.
    // This is typically the distance between vertices, but not for light bulbs.  This value is constant, except
    // for wires which can have their length changed.
    this.electronPathLength = electronPathLength;
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
     * Replace one of the vertices with a new one
     * @param {Vertex} oldVertex
     * @param {Vertex} newVertex
     * @public
     */
    replaceVertex: function( oldVertex, newVertex ) {
      assert && assert( oldVertex !== newVertex, 'Cannot replace with the same vertex' );
      var startVertex = this.startVertexProperty.get();
      var endVertex = this.endVertexProperty.get();
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
     * @return {boolean}
     * @public
     */
    containsVertex: function( vertex ) {
      return this.startVertexProperty.get() === vertex || this.endVertexProperty.get() === vertex;
    },

    /**
     * Returns true if this CircuitElement contains both Vertex instances.
     * @param {Vertex} vertex1
     * @param {Vertex} vertex2
     * @return {boolean}
     * @public
     */
    containsBothVertices: function( vertex1, vertex2 ) {
      return this.containsVertex( vertex1 ) && this.containsVertex( vertex2 );
    },

    /**
     * Gets the 2D Position along the CircuitElement corresponding to the given scalar distance
     * @param {number} distanceAlongWire - the scalar distance from one endpoint to another.
     * @return {Vector2}
     * @public
     */
    getPosition: function( distanceAlongWire ) {
      var startPosition = this.startVertexProperty.get().positionProperty.get();
      var endPosition = this.endVertexProperty.get().positionProperty.get();
      return startPosition.blend( endPosition, distanceAlongWire / this.electronPathLength );
    },

    /**
     * Returns true if this CircuitElement contains the specified scalar location.
     * @param {number} scalarLocation
     * @return {boolean}
     * @public
     */
    containsScalarLocation: function( scalarLocation ) {
      return scalarLocation >= 0 && scalarLocation <= this.electronPathLength;
    }
  } );
} );