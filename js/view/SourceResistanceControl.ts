// Copyright 2020-2022, University of Colorado Boulder

/**
 * Controls for showing and changing the battery internal resistance.  Exists for the life of the sim and hence does not
 * require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import Utils from '../../../dot/js/Utils.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { Text } from '../../../scenery/js/imports.js';
import { VBox } from '../../../scenery/js/imports.js';
import HSlider from '../../../sun/js/HSlider.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Property from '../../../axon/js/Property.js';
import { AlignGroup } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';

const resistanceOhmsSymbolString = circuitConstructionKitCommonStrings.resistanceOhmsSymbol;

export default class SourceResistanceControl extends VBox {

  /**
   * @param {Property.<number>} sourceResistanceProperty - axon Property for the internal resistance of all Batteries
   * @param {AlignGroup} alignGroup
   * @param {string} batteryResistanceControlString
   * @param {Object} titleConfig
   * @param {Tandem} tandem
   */
  constructor( sourceResistanceProperty: Property<number>, alignGroup: AlignGroup, batteryResistanceControlString: string, titleConfig: any, tandem: Tandem ) {

    /**
     * Creates label to be used for slider
     * @param {string} string
     * @param {Tandem} tandem
     */
    const createLabel = ( string: string, tandem: Tandem ) => new Text( string, {
      fontSize: 12,
      tandem: tandem,
      maxWidth: 45
    } );

    const range = CCKCConstants.BATTERY_RESISTANCE_RANGE;
    const midpoint = ( range.max + range.min ) / 2;
    const slider = new HSlider( sourceResistanceProperty, range, {
      trackSize: CCKCConstants.SLIDER_TRACK_SIZE,
      thumbSize: CCKCConstants.THUMB_SIZE,
      majorTickLength: CCKCConstants.MAJOR_TICK_LENGTH,
      minorTickLength: CCKCConstants.MINOR_TICK_LENGTH,

      // Snap to the nearest whole number.
      constrainValue: ( value: number ) => range.constrainValue( Utils.roundSymmetric( value ) ),
      tandem: tandem.createTandem( 'slider' )
    } );
    slider.addMajorTick( range.min, createLabel( circuitConstructionKitCommonStrings.tiny, tandem.createTandem( 'tinyLabel' ) ) );
    slider.addMajorTick( midpoint );
    slider.addMajorTick( range.max, createLabel( StringUtils.fillIn( resistanceOhmsSymbolString, { resistance: Utils.toFixed( range.max, 0 ) } ), tandem.createTandem( 'maxLabel' ) ) );

    for ( let i = range.min + 1; i < range.max; i++ ) {
      if ( Math.abs( i - midpoint ) > 1E-6 ) {
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