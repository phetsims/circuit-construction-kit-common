// Copyright 2017, University of Colorado Boulder

/**
 * Radio buttons that allow the user to choose between Schematic and Lifelike views.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Property = require( 'AXON/Property' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  var BatteryType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/BatteryType' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Vertex' );
  var BatteryNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/BatteryNode' );
  var CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementViewType' );
  var Vector2 = require( 'DOT/Vector2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );

  // constants
  var BATTERY_LENGTH = CircuitConstructionKitCommonConstants.BATTERY_LENGTH;
  var SCALE = 0.58;

  /**
   * @constructor
   */
  function ViewRadioButtonGroup( viewTypeProperty, tandem ) {

    // Create a battery which can be used in the views
    var startVertex = new Vertex( new Vector2( BATTERY_LENGTH / 2, 0 ) );
    var endVertex = new Vertex( new Vector2( -BATTERY_LENGTH / 2, 0 ) );
    var battery = new Battery( endVertex, startVertex, new Property( 0 ), BatteryType.NORMAL, tandem.createTandem( 'battery' ), {
      initialOrientation: 'left'
    } );

    /**
     * Create a battery node to be used as an icon.
     *
     * @param {CircuitElementViewType} view
     * @param {Tandem} tandem
     * @returns {BatteryNode}
     */
    var createBatteryNode = function( view, tandem ) {
      return new BatteryNode( null, null, battery, new Property( view ), tandem, {
        icon: true,
        scale: SCALE
      } );
    };
    var lifelikeIcon = createBatteryNode( CircuitElementViewType.LIFELIKE, tandem.createTandem( 'lifelikeIcon' ) );
    var schematicIcon = createBatteryNode( CircuitElementViewType.SCHEMATIC, tandem.createTandem( 'schematicIcon' ) );
    RadioButtonGroup.call( this, viewTypeProperty, [ {
      value: CircuitElementViewType.LIFELIKE,
      node: lifelikeIcon,
      tandemName: 'lifelikeRadioButton'
    }, {
      value: CircuitElementViewType.SCHEMATIC,
      node: schematicIcon,
      tandemName: 'schematicRadioButton'
    } ], {
      spacing: 13.5, // Fitted to make this control have the same width as the rest of the panels
      orientation: 'horizontal',
      buttonContentXMargin: 14,
      buttonContentYMargin: 7,
      baseColor: CircuitConstructionKitCommonConstants.PANEL_COLOR,
      deselectedButtonOpacity: 0.4,
      overButtonOpacity: 0.7,
      cornerRadius: CircuitConstructionKitCommonConstants.CORNER_RADIUS,
      tandem: tandem
    } );
  }

  circuitConstructionKitCommon.register( 'ViewRadioButtonGroup', ViewRadioButtonGroup );

  return inherit( RadioButtonGroup, ViewRadioButtonGroup );
} );