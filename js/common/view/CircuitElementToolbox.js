// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
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
  var Property = require( 'AXON/Property' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var CustomLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CustomLightBulbNode' );

  // images
  var batteryImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/battery.png' );

  // constants
  var batteryLength = Battery.BATTERY_LENGTH;

  /**
   * @param {Circuit} circuit
   * @param {CircuitNode} circuitNode
   * @param {Object} [options]
   * @constructor
   */
  function CircuitElementToolbox( circuit, circuitNode, tandem, options ) {

    options = _.extend( {
      orientation: 'vertical',
      numberOfRightBatteries: CircuitElementToolbox.NUMBER_OF_RIGHT_BATTERIES,
      numberOfLeftBatteries: CircuitElementToolbox.NUMBER_OF_LEFT_BATTERIES,
      numberOfWires: CircuitElementToolbox.NUMBER_OF_WIRES,
      numberOfLightBulbs: CircuitElementToolbox.NUMBER_OF_LIGHT_BULBS,
      numberOfResistors: CircuitElementToolbox.NUMBER_OF_RESISTORS,
      numberOfSwitches: CircuitElementToolbox.NUMBER_OF_SWITCHES
    }, options );
    var circuitElementToolbox = this;
    // From: https://github.com/phetsims/scenery-phet/issues/195#issuecomment-186300071
    // @jonathanolson and I looked into the way Charges and Fields just calls startDrag(event) on the play area drag listener (which adds a listener to the pointer, in the usual SimpleDragHandler way), and it seems like a good pattern. I will try this pattern for Circuit Construction Kit, when I am working on the toolbox listeners.

    /**
     *
     * @param {Function} createElement - given a view location, create a circuit element
     * @param {ObservableArray.<Object>} modelList - list of circuit elements the new element should be added to
     * @param {Array.<Node>} viewList - list of nodes where the newly created circuit element node will be found
     * @param {Function} getCircuitElementFromNode - function that gets a model element from a node
     * @returns {{down: down}}
     */
    var createToolIconInputListener = function( createElement, modelList, viewList, getCircuitElementFromNode ) {
      return {
        down: function( event ) {

          // Ignore non-left-mouse-button, see #64
          if ( event.pointer.isMouse && event.domEvent.button !== 0 ) {
            return;
          }

          // initial position of the pointer in the screenView coordinates
          var viewPosition = circuitElementToolbox.globalToParentPoint( event.pointer.point );
          var circuitElement = createElement( viewPosition );
          modelList.add( circuitElement );
          var matchedNodes = viewList.filter( function( circuitElementNode ) {
            return getCircuitElementFromNode( circuitElementNode ) === circuitElement;
          } );
          assert && assert( matchedNodes.length === 1, 'should have found the one and only node for this element' );
          var circuitElementNode = matchedNodes[ 0 ];
          circuitElementNode.inputListener.startDrag( event );
        }
      };
    };

    var iconWidth = CircuitConstructionKitConstants.toolboxIconLength;
    var wireNode = new WireNode( null, null, new Wire( new Vertex( 0, 0 ), new Vertex( 100, 0 ), 0 ), null, tandem.createTandem( 'wireIcon' ) );

    var resistorNode = new ResistorNode(
      null,
      null,
      new Resistor( new Vertex( 0, 0 ), new Vertex( Resistor.RESISTOR_LENGTH, 0 ), CircuitConstructionKitConstants.defaultResistance ),
      null,
      tandem.createTandem( 'resistorIcon' ), {
        icon: true
      }
    );
    var lightBulbNode = new CustomLightBulbNode( new Property( 0 ) );

    var countBatteries = function( initialOrientation ) {
      return circuit.batteries.filter( function( battery ) {
        return battery.initialOrientation === initialOrientation && !battery.insideTrueBlackBox;
      } ).length;
    };

    var createVertex = function( x, y ) {
      return new Vertex( x, y, {
        tandem: circuit.vertexGroupTandem.createNextTandem()
      } );
    };

    var leftBatteryIcon = new Image( batteryImage, {
      cursor: 'pointer',
      scale: iconWidth / Math.max( batteryImage[ 0 ].width, batteryImage[ 0 ].height ),
      rotation: Math.PI
    } ).addInputListener( createToolIconInputListener(
      function( position ) {
        var startVertex = createVertex( position.x - batteryLength / 2, position.y );
        var endVertex = createVertex( position.x + batteryLength / 2, position.y );
        return new Battery( endVertex, startVertex, 9.0, {
          initialOrientation: 'left'
        } );
      },
      circuit.batteries,
      circuitNode.batteryNodes,
      function( batteryNode ) { return batteryNode.battery; }
    ) );
    circuit.batteries.lengthProperty.link( function() {
      leftBatteryIcon.visible = countBatteries( 'left' ) < options.numberOfRightBatteries;
    } );

    var rightBatteryIcon = new Image( batteryImage, {
      cursor: 'pointer',
      scale: iconWidth / Math.max( batteryImage[ 0 ].width, batteryImage[ 0 ].height )
    } ).addInputListener( createToolIconInputListener(
      function( position ) {
        var startVertex = createVertex( position.x - batteryLength / 2, position.y );
        var endVertex = createVertex( position.x + batteryLength / 2, position.y );
        return new Battery( startVertex, endVertex, 9.0, {
          initialOrientation: 'right'
        } );
      },
      circuit.batteries,
      circuitNode.batteryNodes,
      function( batteryNode ) { return batteryNode.battery; }
    ) );
    circuit.batteries.lengthProperty.link( function() {
      rightBatteryIcon.visible = countBatteries( 'right' ) < options.numberOfRightBatteries;
    } );

    var wireIcon = wireNode.mutate( { scale: iconWidth / Math.max( wireNode.width, wireNode.height ) } )
      .addInputListener( createToolIconInputListener(
        function( position ) {
          return new Wire( createVertex( position.x - 50, position.y ), createVertex( position.x + 50, position.y ), CircuitConstructionKitConstants.defaultResistivity );
        },
        circuit.wires,
        circuitNode.wireNodes,
        function( wireNode ) { return wireNode.wire; }
      ) );
    var updateWireIcon = function() {
      var numberOfCreatedWires = circuit.wires.filter( function( wire ) {return !wire.insideTrueBlackBox;} ).length;
      wireIcon.visible = numberOfCreatedWires < options.numberOfWires;
    };
    circuit.wires.addItemRemovedListener( updateWireIcon );
    circuit.wires.addItemAddedListener( updateWireIcon );

    var lightBulbIcon = lightBulbNode.mutate( {
      pickable: true,
      cursor: 'pointer',
      scale: iconWidth / Math.max( lightBulbNode.width, lightBulbNode.height ) // constrained by being too tall, not too wide
    } )
      .addInputListener( createToolIconInputListener(
        function( position ) {
          return LightBulb.createAtPosition( position, circuit.vertexGroupTandem );
        },
        circuit.lightBulbs,
        circuitNode.lightBulbNodes,
        function( lightBulbNode ) { return lightBulbNode.lightBulb; }
      ) );
    var updateLightBulbIcon = function() {
      var numberOfCreatedLightBulbs = circuit.lightBulbs.filter( function( lightBulb ) {return !lightBulb.insideTrueBlackBox;} ).length;
      lightBulbIcon.visible = numberOfCreatedLightBulbs < options.numberOfLightBulbs;
    };
    circuit.lightBulbs.addItemRemovedListener( updateLightBulbIcon );
    circuit.lightBulbs.addItemAddedListener( updateLightBulbIcon );

    var resistorIcon = resistorNode.mutate( {
      pickable: true,
      cursor: 'pointer',
      scale: iconWidth / Math.max( resistorNode.width, resistorNode.height )
    } )
      .addInputListener( createToolIconInputListener(
        function( position ) {
          var resistorLength = Resistor.RESISTOR_LENGTH;
          var startVertex = createVertex( position.x - resistorLength / 2, position.y );
          var endVertex = createVertex( position.x + resistorLength / 2, position.y );
          return new Resistor( startVertex, endVertex, CircuitConstructionKitConstants.defaultResistance );
        },
        circuit.resistors,
        circuitNode.resistorNodes,
        function( resistorNode ) { return resistorNode.resistor; }
      ) );
    var updateResistorIcon = function() {
      var numberOfCreatedResistors = circuit.resistors.filter( function( resistor ) {return !resistor.insideTrueBlackBox;} ).length;
      resistorIcon.visible = numberOfCreatedResistors < options.numberOfResistors;
    };
    circuit.resistors.addItemRemovedListener( updateResistorIcon );
    circuit.resistors.addItemAddedListener( updateResistorIcon );

    var switchWireNode = new WireNode( null, null, new Wire( new Vertex( 0, 0 ), new Vertex( 100, 0 ), 0 ), null, tandem.createTandem( 'switchIcon' ) );
    var switchIcon = switchWireNode.mutate( { scale: iconWidth / Math.max( switchWireNode.width, switchWireNode.height ) } )
      .addInputListener( createToolIconInputListener(
        function( position ) {
          return new Switch( createVertex( position.x - 50, position.y ), createVertex( position.x + 50, position.y ), CircuitConstructionKitConstants.defaultResistivity );
        },
        circuit.switches,
        circuitNode.switchNodes,
        function( switchNode ) { return switchNode.switchModel; }
      ) );
    var updateSwitchIcon = function() {
      var numberOfCreatedSwitches = circuit.switches.filter( function( s ) {return !s.insideTrueBlackBox;} ).length;
      switchIcon.visible = numberOfCreatedSwitches < options.numberOfSwitches;
    };
    circuit.switches.addItemRemovedListener( updateSwitchIcon );
    circuit.switches.addItemAddedListener( updateSwitchIcon );

    var children = [];
    options.numberOfLeftBatteries && children.push( leftBatteryIcon );
    options.numberOfRightBatteries && children.push( rightBatteryIcon );
    options.numberOfWires && children.push( wireIcon );
    options.numberOfLightBulbs && children.push( lightBulbIcon );
    options.numberOfResistors && children.push( resistorIcon );
    options.numberOfSwitches && children.push( switchIcon );
    CircuitConstructionKitPanel.call( this, new LayoutBox( {
      orientation: options.orientation,
      spacing: CircuitConstructionKitConstants.toolboxItemSpacing,
      children: children
    } ) );
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