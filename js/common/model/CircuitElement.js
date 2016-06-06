// Copyright 2015-2016, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Emitter = require( 'AXON/Emitter' );

  /**
   *
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Object} propertySetMap - additional properties to add to PropertySet
   * @param {Object} [options]
   * @constructor
   */
  function CircuitElement( startVertex, endVertex, propertySetMap, options ) {
    assert && assert( startVertex !== endVertex, 'vertices must be different' );

    var circuitElement = this;

    options = _.extend( {
      canBeDroppedInToolbox: true, // false in Circuit Construction Kit Intro screen
      interactive: true // false for Black Box elements
    }, options );
    this.canBeDroppedInToolbox = options.canBeDroppedInToolbox;

    PropertySet.call( this, _.extend( {
      startVertex: startVertex,
      endVertex: endVertex,
      current: 0,

      // @public - can be edited and dragged
      interactive: options.interactive,

      // @public - whether the circuit element is inside the true black box, not inside the user-created black box, on
      // the interface or outside of the black box
      insideTrueBlackBox: false
    }, propertySetMap ) );

    this.interactiveProperty = this.interactiveProperty || null;

    // @public (read-only) - indicate when this circuit element has been connected
    this.connectedEmitter = new Emitter();

    // @public (read-only) - indicate when an adjacent vertex has moved to front, so that the Circuit Element node can
    // move to front too
    this.vertexSelectedEmitter = new Emitter();

    // @public (read-only) - indicate when either vertex has moved
    this.vertexMovedEmitter = new Emitter();

    var vertexMoved = function() {
      circuitElement.vertexMovedEmitter.emit();
    };
    var linkToVertex = function( vertex, oldVertex ) {
      oldVertex && oldVertex.positionProperty.unlink( vertexMoved );
      vertex.positionProperty.link( vertexMoved );

      if ( !oldVertex || !oldVertex.position.equals( vertex.position ) ) {
        circuitElement.vertexMovedEmitter.emit();
      }
    };
    this.startVertexProperty.link( linkToVertex );
    this.endVertexProperty.link( linkToVertex );

    this.disposeCircuitElement = function() {
      circuitElement.startVertexProperty.unlink( linkToVertex );
      circuitElement.endVertexProperty.unlink( linkToVertex );

      circuitElement.startVertex.positionProperty.unlink( vertexMoved );
      circuitElement.endVertex.positionProperty.unlink( vertexMoved );
    };
  }

  circuitConstructionKit.register( 'CircuitElement', CircuitElement );

  return inherit( PropertySet, CircuitElement, {

    dispose: function() {
      this.disposeCircuitElement();
    },

    /**
     * Replace one of the vertices with a new one
     * @param oldVertex
     * @param newVertex
     */
    replaceVertex: function( oldVertex, newVertex ) {
      assert && assert( oldVertex !== newVertex, 'Cannot replace with the same vertex' );
      assert && assert( oldVertex === this.startVertex || oldVertex === this.endVertex, 'Cannot replace a nonexistent vertex' );
      assert && assert( newVertex !== this.startVertex && newVertex !== this.endVertex, 'The new vertex shouldn\'t already be in the circuit element.' );
      if ( oldVertex === this.startVertex ) {
        this.startVertex = newVertex;
      }
      else {
        this.endVertex = newVertex;
      }
    },
    getOppositeVertex: function( vertex ) {
      assert && assert( this.containsVertex( vertex ), 'Missing vertex' );
      if ( this.startVertex === vertex ) {
        return this.endVertex;
      }
      else {
        return this.startVertex;
      }
    },
    containsVertex: function( vertex ) {
      return this.startVertex === vertex || this.endVertex === vertex;
    },

    /**
     * Connect the vertices, merging vertex2 into vertex1 and deleting vertex2
     * @param {Vertex} vertex1
     * @param {Vertex} vertex2
     * @public
     */
    connectCircuitElement: function( vertex1, vertex2 ) {
      if ( this.startVertex === vertex2 ) {
        this.startVertex = vertex1;
      }
      if ( this.endVertex === vertex2 ) {
        this.endVertex = vertex1;
      }

      // Make sure we didn't just obtain same start and end vertices
      assert && assert( this.startVertex !== this.endVertex, 'vertices must be different' );
    },

    hasBothVertices: function( vertex1, vertex2 ) {
      return (this.startVertex === vertex1 && this.endVertex === vertex2) ||
             (this.startVertex === vertex2 && this.endVertex === vertex1);
    },
    toStateObjectWithVertexIndices: function( getVertexIndex ) {
      return {
        startVertex: getVertexIndex( this.startVertex ),
        endVertex: getVertexIndex( this.endVertex )
      };
    },
    getPosition: function( distanceAlongWire ) {
      return this.startVertex.position.blend( this.endVertex.position, distanceAlongWire / this.length );
    },
    containsScalarLocation: function( s ) {
      return s >= 0 && s <= this.length;
    }
  } );
} );