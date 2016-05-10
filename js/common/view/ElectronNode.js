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
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Image = require( 'SCENERY/nodes/Image' );

  var radius = 10;

  //Scale up before rasterization so it won't be too pixellated/fuzzy
  var scale = 2;

  // Copied from John Travoltage
  var minusChargeNode = new Node( {
    children: [
      new Circle( radius, {
        fill: new RadialGradient( 2, -3, 2, 2, -3, 7 )
          .addColorStop( 0, '#4fcfff' )
          .addColorStop( 0.5, '#2cbef5' )
          .addColorStop( 1, '#00a9e8' )
      } ),

      new Rectangle( 0, 0, 11, 2, {
        fill: 'white',
        centerX: 0,
        centerY: 0
      } )
    ], scale: scale
  } );
  minusChargeNode.top = 0;
  minusChargeNode.left = 0;

  var node = new Node();
  minusChargeNode.toImage( function( im ) {

    //Scale back down so the image will be the desired size
    node.children = [ new Image( im, { scale: 1.0 / scale } ) ];
  }, 0, 0, minusChargeNode.width, minusChargeNode.height );

  function ElectronNode( electron ) {
    var electronNode = this;
    Node.call( this, {
      children: [ node ],
      pickable: false
    } );
    electron.positionProperty.link( function( position ) {
      electronNode.center = position;
    } );
  }

  circuitConstructionKit.register( 'ElectronNode', ElectronNode );

  return inherit( Node, ElectronNode );
} );