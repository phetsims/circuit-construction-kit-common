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
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitConstructionKitCommonConstants =
    require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Text = require( 'SCENERY/nodes/Text' );

  /**
   * @param {Node} content - the content to display in the accordion box when it is expanded
   * @param {string} title - the text to display in the title bar
   * @param {Tandem} tandem
   * @constructor
   */
  function CircuitConstructionKitAccordionBox( content, title, tandem ) {
    AccordionBox.call( this, content, {
      fill: CircuitConstructionKitCommonConstants.PANEL_COLOR,
      cornerRadius: CircuitConstructionKitCommonConstants.CORNER_RADIUS,
      titleXMargin: 10,
      buttonXMargin: 8,
      buttonYMargin: 8,
      titleYMargin: 4,
      titleXSpacing: 14,
      contentYSpacing: 0,
      lineWidth: CircuitConstructionKitCommonConstants.PANEL_LINE_WIDTH,
      minWidth: CircuitConstructionKitCommonConstants.RIGHT_SIDE_PANEL_MIN_WIDTH,
      titleNode: new HBox( {
        children: [
          new HStrut( 10 ),
          new Text( title, {
            fontSize: CircuitConstructionKitCommonConstants.FONT_SIZE,
            maxWidth: 175,
            tandem: tandem.createTandem( title )
          } )
        ]
      } ),
      tandem: tandem
    } );
  }

  circuitConstructionKitCommon.register( 'CircuitConstructionKitAccordionBox', CircuitConstructionKitAccordionBox );

  return inherit( AccordionBox, CircuitConstructionKitAccordionBox );
} );