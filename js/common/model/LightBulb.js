// Copyright 2015-2017, University of Colorado Boulder

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

  // The distance (as the crow flies) between start and end vertex
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
   * @param {Vertex} startVertex - the side Vertex
   * @param {Vertex} endVertex - the bottom Vertex
   * @param {number} resistance - in ohms
   * @param {Object} [options]
   * @constructor
   */
  function LightBulb( startVertex, endVertex, resistance, options ) {

    // @public (read-only)
    this.resistanceProperty = new NumberProperty( resistance );

    // @private (read-only) the vector between the vertices
    this.vertexDelta = endVertex.positionProperty.get().minus( startVertex.positionProperty.get() );

    var accumulatedDistance = 0;
    for ( var i = 0; i < POINTS.length - 1; i++ ) {
      var point1 = this.getPoint( i, startVertex );
      var q2 = this.getPoint( i + 1, startVertex );
      accumulatedDistance += q2.distance( point1 );
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
      var point = POINTS[ index ];

      var x = Util.linear( START_POINT.x, END_POINT.x, startVertex.positionProperty.get().x, startVertex.positionProperty.get().x + this.vertexDelta.x, point.x );
      var y = Util.linear( START_POINT.y, END_POINT.y, startVertex.positionProperty.get().y, startVertex.positionProperty.get().y + this.vertexDelta.y, point.y );

      return new Vector2( x, y );
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
     * @returns {Object}
     * @override
     * @public
     */
    getPositionAndAngle: function( distanceAlongWire ) {

      var previousAccumulatedDistance = 0;
      var accumulatedDistance = 0;
      for ( var i = 0; i < POINTS.length - 1; i++ ) {
        var point1 = this.getPoint( i, this.startVertexProperty.get() );
        var point2 = this.getPoint( i + 1, this.startVertexProperty.get() );

        accumulatedDistance += point2.distance( point1 );

        // Find what segment the charge is in
        if ( distanceAlongWire <= accumulatedDistance ) {
          var normalizedDistance = Util.linear( previousAccumulatedDistance, accumulatedDistance, 0, 1, distanceAlongWire );
          var averaged = point1.blend( point2, normalizedDistance );  // TODO: what is happening here?

          // rotate the point about the start vertex
          var vertexDelta = this.endVertexProperty.get().positionProperty.get().minus( this.startVertexProperty.get().positionProperty.get() );
          var relativeAngle = vertexDelta.angle() - this.vertexDelta.angle();
          var position = averaged.rotatedAboutPoint( this.startVertexProperty.get().positionProperty.get(), relativeAngle );
          var angle = point2.minus( point1 ).angle();

          return { position: position, angle: angle };
        }
        previousAccumulatedDistance = accumulatedDistance;
      }

      assert && assert( false, 'exceeded charge path bounds' );
      return null;
    }
  }, {

    /**
     * Create a LightBulb at the specified position
     * @param {Vector2} position
     * @param {Tandem} circuitVertexGroupTandem
     * @param {Object} [options]
     * @returns {LightBulb}
     * @public
     */
    createAtPosition: function( position, circuitVertexGroupTandem, options ) { // TODO: Tandem
      var translation = new Vector2( 30, 10 );

      // Connect at the side and bottom
      var startPoint = new Vector2( position.x - DISTANCE_BETWEEN_VERTICES / 2, position.y ).plus( translation );
      var endPoint = new Vector2( position.x, position.y + DISTANCE_BETWEEN_VERTICES / 4 ).plus( translation );

      var delta = endPoint.minus( startPoint );
      var angle = delta.angle();

      // TODO: what is happening here?
      endPoint = startPoint.plus( Vector2.createPolar( DISTANCE_BETWEEN_VERTICES, angle - Math.PI * 0.3975 ) );

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