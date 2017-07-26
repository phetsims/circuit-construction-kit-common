// Copyright 2016-2017, University of Colorado Boulder

/**
 * Light bulb, made to 'glow' by modulating opacity of the 'on' image. Forked from SCENERY_PHET/LightBulbNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Util = require( 'DOT/Util' );
  var Shape = require( 'KITE/Shape' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Node = require( 'SCENERY/nodes/Node' );
  var LightRaysNode = require( 'SCENERY_PHET/LightRaysNode' );

  // images
  var backImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightbulb-back.png' );
  var highResistanceSocketImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightbulb-front-high.png' );
  var socketImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightbulb-front.png' );
  var middleImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightbulb-middle.png' );

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

    options = _.extend( {
      baseOnly: false,
      highResistance: true
    }, options );

    // @private (read-only) {boolean]
    this.baseOnly = options.baseOnly;

    var selectedSocketImage = options.highResistance ? highResistanceSocketImage : socketImage;

    // @private {Image}
    self.backNode = new Image( options.baseOnly ? selectedSocketImage : backImage, {
      scale: BULB_IMAGE_SCALE,
      centerX: 0,
      bottom: 0,
      pickable: false
    } );

    var middleNode = new Image( options.baseOnly ? selectedSocketImage : middleImage, {
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

      // Show the rays here where they can be easily positioned, but only when more than the base is showing
      var bulbRadius = middleNode.width / 2;
      self.raysNode = new LightRaysNode( bulbRadius, {
        x: this.backNode.centerX,
        y: (middleNode.top + bulbRadius) * options.scale
      } ); // @private
      self.raysNode.mutate( options );

      options.children = [ self.backNode, middleNode ];
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
          this.backNode.imageOpacity = Util.clamp( Util.linear( 0, 0.5, 0, 1, brightness ), 0, 1 );
        }
        this.raysNode.setBrightness( brightness );
      }
    },

    /**
     * @override update when this node becomes visible
     * @param {boolean} visible
     * @public
     */
    setVisible: function( visible ) {
      var wasVisible = this.visible;
      Node.prototype.setVisible.call( this, visible );
      if ( !wasVisible && visible ) {
        this.update();
      }
    }
  }, {

    /**
     * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
     * @public
     */
    webglSpriteNodes: [
      new Image( backImage ),
      new Image( middleImage ),
      new Image( socketImage ),
      new Image( highResistanceSocketImage ) ]
  } );
} );