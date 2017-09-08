// Copyright 2017, University of Colorado Boulder

/**
 * Creates CircuitElementToolNodes that can be used to create CircuitElements from the toolbox.  Exists for the life of
 * the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Property = require( 'AXON/Property' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  var BatteryType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/BatteryType' );
  var CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElementViewType' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  var ResistorType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ResistorType' );
  var Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Vertex' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );
  var BatteryNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/BatteryNode' );
  var CircuitConstructionKitLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitConstructionKitLightBulbNode' );
  var CircuitElementToolNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementToolNode' );
  var ResistorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ResistorNode' );
  var SwitchNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SwitchNode' );
  var Range = require( 'DOT/Range' );
  var Vector2 = require( 'DOT/Vector2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Color = require( 'SCENERY/util/Color' );

  // strings
  var batteryString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/battery' );
  var coinString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/coin' );
  var dogString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/dog' );
  var dollarBillString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/dollarBill' );
  var eraserString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/eraser' );
  var handString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/hand' );
  var lightBulbString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightBulb' );
  var paperClipString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/paperClip' );
  var pencilString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/pencil' );
  var resistorString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistor' );
  var switchString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/switch' );
  var wireString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/wire' );

  // images
  var wireIconImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/wire-icon.png' );

  // constants
  var BATTERY_LENGTH = CircuitConstructionKitCommonConstants.BATTERY_LENGTH;
  var TOOLBOX_ICON_SIZE = CircuitConstructionKitCommonConstants.TOOLBOX_ICON_SIZE;
  var RESISTOR_LENGTH = CircuitConstructionKitCommonConstants.RESISTOR_LENGTH;
  var WIRE_LENGTH = 100;
  var SWITCH_LENGTH = CircuitConstructionKitCommonConstants.SWITCH_LENGTH;
  var HIGH_RESISTANCE = Math.pow( 10, 9 );
  var MIN_RESISTANCE = 1E-6;

  /**
   * @param {Circuit} circuit
   * @param {Property.<boolean>} showLabelsProperty
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {function} globalToCircuitLayerNodePoint Vector2=>Vector2 global point to coordinate frame of circuitLayerNode
   * @constructor
   */
  function CircuitElementToolFactory( circuit, showLabelsProperty, viewTypeProperty, globalToCircuitLayerNodePoint ) {
    this.circuit = circuit;
    this.showLabelsProperty = showLabelsProperty;
    this.viewTypeProperty = viewTypeProperty;
    this.globalToCircuitLayerNodePoint = globalToCircuitLayerNodePoint;
  }

  circuitConstructionKitCommon.register( 'CircuitElementToolFactory', CircuitElementToolFactory );

  return inherit( Object, CircuitElementToolFactory, {

    /**
     * Resets the toolbox.
     * @override
     * @public
     */
    reset: function() {
      this.carousel.reset( { animationEnabled: false } );
    },


    /**
     * Create a Vertex at the specified location, convenience function for creating the vertices for CircuitElements.
     * @param {Vector2} position - the position of the Vertex in view = model coordinates
     * @returns {Vertex}
     * @private
     */
    createVertex: function( position ) {
      return new Vertex( position, { tandem: this.circuit.vertexGroupTandem.createNextTandem() } );
    },

    /**
     * Returns a function which counts the number of circuit elements (not counting those in the true black box).
     * @param {function} predicate - CircuitElement => boolean
     * @returns {function} a no-arg function that returns the {number} of CircuitElements of the specified type
     * @private
     */
    createCounter: function( predicate ) {
      var self = this;
      return function() {
        return self.circuit.circuitElements.getArray().filter( function( circuitElement ) {

          // Count according to the predicate, but don't count elements inside the true black box
          return predicate( circuitElement ) && !circuitElement.insideTrueBlackBoxProperty.get();
        } ).length;
      };
    },

    /**
     * Create a pair of vertices to be used for a new CircuitElement
     * @param {Vector2} position - the position of the center of the CircuitElement
     * @param {number} length - the distance between the vertices
     * @returns {{startVertex: Vertex, endVertex: Vertex}}
     * @private
     */
    createVertexPair: function( position, length ) {
      return {
        startVertex: this.createVertex( position.plusXY( -length / 2, 0 ) ),
        endVertex: this.createVertex( position.plusXY( length / 2, 0 ) )
      };
    },

    /**
     * Utility function that creates a CircuitElementToolNode
     * @param {string} labelString
     * @param {number} count
     * @param {Node} icon
     * @param {Property.<CircuitElementViewType>} viewTypeProperty
     * @param {function} predicate - CircuitElement => boolean, used to count circuit elements of that kind
     * @param {function} createElement - (Vector2) => CircuitElement Function that creates a CircuitElement at the given location
     *                                 - for most components it is the center of the component.  For Light Bulbs, it is
     *                                 - in the center of the socket
     * @param {Object} [options]
     * @returns {CircuitElementToolNode}
     * @private
     */
    createCircuitElementToolNode: function( labelString, count, icon, predicate, createElement, options ) {
      options = _.extend( { iconScale: 1.0 }, options );
      icon.mutate( { scale: options.iconScale * TOOLBOX_ICON_SIZE / Math.max( icon.width, icon.height ) } );
      return new CircuitElementToolNode(
        labelString,
        this.showLabelsProperty,
        this.viewTypeProperty,
        this.circuit,
        this.globalToCircuitLayerNodePoint,
        icon,
        count,
        this.createCounter( predicate ),
        createElement
      );
    },

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createWireToolNode: function( count, tandem ) {
      var self = this;
      var lifelikeWireNode = new Image( wireIconImage );
      var schematicWireNode = new Line( 0, 0, 120, 0, {
        stroke: Color.BLACK,
        lineWidth: 4.5 // match with other toolbox icons
      } );
      var wireNode = new Node();
      this.viewTypeProperty.link( function( view ) {
        wireNode.children = [ view === CircuitElementViewType.LIFELIKE ? lifelikeWireNode : schematicWireNode ];
      } );
      return this.createCircuitElementToolNode( wireString, count, wireNode,
        function( circuitElement ) { return circuitElement instanceof Wire; },
        function( position ) {
          var vertexPair = self.createVertexPair( position, WIRE_LENGTH );
          return new Wire(
            vertexPair.startVertex,
            vertexPair.endVertex,
            self.circuit.wireResistivityProperty,
            self.circuit.wireGroupTandem.createNextTandem()
          );
        }
      );
    },

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createRightBatteryToolNode: function( count, tandem ) {
      var self = this;
      var batteryModel = new Battery( new Vertex( Vector2.ZERO ), new Vertex( new Vector2( CircuitConstructionKitCommonConstants.BATTERY_LENGTH, 0 ) ),
        null, BatteryType.NORMAL, tandem.createTandem( 'rightIconBattery' ) );
      var rightBatteryToolNode = this.createCircuitElementToolNode( batteryString, count,
        new BatteryNode( null, null, batteryModel, this.viewTypeProperty, tandem.createTandem( 'rightBatteryIcon' ), { isIcon: true }
        ),
        function( circuitElement ) {
          return circuitElement instanceof Battery &&
                 circuitElement.initialOrientation === 'right' &&
                 circuitElement.batteryType === BatteryType.NORMAL;
        },
        function( position ) {
          var vertexPair = self.createVertexPair( position, BATTERY_LENGTH );
          return new Battery(
            vertexPair.startVertex,
            vertexPair.endVertex,
            self.circuit.batteryResistanceProperty,
            BatteryType.NORMAL,
            self.circuit.rightBatteryTandemGroup.createNextTandem()
          );
        }
      );
      return rightBatteryToolNode;
    },

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createLightBulbToolNode: function( count, tandem ) {
      var self = this;
      var lightBulbModel = LightBulb.createAtPosition(
        Vector2.ZERO,
        this.circuit.vertexGroupTandem,
        CircuitConstructionKitCommonConstants.DEFAULT_RESISTANCE,
        this.viewTypeProperty,
        this.circuit.lightBulbGroupTandem.createNextTandem(), {
          highResistance: false
        } );
      var lightBulbToolNode = this.createCircuitElementToolNode( lightBulbString, count,
        new CircuitConstructionKitLightBulbNode( null, null,
          lightBulbModel,
          new Property( true ), this.viewTypeProperty, tandem.createTandem( 'lightBulbIcon' ), { isIcon: true } ),
        function( circuitElement ) { return circuitElement instanceof LightBulb && !circuitElement.highResistance; },
        function( position ) {
          return LightBulb.createAtPosition(
            position,
            self.circuit.vertexGroupTandem,
            CircuitConstructionKitCommonConstants.DEFAULT_RESISTANCE,
            self.viewTypeProperty,
            self.circuit.lightBulbGroupTandem.createNextTandem()
          );
        }, {
          iconScale: 0.85
        } );
      return lightBulbToolNode;
    },

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createResistorToolNode: function( count, tandem ) {
      var self = this;
      var resistorModel = new Resistor(
        new Vertex( Vector2.ZERO ),
        new Vertex( new Vector2( CircuitConstructionKitCommonConstants.RESISTOR_LENGTH, 0 ) ),
        tandem.createTandem( 'resistor' )
      );
      var resistorToolNode = this.createCircuitElementToolNode( resistorString, count,
        new ResistorNode( null, null, resistorModel, this.viewTypeProperty, tandem.createTandem( 'resistorIcon' ), {
          isIcon: true
        } ),
        function( circuitElement ) {
          return circuitElement instanceof Resistor && circuitElement.resistorType === ResistorType.RESISTOR;
        },
        function( position ) {
          var vertexPair = self.createVertexPair( position, RESISTOR_LENGTH );
          return new Resistor(
            vertexPair.startVertex, vertexPair.endVertex, self.circuit.resistorGroupTandem.createNextTandem()
          );
        }
      );
      return resistorToolNode;
    },

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createSwitchToolNode: function( count, tandem ) {
      var self = this;
      var switchToolNode = this.createCircuitElementToolNode( switchString, count,
        new SwitchNode( null, null,
          new Switch(
            new Vertex( Vector2.ZERO ),
            new Vertex( new Vector2( SWITCH_LENGTH, 0 ) ),
            tandem.createTandem( 'switch' )
          ), this.viewTypeProperty, tandem.createTandem( 'switchIcon' ), {
            isIcon: true
          } ),
        function( circuitElement ) { return circuitElement instanceof Switch; },
        function( position ) {
          var vertexPair = self.createVertexPair( position, SWITCH_LENGTH );
          return new Switch( vertexPair.startVertex, vertexPair.endVertex, self.circuit.switchGroupTandem.createNextTandem() );
        } );
      return switchToolNode;
    },

    /**
     * Create a ToolNode for a household item, such as an eraser or dog
     * @param {ResistorType} resistorType
     * @param {number} resistance
     * @param {number} resistorLength
     * @param {string} labelString
     * @param {number} maxCount
     * @param {Tandem} iconModelTandem
     * @param {Tandem} iconTandem
     * @param {Tandem} groupTandem
     * @returns {CircuitElementToolNode}
     * @private
     */
    createHouseholdItemToolNode: function( resistorType, resistance, resistorLength, labelString, maxCount,
                                           iconModelTandem, iconTandem, groupTandem ) {
      var self = this;
      var createHouseholdIcon = function( householdItem, tandem ) {
        return new ResistorNode( null, null, householdItem, self.viewTypeProperty, tandem, { isIcon: true } );
      };

      var getHouseholdItemCreator = function( resistorType, resistance, resistorLength, groupTandem ) {
        return function( position ) {
          var vertexPair = self.createVertexPair( position, resistorLength );
          return new Resistor( vertexPair.startVertex, vertexPair.endVertex, groupTandem.createNextTandem(), {
            resistance: resistance,
            resistorType: resistorType,
            resistorLength: resistorLength
          } );
        };
      };

      /**
       * Create the specified household item
       * @param {ResistorType} resistorType
       * @param {number} resistorLength
       * @param {Tandem} tandem
       * @returns {Resistor}
       */
      var createHouseholdItem = function( resistorType, resistorLength, tandem ) {
        return new Resistor( new Vertex( Vector2.ZERO ), new Vertex( new Vector2( resistorLength, 0 ) ), tandem, {
          resistorType: resistorType,
          resistorLength: resistorLength
        } );
      };
      var createdItem = createHouseholdItem( resistorType, resistorLength, iconModelTandem );
      return this.createCircuitElementToolNode( labelString, maxCount, createHouseholdIcon( createdItem, iconTandem ),
        function( circuitElement ) {
          return circuitElement instanceof Resistor && circuitElement.resistorType === resistorType;
        },
        getHouseholdItemCreator( resistorType, resistance, resistorLength, groupTandem )
      );
    },

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createDollarBillToolNode: function( count, tandem ) {
      return this.createHouseholdItemToolNode(
        ResistorType.DOLLAR_BILL,
        HIGH_RESISTANCE,
        CircuitConstructionKitCommonConstants.DOLLAR_BILL_LENGTH,
        dollarBillString,
        count,
        tandem.createTandem( 'dollarBill' ),
        tandem.createTandem( 'dollarBillIcon' ),
        this.circuit.dollarBillGroupTandem
      );
    },

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createPaperClipToolNode: function( count, tandem ) {
      return this.createHouseholdItemToolNode(
        ResistorType.PAPER_CLIP,
        MIN_RESISTANCE,
        CircuitConstructionKitCommonConstants.PAPER_CLIP_LENGTH,
        paperClipString,
        count,
        tandem.createTandem( 'paperClip' ),
        tandem.createTandem( 'paperClipIcon' ),
        this.circuit.paperClipGroupTandem
      );
    },

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createCoinToolNode: function( count, tandem ) {
      return this.createHouseholdItemToolNode(
        ResistorType.COIN,
        MIN_RESISTANCE,
        CircuitConstructionKitCommonConstants.COIN_LENGTH,
        coinString,
        count,
        tandem.createTandem( 'coin' ),
        tandem.createTandem( 'coinIcon' ),
        this.circuit.coinGroupTandem
      );
    },

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createEraserToolNode: function( count, tandem ) {
      return this.createHouseholdItemToolNode(
        ResistorType.ERASER,
        HIGH_RESISTANCE,
        CircuitConstructionKitCommonConstants.ERASER_LENGTH,
        eraserString,
        count,
        tandem.createTandem( 'eraser' ),
        tandem.createTandem( 'eraserIcon' ),
        this.circuit.eraserGroupTandem
      );
    },

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createPencilToolNode: function( count, tandem ) {
      return this.createHouseholdItemToolNode(
        ResistorType.PENCIL,
        300,
        CircuitConstructionKitCommonConstants.PENCIL_LENGTH,
        pencilString,
        count,
        tandem.createTandem( 'pencil' ),
        tandem.createTandem( 'pencilIcon' ),
        this.circuit.pencilGroupTandem
      );
    },

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createHandToolNode: function( count, tandem ) {
      return this.createHouseholdItemToolNode(
        ResistorType.HAND,
        Math.pow( 10, 6 ),
        CircuitConstructionKitCommonConstants.HAND_LENGTH,
        handString,
        count,
        tandem.createTandem( 'hand' ),
        tandem.createTandem( 'handIcon' ),
        this.circuit.handGroupTandem
      );
    },

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createDogToolNode: function( count, tandem ) {
      return this.createHouseholdItemToolNode(
        ResistorType.DOG,
        HIGH_RESISTANCE,
        CircuitConstructionKitCommonConstants.DOG_LENGTH,
        dogString,
        count,
        tandem.createTandem( 'dog' ),
        tandem.createTandem( 'dogIcon' ),
        this.circuit.dogGroupTandem
      );
    },

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createHighVoltageBatteryToolNode: function( count, tandem ) {
      var self = this;
      return this.createCircuitElementToolNode(
        batteryString,
        count,
        new BatteryNode( null, null,
          new Battery(
            new Vertex( Vector2.ZERO ),
            new Vertex( new Vector2( CircuitConstructionKitCommonConstants.BATTERY_LENGTH, 0 ) ),
            null,
            BatteryType.HIGH_VOLTAGE,
            tandem.createTandem( 'highVoltageIconBattery' )
          ), this.viewTypeProperty, tandem.createTandem( 'highVoltageBatteryIcon' ), { isIcon: true } ),
        function( circuitElement ) {
          return circuitElement instanceof Battery &&

                 circuitElement.initialOrientation === 'right' &&
                 circuitElement.batteryType === BatteryType.HIGH_VOLTAGE;
        }, function( position ) {
          var vertexPair = self.createVertexPair( position, BATTERY_LENGTH );
          return new Battery(
            vertexPair.startVertex,
            vertexPair.endVertex,
            self.circuit.batteryResistanceProperty,
            BatteryType.HIGH_VOLTAGE,
            self.circuit.rightBatteryTandemGroup.createNextTandem(), {
              voltage: 10000,
              editableRange: new Range( 100, 100000 ),
              editorDelta: CircuitConstructionKitCommonConstants.HIGH_EDITOR_DELTA
            } );
        } );
    },

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createHighResistanceBulbToolNode: function( count, tandem ) {
      var self = this;
      return this.createCircuitElementToolNode(
        lightBulbString,
        count,
        new CircuitConstructionKitLightBulbNode(
          null,
          null,
          LightBulb.createAtPosition(
            Vector2.ZERO,
            this.circuit.vertexGroupTandem,
            1000,
            this.viewTypeProperty,
            this.circuit.lightBulbGroupTandem.createNextTandem(), {
              highResistance: true
            } ),
          new Property( true ),
          this.viewTypeProperty,
          tandem.createTandem( 'highResistanceLightBulbIcon' ), {
            isIcon: true
          } ),
        function( circuitElement ) { return circuitElement instanceof LightBulb && circuitElement.highResistance; },
        function( position ) {
          return LightBulb.createAtPosition( position, self.circuit.vertexGroupTandem,
            CircuitConstructionKitCommonConstants.HIGH_RESISTANCE, self.viewTypeProperty,
            self.circuit.lightBulbGroupTandem.createNextTandem(), {
              highResistance: true,
              editableRange: CircuitConstructionKitCommonConstants.HIGH_RESISTANCE_RANGE,
              editorDelta: CircuitConstructionKitCommonConstants.HIGH_EDITOR_DELTA
            } );
        } );
    },

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createHighResistanceResistorToolNode: function( count, tandem ) {
      var self = this;
      return this.createCircuitElementToolNode(
        resistorString,
        count,
        new ResistorNode( null, null,
          new Resistor(
            new Vertex( Vector2.ZERO ),
            new Vertex( new Vector2( CircuitConstructionKitCommonConstants.RESISTOR_LENGTH, 0 ) ),
            tandem.createTandem( 'highResistanceResistor' ), {
              resistorType: ResistorType.HIGH_RESISTANCE_RESISTOR, resistance: 1000
            } ),
          this.viewTypeProperty,
          tandem.createTandem( 'highResistanceResistorIcon' ), {
            isIcon: true
          } ),
        function( circuitElement ) {
          return circuitElement instanceof Resistor && circuitElement.resistorType === ResistorType.HIGH_RESISTANCE_RESISTOR;
        },
        function( position ) {
          var vertexPair = self.createVertexPair( position, RESISTOR_LENGTH );
          return new Resistor(
            vertexPair.startVertex,
            vertexPair.endVertex,
            self.circuit.resistorGroupTandem.createNextTandem(), {
              resistorType: ResistorType.HIGH_RESISTANCE_RESISTOR,
              resistance: CircuitConstructionKitCommonConstants.HIGH_RESISTANCE,
              editableRange: CircuitConstructionKitCommonConstants.HIGH_RESISTANCE_RANGE,
              editorDelta: CircuitConstructionKitCommonConstants.HIGH_EDITOR_DELTA
            } );
        }
      );
    }
  } );
} );