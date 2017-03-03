// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * This control panel shows checkboxes for "Show Electrons", etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitConstructionKitPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CircuitConstructionKitPanel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var CheckBox = require( 'SUN/CheckBox' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );

  /**
   * @param {Property} showCurrentProperty - true if current should be shown
   * @param {Property} currentTypeProperty - true if current should be shown as electrons or conventional
   * @param {Property} showValuesProperty - true if values should be shown
   * @param {Property} showLabelsProperty - true if toolbox labels should be shown
   * @param {Tandem} tandem
   * @param {Object} options
   * @constructor
   */
  function DisplayOptionsPanel( showCurrentProperty, currentTypeProperty, showValuesProperty, showLabelsProperty, tandem, options ) {
    options = _.extend( {
      showElectronsCheckBox: true,
      showConventionalCurrentCheckBox: true,
      showValuesCheckBox: true,
      showCurrentCheckBox: true
    }, options );
    var textOptions = {
      fontSize: 16
    };
    var aquaRadioButtonOptions = {
      radius: 8
    };

    var children = [];
    children.push( new VBox( {
      align: 'left',
      spacing: 8,
      children: [
        new CheckBox( new Text( 'Show Current', textOptions ), showCurrentProperty ),
        new HBox( {
          children: [
            new HStrut( 30 ),
            new VBox( {
              align: 'left',
              spacing: 6,
              children: [
                new AquaRadioButton( currentTypeProperty, 'electrons', new Text( 'Electrons', textOptions ), aquaRadioButtonOptions ),
                new AquaRadioButton( currentTypeProperty, 'conventional', new Text( 'Conventional', textOptions ), aquaRadioButtonOptions )
              ]
            } )
          ]
        } )
      ]
    } ) );

    children.push( new CheckBox( new Text( 'Labels', textOptions ), showLabelsProperty ) );
    children.push( new CheckBox( new Text( 'Values', textOptions ), showValuesProperty ) );
    var vbox = new VBox( {
      children: children,
      spacing: 10,
      align: 'left'
    } );

    CircuitConstructionKitPanel.call( this, vbox, tandem );
  }

  circuitConstructionKitCommon.register( 'DisplayOptionsPanel', DisplayOptionsPanel );

  return inherit( CircuitConstructionKitPanel, DisplayOptionsPanel );
} );