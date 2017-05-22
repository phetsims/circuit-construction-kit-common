// Copyright 2016-2017, University of Colorado Boulder

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
  var CircuitConstructionKitPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitConstructionKitPanel' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Vertex' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );
  var Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var ResistorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ResistorNode' );
  var SwitchNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SwitchNode' );
  var BatteryNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/BatteryNode' );
  var WireNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/WireNode' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var CustomLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CustomLightBulbNode' );
  var CircuitElementToolNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementToolNode' );
  var Property = require( 'AXON/Property' );

  // strings
  var resistorString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistor' );
  var batteryString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/battery' );
  var lightBulbString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightBulb' );
  var switchString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/switch' );
  var wireString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/wire' );

  // constants
  var BATTERY_LENGTH = CircuitConstructionKitConstants.BATTERY_LENGTH;
  var TOOLBOX_ICON_SIZE = CircuitConstructionKitConstants.TOOLBOX_ICON_SIZE;
  var RESISTOR_LENGTH = CircuitConstructionKitConstants.RESISTOR_LENGTH;
  var WIRE_LENGTH = 100;
  var SWITCH_LENGTH = CircuitConstructionKitConstants.SWITCH_LENGTH;

  /**
   * @param {Circuit} circuit
   * @param {Property.<boolean>} showLabelsProperty
   * @param {Property.<string>} viewProperty
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

    /**
     * Create a Vertex at the specified location, convenience function for creating the vertices for CircuitElements.
     * @param {number} x - the x-coordinate of the Vertex
     * @param {number} y - the y-coordinate of the Vertex
     * @returns {Vertex}
     */
    var createVertex = function( x, y ) {
      return new Vertex( x, y, { tandem: circuit.vertexGroupTandem.createNextTandem() } );
    };

    // create icons
    var leftIconBattery = new Battery( new Vertex( 0, 0 ), new Vertex( CircuitConstructionKitConstants.BATTERY_LENGTH, 0 ), null, tandem.createTandem( 'leftIconBattery' ) );
    var leftBatteryIcon = new BatteryNode( null, null, leftIconBattery, null, viewProperty, tandem.createTandem( 'leftBatteryIcon' ), {
      icon: true
    } );

    var rightIconBattery = new Battery( new Vertex( 0, 0 ), new Vertex( CircuitConstructionKitConstants.BATTERY_LENGTH, 0 ), null, tandem.createTandem( 'rightIconBattery' ) );
    var rightBatteryIcon = new BatteryNode( null, null, rightIconBattery, null, viewProperty, tandem.createTandem( 'rightBatteryIcon' ), {
      icon: true
    } );
    var wire = new Wire( new Vertex( 0, 0 ), new Vertex( 100, 0 ), new Property( 0 ), tandem.createTandem( 'wireIconWire' ) );
    var wireIcon = new WireNode( null, null, wire, null, viewProperty, tandem.createTandem( 'wireIcon' ) );
    var lightBulbIcon = new CustomLightBulbNode( new NumberProperty( 0 ), {
      icon: true
    } );
    var resistor = new Resistor(
      new Vertex( 0, 0 ),
      new Vertex( CircuitConstructionKitConstants.RESISTOR_LENGTH, 0 ),
      tandem.createTandem( 'resistor' )
    );
    var resistorIcon = new ResistorNode( null, null,
      resistor,
      null, viewProperty, tandem.createTandem( 'resistorIcon' ), {
        icon: true
      }
    );
    var circuitSwitch = new Switch( new Vertex( 0, 0 ), new Vertex( SWITCH_LENGTH, 0 ), tandem.createTandem( 'switch' ) );
    var switchIcon = new SwitchNode( null, null, circuitSwitch, null, viewProperty, tandem.createTandem( 'switchIcon' ), {
      icon: true
    } );

    // normalize icon sizes
    resistorIcon.mutate( { scale: TOOLBOX_ICON_SIZE / Math.max( resistorIcon.width, resistorIcon.height ) } );
    wireIcon.mutate( { scale: TOOLBOX_ICON_SIZE / Math.max( wireIcon.width, wireIcon.height ) } );
    lightBulbIcon.mutate( { scale: TOOLBOX_ICON_SIZE / Math.max( lightBulbIcon.width, lightBulbIcon.height ) } );
    switchIcon.mutate( { scale: TOOLBOX_ICON_SIZE / Math.max( switchIcon.width, switchIcon.height ) } );
    leftBatteryIcon.mutate( { scale: TOOLBOX_ICON_SIZE / Math.max( leftBatteryIcon.width, leftBatteryIcon.height ) } );
    rightBatteryIcon.mutate( { scale: TOOLBOX_ICON_SIZE / Math.max( rightBatteryIcon.width, rightBatteryIcon.height ) } );

    /**
     * Returns a function which counts the number of circuit elements (not counting those in the true black box).
     * @param {function} predicate
     * @returns {function}
     */
    var createCounter = function( predicate ) {
      return function() {
        return circuit.circuitElements.filter( function( circuitElement ) {

          // Count according to the predicate, but don't count elements inside the true black box
          return predicate( circuitElement ) && !circuitElement.insideTrueBlackBoxProperty.get();
        } ).length;
      };
    };

    // Functions that count how many circuit elements there are of each type, so the icon can be hidden when the user created
    // the maximum number of that type
    var countLeftBatteries = createCounter( function( circuitElement ) {
      return circuitElement instanceof Battery && circuitElement.initialOrientation === 'left';
    } );
    var countRightBatteries = createCounter( function( circuitElement ) {
      return circuitElement instanceof Battery && circuitElement.initialOrientation === 'right';
    } );
    var countWires = createCounter( function( circuitElement ) { return circuitElement instanceof Wire; } );
    var countLightBulbs = createCounter( function( circuitElement ) { return circuitElement instanceof LightBulb; } );
    var countResistors = createCounter( function( circuitElement ) { return circuitElement instanceof Resistor; } );
    var countSwitches = createCounter( function( circuitElement ) { return circuitElement instanceof Switch; } );

    /**
     * Create a pair of vertices to be used for a new CircuitElement
     * @param {Vector2} position - the position of the center of the CircuitElement
     * @param {number} length - the distance between the vertices
     * @returns {{startVertex: Vertex, endVertex: Vertex}}
     */
    var createVertexPair = function( position, length ) {
      return {
        startVertex: createVertex( position.x - length / 2, position.y ),
        endVertex: createVertex( position.x + length / 2, position.y )
      };
    };

    // create tool nodes
    var createLeftBattery = function( position ) {
      var vertexPair = createVertexPair( position, BATTERY_LENGTH );
      return new Battery( vertexPair.endVertex, vertexPair.startVertex, circuit.batteryResistanceProperty, circuit.leftBatteryTandemGroup.createNextTandem(), { initialOrientation: 'left' } );
    };
    var createRightBattery = function( position ) {
      var vertexPair = createVertexPair( position, BATTERY_LENGTH );
      return new Battery( vertexPair.startVertex, vertexPair.endVertex, circuit.batteryResistanceProperty, circuit.rightBatteryTandemGroup.createNextTandem() );
    };
    var createWire = function( position ) {
      var vertexPair = createVertexPair( position, WIRE_LENGTH );
      return new Wire( vertexPair.startVertex, vertexPair.endVertex, circuit.wireResistivityProperty, circuit.wireGroupTandem.createNextTandem() );
    };
    var createLightBulb = function( position ) {
      return LightBulb.createAtPosition( position, circuit.vertexGroupTandem, circuit.lightBulbGroupTandem.createNextTandem() );
    };
    var createResistor = function( position ) {
      var vertexPair = createVertexPair( position, RESISTOR_LENGTH );
      return new Resistor( vertexPair.startVertex, vertexPair.endVertex, circuit.resistorGroupTandem.createNextTandem() );
    };
    var createSwitch = function( position ) {
      var vertexPair = createVertexPair( position, SWITCH_LENGTH );
      return new Switch( vertexPair.startVertex, vertexPair.endVertex, circuit.switchGroupTandem.createNextTandem() );
    };
    var leftBatteryToolNode = new CircuitElementToolNode( batteryString, showLabelsProperty, circuitNode, leftBatteryIcon, options.numberOfLeftBatteries, countLeftBatteries, createLeftBattery );
    var rightBatteryToolNode = new CircuitElementToolNode( batteryString, showLabelsProperty, circuitNode, rightBatteryIcon, options.numberOfRightBatteries, countRightBatteries, createRightBattery );
    var wireToolNode = new CircuitElementToolNode( wireString, showLabelsProperty, circuitNode, wireIcon, options.numberOfWires, countWires, createWire );
    var lightBulbToolNode = new CircuitElementToolNode( lightBulbString, showLabelsProperty, circuitNode, lightBulbIcon, options.numberOfLightBulbs, countLightBulbs, createLightBulb );
    var resistorToolNode = new CircuitElementToolNode( resistorString, showLabelsProperty, circuitNode, resistorIcon, options.numberOfResistors, countResistors, createResistor );
    var switchToolNode = new CircuitElementToolNode( switchString, showLabelsProperty, circuitNode, switchIcon, options.numberOfSwitches, countSwitches, createSwitch );

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