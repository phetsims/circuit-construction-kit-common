// Copyright 2017-2022, University of Colorado Boulder

/**
 * Trash button that is used to delete components.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import { Path } from '../../../scenery/js/imports.js';
import trashAltRegularShape from '../../../sherpa/js/fontawesome-5/trashAltRegularShape.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CCKCRoundPushButton from './CCKCRoundPushButton.js';
import Circuit from '../model/Circuit.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { RoundPushButtonOptions } from '../../../sun/js/buttons/RoundPushButton.js';

export default class CCKCTrashButton extends CCKCRoundPushButton {

  /**
   * @param circuit - the circuit from which the CircuitElement can be removed
   * @param tandem
   * @param [providedOptions]
   */
  public constructor( circuit: Circuit, tandem: Tandem, providedOptions?: RoundPushButtonOptions ) {

    super( merge( {
      touchAreaDilation: 5, // radius dilation for touch area
      content: new Path( trashAltRegularShape, {
        fill: 'black',
        scale: CCKCConstants.FONT_AWESOME_ICON_SCALE * 0.8
      } ),
      listener: () => {

        const circuitElement = circuit.selectedCircuitElementProperty.value;
        if ( circuitElement ) {

          // Only permit deletion when not being dragged, see https://github.com/phetsims/circuit-construction-kit-common/issues/414
          if ( !circuitElement.startVertexProperty.value.isDragged && !circuitElement.endVertexProperty.value.isDragged ) {
            circuit.disposeCircuitElement( circuitElement );
          }
        }
      },
      tandem: tandem
    }, providedOptions ) );
  }

  public override dispose(): void {
    assert && assert( false, 'should not be disposed' );
  }
}

circuitConstructionKitCommon.register( 'CCKCTrashButton', CCKCTrashButton );