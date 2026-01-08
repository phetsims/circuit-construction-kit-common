// Copyright 2019-2025, University of Colorado Boulder

/**
 * Control that allows the user to change the phase of the ac voltage source on the AC Lab Screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Multilink, { type UnknownMultilink } from '../../../axon/js/Multilink.js';
import Property from '../../../axon/js/Property.js';
import Range from '../../../dot/js/Range.js';
import affirm from '../../../perennial-alias/js/browser-and-node/affirm.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import type PickRequired from '../../../phet-core/js/types/PickRequired.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import VBox, { type VBoxOptions } from '../../../scenery/js/layout/nodes/VBox.js';
import Text from '../../../scenery/js/nodes/Text.js';
import NumberSpinner, { type NumberSpinnerOptions } from '../../../sun/js/NumberSpinner.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import ACVoltage from '../model/ACVoltage.js';
import type Circuit from '../model/Circuit.js';
import type CircuitElement from '../model/CircuitElement.js';
import type Vertex from '../model/Vertex.js';
import CCKCColors from './CCKCColors.js';
import CircuitElementNumberControl from './CircuitElementNumberControl.js';

type PhaseShiftControlOptions = VBoxOptions & PickRequired<VBoxOptions, 'tandem'>;

export default class PhaseShiftControl extends VBox {

  public constructor( phaseProperty: Property<number>, circuit: Circuit, providedOptions?: PhaseShiftControlOptions ) {
    providedOptions = combineOptions<PhaseShiftControlOptions>( {
      spacing: 7
    }, providedOptions );
    affirm( !providedOptions.children, 'children not supported' );

    const valueRangeProperty = new Property( new Range( -180, 180 ) );
    const enabledProperty = new BooleanProperty( true );

    // options for all spinners
    const spinnerOptions: NumberSpinnerOptions = {
      enabledProperty: enabledProperty,
      deltaValue: 15,
      numberDisplayOptions: {
        align: 'center',
        decimalPlaces: 0,
        xMargin: 0,
        yMargin: 3,
        minBackgroundWidth: 45,
        textOptions: {
          font: CCKCConstants.DEFAULT_FONT
        },
        valuePattern: `{{value}}${MathSymbols.DEGREES}` // Does not require internationalization
      },
      arrowsPosition: 'leftRight',
      arrowsScale: 0.9,
      tandem: providedOptions.tandem.createTandem( 'numberSpinner' )
    };

    const title = new Text( CircuitConstructionKitCommonFluent.phaseShiftStringProperty, {
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