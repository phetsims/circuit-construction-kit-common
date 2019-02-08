// Copyright 2016-2017, University of Colorado Boulder

/**
 * Light bulb, made to 'glow' by modulating opacity of the 'on' image. Forked from SCENERY_PHET/LightBulbNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Image = require( 'SCENERY/nodes/Image' );
  const LightRaysNode = require( 'SCENERY_PHET/LightRaysNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Shape = require( 'KITE/Shape' );
  const Util = require( 'DOT/Util' );

  // images
  const backImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightbulb-back.png' );
  const highResistanceSocketImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightbulb-front-high.png' );
  const middleImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightbulb-middle.png' );
  const socketImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightbulb-front.png' );

  // constants
  const BULB_IMAGE_SCALE = 0.125;

  class CustomLightBulbNode extends Node {

    /**
     * @param {Property.<number>} brightnessProperty 0 (off) to 1 (full brightness)
     * @param {Object} [options]
     */
    constructor( brightnessProperty, options ) {
      assert && assert( brightnessProperty, 'brightness property should exist' );

      options = _.extend( {
        baseOnly: false,
        highResistance: true,
        scale: CCKCConstants.BULB_SCALE
      }, options );

      // @private (read-only) {boolean]
      const baseOnly = options.baseOnly;

      const selectedSocketImage = options.highResistance ? highResistanceSocketImage : socketImage;

      // @private {Image}
      const backNode = new Image( options.baseOnly ? selectedSocketImage : backImage, {
        scale: BULB_IMAGE_SCALE,
        centerX: 0,
        bottom: 0,
        pickable: false
      } );

      const middleNode = new Image( options.baseOnly ? selectedSocketImage : middleImage, {
        scale: BULB_IMAGE_SCALE,
        centerBottom: backNode.centerBottom,
        pickable: false
      } );

      let raysNode = null;

      // If it is only for showing the socket, omit the rays
      if ( options.baseOnly ) {
        options.children = [ backNode ];
      }
      else {

        // Show the rays here where they can be easily positioned, but only when more than the base is showing
        const bulbRadius = middleNode.width / 2;

        // @private {Node} - displays the light rays, not a child of this node
        raysNode = new LightRaysNode( bulbRadius, {

          // Since the raysNode is rendered in another node (not a child of the CustemLightBulbNode), it needs the same scale
          scale: options.scale,
          x: backNode.centerX,

          // The scale here seems essential to line up the rays on the bulb, not sure why, see https://github.com/phetsims/circuit-construction-kit-common/issues/397
          y: ( middleNode.top + bulbRadius ) * options.scale
        } );

        options.children = [ backNode, middleNode ];
      }

      super( options );

      this.baseOnly = baseOnly;
      this.backNode = backNode;
      this.raysNode = raysNode;

      // @private {Property.<number>} - brightness of the bulb
      this.brightnessProperty = brightnessProperty;

      // If it shows the rays, update their brightness
      if ( !options.baseOnly ) {

        // @private {function}
        this.brightnessObserver = this.update.bind( this );
        this.brightnessProperty.link( this.brightnessObserver );
      }

      // @private {function} - for disposal
      this.disposeCustomLightBulbNode = () => {
        if ( !options.baseOnly ) {
          this.brightnessProperty.unlink( this.brightnessObserver );
        }
      };

      // Custom mouse and touch area for the bulb, so it doesn't interfere with the vertices,
      // see https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/5
      const w = this.localBounds.width;
      const h = this.localBounds.height;
      const fractionDown = 0.6; // How far the top part of the bulb extends over the image
      const fractionTrim = 0.1; // How much to trim off of the bottom of the bulb.
      const fractionHorizontalPadding = 0.25;
      this.mouseArea = new Shape()
        .moveTo( this.localBounds.minX, this.localBounds.minY )
        .lineToRelative( w, 0 )
        .lineToRelative( 0, h * fractionDown )
        .lineToRelative( -w * fractionHorizontalPadding, 0 )
        .lineToRelative( 0, h * ( 1 - fractionDown - fractionTrim ) )
        .lineToRelative( -w * ( 1 - fractionHorizontalPadding * 2 ), 0 )
        .lineToRelative( 0, -h * ( 1 - fractionDown - fractionTrim ) )
        .lineToRelative( -w * fractionHorizontalPadding, 0 )
        .lineTo( this.localBounds.minX, this.localBounds.minY );
      this.touchArea = this.mouseArea;
    }

    /**
     * @public - dispose resources when no longer used
     */
    dispose() {
      this.disposeCustomLightBulbNode();
    }

    /**
     * @private - update when the brightness changes
     */
    update() {
      if ( this.visible && !this.baseOnly ) {
        const brightness = this.brightnessProperty.value;
        assert && assert( brightness >= 0 && brightness <= 1 );
        this.backNode.visible = ( brightness > 0 );
        if ( this.backNode.visible ) {
          this.backNode.imageOpacity = Util.clamp( Util.linear( 0, 0.5, 0, 1, brightness ), 0, 1 );
        }
        this.raysNode.setBrightness( brightness );
      }
    }

    /**
     * @override update when this node becomes visible
     * @param {boolean} visible
     * @public
     */
    setVisible( visible ) {
      const wasVisible = this.visible;
      super.setVisible( visible );
      if ( !wasVisible && visible ) {
        this.update();
      }
      return this;
    }
  }

  /**
   * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
   * @public {Array.<Image>}
   */
  CustomLightBulbNode.webglSpriteNodes = [
    new Image( backImage ),
    new Image( middleImage ),
    new Image( socketImage ),
    new Image( highResistanceSocketImage ) ];

  return circuitConstructionKitCommon.register( 'CustomLightBulbNode', CustomLightBulbNode );
} );