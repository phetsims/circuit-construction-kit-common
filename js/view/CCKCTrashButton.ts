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
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import Battery from '../model/Battery.js';
import Capacitor from '../model/Capacitor.js';
import CircuitElement from '../model/CircuitElement.js';
import Inductor from '../model/Inductor.js';
import Resistor from '../model/Resistor.js';
import VoltageSource from '../model/VoltageSource.js';
import CCKCRoundPushButton from './CCKCRoundPushButton.js';
import CircuitNode from './CircuitNode.js';

export default class CCKCTrashButton extends CCKCRoundPushButton {

  public constructor( circuitNode: CircuitNode, tandem: Tandem ) {

    const circuit = circuitNode.circuit;

    super( {
      accessibleName: CircuitConstructionKitCommonFluent.a11y.trashButton.accessibleName.createProperty( {
        type: circuit.selectionProperty.derived( selection => selection instanceof CircuitElement ? selection.type : 'wire' ),
        resistance: circuit.selectionProperty.derived( selection => selection instanceof Resistor ? selection.resistanceProperty.value : 0 ),
        voltage: circuit.selectionProperty.derived( selection => selection instanceof Battery ? selection.voltageProperty.value : 0 ),
        capacitance: circuit.selectionProperty.derived( selection => selection instanceof Capacitor ? selection.capacitanceProperty.value : 0 ),
        inductance: circuit.selectionProperty.derived( selection => selection instanceof Inductor ? selection.inductanceProperty.value : 0 ),
        switchState: 'open',
        hasPosition: 'false',
        position: 0,
        total: 0,
        displayMode: circuitNode.model.showValuesProperty.derived( showValues => showValues ? 'value' : 'name' ),
        internalResistance: circuit.selectionProperty.derived( selection =>
          selection instanceof VoltageSource ? selection.internalResistanceProperty.value : 0 ),
        hasInternalResistance: circuit.selectionProperty.derived( selection =>
          selection instanceof VoltageSource && selection.internalResistanceProperty.value > CCKCQueryParameters.batteryMinimumResistance ? 'true' : 'false' ),
        isOnFire: circuit.selectionProperty.derived( selection =>
          selection instanceof VoltageSource ? ( selection.isOnFireProperty.value ? 'true' : 'false' ) : 'false' )
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
      phetioVisiblePropertyInstrumented: false,
      phetioEnabledPropertyInstrumented: false
    } );
  }
}

circuitConstructionKitCommon.register( 'CCKCTrashButton', CCKCTrashButton );