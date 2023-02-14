// Copyright 2017-2023, University of Colorado Boulder

/**
 * Controls for showing and changing the wire resistivity.  Exists for the life of the sim and hence does not require a
 * dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { AlignGroup, Text, TextOptions, VBox } from '../../../scenery/js/imports.js';
import HSlider from '../../../sun/js/HSlider.js';
import CCKCConstants from '../CCKCConstants.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Property from '../../../axon/js/Property.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import CCKCColors from './CCKCColors.js';

const lotsStringProperty = CircuitConstructionKitCommonStrings.lotsStringProperty;
const tinyStringProperty = CircuitConstructionKitCommonStrings.tinyStringProperty;
const wireResistivityStringProperty = CircuitConstructionKitCommonStrings.wireResistivityStringProperty;

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
      phetioVisiblePropertyInstrumented: false,
      tandem: tandem.createTandem( 'slider' )
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