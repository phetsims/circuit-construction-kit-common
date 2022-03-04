// Copyright 2016-2022, University of Colorado Boulder

/**
 * Light bulb, made to 'glow' by modulating opacity of the 'on' image. Forked from SCENERY_PHET/LightBulbNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Utils from '../../../dot/js/Utils.js';
import { Shape } from '../../../kite/js/imports.js';
import merge from '../../../phet-core/js/merge.js';
import LightRaysNode from '../../../scenery-phet/js/LightRaysNode.js';
import { Image } from '../../../scenery/js/imports.js';
import { Node } from '../../../scenery/js/imports.js';
import lightBulbBack_png from '../../images/lightBulbBack_png.js';
import lightBulbFrontHigh_png from '../../images/lightBulbFrontHigh_png.js';
import lightBulbFrontReal_png from '../../images/lightBulbFrontReal_png.js';
import lightBulbFront_png from '../../images/lightBulbFront_png.js';
import lightBulbMiddleReal_png from '../../mipmaps/lightBulbMiddleReal_png.js';
import lightBulbMiddle_png from '../../mipmaps/lightBulbMiddle_png.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

// constants
const BULB_IMAGE_SCALE = 0.125;

class CustomLightBulbNode extends Node {
  private readonly baseOnly: boolean;
  private readonly backNode: Node;
  private readonly raysNode: LightRaysNode | null;
  private readonly brightnessProperty: Property<number>;
  private readonly brightnessObserver: ( ( brightness: number ) => void ) | null;
  private readonly disposeCustomLightBulbNode: () => void;
  static webglSpriteNodes: Image[];

  /**
   * @param {Property.<number>} brightnessProperty 0 (off) to 1 (full brightness)
   * @param {Object} [providedOptions]
   */
  constructor( brightnessProperty: Property<number>, providedOptions?: any ) {
    assert && assert( brightnessProperty, 'brightness property should exist' );

    providedOptions = merge( {
      baseOnly: false,
      highResistance: true,
      scale: CCKCConstants.BULB_SCALE,
      real: false
    }, providedOptions );

    const baseOnly = providedOptions.baseOnly;

    const selectedSocketImage = providedOptions.highResistance ? lightBulbFrontHigh_png :
                                providedOptions.real ? lightBulbFrontReal_png :
                                lightBulbFront_png;

    const selectedMiddleImage = providedOptions.real ? lightBulbMiddleReal_png :
                                lightBulbMiddle_png;

    const backNode = new Image( providedOptions.baseOnly ? selectedSocketImage : lightBulbBack_png, {
      scale: BULB_IMAGE_SCALE,
      centerX: 0,
      bottom: 0,
      pickable: false
    } );

    const middleNode = new Image( providedOptions.baseOnly ? selectedSocketImage :
                                  selectedMiddleImage, {
      scale: BULB_IMAGE_SCALE,
      centerBottom: backNode.centerBottom,
      pickable: false
    } );

    let raysNode = null;

    // If it is only for showing the socket, omit the rays
    if ( providedOptions.baseOnly ) {
      providedOptions.children = [ backNode ];
    }
    else {

      // Show the rays here where they can be easily positioned, but only when more than the base is showing
      const bulbRadius = middleNode.width / 2;

      // @private {Node} - displays the light rays, not a child of this node
      raysNode = new LightRaysNode( bulbRadius, {

        // Since the raysNode is rendered in another node (not a child of the CustemLightBulbNode), it needs the same scale
        scale: providedOptions.scale,
        x: backNode.centerX,

        // The scale here seems essential to line up the rays on the bulb, not sure why, see https://github.com/phetsims/circuit-construction-kit-common/issues/397
        y: ( middleNode.top + bulbRadius ) * providedOptions.scale
      } );

      providedOptions.children = [ backNode, middleNode ];
    }

    super( providedOptions );

    // @private {boolean}
    this.baseOnly = baseOnly;

    // @private {Image}
    this.backNode = backNode;

    // @public {LightRaysNode|null}
    this.raysNode = raysNode;

    // @private {Property.<number>} - brightness of the bulb
    this.brightnessProperty = brightnessProperty;

    // If it shows the rays, update their brightness
    if ( !providedOptions.baseOnly ) {

      // @private {function}
      this.brightnessObserver = this.update.bind( this );
      this.brightnessProperty.link( this.brightnessObserver );
    }
    else {
      this.brightnessObserver = null;
    }

    // @private {function} - for disposal
    this.disposeCustomLightBulbNode = () => {
      if ( !providedOptions.baseOnly ) {
        this.brightnessProperty.unlink( this.brightnessObserver! );
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

    // Update this Node when it becomes visible.
    this.visibleProperty.link( ( visible: boolean ) => visible && this.update() );
  }

  /**
   * @public - dispose resources when no longer used
   */
  dispose() {
    this.disposeCustomLightBulbNode();
  }

  /**
   * Move forward in time
   * @param {number} time - total elapsed time in seconds
   * @param {number} dt - seconds since last step
   * @public
   */
  step( time: number, dt: number ) {
    this.update();
  }

  // update when the brightness changes
  update() {
    if ( this.visible && !this.baseOnly ) {
      const brightness = this.brightnessProperty.value;
      assert && assert( brightness >= 0 && brightness <= 1 );
      this.backNode.visible = ( brightness > 0 );
      if ( this.backNode.visible ) {

        // @ts-ignore
        this.backNode.imageOpacity = Utils.clamp( Utils.linear( 0, 0.5, 0, 1, brightness ), 0, 1 );
      }

      assert && assert( this.raysNode );
      if ( this.raysNode ) {
        this.raysNode.setBrightness( brightness );
      }
    }
  }
}

/**
 * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
 * @public {Array.<Image>}
 */
CustomLightBulbNode.webglSpriteNodes = [
  new Image( lightBulbBack_png ),
  new Image( lightBulbMiddle_png ),
  new Image( lightBulbFront_png ),
  new Image( lightBulbFrontHigh_png ) ];

circuitConstructionKitCommon.register( 'CustomLightBulbNode', CustomLightBulbNode );
export default CustomLightBulbNode;