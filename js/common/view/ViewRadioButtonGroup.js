// Copyright 2017, University of Colorado Boulder

/**
 * Radio buttons that allow the user to choose between Schematic and Lifelike views.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Property = require( 'AXON/Property' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Battery' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Vertex' );
  var BatteryNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/BatteryNode' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );

  var BATTERY_LENGTH = CircuitConstructionKitConstants.BATTERY_LENGTH;
  var SCALE = 0.56;

  /**
   * @constructor
   */
  function ViewRadioButtonGroup( viewProperty, tandem ) {

    // Create a battery which can be used in the views
    var startVertex = new Vertex( BATTERY_LENGTH / 2, 0 );
    var endVertex = new Vertex( -BATTERY_LENGTH / 2, 0 );
    var battery = new Battery( endVertex, startVertex, 9.0, { initialOrientation: 'left' } );

    /**
     * Create a battery node to be used as an icon.
     *
     * @param {string} view - 'lifelike' or 'schematic'
     * @returns {BatteryNode}
     */
    var createBatteryNode = function( view ) {
      return new BatteryNode( null, null, battery, new Property( true ), new Property( view ), tandem.createTandem( 'lifelikeRadioButton' ), {
        icon: true,
        scale: SCALE
      } );
    };
    var lifelikeNode = createBatteryNode( 'lifelike' );
    var schematicNode = createBatteryNode( 'schematic' );
    RadioButtonGroup.call( this, viewProperty, [ {
      value: 'lifelike',
      node: lifelikeNode
    }, {
      value: 'schematic',
      node: schematicNode
    } ], {
      orientation: 'horizontal',
      buttonContentXMargin: 14,
      buttonContentYMargin: 7,
      baseColor: CircuitConstructionKitConstants.PANEL_COLOR,
      deselectedButtonOpacity: 0.4,
      overButtonOpacity: 0.7,
      cornerRadius: CircuitConstructionKitConstants.CORNER_RADIUS
    } );
  }

  circuitConstructionKitCommon.register( 'ViewRadioButtonGroup', ViewRadioButtonGroup );

  return inherit( RadioButtonGroup, ViewRadioButtonGroup );
} );