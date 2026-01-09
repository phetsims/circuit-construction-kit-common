// Copyright 2016-2025, University of Colorado Boulder

/**
 * Toolbox from which CircuitElements can be dragged or returned.  Exists for the life of the sim and hence does not
 * require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type Property from '../../../axon/js/Property.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import HBox, { type HBoxOptions } from '../../../scenery/js/layout/nodes/HBox.js';
import Color from '../../../scenery/js/util/Color.js';
import Carousel, { type CarouselItem, type CarouselOptions } from '../../../sun/js/Carousel.js';
import PageControl from '../../../sun/js/PageControl.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import type CircuitElementViewType from '../model/CircuitElementViewType.js';
import CCKCColors from './CCKCColors.js';

// constants

type SelfOptions = {
  carouselOptions?: CarouselOptions;
  carouselScale: number;
};
export type CircuitElementToolboxOptions = SelfOptions & HBoxOptions;

export default class CircuitElementToolbox extends HBox {
  public readonly carousel: Carousel;

  public constructor( viewTypeProperty: Property<CircuitElementViewType>, circuitElementToolItems: CarouselItem[], tandem: Tandem, providedOptions?: CircuitElementToolboxOptions ) {

    providedOptions = optionize<CircuitElementToolboxOptions, SelfOptions, HBoxOptions>()( {
      carouselOptions: {

        itemsPerPage: 5,

        orientation: 'vertical',

        buttonOptions: {
          // Expand the touch area above the up button and below the down button
          touchAreaXDilation: 8
        },

        spacing: 24,

        margin: 12,

        separatorsVisible: true,

        fill: CCKCColors.panelFillProperty,

        stroke: CCKCColors.panelStrokeProperty,

        tandem: tandem.createTandem( 'carousel' )
      }
    }, providedOptions );

    // create the carousel
    const carousel = new Carousel( circuitElementToolItems, combineOptions<CarouselOptions>( {}, providedOptions.carouselOptions, {
      accessibleName: CircuitConstructionKitCommonFluent.a11y.circuitComponentToolbox.carousel.accessibleNameStringProperty,
      accessibleHelpText: CircuitConstructionKitCommonFluent.a11y.circuitComponentToolbox.carousel.accessibleHelpTextStringProperty
    } ) );
    carousel.mutate( { scale: providedOptions.carouselScale } );

    const pageControl = new PageControl( carousel.pageNumberProperty, carousel.numberOfPagesProperty, {
      orientation: 'vertical',
      pageFill: Color.WHITE,
      pageStroke: Color.BLACK,
      currentPageStroke: Color.TRANSPARENT,
      interactive: true,
      tandem: tandem.createTandem( 'pageControl' )
    } );

    carousel.insertPageControl( pageControl );

    super( {
      spacing: 5,
      children: [ pageControl, carousel ],
      tandem: tandem,
      visiblePropertyOptions: {
        phetioFeatured: true
      }
    } );

    this.carousel = carousel;
  }

  /**
   * Resets the toolbox.
   */
  public reset(): void {
    this.carousel.reset();
  }
}

circuitConstructionKitCommon.register( 'CircuitElementToolbox', CircuitElementToolbox );
