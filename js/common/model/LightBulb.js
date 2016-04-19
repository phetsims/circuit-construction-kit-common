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

  // constants
  var LIGHT_BULB_LENGTH = 60;

  /**
   *
   * @constructor
   */
  function LightBulb( startVertex, endVertex, resistance ) {
    FixedLengthCircuitElement.call( this, LIGHT_BULB_LENGTH, startVertex, endVertex, {
      resistance: resistance
    } );
  }

  return inherit( FixedLengthCircuitElement, LightBulb, {
    toStateObjectWithVertexIndices: function( getVertexIndex ) {
      return _.extend( { resistance: this.resistance }, FixedLengthCircuitElement.prototype.toStateObjectWithVertexIndices.call( this, getVertexIndex ) );
    }
  }, {
    LIGHT_BULB_LENGTH: LIGHT_BULB_LENGTH
  } );
} );