// Copyright 2015-2017, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * The LightBulb is a CircuitElement that shines when current flows through it.
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
  var NumberProperty = require( 'AXON/NumberProperty' );

  // constants
  var DISTANCE_BETWEEN_VERTICES = 33;

  // Tinker with coordinates to get thing to match up
  var LEFT_CURVE_X_SCALE = 1.5;
  var TOP_Y_SCALE = 0.32;
  var RIGHT_CURVE_X_SCALE = 0.87;

  // The sampled points for the wire/filament curves
  var POINTS = [
    new Vector2( 0.623, 2.063 ),                                          // bottom center
    new Vector2( 0.623, 1.014 * 0.75 ),                                   // first curve
    new Vector2( 0.314 * LEFT_CURVE_X_SCALE, 0.704 * TOP_Y_SCALE * 1.1 ), // left curve 1
    new Vector2( 0.314 * LEFT_CURVE_X_SCALE, 0.639 * TOP_Y_SCALE ),       // left curve 2
    new Vector2( 0.394 * LEFT_CURVE_X_SCALE, 0.560 * TOP_Y_SCALE ),       // left curve 3
    new Vector2( 0.823 * RIGHT_CURVE_X_SCALE, 0.565 * TOP_Y_SCALE ),      // top right 1
    new Vector2( 0.888 * RIGHT_CURVE_X_SCALE, 0.600 * TOP_Y_SCALE ),      // top right 2
    new Vector2( 0.922 * RIGHT_CURVE_X_SCALE, 0.699 * TOP_Y_SCALE ),      // top right 3
    new Vector2( 0.927 * RIGHT_CURVE_X_SCALE, 1.474 ),                    // exit notch
    new Vector2( 0.927 * 0.8 * 1.2, 1.474 )                               // exit
  ];

  // Nicknames for the first and last points
  var START_POINT = POINTS[ 0 ];
  var END_POINT = POINTS[ POINTS.length - 1 ];

  /**
   * @param {Vertex} startVertex - TODO: is this the side or bottom vertex?
   * @param {Vertex} endVertex
   * @param {number} resistance - in ohms
   * @param {Object} [options]
   * @constructor
   */
  function LightBulb( startVertex, endVertex, resistance, options ) {

    // @private
    this.resistanceProperty = new NumberProperty( resistance );

    // @private (read-only) the vector between the vertices
    this.vertexDelta = endVertex.positionProperty.get().minus( startVertex.positionProperty.get() );

    var accumulatedDistance = 0;
    for ( var i = 0; i < POINTS.length - 1; i++ ) {
      var q1 = this.getPoint( i, startVertex );
      var q2 = this.getPoint( i + 1, startVertex );
      accumulatedDistance += q2.distance( q1 );
    }

    var chargePathLength = accumulatedDistance - 1E-8; // changes the speed at which particles go through the light bulb // TODO: why subtract 1E-8 here?
    FixedLengthCircuitElement.call( this, startVertex, endVertex, DISTANCE_BETWEEN_VERTICES, chargePathLength, options );
  }

  circuitConstructionKitCommon.register( 'LightBulb', LightBulb );

  return inherit( FixedLengthCircuitElement, LightBulb, {

    /**
     * Get the Vector2 corresponding to the specified index, using the startVertex as an origin.
     * TODO: this implementation doesn't match the jsdoc.
     * @param {number} index
     * @param {Vertex} startVertex
     * @returns {Vector2}
     */
    getPoint: function( index, startVertex ) {
      var p1 = POINTS[ index ];

      var p1X = Util.linear( START_POINT.x, END_POINT.x, startVertex.positionProperty.get().x, startVertex.positionProperty.get().x + this.vertexDelta.x, p1.x );
      var p1Y = Util.linear( START_POINT.y, END_POINT.y, startVertex.positionProperty.get().y, startVertex.positionProperty.get().y + this.vertexDelta.y, p1.y );

      return new Vector2( p1X, p1Y );
    },

    /**
     * Gets all of the properties that characterize this LightBulb.
     * @override
     * @returns {Property[]}
     * @public
     */
    getCircuitProperties: function() {
      return [ this.resistanceProperty ];
    },

    /**
     * Returns a serialized form of the properties that characterize this LightBulb
     * @returns {Object}
     * @public
     */
    attributesToStateObject: function() {
      return {
        resistance: this.resistanceProperty.get()
      };
    },

    /**
     * Overrides CircuitElement.getPosition to describe the path the charge takes through the light bulb.
     *
     * @param {number} distanceAlongWire - how far along the bulb's length the charge has traveled
     *                                   - the light bulb's length is declared in ChargeLayout // TODO: fix that
     * @returns {Object}
     * @override
     * @public
     */
    getPositionAndAngle: function( distanceAlongWire ) {

      var accumulatedDistance = 0;
      var prev = 0;
      for ( var i = 0; i < POINTS.length - 1; i++ ) {
        var q1 = this.getPoint( i, this.startVertexProperty.get() );
        var q2 = this.getPoint( i + 1, this.startVertexProperty.get() );

        accumulatedDistance += q2.distance( q1 );

        // Find what segment the charge is in
        if ( distanceAlongWire < accumulatedDistance ) {
          var a = Util.linear( prev, accumulatedDistance, 0, 1, distanceAlongWire );
          var position = q1.blend( q2, a );

          // Rotate about the start vertex.
          var vd = this.endVertexProperty.get().positionProperty.get().minus( this.startVertexProperty.get().positionProperty.get() );

          var angle = vd.angle() - this.vertexDelta.angle();

          // rotate the point about the start vertex
          var p = position.rotatedAboutPoint( this.startVertexProperty.get().positionProperty.get(), angle );

          var localAngle = q2.minus( q1 ).angle();
          return { position: p, angle: localAngle };
        }
        prev = accumulatedDistance;
      }

      // TODO: Restore this assertion after #186 complete
      // assert && assert( false, 'hello' );
      return { position: new Vector2(), angle: 0 };
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

      return new LightBulb( startVertex, endVertex, CircuitConstructionKitConstants.DEFAULT_RESISTANCE, options );
    }
  } );
} );