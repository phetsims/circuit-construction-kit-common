// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var VerticalCheckBoxGroup = require( 'SUN/VerticalCheckBoxGroup' );
  var CircuitConstructionKitBasicsPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitConstructionKitBasicsPanel' );
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
    CircuitConstructionKitBasicsPanel.call( this, content );
  }

  return inherit( CircuitConstructionKitBasicsPanel, DisplayOptionsPanel, {} );
} );