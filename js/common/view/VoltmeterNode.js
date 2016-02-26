// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Node = require( 'SCENERY/nodes/Node' );

  // images
  var voltmeterBody = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/voltmeter_body.png' );

  function VoltmeterNode() {
    Node.call( this, {
      children: [ new Image( voltmeterBody ) ]
    } );
  }

  circuitConstructionKitBasics.register( 'VoltmeterNode', VoltmeterNode );

  return inherit( Node, VoltmeterNode, {} );
} );