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
  var Node = require( 'SCENERY/nodes/Node' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Vertex' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );
  var Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var ResistorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ResistorNode' );
  var CircuitConstructionKitLightBulbNode =
    require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitConstructionKitLightBulbNode' );
  var SwitchNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SwitchNode' );
  var BatteryNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/BatteryNode' );
  var WireNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/WireNode' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Carousel = require( 'SUN/Carousel' );
  var CircuitElementToolNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementToolNode' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );
  var Range = require( 'DOT/Range' );
  var PageControl = require( 'SUN/PageControl' );

  // strings
  var resistorString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistor' );
  var batteryString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/battery' );
  var lightBulbString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightBulb' );
  var switchString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/switch' );
  var coinString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/coin' );
  var eraserString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/eraser' );
  var pencilString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/pencil' );
  var handString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/hand' );
  var dogString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/dog' );
  var dollarBillString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/dollarBill' );
  var paperClipString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/paperClip' );
  var wireString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/wire' );

  // constants
  var BATTERY_LENGTH = CircuitConstructionKitConstants.BATTERY_LENGTH;
  var TOOLBOX_ICON_SIZE = CircuitConstructionKitConstants.TOOLBOX_ICON_SIZE;
  var RESISTOR_LENGTH = CircuitConstructionKitConstants.RESISTOR_LENGTH;
  var WIRE_LENGTH = 100;
  var SWITCH_LENGTH = CircuitConstructionKitConstants.SWITCH_LENGTH;
  var HIGH_RESISTANCE = Math.pow( 10, 9 );

  /**
   * @param {Circuit} circuit
   * @param {Property.<boolean>} showLabelsProperty
   * @param {Property.<string>} viewProperty
   * @param {CircuitLayerNode} circuitLayerNode
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function CircuitElementToolbox( circuit, showLabelsProperty, viewProperty, circuitLayerNode, tandem, options ) {

    options = _.extend( {
      orientation: 'vertical',
      numberOfWires: 20,
      numberOfRightBatteries: 10,
      numberOfLightBulbs: 10,
      numberOfResistors: 10,
      numberOfSwitches: 5,
      numberOfCoins: 0,
      numberOfErasers: 0,
      numberOfPencils: 0,
      numberOfHands: 0,
      numberOfDogs: 0,
      numberOfDollarBills: 0,
      numberOfPaperClips: 0,
      numberOfHighVoltageBatteries: 0,
      numberOfHighResistanceResistors: 0,
      numberOfHighResistanceLightBulbs: 0
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

    /**
     * Returns a function which counts the number of circuit elements (not counting those in the true black box).
     * @param {function} predicate
     * @returns {function}
     */
    var createCounter = function( predicate ) {
      return function() {
        return circuit.circuitElements.getArray().filter( function( circuitElement ) {

          // Count according to the predicate, but don't count elements inside the true black box
          return predicate( circuitElement ) && !circuitElement.insideTrueBlackBoxProperty.get();
        } ).length;
      };
    };

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

    /**
     * Utility function that creates a CircuitElementToolNode
     * @param {string} labelString
     * @param {number} count
     * @param {Node} icon
     * @param {function} counterFunction
     * @param {function} creator
     * @param {Object} [options]
     * @returns {CircuitElementToolNode}
     */
    var createCircuitElementToolNode = function( labelString, count, icon, counterFunction, creator, options ) {
      options = _.extend( { iconScale: 1.0 }, options );
      icon.mutate( { scale: options.iconScale * TOOLBOX_ICON_SIZE / Math.max( icon.width, icon.height ) } );
      return new CircuitElementToolNode(
        labelString, showLabelsProperty, circuitLayerNode, icon, count, createCounter( counterFunction ), creator
      );
    };

    // Create the tool nodes
    var wireToolNode = createCircuitElementToolNode( wireString, options.numberOfWires,
      new WireNode( null, null,
        new Wire( new Vertex( 0, 0 ), new Vertex( 100, 0 ), new Property( 0 ), tandem.createTandem( 'wireIconWire' )
        ), null, viewProperty, tandem.createTandem( 'wireIcon' ) ),
      function( circuitElement ) { return circuitElement instanceof Wire; },
      function( position ) {
        var vertexPair = createVertexPair( position, WIRE_LENGTH );
        return new Wire(
          vertexPair.startVertex,
          vertexPair.endVertex,
          circuit.wireResistivityProperty,
          circuit.wireGroupTandem.createNextTandem()
        );
      }
    );

    var batteryModel = new Battery( new Vertex( 0, 0 ), new Vertex( CircuitConstructionKitConstants.BATTERY_LENGTH, 0 ),
      null, 'normal', tandem.createTandem( 'rightIconBattery' ) );
    var rightBatteryToolNode = createCircuitElementToolNode( batteryString, options.numberOfRightBatteries,
      new BatteryNode( null, null, batteryModel,
        null, viewProperty, tandem.createTandem( 'rightBatteryIcon' ), { icon: true }
      ),
      function( circuitElement ) {
        return circuitElement instanceof Battery &&
               circuitElement.initialOrientation === 'right' &&
               circuitElement.batteryType === 'normal';
      },
      function( position ) {
        var vertexPair = createVertexPair( position, BATTERY_LENGTH );
        return new Battery(
          vertexPair.startVertex,
          vertexPair.endVertex,
          circuit.batteryResistanceProperty,
          'normal',
          circuit.rightBatteryTandemGroup.createNextTandem()
        );
      }
    );

    var lightBulbModel = LightBulb.createAtPosition(
      new Vector2( 0, 0 ),
      circuit.vertexGroupTandem,
      CircuitConstructionKitConstants.DEFAULT_RESISTANCE,
      circuit.lightBulbGroupTandem.createNextTandem(), {
        highResistance: false
      } );
    var lightBulbToolNode = createCircuitElementToolNode( lightBulbString, options.numberOfLightBulbs,
      new CircuitConstructionKitLightBulbNode( null, null,
        lightBulbModel,
        new Property( true ), viewProperty, tandem.createTandem( 'lightBulbIcon' ), { icon: true } ),
      function( circuitElement ) { return circuitElement instanceof LightBulb && !circuitElement.highResistance; },
      function( position ) {
        return LightBulb.createAtPosition(
          position,
          circuit.vertexGroupTandem,
          CircuitConstructionKitConstants.DEFAULT_RESISTANCE,
          circuit.lightBulbGroupTandem.createNextTandem()
        );
      }, {
        iconScale: 0.85
      } );

    // Override touch area because it has unique dimensions
    // lightBulbToolNode.touchArea = lightBulbToolNode.localBounds.dilatedXY( 11, 8 );

    var resistorModel = new Resistor(
      new Vertex( 0, 0 ),
      new Vertex( CircuitConstructionKitConstants.RESISTOR_LENGTH, 0 ),
      tandem.createTandem( 'resistor' )
    );
    var resistorToolNode = createCircuitElementToolNode( resistorString, options.numberOfResistors,
      new ResistorNode( null, null,
        resistorModel, null, viewProperty, tandem.createTandem( 'resistorIcon' ), { icon: true }
      ),
      function( circuitElement ) {
        return circuitElement instanceof Resistor && circuitElement.resistorType === 'resistor';
      },
      function( position ) {
        var vertexPair = createVertexPair( position, RESISTOR_LENGTH );
        return new Resistor(
          vertexPair.startVertex, vertexPair.endVertex, circuit.resistorGroupTandem.createNextTandem()
        );
      }
    );

    var switchToolNode = createCircuitElementToolNode( switchString, options.numberOfSwitches,
      new SwitchNode( null, null,
        new Switch(
          new Vertex( 0, 0 ),
          new Vertex( SWITCH_LENGTH, 0 ),
          tandem.createTandem( 'switch' )
        ), null, viewProperty, tandem.createTandem( 'switchIcon' ), {
          icon: true
        } ),
      function( circuitElement ) { return circuitElement instanceof Switch; },
      function( position ) {
        var vertexPair = createVertexPair( position, SWITCH_LENGTH );
        return new Switch( vertexPair.startVertex, vertexPair.endVertex, circuit.switchGroupTandem.createNextTandem() );
      } );

    if ( options.numberOfCoins ) {

      /**
       * Create a ToolNode for a grab bag item
       * @param {string} resistorType
       * @param {number} resistance
       * @param {number} resistorLength
       * @param {string} labelString
       * @param {number} maxCount
       * @param {Tandem} iconModelTandem
       * @param {Tandem} iconTandem
       * @param {Tandem} groupTandem
       * @returns {CircuitElementToolNode}
       */
      var createGrabBagToolNode = function( resistorType, resistance, resistorLength, labelString, maxCount,
                                            iconModelTandem, iconTandem, groupTandem ) {
        var createGrabBagIcon = function( grabBagItem, tandem ) {
          return new ResistorNode( null, null, grabBagItem, null, viewProperty, tandem, { icon: true } );
        };

        var getGrabBagItemCreator = function( resistorType, resistance, resistorLength, groupTandem ) {
          return function( position ) {
            var vertexPair = createVertexPair( position, resistorLength );
            return new Resistor( vertexPair.startVertex, vertexPair.endVertex, groupTandem.createNextTandem(), {
              resistance: resistance,
              resistorType: resistorType,
              resistorLength: resistorLength
            } );
          };
        };

        /**
         * Create the specified grab bag item
         * @param {string} resistorType
         * @param {number} resistorLength
         * @param {Tandem} tandem
         * @returns {Resistor}
         */
        var createGrabBagItem = function( resistorType, resistorLength, tandem ) {
          return new Resistor( new Vertex( 0, 0 ), new Vertex( resistorLength, 0 ), tandem, {
            resistorType: resistorType,
            resistorLength: resistorLength
          } );
        };
        var createdItem = createGrabBagItem( resistorType, resistorLength, iconModelTandem );
        return createCircuitElementToolNode( labelString, maxCount, createGrabBagIcon( createdItem, iconTandem ),
          function( circuitElement ) {
            return circuitElement instanceof Resistor && circuitElement.resistorType === resistorType;
          },
          getGrabBagItemCreator( resistorType, resistance, resistorLength, groupTandem )
        );
      };

      var MIN_RESISTANCE = 1E-6;

      var dollarBillNode = createGrabBagToolNode(
        'dollarBill',
        HIGH_RESISTANCE,
        CircuitConstructionKitConstants.DOLLAR_BILL_LENGTH,
        dollarBillString,
        options.numberOfDollarBills,
        tandem.createTandem( 'dollarBill' ),
        tandem.createTandem( 'dollarBillIcon' ),
        circuit.dollarBillGroupTandem
      );
      var paperClipNode = createGrabBagToolNode(
        'paperClip',
        MIN_RESISTANCE,
        CircuitConstructionKitConstants.PAPER_CLIP_LENGTH,
        paperClipString,
        options.numberOfPaperClips,
        tandem.createTandem( 'paperClip' ),
        tandem.createTandem( 'paperClipIcon' ),
        circuit.paperClipGroupTandem
      );
      var coinToolNode = createGrabBagToolNode(
        'coin',
        MIN_RESISTANCE,
        CircuitConstructionKitConstants.COIN_LENGTH,
        coinString,
        options.numberOfCoins,
        tandem.createTandem( 'coin' ),
        tandem.createTandem( 'coinIcon' ),
        circuit.coinGroupTandem
      );
      var eraserToolNode = createGrabBagToolNode(
        'eraser',
        HIGH_RESISTANCE,
        CircuitConstructionKitConstants.ERASER_LENGTH,
        eraserString,
        options.numberOfErasers,
        tandem.createTandem( 'eraser' ),
        tandem.createTandem( 'eraserIcon' ),
        circuit.eraserGroupTandem
      );
      var pencilToolNode = createGrabBagToolNode(
        'pencil',
        300,
        CircuitConstructionKitConstants.PENCIL_LENGTH,
        pencilString,
        options.numberOfPencils,
        tandem.createTandem( 'pencil' ),
        tandem.createTandem( 'pencilIcon' ),
        circuit.pencilGroupTandem
      );
      var handToolNode = createGrabBagToolNode(
        'hand',
        Math.pow( 10, 6 ),
        CircuitConstructionKitConstants.HAND_LENGTH,
        handString,
        options.numberOfHands,
        tandem.createTandem( 'hand' ),
        tandem.createTandem( 'handIcon' ),
        circuit.handGroupTandem
      );
      var dogToolNode = createGrabBagToolNode(
        'dog',
        HIGH_RESISTANCE,
        CircuitConstructionKitConstants.DOG_LENGTH,
        dogString,
        options.numberOfDogs,
        tandem.createTandem( 'dog' ),
        tandem.createTandem( 'dogIcon' ),
        circuit.dogGroupTandem
      );
    }

    if ( options.numberOfHighVoltageBatteries ) {

      var highVoltageBatteryToolNode = createCircuitElementToolNode(
        batteryString,
        options.numberOfHighVoltageBatteries,
        new BatteryNode( null, null,
          new Battery(
            new Vertex( 0, 0 ),
            new Vertex( CircuitConstructionKitConstants.BATTERY_LENGTH, 0 ),
            null,
            'high-voltage',
            tandem.createTandem( 'highVoltageIconBattery' )
          ), null, viewProperty, tandem.createTandem( 'highVoltageBatteryIcon' ), { icon: true } ),
        function( circuitElement ) {
          return circuitElement instanceof Battery &&
                 circuitElement.initialOrientation === 'right' &&
                 circuitElement.batteryType === 'high-voltage';
        }, function( position ) {
          var vertexPair = createVertexPair( position, BATTERY_LENGTH );
          return new Battery(
            vertexPair.startVertex,
            vertexPair.endVertex,
            circuit.batteryResistanceProperty,
            'high-voltage',
            circuit.rightBatteryTandemGroup.createNextTandem(), {
              voltage: 10000,
              editableRange: new Range( 100, 100000 ),
              editorDelta: CircuitConstructionKitConstants.HIGH_EDITOR_DELTA
            } );
        } );

      var highResistanceBulbToolNode = createCircuitElementToolNode(
        lightBulbString,
        options.numberOfHighResistanceLightBulbs,
        new CircuitConstructionKitLightBulbNode(
          null,
          null,
          LightBulb.createAtPosition(
            new Vector2( 0, 0 ),
            circuit.vertexGroupTandem,
            1000,
            circuit.lightBulbGroupTandem.createNextTandem(), {
              highResistance: true
            } ),
          new Property( true ),
          viewProperty,
          tandem.createTandem( 'highResistanceLightBulbIcon' ), {
            icon: true
          } ),
        function( circuitElement ) { return circuitElement instanceof LightBulb && circuitElement.highResistance; },
        function( position ) {
          return LightBulb.createAtPosition( position, circuit.vertexGroupTandem,
            CircuitConstructionKitConstants.HIGH_RESISTANCE, circuit.lightBulbGroupTandem.createNextTandem(), {
              highResistance: true,
              editableRange: CircuitConstructionKitConstants.HIGH_RESISTANCE_RANGE,
              editorDelta: CircuitConstructionKitConstants.HIGH_EDITOR_DELTA
            } );
        } );

      var highResistanceResistorToolNode = createCircuitElementToolNode(
        resistorString,
        options.numberOfHighResistanceResistors,
        new ResistorNode( null, null,
          new Resistor(
            new Vertex( 0, 0 ),
            new Vertex( CircuitConstructionKitConstants.RESISTOR_LENGTH, 0 ),
            tandem.createTandem( 'highResistanceResistor' ), {
              resistorType: 'highResistanceResistor', resistance: 1000
            } ),
          null,
          viewProperty,
          tandem.createTandem( 'highResistanceResistorIcon' ), {
            icon: true
          } ),
        function( circuitElement ) {
          return circuitElement instanceof Resistor && circuitElement.resistorType === 'highResistanceResistor';
        },
        function( position ) {
          var vertexPair = createVertexPair( position, RESISTOR_LENGTH );
          return new Resistor(
            vertexPair.startVertex,
            vertexPair.endVertex,
            circuit.resistorGroupTandem.createNextTandem(), {
              resistorType: 'highResistanceResistor',
              resistance: CircuitConstructionKitConstants.HIGH_RESISTANCE,
              editableRange: CircuitConstructionKitConstants.HIGH_RESISTANCE_RANGE,
              editorDelta: CircuitConstructionKitConstants.HIGH_EDITOR_DELTA
            } );
        } );
    }

    // Tool nodes that appear on every screen. Pagination for the carousel, each page should begin with wire node
    var circuitElementToolNodes = [
      wireToolNode,
      rightBatteryToolNode,
      lightBulbToolNode,
      resistorToolNode,
      switchToolNode
    ];

    if ( options.numberOfCoins && !options.numberOfHighVoltageBatteries ) {
      circuitElementToolNodes = circuitElementToolNodes.concat( [

        new Node( { children: [ wireToolNode ] } ), // Wire should appear at the top of each carousel page
        dollarBillNode,
        paperClipNode,
        coinToolNode,
        eraserToolNode,

        new Node( { children: [ wireToolNode ] } ),// Wire should appear at the top of each carousel page
        pencilToolNode,
        handToolNode,
        dogToolNode
      ] );
    }
    else if ( options.numberOfCoins && options.numberOfHighVoltageBatteries ) {
      circuitElementToolNodes = circuitElementToolNodes.concat( [
        new Node( { children: [ wireToolNode ] } ),// Wire should appear at the top of each carousel page
        highVoltageBatteryToolNode,
        highResistanceResistorToolNode,
        highResistanceBulbToolNode,
        dollarBillNode,

        new Node( { children: [ wireToolNode ] } ),// Wire should appear at the top of each carousel page
        paperClipNode,
        coinToolNode,
        eraserToolNode,
        pencilToolNode,

        new Node( { children: [ wireToolNode ] } ),// Wire should appear at the top of each carousel page
        handToolNode,
        dogToolNode
      ] );
    }

    var ITEMS_PER_PAGE = 5;
    var SPACING = 5;
    var child = null;

    // If there is only one page, do not show Carousel controls
    if ( circuitElementToolNodes.length <= ITEMS_PER_PAGE ) {
      child = new CircuitConstructionKitPanel( new LayoutBox( {
        orientation: options.orientation,
        spacing: CircuitConstructionKitConstants.TOOLBOX_ITEM_SPACING,
        children: circuitElementToolNodes,
        resize: false
      } ), tandem, {
        resize: false,

        // Match the background of the carousel
        fill: 'white',
        yMargin: 27
      } );
    }
    else {

      // If there are 2+ pages, show them in a carousel
      this.carousel = new Carousel( circuitElementToolNodes, {
        orientation: 'vertical',
        itemsPerPage: ITEMS_PER_PAGE,
        spacing: 0,
        margin: 15,
        tandem: tandem.createTandem( 'carousel' )
      } );

      var pageControl = new PageControl( this.carousel.numberOfPages, this.carousel.pageNumberProperty, {
        orientation: 'vertical',
        pageFill: 'white',
        pageStroke: 'black',
        interactive: true,
        dotTouchAreaDilation: 4,
        dotMouseAreaDilation: 4
      } );

      child = new HBox( {
        spacing: SPACING,
        children: [ pageControl, this.carousel ]
      } );
    }
    Node.call( this, {
      children: [ child ]
    } );
  }

  circuitConstructionKitCommon.register( 'CircuitElementToolbox', CircuitElementToolbox );

  return inherit( Node, CircuitElementToolbox, {

    /**
     * Resets the toolbox.
     * @override
     * @public
     */
    reset: function() {
      this.carousel && this.carousel.reset( { animationEnabled: false } );
    }
  } );
} );