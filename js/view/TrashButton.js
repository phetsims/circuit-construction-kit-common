// Copyright 2017-2020, University of Colorado Boulder

/**
 * Trash button that is used to delete components.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import FontAwesomeNode from '../../../sun/js/FontAwesomeNode.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CCKCRoundPushButton from './CCKCRoundPushButton.js';
import TrashButtonIO from './TrashButtonIO.js';

class TrashButton extends CCKCRoundPushButton {

  /**
   * @param {Circuit} circuit - the circuit from which the CircuitElement can be removed
   * @param {CircuitElement|null} circuitElement - the CircuitElement to remove when the button is pressed, or null if for a archetype
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( circuit, circuitElement, tandem, options ) {

    assert && assert( circuitElement !== undefined, 'circuit element should be null or defined' );
    super( merge( {
      content: new FontAwesomeNode( 'trash', {
        scale: CCKCConstants.FONT_AWESOME_ICON_SCALE
      } ),
      listener: () => {

        // Only permit deletion when not being dragged, see https://github.com/phetsims/circuit-construction-kit-common/issues/414
        if ( !circuitElement.startVertexProperty.value.isDragged && !circuitElement.endVertexProperty.value.isDragged ) {
          circuit.disposeCircuitElement( circuitElement );
          !this.isDisposed && this.dispose();
        }
      },
      tandem: tandem,
      phetioDynamicElement: true,
      phetioType: TrashButtonIO
    }, options ) );

    // @public (read-only, phet-io)
    this.circuitElement = circuitElement;
  }
}

circuitConstructionKitCommon.register( 'TrashButton', TrashButton );
export default TrashButton;