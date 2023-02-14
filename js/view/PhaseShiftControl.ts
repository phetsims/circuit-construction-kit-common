// Copyright 2019-2023, University of Colorado Boulder

/**
 * Control that allows the user to change the phase of the ac voltage source on the AC Lab Screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Property from '../../../axon/js/Property.js';
import Range from '../../../dot/js/Range.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import { Text, VBox, VBoxOptions } from '../../../scenery/js/imports.js';
import NumberSpinner, { NumberSpinnerOptions } from '../../../sun/js/NumberSpinner.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import CircuitElementNumberControl from './CircuitElementNumberControl.js';
import CircuitElement from '../model/CircuitElement.js';
import Circuit from '../model/Circuit.js';
import ACVoltage from '../model/ACVoltage.js';
import Multilink, { UnknownMultilink } from '../../../axon/js/Multilink.js';
import PickRequired from '../../../phet-core/js/types/PickRequired.js';
import Vertex from '../model/Vertex.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import CCKCColors from './CCKCColors.js';

type PhaseShiftControlOptions = VBoxOptions & PickRequired<VBoxOptions, 'tandem'>;
export default class PhaseShiftControl extends VBox {

  public constructor( phaseProperty: Property<number>, circuit: Circuit, providedOptions?: PhaseShiftControlOptions ) {
    providedOptions = combineOptions<PhaseShiftControlOptions>( {
      spacing: 7
    }, providedOptions );
    assert && assert( !providedOptions.children, 'children not supported' );

    const valueRangeProperty = new Property( new Range( -180, 180 ) );
    const enabledProperty = new BooleanProperty( true );

    // options for all spinners
    const spinnerOptions: NumberSpinnerOptions = {
      enabledProperty: enabledProperty,
      deltaValue: 15,
      numberDisplayOptions: {
        align: 'center',
        decimalPlaces: 0,
        xMargin: 10,
        yMargin: 3,
        minBackgroundWidth: 60,
        textOptions: {
          font: CCKCConstants.DEFAULT_FONT
        },
        valuePattern: `{{value}}${MathSymbols.DEGREES}` // Does not require internationalization
      },
      arrowsPosition: 'leftRight',
      arrowsScale: 0.9,
      tandem: providedOptions.tandem.createTandem( 'numberSpinner' )
    };

    const title = new Text( CircuitConstructionKitCommonStrings.phaseShiftStringProperty, {
      font: CCKCConstants.DEFAULT_FONT,
      maxWidth: CircuitElementNumberControl.NUMBER_CONTROL_ELEMENT_MAX_WIDTH,
      fill: CCKCColors.textFillProperty
    } );

    const numberSpinner = new NumberSpinner( phaseProperty, valueRangeProperty, spinnerOptions );
    providedOptions.children = [ title, numberSpinner ];
    super( providedOptions );

    const listener = ( isPhaseEditable: boolean, isEditable: boolean ) => {
      this.visible = isPhaseEditable && isEditable;
    };

    let multilink: UnknownMultilink | null = null;

    // This is reused across all instances. The control itself can be hidden by PhET-iO customization, but the parent
    // node is another gate for the visibility.
    circuit.selectionProperty.link( ( newCircuitElement: CircuitElement | Vertex | null, oldCircuitElement: CircuitElement | Vertex | null ) => {
      oldCircuitElement instanceof ACVoltage && multilink && Multilink.unmultilink( multilink );
      if ( newCircuitElement instanceof ACVoltage ) {
        multilink = Multilink.multilink( [ newCircuitElement.isPhaseEditableProperty, newCircuitElement.isEditableProperty ], listener );
      }
    } );
  }
}

circuitConstructionKitCommon.register( 'PhaseShiftControl', PhaseShiftControl );