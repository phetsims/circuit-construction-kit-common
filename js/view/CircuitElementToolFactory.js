// Copyright 2017-2020, University of Colorado Boulder

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
  const CapacitorCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CapacitorCircuitElementNode' );
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
  const InductorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/InductorNode' );
  const LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  const Line = require( 'SCENERY/nodes/Line' );
  const merge = require( 'PHET_CORE/merge' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Property = require( 'AXON/Property' );
  const Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  const ResistorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ResistorNode' );
  const Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  const SwitchNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SwitchNode' );
  const Tandem = require( 'TANDEM/Tandem' );
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
  const FUSE_LENGTH = CCKCConstants.FUSE_LENGTH;
  const WIRE_LENGTH = CCKCConstants.WIRE_LENGTH;
  const SWITCH_LENGTH = CCKCConstants.SWITCH_LENGTH;

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
     * Utility function that creates a CircuitElementToolNode
     * @param {string} labelString
     * @param {number} count
     * @param {Node} icon
     * @param {function} predicate - CircuitElement => boolean, used to count circuit elements of that kind
     * @param {function} createElement - (Vector2) => CircuitElement Function that creates a CircuitElement at the given location
     *                                 - for most components it is the center of the component.  For Light Bulbs, it is
     *                                 - in the center of the socket
     * @param {Object} [options]
     * @returns {CircuitElementToolNode}
     * @private
     */
    createCircuitElementToolNode( labelString, count, icon, predicate, createElement, options ) {
      options = merge( {
        iconScale: 1.0,
        limitingMaxDimension: Math.max( icon.width, icon.height )
      }, options );
      icon.mutate( { scale: options.iconScale * TOOLBOX_ICON_SIZE / options.limitingMaxDimension } );
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
        position => this.circuit.wireGroup.createNextMember( ...this.circuit.createVertexPairArray( position, WIRE_LENGTH ) ) );
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createRightBatteryToolNode( count, tandem ) {
      const batteryModel = new Battery(
        new Vertex( Vector2.ZERO ), new Vertex( new Vector2( CCKCConstants.BATTERY_LENGTH, 0 ) ),
        new Property( 0 ), Battery.BatteryType.NORMAL, Tandem.OPTIONAL
      );
      return this.createCircuitElementToolNode( batteryString, count,
        new BatteryNode( null, null, batteryModel, this.viewTypeProperty, tandem.createTandem( 'rightBatteryIcon' ), { isIcon: true } ),
        circuitElement => circuitElement instanceof Battery &&
                          circuitElement.initialOrientation === 'right' &&
                          circuitElement.batteryType === Battery.BatteryType.NORMAL,
        position => this.circuit.batteryGroup.createNextMember( ...this.circuit.createVertexPairArray( position, BATTERY_LENGTH ) ) );
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createACVoltageToolNode( count, tandem ) {
      const acSource = new ACVoltage(
        new Vertex( Vector2.ZERO ),
        new Vertex( new Vector2( AC_VOLTAGE_LENGTH, 0 ) ),
        new Property( 0 ),
        Tandem.OPTIONAL
      );
      return this.createCircuitElementToolNode( acSourceString, count,
        new ACVoltageNode( null, null, acSource, this.viewTypeProperty, tandem.createTandem( 'acSourceIcon' ), { isIcon: true } ),
        circuitElement => circuitElement instanceof ACVoltage,
        position => this.circuit.acVoltageGroup.createNextMember( ...this.circuit.createVertexPairArray( position, AC_VOLTAGE_LENGTH ) ), {
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
        new Vector2( 0, 0 ),
        this.circuit,
        CCKCConstants.DEFAULT_RESISTANCE,
        this.viewTypeProperty,
        Tandem.OPTIONAL, {
          highResistance: false,
          icon: true
        } );
      return this.createCircuitElementToolNode( lightBulbString, count,
        new CCKCLightBulbNode( null, null,
          lightBulbModel,
          new Property( true ), this.viewTypeProperty, tandem.createTandem( 'lightBulbIcon' ), { isIcon: true } ),
        circuitElement => circuitElement instanceof LightBulb && !circuitElement.highResistance,
        position => {
          const vertexPair = LightBulb.createVertexPair( position, this.circuit );
          return this.circuit.lightBulbGroup.createNextMember( vertexPair.startVertex, vertexPair.endVertex,
            CCKCConstants.DEFAULT_RESISTANCE );
        }, {
          iconScale: 0.85
        } );
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Resistor.ResistorType} resistorType
     * @param {Tandem} tandem
     * @param {string} [labelString]
     * @returns {CircuitElementToolNode}
     * @public
     */
    createResistorToolNode( count, resistorType, tandem, labelString = resistorString ) {

      // Create the icon model without using the PhetioGroup, so it will not be PhET-iO instrumented.
      const resistorModel = new Resistor(
        new Vertex( Vector2.ZERO ),
        new Vertex( new Vector2( resistorType.length, 0 ) ),
        resistorType,
        Tandem.OPTIONAL
      );

      return this.createCircuitElementToolNode(
        labelString,
        count,
        new ResistorNode( null, null, resistorModel, this.viewTypeProperty, tandem.createTandem( 'resistorIcon' ), {
          isIcon: true
        } ),
        circuitElement => circuitElement instanceof Resistor && circuitElement.resistorType === resistorType,
        position => {
          const vertices = this.circuit.createVertexPairArray( position, resistorType.length );
          return this.circuit.resistorGroup.createNextMember( vertices[ 0 ], vertices[ 1 ], resistorType );
        } );
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
        Tandem.OPTIONAL
      );
      return this.createCircuitElementToolNode( fuseString, count,
        new FuseNode( null, null, fuseModel, this.viewTypeProperty, tandem.createTandem( 'resistorIcon' ), {
          isIcon: true
        } ),
        circuitElement => circuitElement instanceof Fuse,
        position => this.circuit.fuseGroup.createNextMember( ...this.circuit.createVertexPairArray( position, FUSE_LENGTH ) )
      );
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
        Tandem.OPTIONAL
      );
      const icon = new CapacitorCircuitElementNode( null, null, capacitorModel, this.viewTypeProperty, tandem.createTandem( 'resistorIcon' ), {
        isIcon: true
      } );
      return this.createCircuitElementToolNode( 'CAPACITOR', count,
        icon,
        circuitElement => circuitElement instanceof Capacitor,
        position => this.circuit.capacitorGroup.createNextMember( ...this.circuit.createVertexPairArray( position, CCKCConstants.CAPACITOR_LENGTH ) ), {

          // Capacitor is tall, so to make sure the icon has the same width as other components, we need to specify the
          // scaling is based on width
          limitingMaxDimension: icon.width
        } );
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
        Tandem.OPTIONAL
      );
      return this.createCircuitElementToolNode( 'INDUCTOR', count,
        new InductorNode( null, null, inductorModel, this.viewTypeProperty, tandem.createTandem( 'resistorIcon' ), {
          isIcon: true
        } ),
        circuitElement => circuitElement instanceof Inductor,
        position => this.circuit.inductorGroup.createNextMember( ...this.circuit.createVertexPairArray( position, CCKCConstants.INDUCTOR_LENGTH ) ) );
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createSwitchToolNode( count, tandem ) {
      return this.createCircuitElementToolNode( switchString, count,
        new SwitchNode( null, null,
          new Switch(
            new Vertex( Vector2.ZERO ),
            new Vertex( new Vector2( SWITCH_LENGTH, 0 ) ),
            Tandem.OPTIONAL
          ), this.viewTypeProperty, tandem.createTandem( 'switchIcon' ), {
            isIcon: true
          } ),
        circuitElement => circuitElement instanceof Switch,
        position => this.circuit.switchGroup.createNextMember( ...this.circuit.createVertexPairArray( position, SWITCH_LENGTH ) ) );
    }

    /**
     * @param {number} count - the number that can be dragged out at once
     * @param {Tandem} tandem
     * @returns {CircuitElementToolNode}
     * @public
     */
    createPaperClipToolNode( count, tandem ) {
      return this.createResistorToolNode( count, Resistor.ResistorType.PAPER_CLIP, tandem.createTandem( 'paperClipIcon' ), paperClipString );
    }

    // Same docs as for createPaperClipToolNode
    createCoinToolNode( count, tandem ) {
      return this.createResistorToolNode( count, Resistor.ResistorType.COIN, tandem.createTandem( 'coinIcon' ), coinString );
    }

    // Same docs as for createPaperClipToolNode
    createDollarBillToolNode( count, tandem ) {
      return this.createResistorToolNode( count, Resistor.ResistorType.DOLLAR_BILL, tandem.createTandem( 'dollarBillIcon' ), dollarBillString );
    }

    // Same docs as for createPaperClipToolNode
    createEraserToolNode( count, tandem ) {
      return this.createResistorToolNode( count, Resistor.ResistorType.ERASER, tandem.createTandem( 'eraserIcon' ), eraserString );
    }

    // Same docs as for createPaperClipToolNode
    createPencilToolNode( count, tandem ) {
      return this.createResistorToolNode( count, Resistor.ResistorType.PENCIL, tandem.createTandem( 'pencilIcon' ), pencilString );
    }

    // Same docs as for createPaperClipToolNode
    createHandToolNode( count, tandem ) {
      return this.createResistorToolNode( count, Resistor.ResistorType.HAND, tandem.createTandem( 'handIcon' ), handString );
    }

    // Same docs as for createPaperClipToolNode
    createDogToolNode( count, tandem ) {
      return this.createResistorToolNode( count, Resistor.ResistorType.DOG, tandem.createTandem( 'dogIcon' ), dogString );
    }

    // Same docs as for createPaperClipToolNode
    createHighResistanceResistorToolNode( count, tandem ) {
      return this.createResistorToolNode( count, Resistor.ResistorType.HIGH_RESISTANCE_RESISTOR, tandem.createTandem( 'highResistanceResistorIcon' ), resistorString );
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
            Tandem.OPTIONAL, {
              voltage: 1000
            }
          ), this.viewTypeProperty, tandem.createTandem( 'highVoltageBatteryIcon' ), { isIcon: true } ),
        circuitElement => circuitElement instanceof Battery &&

                          circuitElement.initialOrientation === 'right' &&
                          circuitElement.batteryType === Battery.BatteryType.HIGH_VOLTAGE, position => {
          return this.circuit.highVoltageBatteryGroup.createNextMember( ...this.circuit.createVertexPairArray( position, SWITCH_LENGTH ) );
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
            this.circuit,
            1000,
            this.viewTypeProperty,
            Tandem.OPTIONAL, {
              highResistance: true,
              icon: true
            } ),
          new Property( true ),
          this.viewTypeProperty,
          tandem.createTandem( 'highResistanceLightBulbIcon' ), {
            isIcon: true
          } ),
        circuitElement => circuitElement instanceof LightBulb && circuitElement.highResistance,
        position => LightBulb.createAtPosition( position, this.circuit,
          CCKCConstants.HIGH_RESISTANCE, this.viewTypeProperty,
          Tandem.OPTIONAL, {
            highResistance: true,
            editableRange: CCKCConstants.HIGH_RESISTANCE_RANGE
          } ) );
    }
  }

  return circuitConstructionKitCommon.register( 'CircuitElementToolFactory', CircuitElementToolFactory );
} );