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

  function ElectronSpeedThrottlingReadoutNode( stringProperty ) {
    var electronSpeedThrottlingReadoutNode = this;
    var text = new Text( 'Animation speed limit reached! Simulation speed reduced to < 1% normal.', { fontSize: 32 } );
    Node.call( this, {
      children: [
        text
      ]
    } );
    stringProperty.link( function( string ) {
      text.setText( 'Animation speed limit reached! Simulation speed reduced to ' + string + '% normal.' );
      electronSpeedThrottlingReadoutNode.visible = string !== '100.00';
    } );
  }

  circuitConstructionKit.register( 'ElectronSpeedThrottlingReadoutNode', ElectronSpeedThrottlingReadoutNode );

  return inherit( Node, ElectronSpeedThrottlingReadoutNode, {} );
} );