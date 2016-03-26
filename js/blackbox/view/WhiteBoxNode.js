// Copyright 2016, University of Colorado Boulder

/**
 * Shows an empty box for 'Build' mode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  function WhiteBoxNode( width, height, options ) {
    Node.call( this, {
      children: [
        new Rectangle( 0, 0, width, height, 20, 20, { stroke: 'gray', lineWidth: 2 } )
      ]
    } );
    this.mutate( options );
  }

  return inherit( Node, WhiteBoxNode );
} );