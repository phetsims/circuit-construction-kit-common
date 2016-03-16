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
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @constructor
   */
  function CCKLightBulbNode( circuitConstructionKitBasicsScreenView, circuitNode, lightBulb, options ) {
    this.lightBulb = lightBulb;
    var brightnessProperty = new Property( 0.0 );
    lightBulb.currentProperty.link( function( current ) {
      var scaled = Math.abs( current ) / 20;
      var clamped = Util.clamp( scaled, 0, 1 );

      // Workaround for SCENERY_PHET/LightBulbNode which shows highlight even for current = 1E-16, so clamp it off
      // see https://github.com/phetsims/scenery-phet/issues/225
      if ( clamped < 1E-6 ) {
        clamped = 0;
      }
      brightnessProperty.value = clamped;
    } );
    var lightBulbNode = new LightBulbNode( brightnessProperty, {
      scale: 3.5
    } );
    var contentScale = 2.5;
    options = _.extend( {
      updateLayout: function( startPosition, endPosition ) {

        // TODO: Duplicated somewhat with FixedLengthCircuitElementNode
        var angle = endPosition.minus( startPosition ).angle(); // TODO: speed up maths
        var dist = startPosition.distance( endPosition );
        // TODO: Simplify this matrix math.
        lightBulbNode.resetTransform();
        lightBulbNode.mutate( {
          scale: contentScale
        } );
        lightBulbNode.rotateAround( new Vector2( 0, 0 ), angle );
        lightBulbNode.x = startPosition.x;
        lightBulbNode.y = startPosition.y;
        lightBulbNode.translate( dist / 2 / contentScale, 10 );
      },
      highlightOptions: {
        centerX: 0,
        bottom: 5 // TODO: this must match the highlight inset
      }
    }, options );
    FixedLengthCircuitElementNode.call( this, circuitConstructionKitBasicsScreenView, circuitNode, lightBulb, lightBulbNode, contentScale, options );
  }

  circuitConstructionKitBasics.register( 'CCKLightBulbNode', CCKLightBulbNode );

  return inherit( FixedLengthCircuitElementNode, CCKLightBulbNode );
} );