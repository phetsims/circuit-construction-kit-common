// Copyright 2020-2025, University of Colorado Boulder

/**
 * Controls for showing and changing the battery internal resistance.  Exists for the life of the sim and hence does not
 * require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import PatternStringProperty from '../../../axon/js/PatternStringProperty.js';
import type Property from '../../../axon/js/Property.js';
import type { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import { roundSymmetric } from '../../../dot/js/util/roundSymmetric.js';
import { toFixed } from '../../../dot/js/util/toFixed.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import type AlignGroup from '../../../scenery/js/layout/constraints/AlignGroup.js';
import VBox from '../../../scenery/js/layout/nodes/VBox.js';
import Text, { type TextOptions } from '../../../scenery/js/nodes/Text.js';
import HSlider from '../../../sun/js/HSlider.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import CCKCColors from './CCKCColors.js';

const resistanceOhmsSymbolStringProperty = CircuitConstructionKitCommonFluent.resistanceOhmsSymbolStringProperty;

export default class SourceResistanceControl extends VBox {

  /**
   * @param sourceResistanceProperty - axon Property for the internal resistance of all Batteries
   * @param alignGroup
   * @param batteryResistanceControlString
   * @param titleConfig
   * @param tandem
   */
  public constructor( sourceResistanceProperty: Property<number>, alignGroup: AlignGroup,
                      batteryResistanceControlString: TReadOnlyProperty<string>, titleConfig: TextOptions, tandem: Tandem ) {

    /**
     * Creates label to be used for slider
     */
    const createLabel = ( string: TReadOnlyProperty<string>, tandem: Tandem ) => new Text( string, {
      fontSize: 12,
      fill: CCKCColors.textFillProperty,
      tandem: tandem,
      maxWidth: 45
    } );

    const range = CCKCConstants.BATTERY_RESISTANCE_RANGE;
    const midpoint = ( range.max + range.min ) / 2;
    const sliderSteps = CCKCConstants.SLIDER_STEPS.sourceResistanceControl;

    // Tick marks are at every integer from min to max (11 positions, 10 intervals).
    // numberOfMiddleThresholds = 9 creates 10 intervals so clicks align with tick marks.
    const numberOfTickIntervals = roundSymmetric( range.max - range.min );
    const slider = new HSlider( sourceResistanceProperty, range, {
      trackSize: CCKCConstants.SLIDER_TRACK_SIZE,
      thumbSize: CCKCConstants.THUMB_SIZE,
      majorTickLength: CCKCConstants.MAJOR_TICK_LENGTH,
      minorTickLength: CCKCConstants.MINOR_TICK_LENGTH,
      keyboardStep: sliderSteps.step,
      pageKeyboardStep: sliderSteps.pageKeyboardStep,

      // Snap to the nearest whole number.
      constrainValue: ( value: number ) => range.constrainValue( roundSymmetric( value ) ),
      phetioVisiblePropertyInstrumented: false,
      tandem: tandem.createTandem( 'slider' ),

      accessibleName: batteryResistanceControlString,

      createAriaValueText: ( value: number ) => CircuitConstructionKitCommonFluent.a11y.sourceResistanceControl.ariaValueText.format( { resistance: value } ),

      valueChangeSoundGeneratorOptions: {
        numberOfMiddleThresholds: numberOfTickIntervals - 1
      }
    } );
    slider.addMajorTick( range.min, createLabel( CircuitConstructionKitCommonFluent.tinyStringProperty, tandem.createTandem( 'tinyLabelText' ) ) );
    slider.addMajorTick( midpoint );
    slider.addMajorTick( range.max, createLabel( new PatternStringProperty( resistanceOhmsSymbolStringProperty, {
      resistance: toFixed( range.max, 0 )
    }, {
      tandem: tandem.createTandem( 'maxLabelText' ).createTandem( Text.STRING_PROPERTY_TANDEM_NAME )
    } ), tandem.createTandem( 'maxLabelText' ) ) );

    for ( let i = range.min + 1; i < range.max; i++ ) {
      if ( Math.abs( i - midpoint ) > 1E-6 ) {
        slider.addMinorTick( i );
      }
    }

    const titleNode = new Text( batteryResistanceControlString, combineOptions<TextOptions>( {
      fill: CCKCColors.textFillProperty,
      tandem: tandem.createTandem( 'titleText' )
    }, titleConfig ) );
    super( {
      children: [ titleNode, slider ],
      tandem: tandem,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    } );
  }
}

circuitConstructionKitCommon.register( 'SourceResistanceControl', SourceResistanceControl );