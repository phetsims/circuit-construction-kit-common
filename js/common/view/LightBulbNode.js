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
  var FixedLengthComponentNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/FixedLengthComponentNode' );

  // images
  var lightBulbImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/light-bulb.png' );

  /**
   *
   * @constructor
   */
  function LightBulbNode( circuitNode, lightBulb ) {
    this.lightBulb = lightBulb;
    FixedLengthComponentNode.call( this, circuitNode, lightBulb, lightBulbImage, 0.7 );
  }

  circuitConstructionKitBasics.register( 'LightBulbNode', LightBulbNode );

  return inherit( FixedLengthComponentNode, LightBulbNode );
} );