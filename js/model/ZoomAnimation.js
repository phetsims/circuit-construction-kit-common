// Copyright 2017, University of Colorado Boulder

/**
 * Uses a cubic easing to interpolate the zoom. Forked and pruned from EaseAnimation.js which was unstable
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Easing = require( 'TWIXT/Easing' );

  // constants
  const ZOOM_ANIMATION_TIME = 0.35; // seconds

  class ZoomAnimation {

    /**
     * @param {number} initialZoom
     * @param {number} targetZoom
     * @param {function} zoomCallback
     * @constructor
     */
    class( initialZoom, targetZoom, zoomCallback ) {
      this.easing = Easing.CUBIC_IN_OUT;

      this.ratio = 0;
      this.totalDelta = targetZoom - initialZoom;
      this.zoomCallback = zoomCallback;
    }

    /**
     * @param {number} dt - elapsed time in seconds
     */
    step( dt ) {
      const oldRatio = this.ratio;

      if ( oldRatio < 1 ) {
        let newRatio = oldRatio + dt / ZOOM_ANIMATION_TIME;
        if ( newRatio > 1 ) {
          newRatio = 1;
        }
        this.ratio = newRatio;
        const ratioDelta = Easing.CUBIC_IN_OUT.value( newRatio ) - Easing.CUBIC_IN_OUT.value( oldRatio );
        this.zoomCallback( ratioDelta * this.totalDelta );
      }
    }
  }

  return circuitConstructionKitCommon.register( 'ZoomAnimation', ZoomAnimation );
} );