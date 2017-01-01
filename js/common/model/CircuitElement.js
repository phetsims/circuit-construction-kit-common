// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
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
   *
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {number} electronPathLength
   * @param {Object} [options]
   * @constructor
   */
  function CircuitElement( startVertex, endVertex, electronPathLength, options ) {
    assert && assert( startVertex !== endVertex, 'vertices must be different' );

    var self = this;

    options = _.extend( {
      canBeDroppedInToolbox: true, // false in Circuit Construction Kit Intro screen
      interactive: true // false for Black Box elements
    }, options );
    this.canBeDroppedInToolbox = options.canBeDroppedInToolbox;

    this.startVertexProperty = new Property( startVertex );
    this.endVertexProperty = new Property( endVertex );
    this.currentProperty = new Property( 0 );
    this.isOverToolboxProperty = new Property( false );

    // @public - can be edited and dragged
    this.interactiveProperty = new Property( options.interactive );

    // @public - whether the circuit element is inside the true black box, not inside the user-created black box, on
    // the interface or outside of the black box
    this.insideTrueBlackBoxProperty = new Property( false );
    Property.preventGetSet( this, 'startVertex' );
    Property.preventGetSet( this, 'endVertex' );
    Property.preventGetSet( this, 'current' );
    Property.preventGetSet( this, 'interactive' );
    Property.preventGetSet( this, 'insideTrueBlackBox' );

    // @public - true if the electrons must be layed out
    this.dirty = true;

    // @public (read-only) - indicate when this circuit element has been connected
    this.connectedEmitter = new Emitter();

    // @public (read-only) - indicate when the circuit element has been moved to the front in z-ordering
    this.moveToFrontEmitter = new Emitter();

    // @public (read-only) - indicate when an adjacent vertex has moved to front, so that the Circuit Element node can
    // move to front too
    this.vertexSelectedEmitter = new Emitter();

    // @public (read-only) - indicate when either vertex has moved
    this.vertexMovedEmitter = new Emitter();

    var vertexMoved = function() {
      self.vertexMovedEmitter.emit();
    };
    var linkToVertex = function( vertex, oldVertex ) {
      oldVertex && oldVertex.positionProperty.unlink( vertexMoved );
      vertex.positionProperty.link( vertexMoved );

      if ( !oldVertex || !oldVertex.positionProperty.get().equals( vertex.positionProperty.get() ) ) {
        self.vertexMovedEmitter.emit();
      }
    };
    this.startVertexProperty.link( linkToVertex );
    this.endVertexProperty.link( linkToVertex );

    this.disposeCircuitElement = function() {
      self.startVertexProperty.unlink( linkToVertex );
      self.endVertexProperty.unlink( linkToVertex );

      self.startVertexProperty.get().positionProperty.unlink( vertexMoved );
      self.endVertexProperty.get().positionProperty.unlink( vertexMoved );
    };

    this.electronPathLength = electronPathLength;
  }

  circuitConstructionKitCommon.register( 'CircuitElement', CircuitElement );

  return inherit( Object, CircuitElement, {

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
      assert && assert( oldVertex === this.startVertexProperty.get() || oldVertex === this.endVertexProperty.get(), 'Cannot replace a nonexistent vertex' );
      assert && assert( newVertex !== this.startVertexProperty.get() && newVertex !== this.endVertexProperty.get(), 'The new vertex shouldn\'t already be in the circuit element.' );
      if ( oldVertex === this.startVertexProperty.get() ) {
        this.startVertexProperty.set( newVertex );
      }
      else {
        this.endVertexProperty.set( newVertex );
      }
    },
    getOppositeVertex: function( vertex ) {
      assert && assert( this.containsVertex( vertex ), 'Missing vertex' );
      if ( this.startVertexProperty.get() === vertex ) {
        return this.endVertexProperty.get();
      }
      else {
        return this.startVertexProperty.get();
      }
    },
    containsVertex: function( vertex ) {
      return this.startVertexProperty.get() === vertex || this.endVertexProperty.get() === vertex;
    },

    /**
     * Connect the vertices, merging vertex2 into vertex1 and deleting vertex2
     * @param {Vertex} vertex1
     * @param {Vertex} vertex2
     * @public
     */
    connectCircuitElement: function( vertex1, vertex2 ) {
      if ( this.startVertexProperty.get() === vertex2 ) {
        this.startVertexProperty.set( vertex1 );
      }
      if ( this.endVertexProperty.get() === vertex2 ) {
        this.endVertexProperty.set( vertex1 );
      }

      // Make sure we didn't just obtain same start and end vertices
      assert && assert( this.startVertexProperty.get() !== this.endVertexProperty.get(), 'vertices must be different' );
    },

    hasBothVertices: function( vertex1, vertex2 ) {
      return (this.startVertexProperty.get() === vertex1 && this.endVertexProperty.get() === vertex2) ||
             (this.startVertexProperty.get() === vertex2 && this.endVertexProperty.get() === vertex1);
    },
    getPosition: function( distanceAlongWire ) {
      return this.startVertexProperty.get().positionProperty.get().blend( this.endVertexProperty.get().positionProperty.get(), distanceAlongWire / this.electronPathLength );
    },
    containsScalarLocation: function( s ) {
      return s >= 0 && s <= this.electronPathLength;
    }
  } );
} );