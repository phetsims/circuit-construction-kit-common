// Copyright 2017-2019, University of Colorado Boulder

/**
 * AccordionBox that is customized with constants for Circuit Construction Kit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const AccordionBox = require( 'SUN/AccordionBox' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const HStrut = require( 'SCENERY/nodes/HStrut' );
  const merge = require( 'PHET_CORE/merge' );
  const Text = require( 'SCENERY/nodes/Text' );

  // constants
  const BUTTON_MARGIN = 8;

  class CCKCAccordionBox extends AccordionBox {

    /**
     * @param {Node} content - the content to display in the accordion box when it is expanded
     * @param {string} title - the text to display in the title bar
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( content, title, tandem, options ) {

      options = options || {};
      super( content, merge( {
        fill: CCKCConstants.PANEL_COLOR,
        cornerRadius: CCKCConstants.CORNER_RADIUS,
        titleXMargin: 10,
        buttonXMargin: BUTTON_MARGIN,
        buttonYMargin: BUTTON_MARGIN,
        titleYMargin: 4,
        titleXSpacing: 14,
        contentYSpacing: 0,
        lineWidth: CCKCConstants.PANEL_LINE_WIDTH,
        minWidth: CCKCConstants.RIGHT_SIDE_PANEL_MIN_WIDTH,
        expandedProperty: new BooleanProperty( false, {
          tandem: tandem.createTandem( 'expandedProperty' )
        } ),

        // Expand touch area to match the margins
        expandCollapseButtonOptions: {
          touchAreaYDilation: BUTTON_MARGIN,
          touchAreaXDilation: BUTTON_MARGIN
        },
        titleNode: new HBox( {
          children: [
            new HStrut( options.strutWidth || 10 ),
            new Text( title, {
              fontSize: CCKCConstants.FONT_SIZE,
              maxWidth: 175,
              tandem: tandem.createTandem( 'titleNode' )
            } )
          ]
        } ),
        tandem: tandem
      }, options ) );
    }
  }

  return circuitConstructionKitCommon.register( 'CCKCAccordionBox', CCKCAccordionBox );
} );