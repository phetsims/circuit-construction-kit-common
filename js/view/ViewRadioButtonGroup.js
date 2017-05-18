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
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Vertex' );
  var BatteryNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/BatteryNode' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );

  var BATTERY_LENGTH = CircuitConstructionKitConstants.BATTERY_LENGTH;
  var SCALE = 0.58;

  /**
   * @constructor
   */
  function ViewRadioButtonGroup( viewProperty, tandem ) {

    // Create a battery which can be used in the views
    var startVertex = new Vertex( BATTERY_LENGTH / 2, 0 );
    var endVertex = new Vertex( -BATTERY_LENGTH / 2, 0 );
    var battery = new Battery( endVertex, startVertex, null, tandem.createTandem( 'battery' ), { initialOrientation: 'left' } );

    /**
     * Create a battery node to be used as an icon.
     *
     * @param {string} view - 'lifelike' or 'schematic'
     * @returns {BatteryNode}
     */
    var createBatteryNode = function( view, tandem ) {
      return new BatteryNode( null, null, battery, new Property( true ), new Property( view ), tandem, {
        icon: true,
        scale: SCALE
      } );
    };
    var lifelikeIcon = createBatteryNode( 'lifelike', tandem.createTandem( 'lifelikeIcon' ) );
    var schematicIcon = createBatteryNode( 'schematic', tandem.createTandem( 'schematicIcon' ) );
    RadioButtonGroup.call( this, viewProperty, [ {
      value: 'lifelike',
      node: lifelikeIcon,
      tandemName: 'lifelikeRadioButton'
    }, {
      value: 'schematic',
      node: schematicIcon,
      tandemName: 'schematicRadioButton'
    } ], {
      spacing: 13.5, // Fitted to make this control have the same width as the rest of the panels
      orientation: 'horizontal',
      buttonContentXMargin: 14,
      buttonContentYMargin: 7,
      baseColor: CircuitConstructionKitConstants.PANEL_COLOR,
      deselectedButtonOpacity: 0.4,
      overButtonOpacity: 0.7,
      cornerRadius: CircuitConstructionKitConstants.CORNER_RADIUS,
      tandem: tandem
    } );
  }

  circuitConstructionKitCommon.register( 'ViewRadioButtonGroup', ViewRadioButtonGroup );

  return inherit( RadioButtonGroup, ViewRadioButtonGroup );
} );