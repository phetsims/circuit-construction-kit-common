// Copyright 2017, University of Colorado Boulder

/**
 * Trash button that is used to delete components.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  const RoundPushButton = require( 'SUN/buttons/RoundPushButton' );

  /**
   * @param {Circuit} circuit - the circuit from which the CircuitElement can be removed
   * @param {CircuitElement} circuitElement - the CircuitElement to remove when the button is pressed
   * @param {Tandem} tandem
   * @constructor
   */
  function TrashButton( circuit, circuitElement, tandem ) {

    RoundPushButton.call( this, {
      baseColor: PhetColorScheme.BUTTON_YELLOW,
      content: new FontAwesomeNode( 'trash', {
        scale: CCKCConstants.FONT_AWESOME_ICON_SCALE
      } ),
      listener: () => {

        // Only permit deletion when not being dragged, see https://github.com/phetsims/circuit-construction-kit-common/issues/414
        if ( !circuitElement.startVertexProperty.value.isDragged && !circuitElement.endVertexProperty.value.isDragged ) {
          circuit.circuitElements.remove( circuitElement );
        }
      },
      minXMargin: 10,
      minYMargin: 10,
      tandem: tandem.createTandem( 'trashButton' )
    } );
  }

  circuitConstructionKitCommon.register( 'TrashButton', TrashButton );

  return inherit( RoundPushButton, TrashButton );
} );