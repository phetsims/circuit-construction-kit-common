// Copyright 2018-2021, University of Colorado Boulder

/**
 * Uses a cubic easing to interpolate the zoom. Forked and pruned from EaseAnimation.js which was unstable
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */

import Easing from '../../../twixt/js/Easing.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

// constants
const ZOOM_ANIMATION_TIME = 0.35; // seconds

class ZoomAnimation {

  private readonly easing: Easing;
  private ratio: number;
  private readonly totalDelta: number;
  private readonly zoomCallback: ( delta: number ) => void;

  /**
   * @param {number} initialZoom
   * @param {number} targetZoom
   * @param {function} zoomCallback
   */
  constructor( initialZoom: number, targetZoom: number, zoomCallback: ( delta: number ) => void ) {
    this.easing = Easing.CUBIC_IN_OUT;
    this.ratio = 0;
    this.totalDelta = targetZoom - initialZoom;
    this.zoomCallback = zoomCallback;
  }

  /**
   * @param {number} dt - elapsed time in seconds
   * @public
   */
  step( dt: number ) {
    const oldRatio = this.ratio;

    if ( oldRatio < 1 ) {
      let newRatio = oldRatio + dt / ZOOM_ANIMATION_TIME;
      if ( newRatio > 1 ) {
        newRatio = 1;
      }
      this.ratio = newRatio;
      const ratioDelta = Easing.CUBIC_IN_OUT.value( newRatio ) - Easing.CUBIC_IN_OUT.value( oldRatio );
      this.zoomCallback( ratioDelta * this.totalDelta );
      return newRatio;
    }
    else {
      return oldRatio;
    }
  }
}

circuitConstructionKitCommon.register( 'ZoomAnimation', ZoomAnimation );
export default ZoomAnimation;