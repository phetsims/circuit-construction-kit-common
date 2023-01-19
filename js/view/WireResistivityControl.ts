// Copyright 2017-2022, University of Colorado Boulder

/**
 * Controls for showing and changing the wire resistivity.  Exists for the life of the sim and hence does not require a
 * dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import { AlignGroup, Text, VBox } from '../../../scenery/js/imports.js';
import HSlider from '../../../sun/js/HSlider.js';
import CCKCConstants from '../CCKCConstants.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Property from '../../../axon/js/Property.js';
import Tandem from '../../../tandem/js/Tandem.js';

const lotsStringProperty = CircuitConstructionKitCommonStrings.lotsStringProperty;
const tinyStringProperty = CircuitConstructionKitCommonStrings.tinyStringProperty;
const wireResistivityStringProperty = CircuitConstructionKitCommonStrings.wireResistivityStringProperty;

// constants
const TICK_LABEL_TEXT_OPTIONS = { fontSize: 12, maxWidth: 45 };

export default class WireResistivityControl extends VBox {

  /**
   * @param wireResistivityProperty
   * @param alignGroup - for alignment with other controls
   * @param titleConfig
   * @param tandem
   */
  public constructor( wireResistivityProperty: Property<number>, alignGroup: AlignGroup, titleConfig: object, tandem: Tandem ) {

    const titleNode = new Text( wireResistivityStringProperty, titleConfig );

    const slider = new HSlider( wireResistivityProperty, new Range(
      CCKCConstants.MIN_WIRE_RESISTIVITY,
      CCKCConstants.MAX_WIRE_RESISTIVITY // large enough so that max resistance in a 9v battery slows to a good rate
    ), {
      trackSize: CCKCConstants.SLIDER_TRACK_SIZE,
      thumbSize: CCKCConstants.THUMB_SIZE,
      majorTickLength: CCKCConstants.MAJOR_TICK_LENGTH,
      tandem: tandem.createTandem( 'slider' )
    } );

    slider.addMajorTick( 0, new Text( tinyStringProperty, TICK_LABEL_TEXT_OPTIONS ) );
    slider.addMajorTick( CCKCConstants.MAX_WIRE_RESISTIVITY, new Text( lotsStringProperty, TICK_LABEL_TEXT_OPTIONS ) );

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