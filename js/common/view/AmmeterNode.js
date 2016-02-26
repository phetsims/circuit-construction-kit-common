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
  var ammeterBody = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/ammeter_body.png' );

  function AmmeterNode() {
    Node.call( this, {
      children: [ new Image( ammeterBody ) ]
    } );
  }

  circuitConstructionKitBasics.register( 'AmmeterNode', AmmeterNode );

  return inherit( Node, AmmeterNode, {} );
} );