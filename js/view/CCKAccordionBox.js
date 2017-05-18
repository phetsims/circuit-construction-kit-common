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
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Text = require( 'SCENERY/nodes/Text' );

  /**
   * @param {Node} content - the content to display in the accordion box when it is expanded
   * @param {string} title - the text to display in the title bar
   * @param {Tandem} tandem
   * @constructor
   */
  function CCKAccordionBox( content, title, tandem ) {
    AccordionBox.call( this, content, {
      fill: CircuitConstructionKitConstants.PANEL_COLOR,
      cornerRadius: CircuitConstructionKitConstants.CORNER_RADIUS,
      titleXMargin: 10,
      buttonXMargin: 10,
      titleYMargin: 4,
      titleXSpacing: 14,
      contentYSpacing: 4,
      tandem: tandem,
      minWidth: CircuitConstructionKitConstants.RIGHT_SIDE_PANEL_MIN_WIDTH,
      titleNode: new HBox( {
        children: [
          new HStrut( 10 ),
          new Text( title, { fontSize: 14, tandem: tandem.createTandem( title ) } )
        ],
        tandem: tandem
      } )
    } );
  }

  circuitConstructionKitCommon.register( 'CCKAccordionBox', CCKAccordionBox );

  return inherit( AccordionBox, CCKAccordionBox );
} );