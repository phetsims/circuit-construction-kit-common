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
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );

  /**
   * @param {Circuit} circuit - the circuit from which the CircuitElement can be removed
   * @param {CircuitElement} circuitElement - the CircuitElement to remove when the button is pressed
   * @param {Tandem} tandem
   * @constructor
   */
  function CCKTrashButton( circuit, circuitElement, tandem ) {

    RoundPushButton.call( this, {
      baseColor: PhetColorScheme.PHET_LOGO_YELLOW,
      content: new FontAwesomeNode( 'trash', {
        scale: CircuitConstructionKitConstants.FONT_AWESOME_ICON_SCALE
      } ),
      listener: function() {
        circuit.remove( circuitElement );
      },
      minXMargin: 10,
      minYMargin: 10,
      tandem: tandem.createTandem( 'trashButton' )
    } );
  }

  circuitConstructionKitCommon.register( 'CCKTrashButton', CCKTrashButton );

  return inherit( RoundPushButton, CCKTrashButton );
} );