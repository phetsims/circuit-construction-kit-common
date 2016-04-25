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

  function RevealButton( revealingProperty, enabledProperty ) {

    RoundMomentaryButton.call( this, false, true, revealingProperty, {
      baseColor: 'yellow',
      minXMargin: 15,
      minYMargin: 15,
      content: new VBox( {
        spacing: 5,
        children: [
          new FontAwesomeNode( 'eye_open', { scale: 0.75 } ),
          new Text( 'Reveal', { fontSize: 15 } )
        ]
      } )
    } );
    enabledProperty.linkAttribute( this, 'enabled' );
  }

  return inherit( RoundMomentaryButton, RevealButton, {} );
} );