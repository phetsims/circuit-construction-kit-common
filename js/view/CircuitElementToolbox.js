// Copyright 2016-2017, University of Colorado Boulder

/**
 * Toolbox from which CircuitElements can be dragged or returned.  Exists for the life of the sim and hence does not
 * require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var AlignGroup = require( 'SCENERY/nodes/AlignGroup' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Color = require( 'SCENERY/util/Color' );
  var Carousel = require( 'SUN/Carousel' );
  var PageControl = require( 'SUN/PageControl' );

  // constants
  var CAROUSEL_ITEM_SPACING = 27;
  var CAROUSEL_PAGE_HEIGHT = 352; // so the carousels will be the same size on each screen
  var ITEMS_PER_PAGE = 5;

  /**
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {CircuitElementToolNode[]} circuitElementToolNodes
   * @param {Tandem} tandem
   * @constructor
   */
  function CircuitElementToolbox( viewTypeProperty, circuitElementToolNodes, tandem ) {

    // Carousel was optimized for items of equal size.  To get equal spacing between objects, we create our own pages
    // see https://github.com/phetsims/circuit-construction-kit-dc/issues/91
    var pages = _.chunk( circuitElementToolNodes, ITEMS_PER_PAGE ).map( function( elements ) {
      return new VBox( { children: elements } );
    } );

    // The schematic and lifelike icons have different dimensions, so update the spacing when the view type changes
    //REVIEW: This really feels like code that should be in the Carousel itself. I vaguely recall discussing this previously.
    //REVIEW^(samreid): This is under discussion in https://github.com/phetsims/sun/issues/307, please review and recommend
    viewTypeProperty.link( function() {

      // Track the spacings so that any non-filled pages can take the average spacing of the other pages
      var spacings = [];
      pages.forEach( function( page ) {

        // Zero out the spacing so we can compute the height without any spacing
        page.setSpacing( 0 );

        // Set the spacing so that items will fill the available area
        var spacing = ( CAROUSEL_PAGE_HEIGHT - page.height ) / ( page.children.length - 1 );
        page.setSpacing( spacing );

        // Track the spacings of filled pages so that the average can be used for non-filled pages
        if ( page.children.length === ITEMS_PER_PAGE ) {
          spacings.push( spacing );
        }
      } );
      var averageSpacing = _.sum( spacings ) / spacings.length;

      pages.forEach( function( page ) {
        if ( page.children.length !== ITEMS_PER_PAGE ) {
          page.setSpacing( averageSpacing );
        }
      } );
    } );

    // Make sure that non-filled pages have the same top
    var alignGroup = new AlignGroup();
    var alignedPages = pages.map( function( page ) { return alignGroup.createBox( page, { yAlign: 'top' } ); } );

    // create the carousel
    this.carousel = new Carousel( alignedPages, {
      orientation: 'vertical',
      itemsPerPage: 1,
      spacing: CAROUSEL_ITEM_SPACING, // Determines the vertical margins
      margin: 15,

      // Expand the touch area above the up button and below the down button
      buttonTouchAreaYDilation: 8,
      tandem: tandem.createTandem( 'carousel' )
    } );

    var pageControl = new PageControl( this.carousel.numberOfPages, this.carousel.pageNumberProperty, {
      orientation: 'vertical',
      pageFill: Color.WHITE,
      pageStroke: Color.BLACK,
      interactive: true,
      dotTouchAreaDilation: 4,
      dotMouseAreaDilation: 4
    } );

    HBox.call( this, {
      spacing: 5,
      children: [ pageControl, this.carousel ]
    } );
  }

  circuitConstructionKitCommon.register( 'CircuitElementToolbox', CircuitElementToolbox );

  return inherit( HBox, CircuitElementToolbox, {

    /**
     * Resets the toolbox.
     * @override
     * @public
     */
    reset: function() {
      this.carousel.reset( { animationEnabled: false } );
    }
  } );
} );