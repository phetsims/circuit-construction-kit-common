// Copyright 2016-2022, University of Colorado Boulder

/**
 * Toolbox from which CircuitElements can be dragged or returned.  Exists for the life of the sim and hence does not
 * require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import optionize from '../../../phet-core/js/optionize.js';
import { Color, HBox, HBoxOptions } from '../../../scenery/js/imports.js';
import Carousel, { CarouselItem, CarouselOptions } from '../../../sun/js/Carousel.js';
import PageControl from '../../../sun/js/PageControl.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';

// constants

type SelfOptions = {
  carouselOptions?: CarouselOptions;
  carouselScale: number;
};
export type CircuitElementToolboxOptions = SelfOptions & HBoxOptions;

export default class CircuitElementToolbox extends HBox {
  public readonly carousel: Carousel;

  /**
   * @param viewTypeProperty
   * @param circuitElementToolNodes
   * @param tandem
   * @param [providedOptions]
   */
  public constructor( viewTypeProperty: Property<CircuitElementViewType>, circuitElementToolNodes: CarouselItem[], tandem: Tandem, providedOptions?: CircuitElementToolboxOptions ) {

    providedOptions = optionize<CircuitElementToolboxOptions, SelfOptions, HBoxOptions>()( {
      carouselOptions: {

        itemsPerPage: 5,

        orientation: 'vertical',

        // Expand the touch area above the up button and below the down button
        buttonTouchAreaYDilation: 8,

        spacing: 24,

        margin: 12,

        separatorsVisible: true,

        tandem: tandem.createTandem( 'carousel' )
      }
    }, providedOptions );

    // create the carousel
    const carousel = new Carousel( circuitElementToolNodes, providedOptions.carouselOptions );
    carousel.mutate( { scale: providedOptions.carouselScale } );

    const pageControl = new PageControl( carousel.pageNumberProperty, carousel.numberOfPagesProperty, {
      orientation: 'vertical',
      pageFill: Color.WHITE,
      pageStroke: Color.BLACK,
      currentPageStroke: Color.TRANSPARENT,
      interactive: true,
      dotTouchAreaDilation: 4,
      dotMouseAreaDilation: 4,
      tandem: tandem.createTandem( 'pageControl' )
    } );

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