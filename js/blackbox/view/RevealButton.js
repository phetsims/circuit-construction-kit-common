// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RoundMomentaryButton = require( 'SUN/buttons/RoundMomentaryButton' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );

  function RevealButton( revealingProperty ) {
    RoundMomentaryButton.call( this, false, true, revealingProperty, {
      baseColor: 'yellow',
      minXMargin: 15,
      minYMargin: 15,
      content: new VBox( {
        children: [
          new FontAwesomeNode( 'eye_open' ),
          new Text( 'Reveal', { fontSize: 15 } )
        ]
      } )
    } );
  }

  return inherit( RoundMomentaryButton, RevealButton, {} );
} );