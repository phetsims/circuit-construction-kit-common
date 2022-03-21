// Copyright 2019-2022, University of Colorado Boulder

/**
 * Control that allows the user to change the phase of the ac voltage source on the AC Lab Screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Property from '../../../axon/js/Property.js';
import Range from '../../../dot/js/Range.js';
import merge from '../../../phet-core/js/merge.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import { Text } from '../../../scenery/js/imports.js';
import { VBox } from '../../../scenery/js/imports.js';
import NumberSpinner from '../../../sun/js/NumberSpinner.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import CircuitElementNumberControl from './CircuitElementNumberControl.js';
import CircuitElement from '../model/CircuitElement.js';
import Circuit from '../model/Circuit.js';
import ACVoltage from '../model/ACVoltage.js';
import Multilink from '../../../axon/js/Multilink.js';

export default class PhaseShiftControl extends VBox {

  constructor( phaseProperty: Property<number>, circuit: Circuit, providedOptions?: any ) {
    providedOptions = merge( {
      spacing: 7
    }, providedOptions );
    assert && assert( !providedOptions.children, 'children not supported' );

    const valueRangeProperty = new Property( new Range( -180, 180 ) );
    const enabledProperty = new BooleanProperty( true );

    // options for all spinners
    const spinnerOptions = {
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

    const title = new Text( circuitConstructionKitCommonStrings.phaseShift, {
      font: CCKCConstants.DEFAULT_FONT,
      maxWidth: CircuitElementNumberControl.NUMBER_CONTROL_ELEMENT_MAX_WIDTH
    } );

    const numberSpinner = new NumberSpinner( phaseProperty, valueRangeProperty, spinnerOptions );
    providedOptions.children = [ title, numberSpinner ];
    super( providedOptions );

    const listener = ( isPhaseEditable: boolean, isEditable: boolean ) => {
      this.visible = isPhaseEditable && isEditable;
    };

    let multilink: Multilink<[ boolean, boolean ]> | null = null;

    // This is reused across all instances. The control itself can be hidden by PhET-iO customization, but the parent
    // node is another gate for the visibility.
    circuit.selectedCircuitElementProperty.link( ( newCircuitElement: CircuitElement | null, oldCircuitElement: CircuitElement | null ) => {
      oldCircuitElement instanceof ACVoltage && multilink && Property.unmultilink( multilink );
      if ( newCircuitElement instanceof ACVoltage ) {
        multilink = Property.multilink( [ newCircuitElement.isPhaseEditableProperty, newCircuitElement.isEditableProperty ], listener );
      }
    } );
  }
}

circuitConstructionKitCommon.register( 'PhaseShiftControl', PhaseShiftControl );