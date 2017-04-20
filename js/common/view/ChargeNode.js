// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Renders a single charge. Electrons are shown as a sphere with a minus sign and conventional current is shown as an
 * arrow.  Electrons are shown when current is zero, but conventional current is not shown for zero current.
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
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );

  // constants
  var ELECTRON_RADIUS = 10; // in view coordinates
  var ELECTRON_SCALE = 2; // Scale up before rasterization so it won't be too pixellated/fuzzy

  // Copied from John Travoltage
  // TODO: Factor out to scenery phet?
  var MINUS_CHARGE_NODE = new Node( {
    children: [
      new Circle( ELECTRON_RADIUS, {
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
    scale: ELECTRON_SCALE,
    boundsMethod: 'none'
  } );
  MINUS_CHARGE_NODE.top = 0;
  MINUS_CHARGE_NODE.left = 0;

  var ELECTRON_IMAGE_NODE = new Node();
  MINUS_CHARGE_NODE.toImage( function( im ) {

    // Scale back down so the image will be the desired size
    ELECTRON_IMAGE_NODE.children = [ new Image( im, { scale: 1.0 / ELECTRON_SCALE } ) ];
  }, 0, 0, MINUS_CHARGE_NODE.width, MINUS_CHARGE_NODE.height );

  // Center arrow so it is easy to rotate
  var ARROW_LENGTH = 23; // view coordinates
  var ARROW_NODE = new ArrowNode( -ARROW_LENGTH / 2, 0, ARROW_LENGTH / 2, 0, {
    headHeight: 10,
    headWidth: 12,
    tailWidth: 3,
    fill: 'red',
    stroke: 'white'
  } );

  function ChargeNode( charge, revealingProperty ) {
    var self = this;
    this.charge = charge;
    Node.call( this, {
      children: [ charge.charge > 0 ? ARROW_NODE : ELECTRON_IMAGE_NODE ],
      pickable: false,
      opacity: 0.75
    } );
    var outsideOfBlackBoxProperty = new BooleanProperty( false );

    // TODO: When I wrote this with Property.multilink, it failed as #172
    var updateVisible = function() {
      self.visible = charge.visibleProperty.value &&
                     (outsideOfBlackBoxProperty.value || revealingProperty.value) &&
                     ( Math.abs( charge.circuitElement.currentProperty.get() ) > 1E-6 || charge.charge < 0 );
    };
    var positionListener = function( position ) {
      var current = charge.circuitElement.currentProperty.get();
      self.center = position;
      self.rotation = charge.charge < 0 ? 0 : charge.angle + (current < 0 ? Math.PI : 0);
      updateVisible();
      outsideOfBlackBoxProperty.value = !charge.circuitElement.insideTrueBlackBoxProperty.get();
    };
    charge.positionProperty.link( positionListener );

    revealingProperty.link( updateVisible );
    charge.visibleProperty.link( updateVisible );
    outsideOfBlackBoxProperty.link( updateVisible );

    var disposeChargeNode = function() {
      self.detach();
      charge.positionProperty.unlink( positionListener );
      charge.disposeEmitter.removeListener( disposeChargeNode );
      revealingProperty.unlink( updateVisible );
      charge.visibleProperty.unlink( updateVisible );
      outsideOfBlackBoxProperty.unlink( updateVisible );

      // We must remove the image child node, or it will continue to track its parents and lead to a memory leak
      self.removeAllChildren();
    };
    charge.disposeEmitter.addListener( disposeChargeNode );
  }

  circuitConstructionKitCommon.register( 'ChargeNode', ChargeNode );

  return inherit( Node, ChargeNode );
} );