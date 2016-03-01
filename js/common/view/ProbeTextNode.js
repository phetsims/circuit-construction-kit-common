// Copyright 2016, University of Colorado Boulder

/**
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

  function ProbeTextNode( textProperty ) {

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
    Node.call( this, {
      children: [ textBox, readout ]
    } );
  }

  return inherit( Node, ProbeTextNode );
} );