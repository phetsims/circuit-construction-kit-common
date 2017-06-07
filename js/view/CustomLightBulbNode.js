// Copyright 2015-2017, University of Colorado Boulder

/**
 * Light bulb, made to 'glow' by modulating opacity of the 'on' image. Forked from SCENERY_PHET/LightBulbNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Util = require( 'DOT/Util' );
  var LightRaysNode = require( 'SCENERY_PHET/LightRaysNode' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Shape = require( 'KITE/Shape' );

  // images
  var backImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightbulb_back.png' );
  var middleImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightbulb_middle.png' );
  var socketImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightbulb_front.png' );

  // constants
  var BULB_IMAGE_SCALE = 0.125;

  /**
   * @param {Property.<number>} brightnessProperty 0 (off) to 1 (full brightness)
   * @param {Object} [options]
   * @constructor
   */
  function CustomLightBulbNode( brightnessProperty, options ) {
    assert && assert( brightnessProperty, 'brightness property should exist' );
    var self = this;

    options = _.extend( { baseOnly: false }, options );

    // @private (read-only)
    this.baseOnly = options.baseOnly;

    // @private
    self.backNode = new Image( options.baseOnly ? socketImage : backImage, {
      scale: BULB_IMAGE_SCALE,
      centerX: 0,
      bottom: 0,
      pickable: false
    } );

    var middleNode = new Image( options.baseOnly ? socketImage : middleImage, {
      scale: BULB_IMAGE_SCALE,
      centerX: self.backNode.centerX,
      bottom: self.backNode.bottom,
      pickable: false
    } );

    // If it is only for showing the socket, omit the rays
    if ( options.baseOnly ) {
      options.children = [ self.backNode ];
    }
    else {

      // Show the rays
      var bulbRadius = middleNode.width / 2;
      var rayOptions = {
        rayStroke: 'yellow',
        minRays: 8,
        maxRays: 60,
        minRayLength: 0,
        maxRayLength: 200,
        longRayLineWidth: 1.5,
        mediumRayLineWidth: 1,
        shortRayLineWidth: 0.5
      };
      rayOptions.x = this.backNode.centerX;
      rayOptions.y = middleNode.top + bulbRadius;
      self.raysNode = new LightRaysNode( bulbRadius, rayOptions ); // @private

      options.children = [ self.raysNode, self.backNode, middleNode ];
    }

    Node.call( self, options );

    // @private
    self.brightnessProperty = brightnessProperty;

    // If it shows the rays, update their brightness
    if ( !options.baseOnly ) {
      self.brightnessObserver = function() { self.update(); }; // @private
      self.brightnessProperty.link( this.brightnessObserver );
    }

    // @private - for disposal
    this.disposeCustomLightBulbNode = function() {
      if ( !options.baseOnly ) {
        self.brightnessProperty.unlink( self.brightnessObserver );
      }
    };

    // Custom mouse and touch area for the bulb, so it doesn't interfere with the vertices,
    // see https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/5
    var w = this.localBounds.width;
    var h = this.localBounds.height;
    var fractionDown = 0.6; // How far the top part of the bulb extends over the image
    var fractionTrim = 0.1; // How much to trim off of the bottom of the bulb.
    var fractionHorizontalPadding = 0.25;
    this.mouseArea = new Shape()
      .moveTo( this.localBounds.minX, this.localBounds.minY )
      .lineToRelative( w, 0 )
      .lineToRelative( 0, h * fractionDown )
      .lineToRelative( -w * fractionHorizontalPadding, 0 )
      .lineToRelative( 0, h * (1 - fractionDown - fractionTrim) )
      .lineToRelative( -w * (1 - fractionHorizontalPadding * 2), 0 )
      .lineToRelative( 0, -h * (1 - fractionDown - fractionTrim) )
      .lineToRelative( -w * fractionHorizontalPadding, 0 )
      .lineTo( this.localBounds.minX, this.localBounds.minY );
    this.touchArea = this.mouseArea;
  }

  circuitConstructionKitCommon.register( 'CustomLightBulbNode', CustomLightBulbNode );

  return inherit( Node, CustomLightBulbNode, {

    /**
     * @public - dispose resources when no longer used
     */
    dispose: function() {
      this.disposeCustomLightBulbNode();
    },

    /**
     * @private - update when the brightness changes
     */
    update: function() {
      if ( this.visible && !this.baseOnly ) {
        var brightness = this.brightnessProperty.value;
        assert && assert( brightness >= 0 && brightness <= 1 );
        this.backNode.visible = ( brightness > 0 );
        if ( this.backNode.visible ) {
          this.backNode.opacity = Util.clamp( Util.linear( 0, 0.5, 0, 1, brightness ), 0, 1 );
        }
        this.raysNode.setBrightness( brightness );
      }
    },

    /**
     * @override update when this node becomes visible
     * @param visible
     */
    setVisible: function( visible ) {
      var wasVisible = this.visible;
      Node.prototype.setVisible.call( this, visible );
      if ( !wasVisible && visible ) {
        this.update();
      }
    }
  } );
} );