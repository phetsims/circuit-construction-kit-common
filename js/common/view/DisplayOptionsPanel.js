// Copyright 2016-2017, University of Colorado Boulder

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

  // constants
  var TEXT_OPTIONS = {
    fontSize: 16
  };

  /**
   * @param {Property.<boolean>} showCurrentProperty - true if current should be shown
   * @param {Property.<boolean>} currentTypeProperty - true if current should be shown as electrons or conventional
   * @param {Property.<boolean>} showValuesProperty - true if values should be shown
   * @param {Property.<boolean>} showLabelsProperty - true if toolbox labels should be shown
   * @param {Tandem} tandem
   * @constructor
   */
  function DisplayOptionsPanel( showCurrentProperty, currentTypeProperty, showValuesProperty, showLabelsProperty, tandem ) {

    /**
     * Create an AquaRadioButton for the specified kind of current
     * @param {string} currentType - 'electrons'|'conventional'
     * @param {string} text - the text to display in the button
     * @returns {AquaRadioButton}
     */
    var createRadioButton = function( currentType, text ) {
      return new AquaRadioButton( currentTypeProperty, currentType, new Text( text, TEXT_OPTIONS ), {
        radius: 8
      } );
    };
    var electronsRadioButton = createRadioButton( 'electrons', 'Electrons' ); // TODO: i18n
    var conventionalRadioButton = createRadioButton( 'conventional', 'Conventional' ); // TODO: i18n

    // Gray out current view options when current is not selected.
    showCurrentProperty.linkAttribute( electronsRadioButton, 'enabled' );
    showCurrentProperty.linkAttribute( conventionalRadioButton, 'enabled' );

    var children = [

      // Show Current and sub-checkboxes
      new VBox( {
        align: 'left',
        spacing: 8,
        children: [
          new CheckBox( new Text( 'Show Current', TEXT_OPTIONS ), showCurrentProperty ),
          new HBox( {
            children: [

              // Indent the sub-checkboxes
              new HStrut( 30 ),
              new VBox( {
                align: 'left',
                spacing: 6,
                children: [
                  electronsRadioButton,
                  conventionalRadioButton
                ]
              } )
            ]
          } )
        ]
      } ),
      new CheckBox( new Text( 'Labels', TEXT_OPTIONS ), showLabelsProperty ),
      new CheckBox( new Text( 'Values', TEXT_OPTIONS ), showValuesProperty )
    ];

    CircuitConstructionKitPanel.call( this, new VBox( {
      children: children,
      spacing: 10,
      align: 'left'
    } ), tandem );
  }

  circuitConstructionKitCommon.register( 'DisplayOptionsPanel', DisplayOptionsPanel );

  return inherit( CircuitConstructionKitPanel, DisplayOptionsPanel );
} );