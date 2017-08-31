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
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var ConventionalCurrentArrowNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ConventionalCurrentArrowNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var ElectronChargeNode = require( 'SCENERY_PHET/ElectronChargeNode' );
  var Tandem = require( 'TANDEM/Tandem' );

  // constants
  var ELECTRON_CHARGE_NODE = new ElectronChargeNode( {

    // electrons are transparent to signify they are just a representation, not physical electrons
    opacity: 0.75,

    // selected so an electron will exactly fit the width of a wire
    scale: 0.78
  } ).toDataURLImageSynchronous();
  var ARROW_NODE = new ConventionalCurrentArrowNode( Tandem.createStaticTandem( 'arrowNode' ) )
    .toDataURLImageSynchronous();

  /**
   * @param {Charge} charge - the model element
   * @constructor
   */
  function ChargeNode( charge ) {

    // @public (read-only) {Charge} - the model depicted by this node
    this.charge = charge;

    var child = charge.charge > 0 ? ARROW_NODE : ELECTRON_CHARGE_NODE;

    Image.call( this, child.image, {
      pickable: false
    } );

    // Negative charges should be transparent
    this.setImageOpacity( charge.charge < 0 ? 0.75 : 1 );

    this.outsideOfBlackBoxProperty = new BooleanProperty( false );

    // Update the visibility accordingly.  A multilink will not work because the charge circuitElement changes.
    this.updateVisibleListener = this.updateVisible.bind( this );

    // When the model position changes, update the node position
    this.updateTransformListener = this.updateTransform.bind( this );

    charge.changedEmitter.addListener( this.updateTransformListener );
    charge.visibleProperty.link( this.updateVisibleListener );
    this.outsideOfBlackBoxProperty.link( this.updateVisibleListener );

    charge.disposeEmitter.addListener( this.dispose.bind( this ) );

    this.updateTransformListener();
  }

  circuitConstructionKitCommon.register( 'ChargeNode', ChargeNode );

  return inherit( Image, ChargeNode, {

    /**
     * Dispose resources when no longer used.
     * @public
     */
    dispose: function() {
      this.charge.changedEmitter.removeListener( this.updateTransformListener );
      this.charge.visibleProperty.unlink( this.updateVisibleListener );
      this.outsideOfBlackBoxProperty.unlink( this.updateVisibleListener );
      Image.prototype.dispose.call( this );
    },

    /**
     * @private - update the transform of the charge node
     * REVIEW^(samreid): I've updated to use Matrix3 and could use help using it to set Node.matrix here without
     * REVIEW^(samreid): creating garbage (not sure if we should mutate matrix then restore it), does scenery make Matrix copy?
     */
    updateTransform: function() {
      var charge = this.charge;
      var current = charge.circuitElement.currentProperty.get();
      var matrix = charge.matrix;
      var translation = matrix.translation;
      if ( charge.charge > 0 ) {

        // Rotate then center the rotated node
        this.rotation = charge.matrix.rotation + ( current < 0 ? Math.PI : 0 );
        this.center = translation;
      }
      else {

        // position the electron--note the offsets that were used to make it look exactly centered, see
        // https://github.com/phetsims/circuit-construction-kit-dc/issues/104
        this.setTranslation(
          translation.x - ELECTRON_CHARGE_NODE.width / 2 - 0.5,
          translation.y - ELECTRON_CHARGE_NODE.height / 2 - 0.5
        );
      }
      this.updateVisible();
      this.outsideOfBlackBoxProperty.set( !charge.circuitElement.insideTrueBlackBoxProperty.get() );
    },

    /**
     * @private - update the visibility
     */
    updateVisible: function() {
      this.visible = this.charge.visibleProperty.get() &&
                     this.outsideOfBlackBoxProperty.get() &&
                     ( Math.abs( this.charge.circuitElement.currentProperty.get() ) > 1E-6 || this.charge.charge < 0 );
    }
  }, {

    /**
     * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
     * @public {Array.<Image>}
     */
    webglSpriteNodes: [
      ELECTRON_CHARGE_NODE, ARROW_NODE
    ]
  } );
} );