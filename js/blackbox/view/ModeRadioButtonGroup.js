// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Radio buttons for choosing 'Investigate Circuit' or 'Build Circuit'
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );

  function ModeRadioButtonGroup( modeProperty, tandem ) {
    var textOptions = { fontSize: 18 };
    RadioButtonGroup.call( this, modeProperty, [ {
      value: 'investigate',
      node: new Text( 'Investigate Circuit', textOptions ),
      tandem: tandem.createTandem( 'investigateCircuitButton' )
    }, {
      value: 'build',
      node: new Text( 'Build Circuit', textOptions ),
      tandem: tandem.createTandem( 'buildCircuitButton' )
    } ], {
      tandem: tandem,
      baseColor: 'white',
      buttonContentXMargin: 10,
      buttonContentYMargin: 15,
      selectedStroke: PhetColorScheme.RESET_ALL_BUTTON_BASE_COLOR,
      selectedLineWidth: 2.5
    } );
  }

  circuitConstructionKit.register( 'ModeRadioButtonGroup', ModeRadioButtonGroup );

  return inherit( RadioButtonGroup, ModeRadioButtonGroup );
} );