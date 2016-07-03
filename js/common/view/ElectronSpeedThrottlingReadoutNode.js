// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );

  function ElectronSpeedThrottlingReadoutNode( timeScaleProperty ) {
    var electronSpeedThrottlingReadoutNode = this;
    var text = new Text( 'Animation speed limit reached! Simulation speed reduced to < 1% normal.', { fontSize: 26 } );
    Node.call( this, {
      children: [
        text
      ]
    } );
    timeScaleProperty.link( function( timeScale ) {
      var readout = (timeScale * 100);
      var fixed = Util.toFixed( readout, 0 );
      if ( timeScale < 0.01 ) {
        fixed = '< 1';
      }
      text.setText( 'Animation speed limit reached! Simulation speed reduced to ' + fixed + '% normal.' );
      electronSpeedThrottlingReadoutNode.visible = timeScale < 1;
    } );
  }

  circuitConstructionKit.register( 'ElectronSpeedThrottlingReadoutNode', ElectronSpeedThrottlingReadoutNode );

  return inherit( Node, ElectronSpeedThrottlingReadoutNode, {} );
} );