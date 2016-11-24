// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var EnergyScreenModel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/energy/model/EnergyScreenModel' );
  var EnergyScreenView = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/energy/view/EnergyScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Image = require( 'SCENERY/nodes/Image' );
  var ResistorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/ResistorNode' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Vertex' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Resistor' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Wire' );
  var WireNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/WireNode' );
  var CustomLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CustomLightBulbNode' );
  var Property = require( 'AXON/Property' );
  var Color = require( 'SCENERY/util/Color' );

  // images
  var batteryImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/battery.png' );

  // constants
  var backgroundColor = CircuitConstructionKitConstants.backgroundColor;

  /**
   * @constructor
   */
  function EnergyScreen( tandem ) {

    var icon = new Rectangle( 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
      fill: backgroundColor
    } );

    var wireNode = new WireNode( null, null, new Wire( new Vertex( 0, 0 ), new Vertex( 100, 0 ), 0 ), null, tandem.createTandem( 'wireIcon' ) );
    var resistorNode = new ResistorNode( null, null, new Resistor( new Vertex( 0, 0 ), new Vertex( Resistor.RESISTOR_LENGTH, 0 ), CircuitConstructionKitConstants.defaultResistance ),
      tandem.createTandem( 'resistorIcon' ), { icon: true } );
    var battery = new Image( batteryImage );
    var lightBulbNode = new CustomLightBulbNode( new Property( 0 ) ); // TODO: For all icons, use image instead of something with a lot of LightRayNode lines

    var elementWidth = 50;
    resistorNode.mutate( { scale: elementWidth / resistorNode.width * 0.75 } );
    wireNode.mutate( { scale: elementWidth / wireNode.width * 0.7 } );
    battery.mutate( { scale: elementWidth / battery.width } );
    lightBulbNode.mutate( { scale: elementWidth / lightBulbNode.width / 2 } );
    var vBox = new VBox( {
      spacing: 20,
      children: [ new HBox( { spacing: 20, children: [ wireNode, resistorNode ] } ), new HBox( {
        spacing: 20,
        children: [ battery, lightBulbNode ]
      } ) ]
    } );
    vBox.mutate( {
      scale: icon.height / vBox.height * 0.8,
      center: icon.center
    } );
    icon.addChild( vBox );

    var options = {
      name: 'Energy', //TODO i18n
      backgroundColorProperty: new Property( Color.toColor( backgroundColor ) ),
      homeScreenIcon: icon,
      tandem: tandem
    };

    Screen.call( this,
      function() {
        return new EnergyScreenModel();
      },
      function( model ) {
        return new EnergyScreenView( model, tandem.createTandem( 'view' ) );
      },
      options );
  }

  circuitConstructionKitCommon.register( 'EnergyScreen', EnergyScreen );

  return inherit( Screen, EnergyScreen );
} );