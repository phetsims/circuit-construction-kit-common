// Copyright 2016-2017, University of Colorado Boulder

/**
 * This shows a readout that indicates the speed of the simulation is reduced (to prevent a strobe effect).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var Property = require( 'AXON/Property' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  // strings
  var animationSpeedLimitString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/animationSpeedLimit' );

  function ChargeSpeedThrottlingReadoutNode( timeScaleProperty, showCurrentProperty, exploreScreenRunningProperty ) {
    var self = this;
    Text.call( this, animationSpeedLimitString, { fontSize: 26 } );

    Property.multilink( [ timeScaleProperty, showCurrentProperty, exploreScreenRunningProperty ], function( timeScale, showCurrent, exploreScreenRunning ) {
      var percent = timeScale * 100;
      var isThrottled = percent < 99.5;
      var fixed = Util.toFixed( percent, 0 );
      if ( timeScale < 0.01 ) {
        fixed = '< 1';
      }
      self.setText( StringUtils.fillIn( animationSpeedLimitString, { percent: fixed } ) );

      // Only show the throttling message if the speed is less than 100% and charges are visible
      self.visible = isThrottled && showCurrent && exploreScreenRunning;
    } );
  }

  circuitConstructionKitCommon.register( 'ChargeSpeedThrottlingReadoutNode', ChargeSpeedThrottlingReadoutNode );

  return inherit( Text, ChargeSpeedThrottlingReadoutNode );
} );