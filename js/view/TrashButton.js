// Copyright 2017-2019, University of Colorado Boulder

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
  const merge = require( 'PHET_CORE/merge' );
  const PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  const RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  const TrashButtonIO = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/TrashButtonIO' );

  class TrashButton extends RoundPushButton {

    /**
     * @param {Circuit} circuit - the circuit from which the CircuitElement can be removed
     * @param {CircuitElement|null} circuitElement - the CircuitElement to remove when the button is pressed, or null if for a prototype
     * @param {Tandem} tandem
     */
    constructor( circuit, circuitElement, tandem, options ) {

      assert && assert( circuitElement !== undefined, 'circuit element should be null or defined' );
      super( merge( {
        baseColor: PhetColorScheme.BUTTON_YELLOW,
        content: new FontAwesomeNode( 'trash', {
          scale: CCKCConstants.FONT_AWESOME_ICON_SCALE
        } ),
        listener: () => {

          // Only permit deletion when not being dragged, see https://github.com/phetsims/circuit-construction-kit-common/issues/414
          if ( !circuitElement.startVertexProperty.value.isDragged && !circuitElement.endVertexProperty.value.isDragged ) {
            circuit.circuitElements.remove( circuitElement );
            circuit.disposeFromGroup( circuitElement );// TODO: improve somehow

            !this.isDisposed && this.dispose();
          }
        },
        minXMargin: 10,
        minYMargin: 10,
        tandem: tandem,
        phetioDynamicElement: true,
        phetioType: TrashButtonIO,
        phetioState: true
      }, options ) );

      // @public (read-only, phet-io)
      this.circuitElement = circuitElement;
    }
  }

  return circuitConstructionKitCommon.register( 'TrashButton', TrashButton );
} );