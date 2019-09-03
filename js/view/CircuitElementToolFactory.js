// Copyright 2017-2019, University of Colorado Boulder

/**
 * Creates CircuitElementToolNodes that can be used to create CircuitElements from the toolbox.  Exists for the life of
 * the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ACVoltage = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ACVoltage' );
  const ACVoltageNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ACVoltageNode' );
  const Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  const BatteryNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/BatteryNode' );
  const Capacitor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Capacitor' );
  const CapacitorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CapacitorNode' );
  const InductorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/InductorNode' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const CCKCLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CCKCLightBulbNode' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const CircuitElementToolNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementToolNode' );
  const CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElementViewType' );
  const Color = require( 'SCENERY/util/Color' );
  const Fuse = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Fuse' );
  const FuseNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FuseNode' );
  const Image = require( 'SCENERY/nodes/Image' );
  const Inductor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Inductor' );
  const LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  const Line = require( 'SCENERY/nodes/Line' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  const ResistorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ResistorNode' );
  const Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  const SwitchNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SwitchNode' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Vertex' );
  const Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );

  // strings
  const acSourceString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/acSource' );
  const batteryString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/battery' );
  const coinString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/coin' );
  const dogString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/dog' );
  const dollarBillString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/dollarBill' );
  const eraserString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/eraser' );
  const fuseString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/fuse' );
  const handString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/hand' );
  const lightBulbString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightBulb' );
  const paperClipString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/paperClip' );
  const pencilString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/pencil' );
  const resistorString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistor' );
  const switchString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/switch' );
  const wireString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/wire' );

  // images
  const wireIconImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/wire-icon.png' );

  // constants
  const BATTERY_LENGTH = CCKCConstants.BATTERY_LENGTH;
  const AC_VOLTAGE_LENGTH = CCKCConstants.AC_VOLTAGE_LENGTH;
  const TOOLBOX_ICON_SIZE = CCKCConstants.TOOLBOX_ICON_SIZE;
  const RESISTOR_LENGTH = CCKCConstants.RESISTOR_LENGTH;
  const WIRE_LENGTH = 100;
  const SWITCH_LENGTH = CCKCConstants.SWITCH_LENGTH;
  const HIGH_RESISTANCE = Math.pow( 10, 9 );
  const MIN_RESISTANCE = 1E-6;

  class CircuitElementToolFactory {

    /**
     * @param {Circuit} circuit
     * @param {Property.<boolean>} showLabelsProperty
     * @param {Property.<CircuitElementViewType>} viewTypeProperty
     * @param {function} globalToCircuitLayerNodePoint Vector2=>Vector2 global point to coordinate frame of circuitLayerNode
     */
    constructor( circuit, showLabelsProperty, viewTypeProperty, globalToCircuitLayerNodePoint ) {
      this.circuit = circuit;
      this.showLabelsProperty = showLabelsProperty;
      this.viewTypeProperty = viewTypeProperty;
      this.globalToCircuitLayerNodePoint = globalToCircuitLayerNodePoint;
    }

    /**
     * Resets the toolbox.
     * @override
     * @public
     */
    reset() {
      this.carousel.reset( { animationEnabled: false } );
    }


    /**
     * Create a Vertex at the specified location, convenience function for creating the vertices for CircuitElements.
     * @param {Vector2} position - the position of the Vertex in view = model coordinates
     * @returns {Vertex}
     * @private
     */
    createVertex( position ) {
      return new Vertex( position, { tandem: this.circuit.vertexGroupTandem.createNextTandem() } );
    }

    /**
     * Returns a function which counts the number of circuit elements (not counting those in the true black box).
     * @param {function} predicate - CircuitElement => boolean
     * @returns {function} a no-arg function that returns the {number} of CircuitElements of the specified type
     * @private
     */
    createCounter( predicate ) {
      return () =>
        this.circuit.circuitElements.getArray().filter( circuitElement =>

          // Count according to the predicate, but don't count elements inside the true black box
          predicate( circuitElement ) && !circuitElement.insideTrueBlackBoxProperty.get()
        ).length;
    }

    /**
     * Create a pair of vertices to be used for a new CircuitElement
     * @param {Vector2} position - the position of the center of the CircuitElement
     * @param {number} length - the distance between the vertices
     * @returns {{startVertex: Vertex, endVertex: Vertex}}
     * @private
     */
    createVertexPair( position, length ) {
      return {
        startVertex: this.createVertex( position.plusXY( -length / 2, 0 ) ),
        endVertex: this.createVertex( position.plusXY( length / 2, 0 ) )
      };
    }

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
    createCircuitElementToolNode( labelString, count, icon, predicate, createElement, options ) {
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
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createWireToolNode( count, tandem ) {
      const lifelikeWireNode = new Image( wireIconImage );
      const schematicWireNode = new Line( 0, 0, 120, 0, {
        stroke: Color.BLACK,
        lineWidth: 4.5 // match with other toolbox icons
      } );
      const wireNode = new Node();
      this.viewTypeProperty.link( view => {
        wireNode.children = [ view === CircuitElementViewType.LIFELIKE ? lifelikeWireNode : schematicWireNode ];
      } );
      return this.createCircuitElementToolNode( wireString, count, wireNode,
        circuitElement => circuitElement instanceof Wire,
        position => {
          const vertexPair = this.createVertexPair( position, WIRE_LENGTH );
          return new Wire(
            vertexPair.startVertex,
            vertexPair.endVertex,
            this.circuit.wireResistivityProperty,
            this.circuit.wireGroupTandem.createNextTandem()
          );
        }
      );
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createRightBatteryToolNode( count, tandem ) {
      const batteryModel = new Battery( new Vertex( Vector2.ZERO ), new Vertex( new Vector2( CCKCConstants.BATTERY_LENGTH, 0 ) ),
        new Property( 0 ), Battery.BatteryType.NORMAL, tandem.createTandem( 'rightIconBattery' ) );
      const rightBatteryToolNode = this.createCircuitElementToolNode( batteryString, count,
        new BatteryNode( null, null, batteryModel, this.viewTypeProperty, tandem.createTandem( 'rightBatteryIcon' ), { isIcon: true }
        ),
        circuitElement => circuitElement instanceof Battery &&
                          circuitElement.initialOrientation === 'right' &&
                          circuitElement.batteryType === Battery.BatteryType.NORMAL,
        position => {
          const vertexPair = this.createVertexPair( position, BATTERY_LENGTH );
          return new Battery(
            vertexPair.startVertex,
            vertexPair.endVertex,
            this.circuit.batteryResistanceProperty,
            Battery.BatteryType.NORMAL,
            this.circuit.rightBatteryTandemGroup.createNextTandem()
          );
        }
      );
      return rightBatteryToolNode;
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createACSourceToolNode( count, tandem ) {
      const acSource = new ACVoltage(
        new Vertex( Vector2.ZERO ),
        new Vertex( new Vector2( AC_VOLTAGE_LENGTH, 0 ) ),
        new Property( 0 ), tandem.createTandem( 'acSourceIconModel' )
      );
      return this.createCircuitElementToolNode( acSourceString, count,
        new ACVoltageNode( null, null, acSource, this.viewTypeProperty, tandem.createTandem( 'acSourceIcon' ), { isIcon: true } ),
        circuitElement => circuitElement instanceof ACVoltage,
        position => {
          const vertexPair = this.createVertexPair( position, AC_VOLTAGE_LENGTH );
          return new ACVoltage(
            vertexPair.startVertex,
            vertexPair.endVertex,
            this.circuit.batteryResistanceProperty,
            this.circuit.rightBatteryTandemGroup.createNextTandem()
          );
        }, {
          iconScale: 0.68
        }
      );
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createLightBulbToolNode( count, tandem ) {
      const lightBulbModel = LightBulb.createAtPosition(
        Vector2.ZERO,
        this.circuit.vertexGroupTandem,
        CCKCConstants.DEFAULT_RESISTANCE,
        this.viewTypeProperty,
        this.circuit.lightBulbGroupTandem.createNextTandem(), {
          highResistance: false
        } );
      const lightBulbToolNode = this.createCircuitElementToolNode( lightBulbString, count,
        new CCKCLightBulbNode( null, null,
          lightBulbModel,
          new Property( true ), this.viewTypeProperty, tandem.createTandem( 'lightBulbIcon' ), { isIcon: true } ),
        circuitElement => circuitElement instanceof LightBulb && !circuitElement.highResistance,
        position => LightBulb.createAtPosition(
          position,
          this.circuit.vertexGroupTandem,
          CCKCConstants.DEFAULT_RESISTANCE,
          this.viewTypeProperty,
          this.circuit.lightBulbGroupTandem.createNextTandem()
        ), {
          iconScale: 0.85
        } );
      return lightBulbToolNode;
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createResistorToolNode( count, tandem ) {
      const resistorModel = new Resistor(
        new Vertex( Vector2.ZERO ),
        new Vertex( new Vector2( CCKCConstants.RESISTOR_LENGTH, 0 ) ),
        tandem.createTandem( 'resistor' )
      );
      const resistorToolNode = this.createCircuitElementToolNode( resistorString, count,
        new ResistorNode( null, null, resistorModel, this.viewTypeProperty, tandem.createTandem( 'resistorIcon' ), {
          isIcon: true
        } ),
        circuitElement => circuitElement instanceof Resistor && circuitElement.resistorType === Resistor.ResistorType.RESISTOR,
        position => {
          const vertexPair = this.createVertexPair( position, RESISTOR_LENGTH );
          return new Resistor(
            vertexPair.startVertex, vertexPair.endVertex, this.circuit.resistorGroupTandem.createNextTandem()
          );
        }
      );
      return resistorToolNode;
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createFuseToolNode( count, tandem ) {
      const fuseModel = new Fuse(
        new Vertex( Vector2.ZERO ),
        new Vertex( new Vector2( CCKCConstants.RESISTOR_LENGTH, 0 ) ),
        tandem.createTandem( 'resistor' )
      );
      const fuseToolNode = this.createCircuitElementToolNode( fuseString, count,
        new FuseNode( null, null, fuseModel, this.viewTypeProperty, tandem.createTandem( 'resistorIcon' ), {
          isIcon: true
        } ),
        circuitElement => circuitElement instanceof Fuse,
        position => {
          const vertexPair = this.createVertexPair( position, RESISTOR_LENGTH );
          return new Fuse(
            vertexPair.startVertex, vertexPair.endVertex, this.circuit.resistorGroupTandem.createNextTandem()
          );
        }
      );
      return fuseToolNode;
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createCapacitorToolNode( count, tandem ) {
      const capacitorModel = new Capacitor(
        new Vertex( Vector2.ZERO ),
        new Vertex( new Vector2( CCKCConstants.CAPACITOR_LENGTH, 0 ) ),
        tandem.createTandem( 'resistor' )
      );
      const capacitorToolNode = this.createCircuitElementToolNode( 'CAPACITOR', count,
        new CapacitorNode( null, null, capacitorModel, this.viewTypeProperty, tandem.createTandem( 'resistorIcon' ), {
          isIcon: true
        } ),
        circuitElement => circuitElement instanceof Capacitor,
        position => {
          const vertexPair = this.createVertexPair( position, CCKCConstants.CAPACITOR_LENGTH );
          return new Capacitor(
            vertexPair.startVertex, vertexPair.endVertex, this.circuit.capacitorGroupTandem.createNextTandem()
          );
        }
      );
      return capacitorToolNode;
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createInductorToolNode( count, tandem ) {
      const inductorModel = new Inductor(
        new Vertex( Vector2.ZERO ),
        new Vertex( new Vector2( CCKCConstants.INDUCTOR_LENGTH, 0 ) ),
        tandem.createTandem( 'resistor' )
      );
      const inductorToolNode = this.createCircuitElementToolNode( 'INDUCTOR', count,
        new InductorNode( null, null, inductorModel, this.viewTypeProperty, tandem.createTandem( 'resistorIcon' ), {
          isIcon: true
        } ),
        circuitElement => circuitElement instanceof Inductor,
        position => {
          const vertexPair = this.createVertexPair( position, CCKCConstants.INDUCTOR_LENGTH );
          return new Inductor(
            vertexPair.startVertex, vertexPair.endVertex, this.circuit.inductorGroupTandem.createNextTandem()
          );
        }
      );
      return inductorToolNode;
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createSwitchToolNode( count, tandem ) {
      const switchToolNode = this.createCircuitElementToolNode( switchString, count,
        new SwitchNode( null, null,
          new Switch(
            new Vertex( Vector2.ZERO ),
            new Vertex( new Vector2( SWITCH_LENGTH, 0 ) ),
            tandem.createTandem( 'switch' )
          ), this.viewTypeProperty, tandem.createTandem( 'switchIcon' ), {
            isIcon: true
          } ),
        circuitElement => circuitElement instanceof Switch,
        position => {
          const vertexPair = this.createVertexPair( position, SWITCH_LENGTH );
          return new Switch( vertexPair.startVertex, vertexPair.endVertex, this.circuit.switchGroupTandem.createNextTandem() );
        } );
      return switchToolNode;
    }

    /**
     * Create a ToolNode for a household item, such as an eraser or dog
     * @param {Resistor.ResistorType} resistorType
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
    createHouseholdItemToolNode( resistorType, resistance, resistorLength, labelString, maxCount,
                                 iconModelTandem, iconTandem, groupTandem ) {
      const createHouseholdIcon = ( householdItem, tandem ) => {
        return new ResistorNode( null, null, householdItem, this.viewTypeProperty, tandem, { isIcon: true } );
      };

      const getHouseholdItemCreator = ( resistorType, resistance, resistorLength, groupTandem ) => {
        return position => {
          const vertexPair = this.createVertexPair( position, resistorLength );
          return new Resistor( vertexPair.startVertex, vertexPair.endVertex, groupTandem.createNextTandem(), {
            resistance: resistance,
            resistorType: resistorType,
            resistorLength: resistorLength
          } );
        };
      };

      /**
       * Create the specified household item
       * @param {Resistor.ResistorType} resistorType
       * @param {number} resistorLength
       * @param {Tandem} tandem
       * @returns {Resistor}
       */
      const createHouseholdItem = function( resistorType, resistorLength, tandem ) {
        return new Resistor( new Vertex( Vector2.ZERO ), new Vertex( new Vector2( resistorLength, 0 ) ), tandem, {
          resistorType: resistorType,
          resistorLength: resistorLength
        } );
      };
      const createdItem = createHouseholdItem( resistorType, resistorLength, iconModelTandem );
      return this.createCircuitElementToolNode( labelString, maxCount, createHouseholdIcon( createdItem, iconTandem ),
        circuitElement => circuitElement instanceof Resistor && circuitElement.resistorType === resistorType,
        getHouseholdItemCreator( resistorType, resistance, resistorLength, groupTandem )
      );
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createDollarBillToolNode( count, tandem ) {
      return this.createHouseholdItemToolNode(
        Resistor.ResistorType.DOLLAR_BILL,
        HIGH_RESISTANCE,
        CCKCConstants.DOLLAR_BILL_LENGTH,
        dollarBillString,
        count,
        tandem.createTandem( 'dollarBill' ),
        tandem.createTandem( 'dollarBillIcon' ),
        this.circuit.dollarBillGroupTandem
      );
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createPaperClipToolNode( count, tandem ) {
      return this.createHouseholdItemToolNode(
        Resistor.ResistorType.PAPER_CLIP,
        MIN_RESISTANCE,
        CCKCConstants.PAPER_CLIP_LENGTH,
        paperClipString,
        count,
        tandem.createTandem( 'paperClip' ),
        tandem.createTandem( 'paperClipIcon' ),
        this.circuit.paperClipGroupTandem
      );
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createCoinToolNode( count, tandem ) {
      return this.createHouseholdItemToolNode(
        Resistor.ResistorType.COIN,
        MIN_RESISTANCE,
        CCKCConstants.COIN_LENGTH,
        coinString,
        count,
        tandem.createTandem( 'coin' ),
        tandem.createTandem( 'coinIcon' ),
        this.circuit.coinGroupTandem
      );
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createEraserToolNode( count, tandem ) {
      return this.createHouseholdItemToolNode(
        Resistor.ResistorType.ERASER,
        HIGH_RESISTANCE,
        CCKCConstants.ERASER_LENGTH,
        eraserString,
        count,
        tandem.createTandem( 'eraser' ),
        tandem.createTandem( 'eraserIcon' ),
        this.circuit.eraserGroupTandem
      );
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createPencilToolNode( count, tandem ) {
      return this.createHouseholdItemToolNode(
        Resistor.ResistorType.PENCIL,
        25,
        CCKCConstants.PENCIL_LENGTH,
        pencilString,
        count,
        tandem.createTandem( 'pencil' ),
        tandem.createTandem( 'pencilIcon' ),
        this.circuit.pencilGroupTandem
      );
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createHandToolNode( count, tandem ) {
      return this.createHouseholdItemToolNode(
        Resistor.ResistorType.HAND,
        Math.pow( 10, 6 ),
        CCKCConstants.HAND_LENGTH,
        handString,
        count,
        tandem.createTandem( 'hand' ),
        tandem.createTandem( 'handIcon' ),
        this.circuit.handGroupTandem
      );
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createDogToolNode( count, tandem ) {
      return this.createHouseholdItemToolNode(
        Resistor.ResistorType.DOG,
        HIGH_RESISTANCE,
        CCKCConstants.DOG_LENGTH,
        dogString,
        count,
        tandem.createTandem( 'dog' ),
        tandem.createTandem( 'dogIcon' ),
        this.circuit.dogGroupTandem
      );
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createHighVoltageBatteryToolNode( count, tandem ) {
      return this.createCircuitElementToolNode(
        batteryString,
        count,
        new BatteryNode( null, null,
          new Battery(
            new Vertex( Vector2.ZERO ),
            new Vertex( new Vector2( CCKCConstants.BATTERY_LENGTH, 0 ) ),
            new Property( 0 ),
            Battery.BatteryType.HIGH_VOLTAGE,
            tandem.createTandem( 'highVoltageIconBattery' )
          ), this.viewTypeProperty, tandem.createTandem( 'highVoltageBatteryIcon' ), { isIcon: true } ),
        circuitElement => circuitElement instanceof Battery &&

                          circuitElement.initialOrientation === 'right' &&
                          circuitElement.batteryType === Battery.BatteryType.HIGH_VOLTAGE, position => {
          const vertexPair = this.createVertexPair( position, BATTERY_LENGTH );
          return new Battery(
            vertexPair.startVertex,
            vertexPair.endVertex,
            this.circuit.batteryResistanceProperty,
            Battery.BatteryType.HIGH_VOLTAGE,
            this.circuit.rightBatteryTandemGroup.createNextTandem(), {
              voltage: 10000,
              editableRange: new Range( 100, 100000 ),
              editorDelta: CCKCConstants.HIGH_EDITOR_DELTA
            } );
        } );
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createHighResistanceBulbToolNode( count, tandem ) {
      return this.createCircuitElementToolNode(
        lightBulbString,
        count,
        new CCKCLightBulbNode(
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
        circuitElement => circuitElement instanceof LightBulb && circuitElement.highResistance,
        position => LightBulb.createAtPosition( position, this.circuit.vertexGroupTandem,
          CCKCConstants.HIGH_RESISTANCE, this.viewTypeProperty,
          this.circuit.lightBulbGroupTandem.createNextTandem(), {
            highResistance: true,
            editableRange: CCKCConstants.HIGH_RESISTANCE_RANGE,
            editorDelta: CCKCConstants.HIGH_EDITOR_DELTA
          } ) );
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createHighResistanceResistorToolNode( count, tandem ) {
      return this.createCircuitElementToolNode(
        resistorString,
        count,
        new ResistorNode( null, null,
          new Resistor(
            new Vertex( Vector2.ZERO ),
            new Vertex( new Vector2( CCKCConstants.RESISTOR_LENGTH, 0 ) ),
            tandem.createTandem( 'highResistanceResistor' ), {
              resistorType: Resistor.ResistorType.HIGH_RESISTANCE_RESISTOR, resistance: 1000
            } ),
          this.viewTypeProperty,
          tandem.createTandem( 'highResistanceResistorIcon' ), {
            isIcon: true
          } ),
        circuitElement => circuitElement instanceof Resistor && circuitElement.resistorType === Resistor.ResistorType.HIGH_RESISTANCE_RESISTOR,
        position => {
          const vertexPair = this.createVertexPair( position, RESISTOR_LENGTH );
          return new Resistor(
            vertexPair.startVertex,
            vertexPair.endVertex,
            this.circuit.resistorGroupTandem.createNextTandem(), {
              resistorType: Resistor.ResistorType.HIGH_RESISTANCE_RESISTOR,
              resistance: CCKCConstants.HIGH_RESISTANCE,
              editableRange: CCKCConstants.HIGH_RESISTANCE_RANGE,
              editorDelta: CCKCConstants.HIGH_EDITOR_DELTA
            } );
        }
      );
    }
  }

  return circuitConstructionKitCommon.register( 'CircuitElementToolFactory', CircuitElementToolFactory );
} );