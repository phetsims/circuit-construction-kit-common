// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var Property = require( 'AXON/Property' );

  function ElectronSpeedThrottlingReadoutNode( timeScaleProperty, showElectronsProperty, exploreScreenRunningProperty ) {
    var self = this;
    var text = new Text( 'Animation speed limit reached! Simulation speed reduced to < 1% normal.', { fontSize: 26 } );
    Node.call( this, {
      children: [
        text
      ]
    } );

    Property.multilink( [ timeScaleProperty, showElectronsProperty, exploreScreenRunningProperty ], function( timeScale, showElectrons, exploreScreenRunning ) {
      var readout = (timeScale * 100);
      var fixed = Util.toFixed( readout, 0 );
      var isThrottled = fixed !== '100';
      if ( timeScale < 0.01 ) {
        fixed = '< 1';
      }
      text.setText( 'Animation speed limit reached! Simulation speed reduced to ' + fixed + '% normal.' );

      // Only show the throttling message if the speed is less than 100% and electrons are visible
      self.visible = isThrottled && showElectrons && exploreScreenRunning;
    } );
  }

  circuitConstructionKitCommon.register( 'ElectronSpeedThrottlingReadoutNode', ElectronSpeedThrottlingReadoutNode );

  return inherit( Node, ElectronSpeedThrottlingReadoutNode, {} );
} );