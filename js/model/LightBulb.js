// Copyright 2015-2017, University of Colorado Boulder

/**
 * The LightBulb is a CircuitElement that shines when current flows through it.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var NumberProperty = require( 'AXON/NumberProperty' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedLengthCircuitElement' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Vertex' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitElementViewType' );

  // constants

  // The distance (as the crow flies) between start and end vertex
  var DISTANCE_BETWEEN_VERTICES = 36;

  // Tinker with coordinates to get thing to match up
  var LEFT_CURVE_X_SCALE = 1.5;
  var TOP_Y_SCALE = 0.6;
  var RIGHT_CURVE_X_SCALE = 0.87;

  // The sampled points for the wire/filament curves
  var LIFELIKE_SAMPLE_POINTS = [
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

  var SCHEMATIC_SAMPLE_POINTS = [
    new Vector2( 0.50, 2.06 ),                                            // bottom left
    new Vector2( 0.50, 0.34 ),                                            // top left
    new Vector2( 0.89, 0.34 ),                                            // top right
    new Vector2( 0.89, 1.474 )                                            // bottom right
  ];

  /**
   * @param {Vertex} startVertex - the side Vertex
   * @param {Vertex} endVertex - the bottom Vertex
   * @param {number} resistance - in ohms
   * @param {Tandem} tandem
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Object} [options]
   * @constructor
   */
  function LightBulb( startVertex, endVertex, resistance, viewTypeProperty, tandem, options ) {
    options = _.extend( { highResistance: false }, options );

    // @public (read-only) {boolean} - true if the light bulb is a high resistance light bulb
    this.highResistance = options.highResistance;

    // @public {Property.<number>} - the resistance of the light bulb which can be edited with the UI
    this.resistanceProperty = new NumberProperty( resistance );

    // @private (read-only) {Vector2} the vector between the vertices
    this.vertexDelta = endVertex.positionProperty.get().minus( startVertex.positionProperty.get() );

    // @private
    this.viewTypeProperty = viewTypeProperty;

    FixedLengthCircuitElement.call(
      this,
      startVertex,
      endVertex,
      DISTANCE_BETWEEN_VERTICES,
      this.getPathLength( startVertex ),
      tandem,
      options
    );

    // @public (read-only) {number} - the number of decimal places to show in readouts and controls
    this.numberOfDecimalPlaces = this.highResistance ? 0 : 1;
  }

  circuitConstructionKitCommon.register( 'LightBulb', LightBulb );

  return inherit( FixedLengthCircuitElement, LightBulb, {

    /**
     * Updates the charge path length when the view changes between lifelike/schematic
     * @public
     */
    updatePathLength: function() {
      this.chargePathLength = this.getPathLength( this.startVertexProperty.value );
    },

    /**
     * Determine the new path length
     * @param {Vertex} startVertex
     * @returns {number}
     * @private
     */
    getPathLength: function( startVertex ) {
      var pathLength = 0;
      var samplePoints = this.viewTypeProperty.value === CircuitElementViewType.LIFELIKE ? LIFELIKE_SAMPLE_POINTS : SCHEMATIC_SAMPLE_POINTS;
      for ( var i = 0; i < samplePoints.length - 1; i++ ) {
        var point1 = this.getFilamentPathPoint( i, startVertex, samplePoints );
        var point2 = this.getFilamentPathPoint( i + 1, startVertex, samplePoints );
        pathLength += point2.distance( point1 );
      }
      return pathLength;
    },

    /**
     * Returns true because all light bulbs can have their resistance changed.
     * @returns {boolean}
     * @public
     */
    isResistanceEditable: function() {
      return true;
    },

    /**
     * Maps from the "as the crow flies" path to the circuitous path.
     *
     * @param {number} index
     * @param {Vertex} startVertex
     * @param {Vector2[]} samplePoints - the array of points to use for sampling
     * @returns {Vector2}
     * @private
     */
    getFilamentPathPoint: function( index, startVertex, samplePoints ) {
      var point = samplePoints[ index ];

      var vertexX = startVertex.positionProperty.get().x;
      var vertexY = startVertex.positionProperty.get().y;

      var startPoint = samplePoints[ 0 ];
      var endPoint = samplePoints[ samplePoints.length - 1 ];

      var x = Util.linear( startPoint.x, endPoint.x, vertexX, vertexX + this.vertexDelta.x, point.x );
      var y = Util.linear( startPoint.y, endPoint.y, vertexY, vertexY + this.vertexDelta.y, point.y );

      return new Vector2( x, y );
    },

    /**
     * Get the properties so that the circuit can be solved when changed.
     * @override
     * @returns {Property.<*>[]}
     * @public
     */
    getCircuitProperties: function() {
      return [ this.resistanceProperty ];
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

      var parentPositionAndAngle = FixedLengthCircuitElement.prototype.getPositionAndAngle.call( this, distanceAlongWire );

      var previousAccumulatedDistance = 0;
      var accumulatedDistance = 0;
      var samplePoints = this.viewTypeProperty.value === CircuitElementViewType.LIFELIKE ? LIFELIKE_SAMPLE_POINTS : SCHEMATIC_SAMPLE_POINTS;
      for ( var i = 0; i < samplePoints.length - 1; i++ ) {
        var point1 = this.getFilamentPathPoint( i, this.startVertexProperty.get(), samplePoints );
        var point2 = this.getFilamentPathPoint( i + 1, this.startVertexProperty.get(), samplePoints );

        accumulatedDistance += point2.distance( point1 );

        // Find what segment the charge is in
        if ( distanceAlongWire <= accumulatedDistance ) {

          // Choose the right point along the segment
          var fractionAlongSegment = Util.linear( previousAccumulatedDistance, accumulatedDistance, 0, 1, distanceAlongWire );
          var positionAlongSegment = point1.blend( point2, fractionAlongSegment );

          // rotate the point about the start vertex
          var startPoint = this.startPositionProperty.get();
          var vertexDelta = this.endPositionProperty.get().minus( startPoint );
          var relativeAngle = vertexDelta.angle() - this.vertexDelta.angle();
          var position = positionAlongSegment.rotatedAboutPoint( startPoint, relativeAngle );
          var angle = point2.minus( point1 ).angle();

          return {
            position: position,
            angle: angle + parentPositionAndAngle.angle + 0.7851354708011367 // sampled from createAtPosition
          };
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
     * @param {number} resistance
     * @param {Property.<CircuitElementViewType>} viewTypeProperty
     * @param {Tandem} tandem
     * @param {Object} [options]
     * @returns {LightBulb}
     * @public
     */
    createAtPosition: function( position, circuitVertexGroupTandem, resistance, viewTypeProperty, tandem, options ) {

      options = options || {};
      var translation = new Vector2( 19, 10 );

      // Connect at the side and bottom
      var startPoint = new Vector2( position.x - DISTANCE_BETWEEN_VERTICES / 2, position.y ).plus( translation );
      var endPoint = new Vector2( position.x, position.y + DISTANCE_BETWEEN_VERTICES / 4 ).plus( translation );

      var delta = endPoint.minus( startPoint );
      var angle = delta.angle();

      // Position the vertices so the light bulb is upright
      endPoint = startPoint.plus( Vector2.createPolar( DISTANCE_BETWEEN_VERTICES, angle - Math.PI * 0.3975 ) );

      // start vertex is at the bottom
      var startVertex = new Vertex( startPoint, {
        tandem: circuitVertexGroupTandem.createNextTandem()
      } );
      var endVertex = new Vertex( endPoint, {
        tandem: circuitVertexGroupTandem.createNextTandem()
      } );

      return new LightBulb( startVertex, endVertex, resistance, viewTypeProperty, tandem, options );
    }
  } );
} );