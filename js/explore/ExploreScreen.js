// Copyright 2015, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var ExploreScreenModel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/explore/model/ExploreScreenModel' );
  var ExploreScreenView = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/explore/view/ExploreScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );
  var Line = require( 'SCENERY/nodes/Line' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Image = require( 'SCENERY/nodes/Image' );
  var ResistorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/ResistorNode' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Vertex' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Resistor' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/LightBulb' );
  var CCKLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CCKLightBulbNode' );

  // images
  var batteryImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/battery.png' );

  /**
   * @constructor
   */
  function ExploreScreen() {

    var backgroundColor = '#c6dbf9';
    var icon = new Rectangle( 0, 0, Screen.NAVBAR_ICON_SIZE.width, Screen.NAVBAR_ICON_SIZE.height, {
      fill: backgroundColor
    } );

    var wireNode = new Line( 0, 0, 50, 0, {
      stroke: CircuitConstructionKitBasicsConstants.wireColor,
      lineWidth: 10,
      cursor: 'pointer',
      strokePickable: true,
      scale: 1
    } );
    var resistorNode = new ResistorNode( null, null, new Resistor( new Vertex( 0, 0 ), new Vertex( Resistor.RESISTOR_LENGTH, 0 ), CircuitConstructionKitBasicsConstants.defaultResistance ), { icon: true } );
    var battery = new Image( batteryImage );
    var lightBulbNode = new CCKLightBulbNode( null, null, new LightBulb( new Vertex( 0, 0 ), new Vertex( LightBulb.LIGHT_BULB_LENGTH, 0 ), CircuitConstructionKitBasicsConstants.defaultResistance ), { icon: true } );

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

    Screen.call( this, 'Explore', icon, function() {
        return new ExploreScreenModel();
      }, function( model ) {
        return new ExploreScreenView( model );
      },
      { backgroundColor: '#c6dbf9' }
    );
  }

  return inherit( Screen, ExploreScreen );
} );