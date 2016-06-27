// Copyright 2016, University of Colorado Boulder

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
  function DisplayOptionsPanel( showElectronsProperty, conventionalCurrentProperty, showValuesProperty, options ) {
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
     * @returns {Object}
     */
    var createItem = function( text, property ) {
      return {
        content: new Text( text, textOptions ),
        property: property
      };
    };
    options.showElectronsCheckBox && array.push( createItem( 'Show Electrons', showElectronsProperty ) );
    options.showConventionalCurrentCheckBox && array.push( createItem( 'Conventional Current', conventionalCurrentProperty ) );
    options.showValuesCheckBox && array.push( createItem( 'Values', showValuesProperty ) );
    var content = new VerticalCheckBoxGroup( array );
    CircuitConstructionKitPanel.call( this, content );
  }

  circuitConstructionKit.register( 'DisplayOptionsPanel', DisplayOptionsPanel );

  return inherit( CircuitConstructionKitPanel, DisplayOptionsPanel );
} );