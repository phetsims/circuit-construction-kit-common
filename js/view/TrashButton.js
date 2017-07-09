// Copyright 2017, University of Colorado Boulder

/**
 * Trash button that is used to delete components.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var CircuitConstructionKitCommonConstants =
    require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );

  /**
   * @param {Circuit} circuit - the circuit from which the CircuitElement can be removed
   * @param {CircuitElement} circuitElement - the CircuitElement to remove when the button is pressed
   * @param {Tandem} tandem
   * @constructor
   */
  function TrashButton( circuit, circuitElement, tandem ) {

    RoundPushButton.call( this, {
      baseColor: PhetColorScheme.PHET_LOGO_YELLOW,
      content: new FontAwesomeNode( 'trash', {
        scale: CircuitConstructionKitCommonConstants.FONT_AWESOME_ICON_SCALE
      } ),
      listener: function() {
        circuit.circuitElements.remove( circuitElement );
      },
      minXMargin: 10,
      minYMargin: 10,
      tandem: tandem.createTandem( 'trashButton' )
    } );
  }

  circuitConstructionKitCommon.register( 'TrashButton', TrashButton );

  return inherit( RoundPushButton, TrashButton );
} );