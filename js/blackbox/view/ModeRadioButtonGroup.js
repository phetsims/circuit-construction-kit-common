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
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );

  // phet-io modules
  var TString = require( 'ifphetio!PHET_IO/types/TString' );

  function ModeRadioButtonGroup( modeProperty, tandem ) {
    var textOptions = { fontSize: 18 };
    RadioButtonGroup.call( this, modeProperty, [ {
      value: 'investigate',
      node: new Text( 'Investigate Circuit', textOptions ),
      tandem: tandem.createTandem( 'investigateCircuitButton' ),
      phetioValueType: TString
    }, {
      value: 'build',
      node: new Text( 'Build Circuit', textOptions ),
      tandem: tandem.createTandem( 'buildCircuitButton' ),
      phetioValueType: TString
    } ], {
      tandem: tandem,
      baseColor: 'white',
      buttonContentXMargin: 10,
      buttonContentYMargin: 15,
      selectedStroke: PhetColorScheme.RESET_ALL_BUTTON_BASE_COLOR,
      selectedLineWidth: 2.5
    } );
  }

  circuitConstructionKitCommon.register( 'ModeRadioButtonGroup', ModeRadioButtonGroup );

  return inherit( RadioButtonGroup, ModeRadioButtonGroup );
} );