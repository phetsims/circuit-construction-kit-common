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
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var VerticalCheckBoxGroup = require( 'SUN/VerticalCheckBoxGroup' );
  var CircuitConstructionKitPanel = require( 'CIRCUIT_CONSTRUCTION_KIT/common/view/CircuitConstructionKitPanel' );
  var Text = require( 'SCENERY/nodes/Text' );

  /**
   * @param {Property} showElectronsProperty - true if electrons should be shown
   * @param {Property} conventionalCurrentProperty - true to show the coventional current direction
   * @param {Property} showValuesProperty - true if values should be shown
   * @param {Object} options
   * @constructor
   */
  function DisplayOptionsPanel( showElectronsProperty, conventionalCurrentProperty, showValuesProperty, tandem, options ) {
    options = _.extend( {
      showElectronsCheckBox: true,
      showConventionalCurrentCheckBox: true,
      showValuesCheckBox: true
    }, options );
    var textOptions = { fontSize: 14 };
    var array = [];

    /**
     * Create an item to be used in a VerticalCheckBoxGroup
     * @param {string} text - the text to display
     * @param {Property.<boolean>} property - the property to wire to the checkbox
     * @param {string} tandemName - the name to use for the dynamically-created subtandem
     * @returns {Object}
     */
    var createItem = function( text, property, tandemName ) {
      return {
        content: new Text( text, textOptions ),
        property: property,
        tandemName: tandemName
      };
    };
    options.showElectronsCheckBox && array.push( createItem( 'Show Electrons', showElectronsProperty, 'showElectronsCheckBox' ) );
    options.showConventionalCurrentCheckBox && array.push( createItem( 'Conventional Current', conventionalCurrentProperty, 'showConventionalCurrentCheckBox' ) );
    options.showValuesCheckBox && array.push( createItem( 'Values', showValuesProperty, 'showValuesCheckBox' ) );
    var verticalCheckBoxGroup = new VerticalCheckBoxGroup( array, {
      tandem: tandem.createTandem( 'verticalCheckBoxGroup' )
    } );
    CircuitConstructionKitPanel.call( this, verticalCheckBoxGroup );
  }

  circuitConstructionKit.register( 'DisplayOptionsPanel', DisplayOptionsPanel );

  return inherit( CircuitConstructionKitPanel, DisplayOptionsPanel );
} );