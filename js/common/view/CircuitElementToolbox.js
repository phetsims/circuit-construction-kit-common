// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Toolbox from which CircuitElements can be dragged or returned.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CircuitConstructionKitPanel' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Battery' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/LightBulb' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Vertex' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Wire' );
  var Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Switch' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Resistor' );
  var Image = require( 'SCENERY/nodes/Image' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var ResistorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/ResistorNode' );
  var WireNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/WireNode' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var CustomLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CustomLightBulbNode' );
  var CircuitElementToolNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CircuitElementToolNode' );
  var Property = require( 'AXON/Property' );

  // strings
  var resistorString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistor' );
  var batteryString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/battery' );
  var lightBulbString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightBulb' );
  var switchString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/switch' );
  var wireString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/wire' );

  // images
  var batteryImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/battery.png' );

  // constants
  var BATTERY_LENGTH = CircuitConstructionKitConstants.BATTERY_LENGTH;
  var TOOLBOX_ICON_SIZE = CircuitConstructionKitConstants.TOOLBOX_ICON_SIZE;

  /**
   * @param {Circuit} circuit
   * @param {Property.<boolean>} showLabelsProperty
   * @param {Property.<string} viewProperty
   * @param {CircuitNode} circuitNode
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function CircuitElementToolbox( circuit, showLabelsProperty, viewProperty, circuitNode, tandem, options ) {

    options = _.extend( {
      orientation: 'vertical',
      numberOfRightBatteries: CircuitElementToolbox.NUMBER_OF_RIGHT_BATTERIES,
      numberOfLeftBatteries: CircuitElementToolbox.NUMBER_OF_LEFT_BATTERIES,
      numberOfWires: CircuitElementToolbox.NUMBER_OF_WIRES,
      numberOfLightBulbs: CircuitElementToolbox.NUMBER_OF_LIGHT_BULBS,
      numberOfResistors: CircuitElementToolbox.NUMBER_OF_RESISTORS,
      numberOfSwitches: CircuitElementToolbox.NUMBER_OF_SWITCHES
    }, options );

    var createVertex = function( x, y ) {
      return new Vertex( x, y, {
        tandem: circuit.vertexGroupTandem.createNextTandem()
      } );
    };
    var leftBatteryToolNode = new CircuitElementToolNode( batteryString, showLabelsProperty, circuitNode, new Image( batteryImage, {
      scale: TOOLBOX_ICON_SIZE / Math.max( batteryImage[ 0 ].width, batteryImage[ 0 ].height ),
      rotation: Math.PI
    } ), circuit, options.numberOfLeftBatteries, function() {
      return circuit.circuitElements.filter( function( battery ) {
        return battery instanceof Battery && battery.initialOrientation === 'left' && !battery.insideTrueBlackBoxProperty.get();
      } ).length;
    }, function( position ) {
      var startVertex = createVertex( position.x - BATTERY_LENGTH / 2, position.y );
      var endVertex = createVertex( position.x + BATTERY_LENGTH / 2, position.y );
      return new Battery( endVertex, startVertex, 9.0, { initialOrientation: 'left' } );
    } );

    var rightBatteryToolNode = new CircuitElementToolNode( batteryString, showLabelsProperty, circuitNode, new Image( batteryImage, {
        scale: TOOLBOX_ICON_SIZE / Math.max( batteryImage[ 0 ].width, batteryImage[ 0 ].height )
      } ), circuit, options.numberOfRightBatteries, function() {
        return circuit.circuitElements.filter( function( battery ) {
          return battery instanceof Battery && battery.initialOrientation === 'right' && !battery.insideTrueBlackBoxProperty.get();
        } ).length;
      }, function( position ) {
        var startVertex = createVertex( position.x - BATTERY_LENGTH / 2, position.y );
        var endVertex = createVertex( position.x + BATTERY_LENGTH / 2, position.y );
        return new Battery( startVertex, endVertex, 9.0, { initialOrientation: 'right' } );
      }
    );

    var wireIcon = new WireNode( null, null, new Wire( new Vertex( 0, 0 ), new Vertex( 100, 0 ), new Property( 0 ) ), null, viewProperty, tandem.createTandem( 'wireIcon' ) );
    var wireToolNode = new CircuitElementToolNode( wireString, showLabelsProperty, circuitNode, wireIcon.mutate( {
        scale: TOOLBOX_ICON_SIZE / Math.max( wireIcon.width, wireIcon.height )
      } ), circuit, options.numberOfWires, function() {
        return circuit.circuitElements.filter( function( circuitElement ) {
          return !circuitElement.insideTrueBlackBoxProperty.get() && circuitElement instanceof Wire;
        } ).length;
      }, function( position ) {
        var startVertex = createVertex( position.x - 50, position.y );
        var endVertex = createVertex( position.x + 50, position.y );
      return new Wire( startVertex, endVertex, circuit.wireResistivityProperty );
      }
    );

    var lightBulbIcon = new CustomLightBulbNode( new NumberProperty( 0 ) );
    var lightBulbToolNode = new CircuitElementToolNode( lightBulbString, showLabelsProperty, circuitNode, lightBulbIcon.mutate( { // TODO: i18n labels
        scale: TOOLBOX_ICON_SIZE / Math.max( lightBulbIcon.width, lightBulbIcon.height ) // constrained by being too tall, not too wide
      } ), circuit, options.numberOfLightBulbs, function() {
        return circuit.circuitElements.filter( function( lightBulb ) {
          return lightBulb instanceof LightBulb && !lightBulb.insideTrueBlackBoxProperty.get();
        } ).length;
      }, function( position ) {
        return LightBulb.createAtPosition( position, circuit.vertexGroupTandem );
      }
    );

    var resistorIcon = new ResistorNode( null, null,
      new Resistor( new Vertex( 0, 0 ), new Vertex( CircuitConstructionKitConstants.RESISTOR_LENGTH, 0 ), CircuitConstructionKitConstants.DEFAULT_RESISTANCE ),
      null, viewProperty, tandem.createTandem( 'resistorIcon' ), {
        icon: true
      }
    );
    var resistorToolNode = new CircuitElementToolNode( resistorString, showLabelsProperty, circuitNode, resistorIcon.mutate( {
        scale: TOOLBOX_ICON_SIZE / Math.max( resistorIcon.width, resistorIcon.height )
      } ), circuit, options.numberOfResistors, function() {
        return circuit.circuitElements.filter( function( resistor ) {
          return resistor instanceof Resistor && !resistor.insideTrueBlackBoxProperty.get();
        } ).length;
      }, function( position ) {
        var resistorLength = CircuitConstructionKitConstants.RESISTOR_LENGTH;
        var startVertex = createVertex( position.x - resistorLength / 2, position.y );
        var endVertex = createVertex( position.x + resistorLength / 2, position.y );
        return new Resistor( startVertex, endVertex, CircuitConstructionKitConstants.DEFAULT_RESISTANCE );
      }
    );

    var switchIcon = new WireNode( null, null, new Wire( new Vertex( 0, 0 ), new Vertex( 100, 0 ), new Property( 0 ) ), null, viewProperty, tandem.createTandem( 'switchIcon' ) );
    var switchToolNode = new CircuitElementToolNode( switchString, showLabelsProperty, circuitNode,
      switchIcon.mutate( { scale: TOOLBOX_ICON_SIZE / Math.max( switchIcon.width, switchIcon.height ) } ),
      circuit, options.numberOfSwitches, function() {
        return circuit.circuitElements.filter( function( s ) {
          return !s.insideTrueBlackBoxProperty.get() && s instanceof Switch;
        } ).length;
      }, function( position ) {
        return new Switch( createVertex( position.x - 50, position.y ), createVertex( position.x + 50, position.y ), CircuitConstructionKitConstants.DEFAULT_RESISTIVITY );
      }
    );

    var children = [];
    options.numberOfLeftBatteries && children.push( leftBatteryToolNode );
    options.numberOfRightBatteries && children.push( rightBatteryToolNode );
    options.numberOfWires && children.push( wireToolNode );
    options.numberOfLightBulbs && children.push( lightBulbToolNode );
    options.numberOfResistors && children.push( resistorToolNode );
    options.numberOfSwitches && children.push( switchToolNode );

    // Expand touch bounds for each icon
    for ( var i = 0; i < children.length; i++ ) {
      children[ i ].touchArea = children[ i ].localBounds.dilatedXY( 10, 18 );
    }
    lightBulbToolNode.touchArea = lightBulbToolNode.localBounds.dilatedXY( 11, 8 );
    CircuitConstructionKitPanel.call( this, new LayoutBox( {
      orientation: options.orientation,
      spacing: CircuitConstructionKitConstants.TOOLBOX_ITEM_SPACING,
      children: children,
      resize: false
    } ), tandem, {
      resize: false
    } );
  }

  circuitConstructionKitCommon.register( 'CircuitElementToolbox', CircuitElementToolbox );

  return inherit( CircuitConstructionKitPanel, CircuitElementToolbox, {}, {
    NUMBER_OF_RIGHT_BATTERIES: 10,
    NUMBER_OF_LEFT_BATTERIES: 10,
    NUMBER_OF_WIRES: 20,
    NUMBER_OF_LIGHT_BULBS: 10,
    NUMBER_OF_RESISTORS: 10,
    NUMBER_OF_SWITCHES: 10
  } );
} );