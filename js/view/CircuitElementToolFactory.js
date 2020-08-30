// Copyright 2017-2020, University of Colorado Boulder

/**
 * Creates CircuitElementToolNodes that can be used to create CircuitElements from the toolbox.  Exists for the life of
 * the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Vector2 from '../../../dot/js/Vector2.js';
import merge from '../../../phet-core/js/merge.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Line from '../../../scenery/js/nodes/Line.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Color from '../../../scenery/js/util/Color.js';
import Tandem from '../../../tandem/js/Tandem.js';
import wireIconImage from '../../images/wire-icon_png.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import ACVoltage from '../model/ACVoltage.js';
import Battery from '../model/Battery.js';
import Capacitor from '../model/Capacitor.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import Fuse from '../model/Fuse.js';
import Inductor from '../model/Inductor.js';
import LightBulb from '../model/LightBulb.js';
import Resistor from '../model/Resistor.js';
import Switch from '../model/Switch.js';
import Vertex from '../model/Vertex.js';
import Wire from '../model/Wire.js';
import ACVoltageNode from './ACVoltageNode.js';
import BatteryNode from './BatteryNode.js';
import CapacitorCircuitElementNode from './CapacitorCircuitElementNode.js';
import CCKCLightBulbNode from './CCKCLightBulbNode.js';
import CircuitElementToolNode from './CircuitElementToolNode.js';
import FuseNode from './FuseNode.js';
import InductorNode from './InductorNode.js';
import ResistorNode from './ResistorNode.js';
import SwitchNode from './SwitchNode.js';

const acSourceString = circuitConstructionKitCommonStrings.acSource;
const batteryString = circuitConstructionKitCommonStrings.battery;
const coinString = circuitConstructionKitCommonStrings.coin;
const dogString = circuitConstructionKitCommonStrings.dog;
const dollarBillString = circuitConstructionKitCommonStrings.dollarBill;
const eraserString = circuitConstructionKitCommonStrings.eraser;
const fuseString = circuitConstructionKitCommonStrings.fuse;
const handString = circuitConstructionKitCommonStrings.hand;
const lightBulbString = circuitConstructionKitCommonStrings.lightBulb;
const paperClipString = circuitConstructionKitCommonStrings.paperClip;
const pencilString = circuitConstructionKitCommonStrings.pencil;
const resistorString = circuitConstructionKitCommonStrings.resistor;
const switchString = circuitConstructionKitCommonStrings.switch;
const wireString = circuitConstructionKitCommonStrings.wire;


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
      this.circuit.circuitElements.filter( circuitElement =>

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
   * @param {function} createElement - (Vector2) => CircuitElement Function that creates a CircuitElement at the given position
   *                                 - for most components it is the center of the component.  For Light Bulbs, it is
   *                                 - in the center of the socket
   * @param {Object} [options]
   * @returns {CircuitElementToolNode}
   * @private
   */
  createCircuitElementToolNode( labelString, count, icon, predicate, createElement, options ) {
    options = merge( {
      iconScale: 1.0,
      limitingMaxDimension: Math.max( icon.width, icon.height ),
      tandem: Tandem.REQUIRED
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
      createElement, {
        tandem: options.tandem
      }
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
      position => this.circuit.wireGroup.createNextElement( ...this.circuit.createVertexPairArray( position, WIRE_LENGTH ) ), {
        tandem: tandem
      } );
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
      position => this.circuit.batteryGroup.createNextElement( ...this.circuit.createVertexPairArray( position, BATTERY_LENGTH ) ), {
        tandem: tandem
      } );
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
      position => this.circuit.acVoltageGroup.createNextElement( ...this.circuit.createVertexPairArray( position, AC_VOLTAGE_LENGTH ) ), {
        tandem: tandem,
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
    const vertexPair = LightBulb.createVertexPair( Vector2.ZERO, this.circuit, true );
    const lightBulbModel = LightBulb.createAtPosition(
      vertexPair.startVertex,
      vertexPair.endVertex,
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
        return this.circuit.lightBulbGroup.createNextElement( vertexPair.startVertex, vertexPair.endVertex,
          CCKCConstants.DEFAULT_RESISTANCE );
      }, {
        iconScale: 0.85,
        tandem: tandem
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
        return this.circuit.resistorGroup.createNextElement( vertices[ 0 ], vertices[ 1 ], resistorType );
      }, {
        tandem: tandem
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
      position => this.circuit.fuseGroup.createNextElement( ...this.circuit.createVertexPairArray( position, FUSE_LENGTH ) ), {
        tandem: tandem
      }
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
      position => this.circuit.capacitorGroup.createNextElement( ...this.circuit.createVertexPairArray( position, CCKCConstants.CAPACITOR_LENGTH ) ), {

        // Capacitor is tall, so to make sure the icon has the same width as other components, we need to specify the
        // scaling is based on width
        limitingMaxDimension: icon.width,
        tandem: tandem
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
      position => this.circuit.inductorGroup.createNextElement( ...this.circuit.createVertexPairArray( position, CCKCConstants.INDUCTOR_LENGTH ) ), {
        tandem: tandem
      } );
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
      position => this.circuit.switchGroup.createNextElement( ...this.circuit.createVertexPairArray( position, SWITCH_LENGTH ) ), {
        tandem: tandem
      } );
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

  // @public - Same docs as for createPaperClipToolNode
  createCoinToolNode( count, tandem ) {
    return this.createResistorToolNode( count, Resistor.ResistorType.COIN, tandem.createTandem( 'coinIcon' ), coinString );
  }

  // @public - Same docs as as for createPaperClipToolNode
  createDollarBillToolNode( count, tandem ) {
    return this.createResistorToolNode( count, Resistor.ResistorType.DOLLAR_BILL, tandem.createTandem( 'dollarBillIcon' ), dollarBillString );
  }

  // @public - Same docs as for createPaperClipToolNode
  createEraserToolNode( count, tandem ) {
    return this.createResistorToolNode( count, Resistor.ResistorType.ERASER, tandem.createTandem( 'eraserIcon' ), eraserString );
  }

  // @public - Same docs as for createPaperClipToolNode
  createPencilToolNode( count, tandem ) {
    return this.createResistorToolNode( count, Resistor.ResistorType.PENCIL, tandem.createTandem( 'pencilIcon' ), pencilString );
  }

  // @public - Same docs as for createPaperClipToolNode
  createHandToolNode( count, tandem ) {
    return this.createResistorToolNode( count, Resistor.ResistorType.HAND, tandem.createTandem( 'handIcon' ), handString );
  }

  // @public - Same docs as for createPaperClipToolNode
  createDogToolNode( count, tandem ) {
    return this.createResistorToolNode( count, Resistor.ResistorType.DOG, tandem.createTandem( 'dogIcon' ), dogString );
  }

  // @public - Same docs as for createPaperClipToolNode
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
        return this.circuit.highVoltageBatteryGroup.createNextElement( ...this.circuit.createVertexPairArray( position, SWITCH_LENGTH ) );
      }, {
        tandem: tandem
      } );
  }

  /**
   * @param {number} count - the number that can be dragged out at once
   * @param {Tandem} tandem
   * @returns {CircuitElementToolNode}
   * @public
   */
  createHighResistanceBulbToolNode( count, tandem ) {
    const vertexPair = LightBulb.createVertexPair( Vector2.ZERO, this.circuit, true );
    return this.createCircuitElementToolNode(
      lightBulbString,
      count,
      new CCKCLightBulbNode(
        null,
        null,
        LightBulb.createAtPosition(
          vertexPair.startVertex,
          vertexPair.endVertex,
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
      position => {
        const vertexPair = LightBulb.createVertexPair( position, this.circuit, false );
        return this.circuit.highResistanceLightBulbGroup.createNextElement( vertexPair.startVertex, vertexPair.endVertex );
      }, {
        tandem: tandem
      } );
  }
}

circuitConstructionKitCommon.register( 'CircuitElementToolFactory', CircuitElementToolFactory );
export default CircuitElementToolFactory;
