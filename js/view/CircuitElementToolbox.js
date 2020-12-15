// Copyright 2016-2020, University of Colorado Boulder

/**
 * Toolbox from which CircuitElements can be dragged or returned.  Exists for the life of the sim and hence does not
 * require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import AlignGroup from '../../../scenery/js/nodes/AlignGroup.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import Color from '../../../scenery/js/util/Color.js';
import Carousel from '../../../sun/js/Carousel.js';
import PageControl from '../../../sun/js/PageControl.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

// constants
const CAROUSEL_ITEM_SPACING = 27;

class CircuitElementToolbox extends HBox {

  /**
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {CircuitElementToolNode[]} circuitElementToolNodes
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( viewTypeProperty, circuitElementToolNodes, tandem, options ) {

    options = merge( {
      itemsPerPage: 5,
      pageHeight: 352 // so the carousels can easily be the same size on each screen
    }, options );

    // Carousel was optimized for items of equal size.  To get equal spacing between objects, we create our own pages
    // see https://github.com/phetsims/circuit-construction-kit-dc/issues/91 and https://github.com/phetsims/sun/issues/541
    const pages = _.chunk( circuitElementToolNodes, options.itemsPerPage ).map( elements => new VBox( {
      children: elements,
      excludeInvisibleChildrenFromBounds: false
    } ) );

    // The schematic and lifelike icons have different dimensions, so update the spacing when the view type changes
    viewTypeProperty.link( () => {

      // Track the spacings so that any non-filled pages can take the average spacing of the other pages
      const spacings = [];
      pages.forEach( page => {

        // Zero out the spacing so we can compute the height without any spacing
        page.setSpacing( 0 );

        // Set the spacing so that items will fill the available area
        const denominator = page.children.length - 1;
        if ( denominator > 0 ) {
          const spacing = ( options.pageHeight - page.height ) / denominator;
          page.setSpacing( spacing );

          // Track the spacings of filled pages so that the average can be used for non-filled pages
          if ( page.children.length === options.itemsPerPage ) {
            spacings.push( spacing );
          }
        }
      } );
      if ( spacings.length > 0 ) {
        const averageSpacing = _.sum( spacings ) / spacings.length;

        pages.forEach( page => {
          if ( page.children.length !== options.itemsPerPage ) {
            page.setSpacing( averageSpacing );
          }
        } );
      }
    } );

    // Make sure that non-filled pages have the same top
    const alignGroup = new AlignGroup();
    const alignedPages = pages.map( page => alignGroup.createBox( page, { yAlign: 'top' } ) );

    // create the carousel
    const carousel = new Carousel( alignedPages, {
      orientation: 'vertical',

      // Carousel was optimized for items of equal size.  To get equal spacing between objects, we create our own pages
      // see https://github.com/phetsims/circuit-construction-kit-dc/issues/91 and https://github.com/phetsims/sun/issues/541
      itemsPerPage: 1,
      spacing: CAROUSEL_ITEM_SPACING, // Determines the vertical margins
      margin: 15,

      // Expand the touch area above the up button and below the down button
      buttonTouchAreaYDilation: 8,

      tandem: tandem.createTandem( 'carousel' )
    } );

    const pageControl = new PageControl( carousel.numberOfPages, carousel.pageNumberProperty, {
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

    // @private
    this.carousel = carousel;
  }

  /**
   * Resets the toolbox.
   * @override
   * @public
   */
  reset() {
    this.carousel.reset( { animationEnabled: false } );
  }
}

circuitConstructionKitCommon.register( 'CircuitElementToolbox', CircuitElementToolbox );
export default CircuitElementToolbox;