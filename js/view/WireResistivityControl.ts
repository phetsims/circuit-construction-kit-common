// Copyright 2017-2026, University of Colorado Boulder

/**
 * Controls for showing and changing the wire resistivity.  Exists for the life of the sim and hence does not require a
 * dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type Property from '../../../axon/js/Property.js';
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

const lotsStringProperty = CircuitConstructionKitCommonFluent.lotsStringProperty;
const tinyStringProperty = CircuitConstructionKitCommonFluent.tinyStringProperty;
const wireResistivityStringProperty = CircuitConstructionKitCommonFluent.wireResistivityStringProperty;
const ariaValueTextPattern = CircuitConstructionKitCommonFluent.a11y.wireResistivityControl.ariaValueText;

// constants
const TICK_LABEL_TEXT_OPTIONS = { fontSize: 12, maxWidth: 45, fill: CCKCColors.textFillProperty };

export default class WireResistivityControl extends VBox {

  /**
   * @param wireResistivityProperty
   * @param alignGroup - for alignment with other controls
   * @param titleConfig
   * @param tandem
   */
  public constructor( wireResistivityProperty: Property<number>, alignGroup: AlignGroup, titleConfig: TextOptions, tandem: Tandem ) {

    const titleNode = new Text( wireResistivityStringProperty,
      combineOptions<TextOptions>( { tandem: tandem.createTandem( 'titleText' ), fill: CCKCColors.textFillProperty }, titleConfig ) );

    const slider = new HSlider( wireResistivityProperty, CCKCConstants.WIRE_RESISTIVITY_RANGE, {
      trackSize: CCKCConstants.SLIDER_TRACK_SIZE,
      thumbSize: CCKCConstants.THUMB_SIZE,
      majorTickLength: CCKCConstants.MAJOR_TICK_LENGTH,
      shiftKeyboardStep: CCKCConstants.WIRE_RESISTIVITY_RANGE.getLength() / 100,
      phetioVisiblePropertyInstrumented: false,
      tandem: tandem.createTandem( 'slider' ),
      accessibleName: wireResistivityStringProperty,
      accessibleHelpText: CircuitConstructionKitCommonFluent.a11y.wireResistivityControl.accessibleHelpTextStringProperty,
      createAriaValueText: value => ariaValueTextPattern.format( {
        resistivity: value < 1E-4 ? value.toString() : toFixed( value, 4 )
      } )
    } );

    slider.addMajorTick( 0, new Text( tinyStringProperty, TICK_LABEL_TEXT_OPTIONS ) );
    slider.addMajorTick( CCKCConstants.WIRE_RESISTIVITY_RANGE.max, new Text( lotsStringProperty, TICK_LABEL_TEXT_OPTIONS ) );

    super( {
      children: [ titleNode, slider ],
      tandem: tandem,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    } );
  }
}

circuitConstructionKitCommon.register( 'WireResistivityControl', WireResistivityControl );