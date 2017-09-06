// Copyright 2017, University of Colorado Boulder

/**
 * The panel that appears in the bottom left which can be used to zoom in and out on the circuit. Exists for the life
 * of the sim and hence does not require a dispose implementation.
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
  var Tandem = require( 'TANDEM/Tandem' );

  // constants
  var ZOOMED_IN = 1;
  var ZOOMED_OUT = 0.5;
  var BUTTON_SPACING = 12;

  /**
   * @param {Property.<number>} selectedZoomProperty
   * @param {Object} [options]
   * @constructor
   */
  function ZoomControlPanel( selectedZoomProperty, options ) {
    options = _.extend( {
      spacing: BUTTON_SPACING,
      tandem: Tandem.tandemRequired()
    }, options );
    var zoomOutButton = new ZoomButton( {
      in: false,
      touchAreaXDilation: BUTTON_SPACING / 2,
      touchAreaYDilation: BUTTON_SPACING / 2,
      listener: function() {
        selectedZoomProperty.set( ZOOMED_OUT );
      },
      tandem: options.tandem.createTandem( 'zoomOutButton' )
    } );
    var zoomInButton = new ZoomButton( {
      in: true,
      touchAreaXDilation: BUTTON_SPACING / 2,
      touchAreaYDilation: BUTTON_SPACING / 2,
      listener: function() {
        selectedZoomProperty.set( ZOOMED_IN );
      },
      tandem: options.tandem.createTandem( 'zoomInButton' )
    } );
    options.children = [
      zoomOutButton,
      zoomInButton
    ];
    HBox.call( this, options );
    selectedZoomProperty.link( function( zoomLevel ) {
      zoomInButton.setEnabled( zoomLevel === ZOOMED_OUT );
      zoomOutButton.setEnabled( zoomLevel === ZOOMED_IN );
    } );
  }

  circuitConstructionKitCommon.register( 'ZoomControlPanel', ZoomControlPanel );

  return inherit( HBox, ZoomControlPanel, {}, {
    ZOOMED_OUT: ZOOMED_OUT,
    ZOOMED_IN: ZOOMED_IN
  } );
} );