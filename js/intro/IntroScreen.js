// Copyright 2015-2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var IntroScreenModel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/intro/model/IntroScreenModel' );
  var IntroScreenView = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/intro/view/IntroScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Image = require( 'SCENERY/nodes/Image' );
  var ResistorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/ResistorNode' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Vertex' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Resistor' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Wire' );
  var WireNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/WireNode' );
  var LightBulbNode = require( 'SCENERY_PHET/LightBulbNode' );
  var Property = require( 'AXON/Property' );
  // images
  var batteryImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/battery.png' );

  /**
   * @constructor
   */
  function IntroScreen() {

    var backgroundColor = '#c6dbf9';
    var icon = new Rectangle( 0, 0, Screen.NAVBAR_ICON_SIZE.width, Screen.NAVBAR_ICON_SIZE.height, {
      fill: backgroundColor
    } );

    var wireNode = new WireNode( null, null, new Wire( new Vertex( 0, 0 ), new Vertex( 100, 0 ), 0 ) );
    var resistorNode = new ResistorNode( null, null, new Resistor( new Vertex( 0, 0 ), new Vertex( Resistor.RESISTOR_LENGTH, 0 ), CircuitConstructionKitBasicsConstants.defaultResistance ), { icon: true } );
    var battery = new Image( batteryImage );
    var lightBulbNode = new LightBulbNode( new Property( 0 ) );

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

    Screen.call( this, 'Intro', icon, function() {
        return new IntroScreenModel();
      }, function( model ) {
        return new IntroScreenView( model );
      },
      { backgroundColor: '#c6dbf9' }
    );
  }

  circuitConstructionKitBasics.register( 'IntroScreen', IntroScreen );
  
  return inherit( Screen, IntroScreen );
} );