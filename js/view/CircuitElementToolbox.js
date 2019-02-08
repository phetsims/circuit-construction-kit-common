// Copyright 2016-2017, University of Colorado Boulder

/**
 * Toolbox from which CircuitElements can be dragged or returned.  Exists for the life of the sim and hence does not
 * require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const AlignGroup = require( 'SCENERY/nodes/AlignGroup' );
  const Carousel = require( 'SUN/Carousel' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Color = require( 'SCENERY/util/Color' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const PageControl = require( 'SUN/PageControl' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // constants
  const CAROUSEL_ITEM_SPACING = 27;
  const CAROUSEL_PAGE_HEIGHT = 352; // so the carousels will be the same size on each screen
  const ITEMS_PER_PAGE = 5;

  class CircuitElementToolbox extends HBox {

    /**
     * @param {Property.<CircuitElementViewType>} viewTypeProperty
     * @param {CircuitElementToolNode[]} circuitElementToolNodes
     * @param {Tandem} tandem
     */
    constructor( viewTypeProperty, circuitElementToolNodes, tandem ) {

      // Carousel was optimized for items of equal size.  To get equal spacing between objects, we create our own pages
      // see https://github.com/phetsims/circuit-construction-kit-dc/issues/91
      const pages = _.chunk( circuitElementToolNodes, ITEMS_PER_PAGE ).map( elements => new VBox( { children: elements } ) );

      // The schematic and lifelike icons have different dimensions, so update the spacing when the view type changes
      viewTypeProperty.link( () => {

        // Track the spacings so that any non-filled pages can take the average spacing of the other pages
        const spacings = [];
        pages.forEach( page => {

          // Zero out the spacing so we can compute the height without any spacing
          page.setSpacing( 0 );

          // Set the spacing so that items will fill the available area
          const spacing = ( CAROUSEL_PAGE_HEIGHT - page.height ) / ( page.children.length - 1 );
          page.setSpacing( spacing );

          // Track the spacings of filled pages so that the average can be used for non-filled pages
          if ( page.children.length === ITEMS_PER_PAGE ) {
            spacings.push( spacing );
          }
        } );
        const averageSpacing = _.sum( spacings ) / spacings.length;

        pages.forEach( page => {
          if ( page.children.length !== ITEMS_PER_PAGE ) {
            page.setSpacing( averageSpacing );
          }
        } );
      } );

      // Make sure that non-filled pages have the same top
      const alignGroup = new AlignGroup();
      const alignedPages = pages.map( page => alignGroup.createBox( page, { yAlign: 'top' } ) );

      // create the carousel
      const carousel = new Carousel( alignedPages, {
        orientation: 'vertical',
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
        dotMouseAreaDilation: 4
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

  return circuitConstructionKitCommon.register( 'CircuitElementToolbox', CircuitElementToolbox );
} );