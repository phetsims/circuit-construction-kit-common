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
  var Image = require( 'SCENERY/nodes/Image' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var ElectronChargeNode = require( 'SCENERY_PHET/ElectronChargeNode' );
  var Tandem = require( 'TANDEM/Tandem' );
  var ConventionalCurrentArrowNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ConventionalCurrentArrowNode' );
  var Matrix3 = require( 'DOT/Matrix3' );

  // constants
  var ELECTRON_CHARGE_NODE = new ElectronChargeNode( { opacity: 0.75, scale: 0.75 } ).toDataURLImageSynchronous();
  var ARROW_NODE = new ConventionalCurrentArrowNode( Tandem.createStaticTandem( 'arrowNode' ) )
    .toDataURLImageSynchronous();

  /**
   * @param {Charge} charge - the model element
   * @param {Property.<boolean>} revealingProperty - true if circuit details are being shown
   * @constructor
   */
  function ChargeNode( charge, revealingProperty ) {
    var self = this;

    // @public (read-only) {Charge} - the model depicted by this node
    this.charge = charge;

    var child = charge.charge > 0 ? ARROW_NODE : ELECTRON_CHARGE_NODE;

    Image.call( this, child.image, {
      pickable: false
    } );
    if ( charge.charge < 0 ) {
      this.setImageOpacity( 0.75 );
    }
    var outsideOfBlackBoxProperty = new BooleanProperty( false );

    // Update the visibility accordingly.  A multilink will not work because the charge circuitElement changes.
    var updateVisible = function() {
      self.visible = charge.visibleProperty.get() &&
                     (outsideOfBlackBoxProperty.get() || revealingProperty.get()) &&
                     ( Math.abs( charge.circuitElement.currentProperty.get() ) > 1E-6 || charge.charge < 0 );
    };

    // When the model position changes, update the node position
    var updateTransform = function() {
      var current = charge.circuitElement.currentProperty.get();
      var position = charge.positionProperty.get();

      if ( charge.charge > 0 ) {
        var angle = charge.charge < 0 ? 0 : charge.angleProperty.get() + (current < 0 ? Math.PI : 0);

        // Rotate then center the rotated node
        self.setMatrix( Matrix3.rotation2( angle ) );
        self.center = position;
      }
      else {
        self.setTranslation(
          position.x - ELECTRON_CHARGE_NODE.width / 2 - 0.5,
          position.y - ELECTRON_CHARGE_NODE.height / 2 - 0.5
        );
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

  return inherit( Image, ChargeNode, {}, {

    /**
     * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
     * @public
     */
    webglSpriteNodes: [
      ELECTRON_CHARGE_NODE, ARROW_NODE
    ]
  } );
} );