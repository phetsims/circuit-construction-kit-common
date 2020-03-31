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
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

const phaseShiftString = circuitConstructionKitCommonStrings.phaseShift;

class PhaseShiftControl extends VBox {

  /**
   * @param {ACVoltage} acVoltage
   * @param {Object} [options]
   */
  constructor( acVoltage, options ) {
    options = merge( {}, options );

    // const valueProperty = new Property( 0 );
    const valueRangeProperty = new Property( new Range( -180, 180 ) );
    const enabledProperty = new BooleanProperty( true );

    // options for all spinners
    const spinnerOptions = {
      enabledProperty: enabledProperty,
      decimalPlaces: 0,
      deltaValue: 10,
      backgroundMinWidth: 60,
      xMargin: 10,
      font: CCKCConstants.DEFAULT_FONT
    };
    const title = new Text( phaseShiftString, {
      font: CCKCConstants.DEFAULT_FONT
    } );

    const numberSpinner = new NumberSpinner( acVoltage.phaseProperty, valueRangeProperty, merge( {}, spinnerOptions, {
      arrowsPosition: 'leftRight',
      valuePattern: '{{value}}' + MathSymbols.DEGREES, // Does not require internationalization
      tandem: options.tandem.createTandem( 'numberSpinner' )
    } ) );

    options = merge( {
      spacing: 10
    }, options );

    assert && assert( !options.children, 'children not supported' );
    options.children = [ title, numberSpinner ];

    super( options );
  }
}

circuitConstructionKitCommon.register( 'PhaseShiftControl', PhaseShiftControl );
export default PhaseShiftControl;