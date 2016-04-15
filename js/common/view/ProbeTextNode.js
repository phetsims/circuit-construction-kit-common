// Copyright 2016, University of Colorado Boulder

/**
 * Shows the title (above) and dynamic readout (below) for the ammeter and voltmeter.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @param {Property} textProperty - the text that should be displayed
   * @param {string} title - the title
   * @param {Object} [options]
   * @constructor
   */
  function ProbeTextNode( textProperty, title, options ) {

    var readout = new Text( '?', { fontSize: 34 } );
    var textBox = new Rectangle( 0, 0, 140, 52, 10, 10, {
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

    VBox.call( this, {
      spacing: 6,

      align: 'center',
      children: [ new Text( title, { fontSize: 42 } ), readoutNode ]
    } );
    this.mutate( options );
  }

  return inherit( VBox, ProbeTextNode );
} );