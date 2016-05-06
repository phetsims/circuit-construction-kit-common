// Copyright 2015-2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var IntroScreenModel = require( 'CIRCUIT_CONSTRUCTION_KIT/intro/model/IntroScreenModel' );
  var IntroScreenView = require( 'CIRCUIT_CONSTRUCTION_KIT/intro/view/IntroScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT/CircuitConstructionKitConstants' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Image = require( 'SCENERY/nodes/Image' );
  var ResistorNode = require( 'CIRCUIT_CONSTRUCTION_KIT/common/view/ResistorNode' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/Vertex' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/Resistor' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/Wire' );
  var WireNode = require( 'CIRCUIT_CONSTRUCTION_KIT/common/view/WireNode' );
  var LightBulbNode = require( 'SCENERY_PHET/LightBulbNode' );
  var Property = require( 'AXON/Property' );
  // images
  var batteryImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT/battery.png' );

  /**
   * @constructor
   */
  function IntroScreen() {

    var backgroundColor = '#c6dbf9';
    var icon = new Rectangle( 0, 0, Screen.NAVBAR_ICON_SIZE.width, Screen.NAVBAR_ICON_SIZE.height, {
      fill: backgroundColor
    } );

    var wireNode = new WireNode( null, null, new Wire( new Vertex( 0, 0 ), new Vertex( 100, 0 ), 0 ) );
    var resistorNode = new ResistorNode( null, null, new Resistor( new Vertex( 0, 0 ), new Vertex( Resistor.RESISTOR_LENGTH, 0 ), CircuitConstructionKitConstants.defaultResistance ), { icon: true } );
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

  circuitConstructionKit.register( 'IntroScreen', IntroScreen );
  
  return inherit( Screen, IntroScreen );
} );