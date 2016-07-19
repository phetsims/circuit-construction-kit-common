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

    this.innerLength = 200;
  }

  circuitConstructionKitCommon.register( 'LightBulb', LightBulb );

  return inherit( FixedLengthCircuitElement, LightBulb, {
    toStateObjectWithVertexIndices: function( getVertexIndex ) {
      return _.extend( { resistance: this.resistance }, FixedLengthCircuitElement.prototype.toStateObjectWithVertexIndices.call( this, getVertexIndex ) );
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

      var points = [
        this.startVertex.position,
        this.startVertex.position.plusXY( 0, -70 ),
        this.endVertex.position
      ];
      if ( distanceAlongWire < this.innerLength / 2 ) {
        var a = Util.linear( 0, this.innerLength / 2, 0, 1, distanceAlongWire );
        return points[ 0 ].blend( points[ 1 ], a );
      }
      else {
        var b = Util.linear( this.innerLength / 2, this.innerLength, 0, 1, distanceAlongWire );
        return points[ 1 ].blend( points[ 2 ], b );
      }
    },
    containsScalarLocation: function( s ) {
      return s >= 0 && s <= this.innerLength;
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