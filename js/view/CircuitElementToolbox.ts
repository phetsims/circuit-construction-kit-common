// Copyright 2016-2022, University of Colorado Boulder

/**
 * Toolbox from which CircuitElements can be dragged or returned.  Exists for the life of the sim and hence does not
 * require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import merge from '../../../phet-core/js/merge.js';
import { HBox, HBoxOptions } from '../../../scenery/js/imports.js';
import { Color } from '../../../scenery/js/imports.js';
import Carousel, { CarouselOptions } from '../../../sun/js/Carousel.js';
import PageControl from '../../../sun/js/PageControl.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import CircuitElementToolNode from './CircuitElementToolNode.js';

// constants

// This specifies the spacing between items and also the space before and after the first and last items
const CAROUSEL_ITEM_SPACING = 11;

type SelfOptions = {
  carouselOptions?: CarouselOptions;
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
  public constructor( viewTypeProperty: Property<CircuitElementViewType>, circuitElementToolNodes: CircuitElementToolNode[], tandem: Tandem, providedOptions?: CircuitElementToolboxOptions ) {

    providedOptions = merge( {
      carouselOptions: {

        itemsPerPage: 5,

        orientation: 'vertical',

        // Determines the vertical margins
        spacing: CAROUSEL_ITEM_SPACING,

        // this is only the horizontal margin
        margin: 13,

        // Expand the touch area above the up button and below the down button
        buttonTouchAreaYDilation: 8,

        tandem: tandem.createTandem( 'carousel' )
      }
    }, providedOptions );

    // create the carousel
    const carousel = new Carousel( circuitElementToolNodes, providedOptions.carouselOptions );
    carousel.mutate( { scale: CCKCConstants.CAROUSEL_SCALE } );

    const pageControl = new PageControl( carousel.pageNumberProperty, carousel.numberOfPages, {
      orientation: 'vertical',
      pageFill: Color.WHITE,
      pageStroke: Color.BLACK,
      interactive: true,
      dotTouchAreaDilation: 4,
      dotMouseAreaDilation: 4,
      tandem: tandem.createTandem( 'pageControl' )
    } );

    super( {
      spacing: 5,
      children: [ pageControl, carousel ]
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