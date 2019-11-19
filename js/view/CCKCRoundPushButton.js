// Copyright 2019, University of Colorado Boulder

/**
 * Base type for buttons that appear in the CircuitElementEditPanels
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  const RoundPushButton = require( 'SUN/buttons/RoundPushButton' );

  class CCKCRoundPushButton extends RoundPushButton {

    /**
     * @param {Node} icon - the circuit that contains the battery
     * @param {function} listener
     * @param {Tandem} tandem
     */
    constructor( icon, listener, tandem ) {
      super( {
        baseColor: PhetColorScheme.BUTTON_YELLOW,
        content: icon,

        minXMargin: 10,
        minYMargin: 10,
        listener: listener,

        tandem: tandem,

        // TODO(phet-io): These elements will need to be members of a PhetioGroup
        phetioState: false,

        phetioComponentOptions: {
          phetioState: false
        }
      } );
    }
  }

  return circuitConstructionKitCommon.register( 'CCKCRoundPushButton', CCKCRoundPushButton );
} );