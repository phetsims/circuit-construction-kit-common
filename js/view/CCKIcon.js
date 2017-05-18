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
  var ResistorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ResistorNode' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Vertex' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );
  var WireNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/WireNode' );
  var CustomLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CustomLightBulbNode' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Property = require( 'AXON/Property' );

  // images
  var batteryMipmap = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/battery.png' );

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

    var wire = new Wire( new Vertex( 0, 0 ), new Vertex( 100, 0 ), new Property( 0 ), tandem.createTandem( 'wire' ) );
    var wireNode = new WireNode( null, null, wire, null, viewProperty, tandem.createTandem( 'wireIcon' ) );

    // Model element used to create the node
    var resistor = new Resistor( new Vertex( 0, 0 ), new Vertex( CircuitConstructionKitConstants.RESISTOR_LENGTH, 0 ), tandem.createTandem( 'resistor' ) );

    var resistorNode = new ResistorNode( null, null, resistor, null, viewProperty, tandem.createTandem( 'resistorIcon' ), {
      icon: true
    } );

    var batteryNode = new Image( batteryMipmap );

    var lightBulbNode = new CustomLightBulbNode( new NumberProperty( 0 ) );

    // icons should not be discoverable by assistive technology, and should not be focusable
    var a11yIconOptions = {
      tagName: null,
      focusable: false
    };

    resistorNode.mutate( _.extend( a11yIconOptions, { scale: ELEMENT_WIDTH / resistorNode.width * 0.75 } ) );
    wireNode.mutate( _.extend( a11yIconOptions, { scale: ELEMENT_WIDTH / wireNode.width * 0.7 } ) );
    batteryNode.mutate( _.extend( a11yIconOptions, { scale: ELEMENT_WIDTH / batteryNode.width } ) );
    lightBulbNode.mutate( _.extend( a11yIconOptions, { scale: ELEMENT_WIDTH / lightBulbNode.width / 2 } ) );
    var vBox = new VBox( {
      spacing: 20,
      children: [ new HBox( { spacing: 20, children: [ wireNode, resistorNode ] } ), new HBox( {
        spacing: 20,
        children: [ batteryNode, lightBulbNode ]
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