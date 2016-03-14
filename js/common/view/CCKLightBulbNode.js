// Copyright 2015, University of Colorado Boulder

/**
 * Named CCKLightBulbNode to avoid collisions with SCENERY_PHET/LightBulbNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var FixedLengthCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/FixedLengthCircuitElementNode' );
  var LightBulbNode = require( 'SCENERY_PHET/LightBulbNode' );
  var Property = require( 'AXON/Property' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Util = require( 'DOT/Util' );

  // images
  var lightBulbImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/light-bulb.png' );

  /**
   *
   * @constructor
   */
  function CCKLightBulbNode( circuitConstructionKitBasicsScreenView, circuitNode, lightBulb ) {
    this.lightBulb = lightBulb;
    var imageNode = new Image( lightBulbImage );
    var brightnessProperty = new Property( 0.0 );
    lightBulb.currentProperty.link( function( current ) {
      var scaled = Math.abs( current ) / 20;
      var clamped = Util.clamp( scaled, 0, 1 );
      brightnessProperty.value = clamped;
    } );
    imageNode.addChild( new LightBulbNode( brightnessProperty, {
      scale: 3.5,
      centerX: imageNode.width / 2,
      centerY: imageNode.height / 2
    } ) );
    FixedLengthCircuitElementNode.call( this, circuitConstructionKitBasicsScreenView, circuitNode, lightBulb, imageNode, 0.7 );
  }

  circuitConstructionKitBasics.register( 'CCKLightBulbNode', CCKLightBulbNode );

  return inherit( FixedLengthCircuitElementNode, CCKLightBulbNode );
} );