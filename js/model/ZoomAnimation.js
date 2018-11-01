// Copyright 2017, University of Colorado Boulder

/**
 * Uses a cubic easing to interpolate the zoom. Forked and pruned from EaseAnimation.js which was unstable
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Jonathan Olson <jonathan.olson@colorado.edu>
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Easing = require( 'TWIXT/Easing' );
  var inherit = require( 'PHET_CORE/inherit' );

  // constants
  var ZOOM_ANIMATION_TIME = 0.35; // seconds

  /**
   * @param {number} initialZoom
   * @param {number} targetZoom
   * @param {function} zoomCallback
   * @constructor
   */
  function ZoomAnimation( initialZoom, targetZoom, zoomCallback ) {
    this.easing = Easing.CUBIC_IN_OUT;

    this.ratio = 0;
    this.totalDelta = targetZoom - initialZoom;
    this.zoomCallback = zoomCallback;
  }

  circuitConstructionKitCommon.register( 'ZoomAnimation', ZoomAnimation );

  return inherit( Object, ZoomAnimation, {

    /**
     * @param {number} dt - elapsed time in seconds
     */
    step: function( dt ) {
      var oldRatio = this.ratio;

      if ( oldRatio < 1 ) {
        var newRatio = oldRatio + dt / ZOOM_ANIMATION_TIME;
        if ( newRatio > 1 ) {
          newRatio = 1;
        }
        this.ratio = newRatio;
        var ratioDelta = Easing.CUBIC_IN_OUT.value( newRatio ) - Easing.CUBIC_IN_OUT.value( oldRatio );
        this.zoomCallback( ratioDelta * this.totalDelta );
      }
    }
  } );
} );