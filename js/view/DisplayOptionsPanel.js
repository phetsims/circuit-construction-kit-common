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
  var CircuitConstructionKitPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitConstructionKitPanel' );
  var ChargeNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ChargeNode' );
  var Text = require( 'SCENERY/nodes/Text' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HStrut = require( 'SCENERY/nodes/HStrut' );
  var CheckBox = require( 'SUN/CheckBox' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var Property = require( 'AXON/Property' );
  var Charge = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Charge' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );

  // strings
  var electronsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/electrons' );
  var conventionalString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/conventional' );
  var labelsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/labels' );
  var valuesString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/values' );
  var ElectronChargeNode = require( 'SCENERY_PHET/ElectronChargeNode' );

  // constants
  var TEXT_OPTIONS = {
    fontSize: 16,
    maxWidth: 120
  };

  // TODO: copied
  var ARROW_LENGTH = 23; // view coordinates

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
     * @param {Tandem} tandem
     * @returns {AquaRadioButton}
     */
    var createRadioButton = function( currentType, node, tandem ) {
      return new AquaRadioButton( currentTypeProperty, currentType, node, {
        radius: 8,
        tandem: tandem
      } );
    };

    var textIconSpacing = 11;

    var electronsText = new Text( electronsString, TEXT_OPTIONS );
    var conventionalText = new Text( conventionalString, TEXT_OPTIONS );
    var largerTextWidth = Math.max( electronsText.width, conventionalText.width );
    var electronsBox = new HBox( {
      spacing: largerTextWidth - electronsText.width + textIconSpacing,
      children: [ electronsText, new ElectronChargeNode() ]
    } );

    var conventionalBox = new HBox( {
      spacing: largerTextWidth - conventionalText.width + textIconSpacing,

      // TODO: arrow is duplicated with ChargeNode
      children: [ conventionalText, new ArrowNode( -ARROW_LENGTH / 2, 0, ARROW_LENGTH / 2, 0, {
        headHeight: 10,
        headWidth: 12,
        tailWidth: 3,
        fill: 'red',
        stroke: 'white'
      } ) ]
    } );
    var electronsRadioButton = createRadioButton( 'electrons', electronsBox, tandem.createTandem( 'electronsRadioButton' ) );
    var conventionalRadioButton = createRadioButton( 'conventional', conventionalBox, tandem.createTandem( 'conventionalRadioButton' ) );

    // Gray out current view options when current is not selected.
    showCurrentProperty.linkAttribute( electronsRadioButton, 'enabled' );
    showCurrentProperty.linkAttribute( conventionalRadioButton, 'enabled' );

    var children = [

      // Show Current and sub-checkboxes
      new VBox( {
        align: 'left',
        spacing: 8,
        children: [
          new CheckBox( new Text( 'Show Current', TEXT_OPTIONS ), showCurrentProperty, {
            tandem: tandem.createTandem( 'showCurrentCheckBox' )
          } ),
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
      new CheckBox( new Text( labelsString, TEXT_OPTIONS ), showLabelsProperty, {
        tandem: tandem.createTandem( 'labelsCheckBox' )
      } ),
      new CheckBox( new Text( valuesString, TEXT_OPTIONS ), showValuesProperty, {
        tandem: tandem.createTandem( 'valuesCheckBox' )
      } )
    ];

    CircuitConstructionKitPanel.call( this, new VBox( {
      children: children,
      spacing: 10,
      align: 'left'
    } ), tandem, {
      yMargin: 10
    } );
  }

  circuitConstructionKitCommon.register( 'DisplayOptionsPanel', DisplayOptionsPanel );

  return inherit( CircuitConstructionKitPanel, DisplayOptionsPanel );
} );