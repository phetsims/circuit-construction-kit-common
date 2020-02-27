// Copyright 2020, University of Colorado Boulder

/**
 * Controls for showing and changing the battery internal resistance.  Exists for the life of the sim and hence does not
 * require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Utils from '../../../dot/js/Utils.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import HSlider from '../../../sun/js/HSlider.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommonStrings from '../circuit-construction-kit-common-strings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

const resistanceOhmsSymbolString = circuitConstructionKitCommonStrings.resistanceOhmsSymbol;

class SourceResistanceControl extends VBox {

  /**
   * @param {Property.<number>} sourceResistanceProperty - axon Property for the internal resistance of all Batteries
   * @param {AlignGroup} alignGroup
   * @param {string} batteryResistanceControlString
   * @param {Object} titleConfig
   * @param {Tandem} tandem
   */
  constructor( sourceResistanceProperty, alignGroup, batteryResistanceControlString, titleConfig, tandem ) {

    /**
     * Creates label to be used for slider
     * @param {string} string
     * @param {Tandem} tandem
     * @returns {Text}
     */
    const createLabel = ( string, tandem ) => new Text( string, { fontSize: 12, tandem: tandem, maxWidth: 45 } );

    const range = CCKCConstants.BATTERY_RESISTANCE_RANGE;
    const midpoint = ( range.max + range.min ) / 2;
    const slider = new HSlider( sourceResistanceProperty, range, {
      trackSize: CCKCConstants.SLIDER_TRACK_SIZE,
      thumbSize: CCKCConstants.THUMB_SIZE,
      majorTickLength: CCKCConstants.MAJOR_TICK_LENGTH,
      minorTickLength: CCKCConstants.MINOR_TICK_LENGTH,

      // Snap to the nearest whole number.
      constrainValue: value => Utils.roundSymmetric( value ),
      tandem: tandem.createTandem( 'slider' )
    } );
    slider.addMajorTick( range.min, createLabel( StringUtils.fillIn( resistanceOhmsSymbolString, { resistance: Utils.toFixed( range.min, 0 ) } ), tandem.createTandem( 'minLabel' ) ) );
    slider.addMajorTick( midpoint );
    slider.addMajorTick( range.max, createLabel( StringUtils.fillIn( resistanceOhmsSymbolString, { resistance: Utils.toFixed( range.max, 0 ) } ), tandem.createTandem( 'maxLabel' ) ) );

    for ( let i = range.min + 1; i < range.max; i++ ) {
      if ( i !== midpoint ) {
        slider.addMinorTick( i );
      }
    }

    const titleNode = new Text( batteryResistanceControlString, titleConfig );
    super( {
      children: [ titleNode, slider ]
    } );
  }
}

circuitConstructionKitCommon.register( 'SourceResistanceControl', SourceResistanceControl );
export default SourceResistanceControl;