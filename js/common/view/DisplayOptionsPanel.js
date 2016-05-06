// Copyright 2016, University of Colorado Boulder

/**
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

  function DisplayOptionsPanel( showElectronsProperty, conventionalCurrentProperty, showValuesProperty ) {
    var textOptions = { fontSize: 14 };
    var content = new VerticalCheckBoxGroup( [ {
      content: new Text( 'Show Electrons', textOptions ),
      property: showElectronsProperty
    }, {
      content: new Text( 'Conventional Current', textOptions ),
      property: conventionalCurrentProperty
    }, {
      content: new Text( 'Values', textOptions ),
      property: showValuesProperty
    } ] );
    CircuitConstructionKitPanel.call( this, content );
  }

  circuitConstructionKit.register( 'DisplayOptionsPanel', DisplayOptionsPanel );

  return inherit( CircuitConstructionKitPanel, DisplayOptionsPanel );
} );