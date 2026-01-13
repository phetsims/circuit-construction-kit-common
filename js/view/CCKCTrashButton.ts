// Copyright 2017-2026, University of Colorado Boulder

/**
 * Trash button that is used to delete components. This is instantiated once and does not need to be disposed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Path from '../../../scenery/js/nodes/Path.js';
import trashAltRegularShape from '../../../sherpa/js/fontawesome-5/trashAltRegularShape.js';
import sharedSoundPlayers from '../../../tambo/js/sharedSoundPlayers.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import CircuitElement from '../model/CircuitElement.js';
import CCKCRoundPushButton from './CCKCRoundPushButton.js';
import CircuitNode from './CircuitNode.js';
import CircuitDescription from './description/CircuitDescription.js';

export default class CCKCTrashButton extends CCKCRoundPushButton {

  public constructor( circuitNode: CircuitNode, tandem: Tandem ) {

    const circuit = circuitNode.circuit;

    // Build accessible name reactively from selection and showValues
    const accessibleNameProperty = new DerivedProperty(
      [ circuit.selectionProperty, circuitNode.model.showValuesProperty ],
      ( selection, showValues ) => {
        if ( selection instanceof CircuitElement ) {
          return CircuitDescription.buildAccessibleName( selection, showValues, 0, 0, false );
        }
        return '';
      }
    );

    super( {
      accessibleName: CircuitConstructionKitCommonFluent.a11y.trashButton.accessibleName.createProperty( {
        accessibleName: accessibleNameProperty
      } ),
      touchAreaDilation: 5, // radius dilation for touch area
      content: new Path( trashAltRegularShape, {
        fill: 'black',
        scale: CCKCConstants.FONT_AWESOME_ICON_SCALE * 0.8
      } ),
      listener: () => {

        const circuitElement = circuit.selectionProperty.value;
        if ( circuitElement instanceof CircuitElement ) {

          // Only permit deletion when not being dragged, see https://github.com/phetsims/circuit-construction-kit-common/issues/414
          if ( !circuitElement.startVertexProperty.value.isDragged && !circuitElement.endVertexProperty.value.isDragged ) {

            // Capture context before removal so the group index is available for announcements
            circuitNode.prepareForElementRemoval( circuitElement );
            circuit.disposeCircuitElement( circuitElement );
          }
        }
      },
      isDisposable: false,
      tandem: tandem,
      phetioVisiblePropertyInstrumented: false,
      phetioEnabledPropertyInstrumented: false,

      soundPlayer: sharedSoundPlayers.get( 'erase' )
    } );
  }
}

circuitConstructionKitCommon.register( 'CCKCTrashButton', CCKCTrashButton );