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
  var ElectronChargeNode = require( 'SCENERY_PHET/ElectronChargeNode' );
  var Tandem = require( 'TANDEM/Tandem' );
  var ConventionalCurrentArrowNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ConventionalCurrentArrowNode' );

  // constants
  var ELECTRON_SCALE = 2; // Scale up before rasterization so it won't be too pixellated/fuzzy

  // Copied from John Travoltage
  var MINUS_CHARGE_NODE = new ElectronChargeNode( { scale: ELECTRON_SCALE, top: 0, left: 0 } );

  var ELECTRON_IMAGE_NODE = new Node(); // TODO: use better startup strategy, see init()

  var ARROW_NODE = new ConventionalCurrentArrowNode( Tandem.createStaticTandem( 'arrowNode' ) );

  /**
   * @param {Charge} charge - the model element
   * @param {Property.<boolean>} revealingProperty - true if circuit details are being shown
   * @constructor
   */
  function ChargeNode( charge, revealingProperty ) {
    var self = this;

    // @public (read-only) {Charge} - the model depicted by this node
    this.charge = charge;

    var child = charge.charge > 0 ? ARROW_NODE : ELECTRON_IMAGE_NODE;
    Node.call( this, {
      children: [ child ],
      pickable: false
    } );
    var outsideOfBlackBoxProperty = new BooleanProperty( false );

    // Update the visibility accordingly.  A multilink will not work because the charge circuitElement changes.
    var updateVisible = function() {
      self.visible = charge.visibleProperty.get() &&
                     (outsideOfBlackBoxProperty.get() || revealingProperty.get()) &&
                     ( Math.abs( charge.circuitElement.currentProperty.get() ) > 1E-6 || charge.charge < 0 );
    };

    // When the model position changes, update the node position changes
    var updateTransform = function() {
      var current = charge.circuitElement.currentProperty.get();
      var position = charge.positionProperty.get();
      self.setTranslation( position.x, position.y );
      if ( charge.charge > 0 ) {
        self.rotation = charge.charge < 0 ? 0 : charge.angleProperty.get() + (current < 0 ? Math.PI : 0);
      }
      updateVisible();
      outsideOfBlackBoxProperty.set( !charge.circuitElement.insideTrueBlackBoxProperty.get() );
    };
    charge.angleProperty.link( updateTransform );
    charge.positionProperty.link( updateTransform );
    revealingProperty.link( updateVisible );
    charge.visibleProperty.link( updateVisible );
    outsideOfBlackBoxProperty.link( updateVisible );

    var disposeChargeNode = function() {
      self.detach();
      charge.positionProperty.unlink( updateTransform );
      charge.angleProperty.unlink( updateTransform );
      revealingProperty.unlink( updateVisible );
      charge.visibleProperty.unlink( updateVisible );
      outsideOfBlackBoxProperty.unlink( updateVisible );

      // We must remove the image child node, or it will continue to track its parents and lead to a memory leak
      self.removeAllChildren();
    };
    charge.disposeEmitter.addListener( disposeChargeNode );
  }

  circuitConstructionKitCommon.register( 'ChargeNode', ChargeNode );

  return inherit( Node, ChargeNode, {}, {
    init: function( callback ) {
      MINUS_CHARGE_NODE.toImage( function( im ) {

        // Scale back down so the image will be the desired size
        var image = new Image( im, {
          scale: 1.0 / ELECTRON_SCALE,
          imageOpacity: 0.75// use imageOpacity for a significant performance boost, see https://github.com/phetsims/circuit-construction-kit-common/issues/293
        } );
        ELECTRON_IMAGE_NODE.children = [ image ];

        // Center it so that animation doesn't require getCenter
        ELECTRON_IMAGE_NODE.translate( -MINUS_CHARGE_NODE.width / 2 / ELECTRON_SCALE, -MINUS_CHARGE_NODE.height / 2 / ELECTRON_SCALE );
        callback();
      }, 0, 0, MINUS_CHARGE_NODE.width, MINUS_CHARGE_NODE.height );
    }
  } );
} );