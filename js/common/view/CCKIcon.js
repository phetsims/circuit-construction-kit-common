// Copyright 2017, University of Colorado Boulder

/**
 * Home screen/navigation bar icon that shows common circuit elements.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
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
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Property = require( 'AXON/Property' );

  // images
  var batteryImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/battery.png' );

  // constants
  var BACKGROUND_COLOR = CircuitConstructionKitConstants.BACKGROUND_COLOR;
  var ELEMENT_WIDTH = 50;

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function CCKIcon( tandem ) {

    Rectangle.call( this, 0, 0, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.width, Screen.MINIMUM_HOME_SCREEN_ICON_SIZE.height, {
      fill: BACKGROUND_COLOR
    } );

    var viewProperty = new Property( 'lifelike' );

    var wireNode = new WireNode( null, null, new Wire( new Vertex( 0, 0 ), new Vertex( 100, 0 ), new Property( 0 ) ), null, viewProperty, tandem.createTandem( 'wireIcon' ) );
    wireNode.accessibleContent = null; // icon should not have accessible content // TODO: explore this.  Do we really need it here?  Do we need it elsewhere?

    // Model element used to create the node
    var resistor = new Resistor(
      new Vertex( 0, 0 ),
      new Vertex( CircuitConstructionKitConstants.RESISTOR_LENGTH, 0 ),
      CircuitConstructionKitConstants.DEFAULT_RESISTANCE
    );

    var resistorNode = new ResistorNode( null, null, resistor, null, viewProperty, tandem.createTandem( 'resistorIcon' ), {
      icon: true
    } );
    resistorNode.accessibleContent = null;

    var batteryImage = new Image( batteryImage );

    var lightBulbNode = new CustomLightBulbNode( new NumberProperty( 0 ) );
    lightBulbNode.accessibleContent = null;

    resistorNode.mutate( { scale: ELEMENT_WIDTH / resistorNode.width * 0.75 } );
    wireNode.mutate( { scale: ELEMENT_WIDTH / wireNode.width * 0.7 } );
    batteryImage.mutate( { scale: ELEMENT_WIDTH / batteryImage.width } );
    lightBulbNode.mutate( { scale: ELEMENT_WIDTH / lightBulbNode.width / 2 } );
    var vBox = new VBox( {
      spacing: 20,
      children: [ new HBox( { spacing: 20, children: [ wireNode, resistorNode ] } ), new HBox( {
        spacing: 20,
        children: [ batteryImage, lightBulbNode ]
      } ) ]
    } );
    vBox.mutate( {
      scale: this.height / vBox.height * 0.8,
      center: this.center
    } );
    this.addChild( vBox );
  }

  circuitConstructionKitCommon.register( 'CCKIcon', CCKIcon );

  return inherit( Rectangle, CCKIcon );
} );