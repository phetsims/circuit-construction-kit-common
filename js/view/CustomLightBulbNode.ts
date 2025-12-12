// Copyright 2016-2025, University of Colorado Boulder

/**
 * Light bulb, made to 'glow' by modulating opacity of the 'on' image. Forked from SCENERY_PHET/LightBulbNode
 *
 * @author Chris Malley (PixelZoom, Inc.)
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type Property from '../../../axon/js/Property.js';
import { clamp } from '../../../dot/js/util/clamp.js';
import { linear } from '../../../dot/js/util/linear.js';
import Shape from '../../../kite/js/Shape.js';
import affirm from '../../../perennial-alias/js/browser-and-node/affirm.js';
import optionize from '../../../phet-core/js/optionize.js';
import LightRaysNode from '../../../scenery-phet/js/LightRaysNode.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Node, { type NodeOptions } from '../../../scenery/js/nodes/Node.js';
import lightBulbBack_png from '../../images/lightBulbBack_png.js';
import lightBulbFront_png from '../../images/lightBulbFront_png.js';
import lightBulbFrontHigh_png from '../../images/lightBulbFrontHigh_png.js';
import lightBulbFrontReal_png from '../../images/lightBulbFrontReal_png.js';
import lightBulbMiddle_png from '../../mipmaps/lightBulbMiddle_png.js';
import lightBulbMiddleReal_png from '../../mipmaps/lightBulbMiddleReal_png.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

// constants
const BULB_IMAGE_SCALE = 0.125;

type SelfOptions = {
  baseOnly?: boolean;
  isExtreme?: boolean;
  isReal?: boolean;
  scale?: number; // Note this differs from NodeOptions['scale']
};
type CustomLightBulbNodeOptions = SelfOptions & NodeOptions;

export default class CustomLightBulbNode extends Node {
  private readonly baseOnly: boolean;
  private readonly backNode: Image;
  public readonly raysNode: LightRaysNode | null;
  private readonly brightnessProperty: Property<number>;
  private readonly brightnessObserver: ( ( brightness: number ) => void ) | null;
  private readonly disposeCustomLightBulbNode: () => void;

  /**
   * @param brightnessProperty 0 (off) to 1 (full brightness)
   * @param [providedOptions]
   */
  public constructor( brightnessProperty: Property<number>, providedOptions?: CustomLightBulbNodeOptions ) {
    affirm( brightnessProperty, 'brightness property should exist' );

    const options = optionize<CustomLightBulbNodeOptions, SelfOptions, NodeOptions>()( {
      baseOnly: false,
      isExtreme: true,
      scale: CCKCConstants.BULB_SCALE,
      isReal: false
    }, providedOptions );

    const baseOnly = options.baseOnly;

    const selectedSocketImage = options.isExtreme ? lightBulbFrontHigh_png :
                                options.isReal ? lightBulbFrontReal_png :
                                lightBulbFront_png;

    const selectedMiddleImage = options.isReal ? lightBulbMiddleReal_png :
                                lightBulbMiddle_png;

    const backNode = new Image( options.baseOnly ? selectedSocketImage : lightBulbBack_png, {
      scale: BULB_IMAGE_SCALE,
      centerX: 0,
      bottom: 0,
      pickable: false
    } );

    const middleNode = new Image( options.baseOnly ? selectedSocketImage :
                                  selectedMiddleImage, {
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

      // {Node} - displays the light rays, not a child of this node
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

    // brightness of the bulb
    this.brightnessProperty = brightnessProperty;

    // If it shows the rays, update their brightness
    if ( !options.baseOnly ) {

      this.brightnessObserver = this.update.bind( this );
      this.brightnessProperty.link( this.brightnessObserver );
    }
    else {
      this.brightnessObserver = null;
    }

    this.disposeCustomLightBulbNode = () => {
      if ( !options.baseOnly ) {
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

  public override dispose(): void {
    this.disposeCustomLightBulbNode();
  }

  /**
   * Move forward in time
   * @param time - total elapsed time in seconds
   * @param dt - seconds since last step
   */
  private step( time: number, dt: number ): void {
    this.update();
  }

  // update when the brightness changes
  private update(): void {
    if ( this.visible && !this.baseOnly ) {
      const brightness = this.brightnessProperty.value;
      affirm( brightness >= 0 && brightness <= 1 );
      this.backNode.visible = ( brightness > 0 );
      if ( this.backNode.visible ) {
        this.backNode.imageOpacity = clamp( linear( 0, 0.5, 0, 1, brightness ), 0, 1 );
      }

      affirm( this.raysNode );
      if ( this.raysNode ) {
        this.raysNode.setBrightness( brightness );
      }
    }
  }
}

circuitConstructionKitCommon.register( 'CustomLightBulbNode', CustomLightBulbNode );