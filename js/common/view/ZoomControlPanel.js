// Copyright 2017, University of Colorado Boulder

/**
 * The panel that appears in the bottom left which can be used to zoom in and out on the circuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var ZoomButton = require( 'SCENERY_PHET/buttons/ZoomButton' );

  // constants
  var ZOOMED_IN = 1;
  var ZOOMED_OUT = 0.5;

  /**
   * @param {Property} selectedZoomProperty
   * @constructor
   */
  function ZoomControlPanel( selectedZoomProperty ) {
    var zoomOutButton = new ZoomButton( {
      in: false,
      listener: function() {
        selectedZoomProperty.set( ZOOMED_OUT );
      }
    } );
    var zoomInButton = new ZoomButton( {
      in: true,
      listener: function() {
        selectedZoomProperty.set( ZOOMED_IN );
      }
    } );
    HBox.call( this, {
      spacing: 12,
      children: [
        zoomOutButton,
        zoomInButton
      ]
    } );
    selectedZoomProperty.link( function( zoomLevel ) {
      zoomInButton.setEnabled( zoomLevel === ZOOMED_OUT );
      zoomOutButton.setEnabled( zoomLevel === ZOOMED_IN );
    } );
  }

  circuitConstructionKitCommon.register( 'ZoomControlPanel', ZoomControlPanel );

  return inherit( HBox, ZoomControlPanel );
} );