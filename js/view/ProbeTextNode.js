// Copyright 2016-2017, University of Colorado Boulder

/**
 * Shows the title (above) and dynamic readout (below) for the ammeter and voltmeter. Exists for the life of the sim
 * and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Color = require( 'SCENERY/util/Color' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  const questionMarkString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/questionMark' );

  // constants
  const TEXT_BOX_WIDTH = 140;

  /**
   * @param {Property.<string>} textProperty - the text that should be displayed
   * @param {Property.<boolean>} showResultsProperty - true if the text should be displayed
   * @param {string} title - the title
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function ProbeTextNode( textProperty, showResultsProperty, title, tandem, options ) {

    options = _.extend( {
      spacing: 3
    }, options );

    const readout = new Text( textProperty.value, {
      fontSize: 40,
      maxWidth: TEXT_BOX_WIDTH - 20,
      tandem: tandem.createTandem( 'readoutText' )
    } );

    const textBox = new Rectangle( 0, 0, TEXT_BOX_WIDTH, 52, {
      cornerRadius: 10,
      lineWidth: 2,
      stroke: Color.BLACK,
      fill: Color.WHITE
    } );

    textProperty.link( text => {
      readout.setText( text );
      if ( text === questionMarkString ) {

        // ? is centered
        readout.centerX = textBox.centerX;
      }
      else {

        // numbers are right-aligned
        readout.right = textBox.right - 10;
      }

      // vertically center
      readout.centerY = textBox.centerY;
    } );

    // Update visibility when show results property changes
    showResultsProperty.linkAttribute( readout, 'visible' );

    // set the children
    options.children = [ new Text( title, {
      fontSize: 42,
      maxWidth: 190,
      tandem: tandem.createTandem( 'titleText' )
    } ), new Node( {
      children: [ textBox, readout ]
    } ) ];

    VBox.call( this, options );
  }

  circuitConstructionKitCommon.register( 'ProbeTextNode', ProbeTextNode );

  return inherit( VBox, ProbeTextNode );
} );