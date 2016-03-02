// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );

  function ModeRadioButtonGroup( modeProperty ) {
    var textOptions = { fontSize: 18 };
    RadioButtonGroup.call( this, modeProperty, [
      {
        value: 'investigate',
        node: new Text( 'Investigate Circuit', textOptions )
      },
      {
        value: 'build',
        node: new Text( 'Build Circuit', textOptions )
      }
    ], {
      baseColor: 'white',
      buttonContentXMargin: 10,
      buttonContentYMargin: 15,
      selectedStroke: ResetAllButton.RESET_ALL_BUTTON_BASE_COLOR,
      selectedLineWidth: 2.5
    } );
  }

  return inherit( RadioButtonGroup, ModeRadioButtonGroup );
} );