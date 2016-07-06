// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Shows the title (above) and dynamic readout (below) for the ammeter and voltmeter.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var TandemText = require( 'TANDEM/scenery/nodes/TandemText' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @param {Property.<string>} textProperty - the text that should be displayed
   * @param {Property.<boolean>} runningProperty - true if the text should be displayed
   * @param {string} title - the title
   * @param {Object} [options]
   * @constructor
   */
  function ProbeTextNode( textProperty, runningProperty, title, tandem, options ) {

    var rectangleWidth = 140;

    var readout = new TandemText( '?', {
      fontSize: 34,
      maxWidth: rectangleWidth - 20,
      tandem: tandem.createTandem( 'readoutText' )
    } );
    var textBox = new Rectangle( 0, 0, rectangleWidth, 52, 10, 10, {
      lineWidth: 2, stroke: 'black', fill: 'white'
    } );

    textProperty.link( function( text ) {
      readout.setText( text );
      if ( text === '?' ) {
        readout.centerX = textBox.centerX;
      }
      else {
        readout.right = textBox.right - 10;
      }
      readout.bottom = textBox.bottom;
    } );
    var readoutNode = new Node( {
      children: [ textBox, readout ]
    } );
    runningProperty.linkAttribute( readout, 'visible' );

    VBox.call( this, {
      spacing: 6,

      align: 'center',
      children: [ new TandemText( title, {
        fontSize: 42,
        tandem: tandem.createTandem( 'titleText' )
      } ), readoutNode ]
    } );
    this.mutate( options );
  }

  circuitConstructionKitCommon.register( 'ProbeTextNode', ProbeTextNode );

  return inherit( VBox, ProbeTextNode );
} );