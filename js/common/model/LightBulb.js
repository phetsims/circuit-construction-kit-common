// Copyright 2015, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var FixedLengthComponent = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/FixedLengthComponent' );

  /**
   *
   * @constructor
   */
  function LightBulb( startVertex, endVertex, resistance ) {
    FixedLengthComponent.call( this, 146, startVertex, endVertex, {
      resistance: resistance
    } );
  }

  return inherit( FixedLengthComponent, LightBulb, {
    toStateObjectWithVertexIndices: function( getVertexIndex ) {
      return _.extend( { resistance: this.resistance }, FixedLengthComponent.prototype.toStateObjectWithVertexIndices.call( this, getVertexIndex ) );
    }
  } );
} );