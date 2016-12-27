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
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/FixedLengthCircuitElement' );
  var Vector2 = require( 'DOT/Vector2' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Vertex' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var Util = require( 'DOT/Util' );
  var Property = require( 'AXON/Property' );

  // constants
  var DISTANCE_BETWEEN_VERTICES = 33;

  // Tinker with coordinates to get thing to match up
  var sx1 = 1.5;
  var sy1 = 0.32;
  var sx2 = 0.87;

  var specs = {
    dimension: new Vector2( 1.222, 2.063 ),
    bottomCenter: new Vector2( 0.623, 2.063 ),
    firstCurve: new Vector2( 0.623, 1.014 * 0.75 ),
    leftCurve1: new Vector2( 0.314 * sx1, 0.704 * sy1 * 1.1 ),
    leftCurve2: new Vector2( 0.314 * sx1, 0.639 * sy1 ),
    leftCurve3: new Vector2( 0.394 * sx1, 0.560 * sy1 ),
    topRight1: new Vector2( 0.823 * sx2, 0.565 * sy1 ),
    topRight2: new Vector2( 0.888 * sx2, 0.600 * sy1 ),
    topRight3: new Vector2( 0.922 * sx2, 0.699 * sy1 ),
    exitNotch: new Vector2( 0.927 * sx2, 1.474 ),
    exit: new Vector2( 0.927 * 0.8 * 1.2, 1.474 )
  };

  var points = [
    specs.bottomCenter,
    specs.firstCurve,
    specs.leftCurve1,
    specs.leftCurve2,
    specs.leftCurve3,
    specs.topRight1,
    specs.topRight2,
    specs.topRight3,
    specs.exitNotch,
    specs.exit
  ];

  var start = points[ 0 ];
  var end = points[ points.length - 1 ];

  // See http://stackoverflow.com/questions/12161277/how-to-rotate-a-vertex-around-a-certain-point
  // TODO: move to Vector2?
  var rotatedAbout = function( point, origin, angle ) {
    var dx = (point.x - origin.x);
    var dy = (point.y - origin.y);
    var cos = Math.cos( angle );
    var sin = Math.sin( angle );
    return new Vector2(
      origin.x + dx * cos - dy * sin,
      origin.y + dx * sin + dy * cos
    );
  };

  /**
   *
   * @constructor
   */
  function LightBulb( startVertex, endVertex, resistance, options ) {
    FixedLengthCircuitElement.call( this, DISTANCE_BETWEEN_VERTICES, startVertex, endVertex, options );
    this.resistanceProperty = new Property( resistance );
    Property.preventGetSet( this, 'resistance' );

    // TODO: copied
    var accumulatedDistance = 0;
    for ( var i = 0; i < points.length - 1; i++ ) {

      var p1 = points[ i ];
      var p2 = points[ i + 1 ];

      var p1X = Util.linear( start.x, end.x, this.startVertexProperty.get().positionProperty.get().x, this.endVertexProperty.get().positionProperty.get().x, p1.x );
      var p1Y = Util.linear( start.y, end.y, this.startVertexProperty.get().positionProperty.get().y, this.endVertexProperty.get().positionProperty.get().y, p1.y );

      var p2X = Util.linear( start.x, end.x, this.startVertexProperty.get().positionProperty.get().x, this.endVertexProperty.get().positionProperty.get().x, p2.x );
      var p2Y = Util.linear( start.y, end.y, this.startVertexProperty.get().positionProperty.get().y, this.endVertexProperty.get().positionProperty.get().y, p2.y );

      var q1 = new Vector2( p1X, p1Y );
      var q2 = new Vector2( p2X, p2Y );
      accumulatedDistance += q2.distance( q1 );
    }

    var trueLength = accumulatedDistance; // measured by code below
    this.length = trueLength - 1E-8; // changes the speed at which particles go through the light bulb

    this.distanceBetweenVertices = startVertex.positionProperty.get().distance( endVertex.positionProperty.get() );

    this.vertexDelta = endVertex.positionProperty.get().minus( startVertex.positionProperty.get() );
  }

  circuitConstructionKitCommon.register( 'LightBulb', LightBulb );

  return inherit( FixedLengthCircuitElement, LightBulb, {
    toStateObjectWithVertexIndices: function( getVertexIndex ) {
      return _.extend( {
        resistance: this.resistanceProperty.get()
      }, FixedLengthCircuitElement.prototype.toStateObjectWithVertexIndices.call( this, getVertexIndex ) );
    },

    /**
     * Overrides CircuitElement.getPosition to describe the path the electron takes through the light bulb.
     *
     * @param {number} distanceAlongWire - how far along the bulb's length the electron has traveled
     *                                   - the light bulb's length is declared in ElectronLayout // TODO: fix that
     * @returns {Vector2}
     * @override
     */
    getPosition: function( distanceAlongWire ) {

      var accumulatedDistance = 0;
      var prev = 0;
      for ( var i = 0; i < points.length - 1; i++ ) {

        var p1 = points[ i ];
        var p2 = points[ i + 1 ];

        var p1X = Util.linear( start.x, end.x, this.startVertexProperty.get().positionProperty.get().x, this.startVertexProperty.get().positionProperty.get().x + this.vertexDelta.x, p1.x );
        var p1Y = Util.linear( start.y, end.y, this.startVertexProperty.get().positionProperty.get().y, this.startVertexProperty.get().positionProperty.get().y + this.vertexDelta.y, p1.y );

        var p2X = Util.linear( start.x, end.x, this.startVertexProperty.get().positionProperty.get().x, this.startVertexProperty.get().positionProperty.get().x + this.vertexDelta.x, p2.x );
        var p2Y = Util.linear( start.y, end.y, this.startVertexProperty.get().positionProperty.get().y, this.startVertexProperty.get().positionProperty.get().y + this.vertexDelta.y, p2.y );

        var q1 = new Vector2( p1X, p1Y );
        var q2 = new Vector2( p2X, p2Y );
        accumulatedDistance += q2.distance( q1 );

        // Find what segment the electron is in
        if ( distanceAlongWire < accumulatedDistance ) {
          var a = Util.linear( prev, accumulatedDistance, 0, 1, distanceAlongWire );
          var position = q1.blend( q2, a );

          // Rotate about the start vertex.
          var vd = this.endVertexProperty.get().positionProperty.get().minus( this.startVertexProperty.get().positionProperty.get() );

          var angle = vd.angle() - this.vertexDelta.angle();

          // rotate the point about the start vertex
          return rotatedAbout( position, this.startVertexProperty.get().positionProperty.get(), angle );
        }
        prev = accumulatedDistance;
      }

      // TODO: Restore this assertion after #186 complete
      console.log( distanceAlongWire, accumulatedDistance );
      // assert && assert( false, 'hello' );
      return new Vector2();
    }
  }, {
    DISTANCE_BETWEEN_VERTICES: DISTANCE_BETWEEN_VERTICES,
    createAtPosition: function( position, circuitVertexGroupTandem, options ) { // TODO: Tandem
      var translation = new Vector2( 30, 10 );

      // Connect at the side and bottom
      var lightBulbLength = LightBulb.DISTANCE_BETWEEN_VERTICES;
      var startPoint = new Vector2( position.x - lightBulbLength / 2, position.y ).plus( translation );
      var endPoint = new Vector2( position.x, position.y + lightBulbLength / 4 ).plus( translation );

      var delta = endPoint.minus( startPoint );
      var angle = delta.angle();

      endPoint = startPoint.plus( Vector2.createPolar( LightBulb.DISTANCE_BETWEEN_VERTICES, angle - Math.PI * 0.3975 ) );

      // start vertex is at the bottom
      var startVertex = new Vertex( startPoint.x, startPoint.y, {
        tandem: circuitVertexGroupTandem.createNextTandem()
      } );
      var endVertex = new Vertex( endPoint.x, endPoint.y, {
        tandem: circuitVertexGroupTandem.createNextTandem()
      } );

      return new LightBulb( startVertex, endVertex, CircuitConstructionKitConstants.defaultResistance, options );
    }
  } );
} );