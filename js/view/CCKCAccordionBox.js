// Copyright 2017, University of Colorado Boulder

/**
 * AccordionBox that is customized with constants for Circuit Construction Kit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var AccordionBox = require( 'SUN/AccordionBox' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Text = require( 'SCENERY/nodes/Text' );

  /**
   * @param {Node} content - the content to display in the accordion box when it is expanded
   * @param {string} title - the text to display in the title bar
   * @param {Tandem} tandem
   * @constructor
   */
  function CCKCAccordionBox( content, title, tandem ) {
    AccordionBox.call( this, content, {
      fill: CCKCConstants.PANEL_COLOR,
      cornerRadius: CCKCConstants.CORNER_RADIUS,
      titleXMargin: 10,
      buttonXMargin: 8,
      buttonYMargin: 8,
      titleYMargin: 4,
      titleXSpacing: 14,
      contentYSpacing: 0,
      lineWidth: CCKCConstants.PANEL_LINE_WIDTH,
      minWidth: CCKCConstants.RIGHT_SIDE_PANEL_MIN_WIDTH,
      expandedProperty: new Property( false ),
      titleNode: new HBox( {
        children: [
          new HStrut( 10 ),
          new Text( title, {
            fontSize: CCKCConstants.FONT_SIZE,
            maxWidth: 175,
            tandem: tandem
          } )
        ]
      } ),
      tandem: tandem
    } );
  }

  circuitConstructionKitCommon.register( 'CCKCAccordionBox', CCKCAccordionBox );

  return inherit( AccordionBox, CCKCAccordionBox );
} );