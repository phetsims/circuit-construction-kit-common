// Copyright 2019-2020, University of Colorado Boulder

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
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import NumberSpinner from '../../../sun/js/NumberSpinner.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import CircuitElementNumberControl from './CircuitElementNumberControl.js';

class PhaseShiftControl extends VBox {

  /**
   * @param {ACVoltage} acVoltage
   * @param {Object} [options]
   */
  constructor( acVoltage, options ) {
    options = merge( {
      spacing: 7
    }, options );
    assert && assert( !options.children, 'children not supported' );

    const valueRangeProperty = new Property( new Range( -180, 180 ) );
    const enabledProperty = new BooleanProperty( true );

    // options for all spinners
    const spinnerOptions = {
      enabledProperty: enabledProperty,
      deltaValue: 10,
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
      tandem: options.tandem.createTandem( 'numberSpinner' )
    };

    const title = new Text( circuitConstructionKitCommonStrings.phaseShift, {
      font: CCKCConstants.DEFAULT_FONT,
      maxWidth: CircuitElementNumberControl.NUMBER_CONTROL_ELEMENT_MAX_WIDTH
    } );

    const numberSpinner = new NumberSpinner( acVoltage.phaseProperty, valueRangeProperty, spinnerOptions );
    options.children = [ title, numberSpinner ];
    super( options );
  }
}

circuitConstructionKitCommon.register( 'PhaseShiftControl', PhaseShiftControl );
export default PhaseShiftControl;