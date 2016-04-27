// Copyright 2015-2016, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/FixedLengthCircuitElement' );
  var Vector2 = require( 'DOT/Vector2' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Vertex' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );

  // constants
  var DISTANCE_BETWEEN_VERTICES = 33;

  /**
   *
   * @constructor
   */
  function LightBulb( startVertex, endVertex, resistance, options ) {
    FixedLengthCircuitElement.call( this, DISTANCE_BETWEEN_VERTICES, startVertex, endVertex, {
      resistance: resistance
    }, options );
  }

  return inherit( FixedLengthCircuitElement, LightBulb, {
    toStateObjectWithVertexIndices: function( getVertexIndex ) {
      return _.extend( { resistance: this.resistance }, FixedLengthCircuitElement.prototype.toStateObjectWithVertexIndices.call( this, getVertexIndex ) );
    }
  }, {
    DISTANCE_BETWEEN_VERTICES: DISTANCE_BETWEEN_VERTICES,
    createAtPosition: function( position, options ) {
      var translation = new Vector2( 30, 10 );

      // Connect at the side and bottom
      var lightBulbLength = LightBulb.DISTANCE_BETWEEN_VERTICES;
      var startPoint = new Vector2( position.x - lightBulbLength / 2, position.y ).plus( translation );
      var endPoint = new Vector2( position.x, position.y + lightBulbLength / 4 ).plus( translation );

      var delta = endPoint.minus( startPoint );
      var angle = delta.angle();

      endPoint = startPoint.plus( Vector2.createPolar( LightBulb.DISTANCE_BETWEEN_VERTICES, angle - Math.PI * 0.3975 ) );

      var startVertex = new Vertex( startPoint.x, startPoint.y );
      var endVertex = new Vertex( endPoint.x, endPoint.y );

      return new LightBulb( startVertex, endVertex, CircuitConstructionKitBasicsConstants.defaultResistance, options );
    }
  } );
} );