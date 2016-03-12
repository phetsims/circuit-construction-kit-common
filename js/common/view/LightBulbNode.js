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
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var FixedLengthCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/FixedLengthCircuitElementNode' );

  // images
  var lightBulbImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/light-bulb.png' );

  /**
   *
   * @constructor
   */
  function LightBulbNode( circuitNode, lightBulb ) {
    this.lightBulb = lightBulb;
    FixedLengthCircuitElementNode.call( this, circuitNode, lightBulb, lightBulbImage, 0.7 );
  }

  circuitConstructionKitBasics.register( 'LightBulbNode', LightBulbNode );

  return inherit( FixedLengthCircuitElementNode, LightBulbNode );
} );