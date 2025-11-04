// Copyright 2017-2025, University of Colorado Boulder

/**
 * Trash button that is used to delete components. This is instantiated once and does not need to be disposed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Path from '../../../scenery/js/nodes/Path.js';
import trashAltRegularShape from '../../../sherpa/js/fontawesome-5/trashAltRegularShape.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import Battery from '../model/Battery.js';
import CircuitElement from '../model/CircuitElement.js';
import Resistor from '../model/Resistor.js';
import CCKCRoundPushButton from './CCKCRoundPushButton.js';
import CircuitNode from './CircuitNode.js';

export default class CCKCTrashButton extends CCKCRoundPushButton {

  public constructor( circuitNode: CircuitNode, tandem: Tandem ) {

    const circuit = circuitNode.circuit;

    const typeProperty = circuit.selectionProperty.derived( selection =>
      selection instanceof CircuitElement ? selection.type : 'wire'
    );

    super( {
      accessibleName: CircuitConstructionKitCommonFluent.a11y.trashButton.accessibleName.createProperty( {
        type: typeProperty,
        resistance: circuit.selectionProperty.derived( selection => selection instanceof Resistor ? selection.resistanceProperty.value : 0 ),
        valuesShowing: circuitNode.model.showValuesProperty.derived( value => value ? 'true' : 'false' ),
        voltage: circuit.selectionProperty.derived( selection => selection instanceof Battery ? selection.voltageProperty.value : 0 ),
        index: circuit.selectionProperty.derived( selection => selection ? selection.descriptionIndex : 0 )
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
            circuit.disposeCircuitElement( circuitElement );
          }
        }
      },
      isDisposable: false,
      tandem: tandem,
      phetioVisiblePropertyInstrumented: false
    } );
  }
}

circuitConstructionKitCommon.register( 'CCKCTrashButton', CCKCTrashButton );