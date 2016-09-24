// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

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
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Property = require( 'AXON/Property' );

  // constants
  var radius = 10;

  // Scale up before rasterization so it won't be too pixellated/fuzzy
  var scale = 2;

  // Copied from John Travoltage
  var minusChargeNode = new Node( {
    children: [
      new Circle( radius, {
        boundsMethod: 'none',
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
    ],
    scale: scale,
    boundsMethod: 'none'
  } );
  minusChargeNode.top = 0;
  minusChargeNode.left = 0;

  var node = new Node();
  minusChargeNode.toImage( function( im ) {

    //Scale back down so the image will be the desired size
    node.children = [ new Image( im, { scale: 1.0 / scale } ) ];
  }, 0, 0, minusChargeNode.width, minusChargeNode.height );

  function ElectronNode( electron, revealingProperty ) {
    var self = this;
    this.electron = electron;
    Node.call( this, {
      children: [ node ],
      pickable: false
    } );
    var outsideOfBlackBoxProperty = new Property( false );

    var positionListener = function( position ) {
      self.center = position;
      outsideOfBlackBoxProperty.value = !electron.circuitElement.insideTrueBlackBox;
    };
    electron.positionProperty.link( positionListener );

    // TODO: When I wrote this with Property.multilink, it failed as #172
    var updateVisible = function() {
      self.visible = electron.visibleProperty.value && (outsideOfBlackBoxProperty.value || revealingProperty.value);
    };
    revealingProperty.link( updateVisible );
    electron.visibleProperty.link( updateVisible );
    outsideOfBlackBoxProperty.link( updateVisible );

    var disposeListener = function() {
      self.detach();
      electron.positionProperty.unlink( positionListener );
      electron.disposeEmitter.removeListener( disposeListener );
      revealingProperty.unlink( updateVisible );
      electron.visibleProperty.unlink( updateVisible );
      outsideOfBlackBoxProperty.unlink( updateVisible );

      // We must remove the image child node, or it will continue to track its parents and lead to a memory leak
      self.removeAllChildren();
    };
    electron.disposeEmitter.addListener( disposeListener );
  }

  circuitConstructionKitCommon.register( 'ElectronNode', ElectronNode );

  return inherit( Node, ElectronNode );
} );