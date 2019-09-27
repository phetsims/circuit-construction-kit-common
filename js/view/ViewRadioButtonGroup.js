// Copyright 2017-2019, University of Colorado Boulder

/**
 * Radio buttons that allow the user to choose between Schematic and Lifelike views. Exists for the life of the sim and
 * hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  const BatteryNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/BatteryNode' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElementViewType' );
  const Property = require( 'AXON/Property' );
  const RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Vertex' );

  // constants
  const BATTERY_LENGTH = CCKCConstants.BATTERY_LENGTH;
  const SCALE = 0.4;

  class ViewRadioButtonGroup extends RadioButtonGroup {

    /**
     * @param {Property.<CircuitElementViewType>} viewTypeProperty - whether to show lifelike or schematic representations
     * @param {Tandem} tandem
     */
    constructor( viewTypeProperty, tandem ) {

      // Create a battery which can be used in the views
      const startVertex = new Vertex( new Vector2( BATTERY_LENGTH / 2, 0 ) );
      const endVertex = new Vertex( new Vector2( -BATTERY_LENGTH / 2, 0 ) );
      const battery = new Battery( endVertex, startVertex, new Property( 0 ), Battery.BatteryType.NORMAL, tandem.createTandem( 'battery' ), {
        initialOrientation: 'left'
      } );

      /**
       * Create a battery node to be used as an icon.
       *
       * @param {CircuitElementViewType} view
       * @param {Tandem} tandem
       * @returns {BatteryNode}
       */
      const createBatteryNode = ( view, tandem ) => new BatteryNode( null, null, battery, new Property( view ), tandem, {
        isIcon: true,
        scale: SCALE
      } );
      const lifelikeIcon = createBatteryNode( CircuitElementViewType.LIFELIKE, tandem.createTandem( 'lifelikeIcon' ) );
      const schematicIcon = createBatteryNode( CircuitElementViewType.SCHEMATIC, tandem.createTandem( 'schematicIcon' ) );
      super( viewTypeProperty, [ {
        value: CircuitElementViewType.LIFELIKE,
        node: lifelikeIcon,
        tandemName: 'lifelikeRadioButton'
      }, {
        value: CircuitElementViewType.SCHEMATIC,
        node: schematicIcon,
        tandemName: 'schematicRadioButton'
      } ], {
        spacing: 4,
        orientation: 'vertical',
        buttonContentXMargin: 8,
        buttonContentYMargin: 4,
        baseColor: CCKCConstants.PANEL_COLOR,
        deselectedButtonOpacity: 0.4,
        overButtonOpacity: 0.7,
        cornerRadius: CCKCConstants.CORNER_RADIUS,
        tandem: tandem
      } );
    }
  }

  return circuitConstructionKitCommon.register( 'ViewRadioButtonGroup', ViewRadioButtonGroup );
} );