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
  var SceneryPhetLightBulb = require( 'SCENERY_PHET/LightBulbNode' );
  var Property = require( 'AXON/Property' );
  var Image = require( 'SCENERY/nodes/Image' );

  // images
  var lightBulbImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/light-bulb.png' );

  /**
   *
   * @constructor
   */
  function LightBulbNode( circuitConstructionKitBasicsScreenView, circuitNode, lightBulb ) {
    this.lightBulb = lightBulb;
    var imageNode = new Image( lightBulbImage );
    imageNode.addChild( new SceneryPhetLightBulb( new Property( 0.5 ), {
      scale: 3.5,
      centerX: imageNode.width / 2,
      centerY: imageNode.height / 2
    } ) );
    FixedLengthCircuitElementNode.call( this, circuitConstructionKitBasicsScreenView, circuitNode, lightBulb, imageNode, 0.7 );
  }

  circuitConstructionKitBasics.register( 'LightBulbNode', LightBulbNode );

  return inherit( FixedLengthCircuitElementNode, LightBulbNode );
} );