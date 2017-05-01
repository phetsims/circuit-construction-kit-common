// Copyright 2016-2017, University of Colorado Boulder

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
  var Image = require( 'SCENERY/nodes/Image' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  var ElectronChargeNode = require( 'SCENERY_PHET/ElectronChargeNode' );
  var Tandem = require( 'TANDEM/Tandem' );

  // constants
  var ELECTRON_SCALE = 2; // Scale up before rasterization so it won't be too pixellated/fuzzy

  // Copied from John Travoltage
  var MINUS_CHARGE_NODE = new ElectronChargeNode( { scale: ELECTRON_SCALE, top: 0, left: 0 } );

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
    stroke: 'white',
    tandem: Tandem.createStaticTandem( 'arrowNode' )
  } );

  /**
   * @param {Charge} charge - the model element
   * @param {Property.<boolean>} revealingProperty - true if circuit details are being shown
   * @constructor
   */
  function ChargeNode( charge, revealingProperty ) {
    var self = this;

    // @public (read-only) the {Charge} depicted by this node
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

    // When the model position changes, update the node position changes
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