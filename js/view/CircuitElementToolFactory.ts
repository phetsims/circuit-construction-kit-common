// Copyright 2017-2021, University of Colorado Boulder

/**
 * Creates CircuitElementToolNodes that can be used to create CircuitElements from the toolbox.  Exists for the life of
 * the sim and hence does not require disposal.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import { Node } from '../../../scenery/js/imports.js';
import Vector2 from '../../../dot/js/Vector2.js';
import merge from '../../../phet-core/js/merge.js';
import { AlignGroup } from '../../../scenery/js/imports.js';
import { Image } from '../../../scenery/js/imports.js';
import { Line } from '../../../scenery/js/imports.js';
import { Color } from '../../../scenery/js/imports.js';
import ToggleNode from '../../../sun/js/ToggleNode.js';
import Tandem from '../../../tandem/js/Tandem.js';
import wireIcon_png from '../../images/wireIcon_png.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import ACVoltage from '../model/ACVoltage.js';
import Battery from '../model/Battery.js';
import Capacitor from '../model/Capacitor.js';
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
import Circuit from '../model/Circuit.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import CircuitElement from '../model/CircuitElement.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import ResistorType from '../model/ResistorType.js';
import RichEnumerationProperty from '../../../axon/js/RichEnumerationProperty.js';

const acSourceString = circuitConstructionKitCommonStrings.acSource;
const capacitorString = circuitConstructionKitCommonStrings.capacitor;
const inductorString = circuitConstructionKitCommonStrings.inductor;
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
const FUSE_LENGTH = CCKCConstants.FUSE_LENGTH;
const WIRE_LENGTH = CCKCConstants.WIRE_LENGTH;
const SWITCH_LENGTH = CCKCConstants.SWITCH_LENGTH;

// Separate icons are made for schematic/lifelike so they can be aligned
const iconAlignGroup = new AlignGroup();
const LIFELIKE_PROPERTY = new RichEnumerationProperty( CircuitElementViewType, CircuitElementViewType.LIFELIKE );
const SCHEMATIC_PROPERTY = new RichEnumerationProperty( CircuitElementViewType, CircuitElementViewType.SCHEMATIC );

class CircuitElementToolFactory {
  private readonly circuit: Circuit;
  private readonly showLabelsProperty: Property<boolean>;
  private readonly viewTypeProperty: Property<CircuitElementViewType>;
  private readonly globalToCircuitLayerNodePoint: ( v: Vector2 ) => Vector2;
  private readonly parentTandem: Tandem;
  private wireToolNode: CircuitElementToolNode | null;

  /**
   * @param {Circuit} circuit
   * @param {Property.<boolean>} showLabelsProperty
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {function} globalToCircuitLayerNodePoint Vector2=>Vector2 global point to coordinate frame of circuitLayerNode
   * @param {Tandem} parentTandem - parent tandem for the created tool nodes
   */
  constructor( circuit: Circuit, showLabelsProperty: Property<boolean>, viewTypeProperty: Property<CircuitElementViewType>, globalToCircuitLayerNodePoint: ( v: Vector2 ) => Vector2, parentTandem: Tandem ) {
    // @public
    this.circuit = circuit;
    this.showLabelsProperty = showLabelsProperty;
    this.viewTypeProperty = viewTypeProperty;
    this.globalToCircuitLayerNodePoint = globalToCircuitLayerNodePoint;

    // @private
    this.parentTandem = parentTandem;

    this.wireToolNode = null;
  }

  /**
   * Returns a function which counts the number of circuit elements (not counting those in the true black box).
   * @param {function} predicate - CircuitElement => boolean
   * @returns {function} a no-arg function that returns the {number} of CircuitElements of the specified type
   * @private
   */
  createCounter( predicate: ( c: CircuitElement ) => boolean ) {
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
   * @param {function(Tandem,Property.<CircuitElementViewType>):Node} createIcon
   * @param {function} predicate - CircuitElement => boolean, used to count circuit elements of that kind.
   *                             - NOTE: All of the predicates are intended to cover all circuit elements and be
   *                             - mutually exclusive (so there is no double counting).  However, this is not enforced.
   * @param {function} createElement - (Vector2) => CircuitElement Function that creates a CircuitElement at the given position
   *                                 - for most components it is the center of the component.  For Light Bulbs, it is
   *                                 - in the center of the socket
   * @param {Object} [providedOptions]
   * @returns {CircuitElementToolNode}
   * @private
   */
  createCircuitElementToolNode( labelString: string, count: number, createIcon: ( t: Tandem, p: Property<CircuitElementViewType> ) => Node,
                                predicate: ( circuitElement: CircuitElement ) => boolean, createElement: any, providedOptions?: any ) {

    assert && assert( Number.isInteger( count ), 'count should be an integer' );

    providedOptions = merge( {
      tandem: Tandem.REQUIRED,
      additionalProperty: new BooleanProperty( true ),
      lifelikeIconHeight: CCKCConstants.TOOLBOX_ICON_HEIGHT,
      schematicIconHeight: CCKCConstants.TOOLBOX_ICON_HEIGHT
    }, providedOptions );

    const wrap = ( node: Node, height: number ) => {
      const node1 = new Node( {
        children: [ node ]
      } );
      node1.mutate( { scale: height / node1.height } );
      return node1;
    };

    const lifelikeIcon = wrap( createIcon( providedOptions.tandem.createTandem( 'lifelikeIcon' ), LIFELIKE_PROPERTY ), providedOptions.lifelikeIconHeight );
    const schematicIcon = wrap( createIcon( providedOptions.tandem.createTandem( 'schematicIcon' ), SCHEMATIC_PROPERTY ), providedOptions.schematicIconHeight );

    const toggleNode = new ToggleNode( this.viewTypeProperty, [
      { value: CircuitElementViewType.LIFELIKE, node: lifelikeIcon },
      { value: CircuitElementViewType.SCHEMATIC, node: schematicIcon }
    ] );

    this.viewTypeProperty.link( viewType => {
      lifelikeIcon.visible = viewType === CircuitElementViewType.LIFELIKE;
      schematicIcon.visible = viewType === CircuitElementViewType.SCHEMATIC;
    } );

    return new CircuitElementToolNode(
      labelString,
      this.showLabelsProperty,
      this.viewTypeProperty,
      this.circuit,
      this.globalToCircuitLayerNodePoint,
      iconAlignGroup.createBox( toggleNode, { yAlign: 'bottom' } ),
      count,
      this.createCounter( predicate ),
      createElement, {
        tandem: providedOptions.tandem,
        additionalProperty: providedOptions.additionalProperty
      }
    );
  }

  /**
   * @returns {CircuitElementToolNode}
   * @public
   */
  createWireToolNode() {
    if ( !this.wireToolNode ) {

      // Cache a single instance to simplify PhET-iO
      this.wireToolNode = this.createCircuitElementToolNode( wireString, CCKCConstants.NUMBER_OF_WIRES,
        ( tandem: Tandem, viewTypeProperty: Property<CircuitElementViewType> ) => {
          return viewTypeProperty.value === CircuitElementViewType.LIFELIKE ? ( new Image( wireIcon_png, {
            tandem: tandem
          } ) ) : new Line( 0, 0, 120, 0, {
            stroke: Color.BLACK,
            lineWidth: 4.5, // match with other toolbox icons
            tandem: tandem
          } );
        },
        circuitElement => circuitElement instanceof Wire,
        ( position: Vector2 ) => this.circuit.wireGroup.createNextElement( ...this.circuit.createVertexPairArray( position, WIRE_LENGTH ) ), {
          tandem: this.parentTandem.createTandem( 'wireToolNode' ),
          lifelikeIconHeight: 9,
          schematicIconHeight: 2
        } );
    }

    return new Node( { children: [ this.wireToolNode ] } );
  }

  /**
   * @param {number} count - the number that can be dragged out at once
   * @returns {CircuitElementToolNode}
   * @public
   */
  createRightBatteryToolNode( count = 10 ) {
    const batteryModel = new Battery(
      new Vertex( Vector2.ZERO ), new Vertex( new Vector2( CCKCConstants.BATTERY_LENGTH, 0 ) ),
      new NumberProperty( 0 ), 'normal', Tandem.OPTIONAL
    );
    return this.createCircuitElementToolNode( batteryString, count,
      ( tandem, viewTypeProperty ) => new BatteryNode( null, null, batteryModel, viewTypeProperty, tandem.createTandem( 'rightBatteryIcon' ), { isIcon: true } ),
      //TODO: https://github.com/phetsims/circuit-construction-kit-common/issues/703: Would we be able to specify an enumeration in the model elements that specifies which tool it corresponds to, instead of using predicates?
      circuitElement => circuitElement instanceof Battery &&
                        circuitElement.initialOrientation === 'right' &&
                        circuitElement.batteryType === 'normal',
      ( position: Vector2 ) => this.circuit.batteryGroup.createNextElement( ...this.circuit.createVertexPairArray( position, BATTERY_LENGTH ) ), {
        tandem: this.parentTandem.createTandem( 'rightBatteryToolNode' ),
        lifelikeIconHeight: 15
      } );
  }

  /**
   * @param {number} count - the number that can be dragged out at once
   * @returns {CircuitElementToolNode}
   * @public
   */
  createACVoltageToolNode( count = 10 ) {
    const acSource = new ACVoltage(
      new Vertex( Vector2.ZERO ),
      new Vertex( new Vector2( AC_VOLTAGE_LENGTH, 0 ) ),
      new NumberProperty( 0 ),
      Tandem.OPTIONAL
    );
    return this.createCircuitElementToolNode( acSourceString, count,
      ( tandem, viewTypeProperty ) => new ACVoltageNode( null, null, acSource, viewTypeProperty, tandem.createTandem( 'acSourceIcon' ), {
        isIcon: true,
        scale: 0.68
      } ),
      circuitElement => circuitElement instanceof ACVoltage,
      ( position: Vector2 ) => this.circuit.acVoltageGroup.createNextElement( ...this.circuit.createVertexPairArray( position, AC_VOLTAGE_LENGTH ) ), {
        tandem: this.parentTandem.createTandem( 'acVoltageToolNode' ),
        lifelikeIconHeight: 27,
        schematicIconHeight: 27
      }
    );
  }

  /**
   * @param {PhetioGroup} lightBulbGroup
   * @param {string} string
   * @param {boolean} real
   * @param {Property.<boolean>} addRealBulbsProperty
   * @param {string} tandemName
   * @returns {CircuitElementToolNode}
   * @public
   */
  createLightBulbToolNode( lightBulbGroup = this.circuit.lightBulbGroup, string = lightBulbString, real = false, addRealBulbsProperty = null, tandemName = 'lightBulbToolNode' ) {
    const vertexPair = LightBulb.createVertexPair( Vector2.ZERO, this.circuit, true );
    const lightBulbModel = LightBulb.createAtPosition(
      vertexPair.startVertex,
      vertexPair.endVertex,
      this.circuit,
      CCKCConstants.DEFAULT_RESISTANCE,
      this.viewTypeProperty,
      Tandem.OPTIONAL, {
        highResistance: false,
        icon: true,
        real: real
      } );
    return this.createCircuitElementToolNode( string, 10,
      ( tandem, viewTypeProperty ) => new CCKCLightBulbNode( null, null,
        lightBulbModel,
        new BooleanProperty( true ), viewTypeProperty, Tandem.OPT_OUT, { isIcon: true, scale: 0.85 } ),
      circuitElement => circuitElement instanceof LightBulb && !circuitElement.highResistance,
      ( position: Vector2 ) => {
        const vertexPair = LightBulb.createVertexPair( position, this.circuit );
        return lightBulbGroup.createNextElement( vertexPair.startVertex, vertexPair.endVertex, CCKCConstants.DEFAULT_RESISTANCE );
      }, {
        tandem: this.parentTandem.createTandem( tandemName ),
        additionalProperty: addRealBulbsProperty || new BooleanProperty( true ),
        schematicIconHeight: 27
      } );
  }

  /**
   * @param {Object} [providedOptions]
   * @returns {CircuitElementToolNode}
   * @public
   */
  createResistorToolNode( providedOptions?: any ) {
    providedOptions = merge( {
      count: 10,
      resistorType: ResistorType.RESISTOR,
      lifelikeIconHeight: 15,
      schematicIconHeight: 14,
      labelString: resistorString,
      tandemName: 'resistorToolNode'
    }, providedOptions );
    const labelString = providedOptions.labelString;
    const resistorType = providedOptions.resistorType;

    // Create the icon model without using the PhetioGroup, so it will not be PhET-iO instrumented.
    const resistorModel = new Resistor(
      new Vertex( Vector2.ZERO ),
      new Vertex( new Vector2( resistorType.length, 0 ) ),
      resistorType,
      Tandem.OPTIONAL
    );

    return this.createCircuitElementToolNode( labelString, providedOptions.count,
      ( tandem, viewTypeProperty ) => new ResistorNode( null, null, resistorModel, viewTypeProperty, tandem.createTandem( 'resistorIcon' ), {
        isIcon: true
      } ),
      circuitElement => circuitElement instanceof Resistor && circuitElement.resistorType === resistorType,
      ( position: Vector2 ) => {
        const vertices = this.circuit.createVertexPairArray( position, resistorType.length );
        return this.circuit.resistorGroup.createNextElement( vertices[ 0 ], vertices[ 1 ], resistorType );
      }, {
        tandem: this.parentTandem.createTandem( providedOptions.tandemName ),
        lifelikeIconHeight: providedOptions.lifelikeIconHeight,
        schematicIconHeight: providedOptions.schematicIconHeight
      } );
  }

  /**
   * @returns {CircuitElementToolNode}
   * @public
   */
  createFuseToolNode() {
    const fuseModel = new Fuse(
      new Vertex( Vector2.ZERO ),
      new Vertex( new Vector2( CCKCConstants.RESISTOR_LENGTH, 0 ) ),
      Tandem.OPTIONAL
    );
    return this.createCircuitElementToolNode( fuseString, 10,
      ( tandem, viewTypeProperty ) => new FuseNode( null, null, fuseModel, viewTypeProperty, tandem.createTandem( 'fuseIcon' ), {
        isIcon: true
      } ),
      circuitElement => circuitElement instanceof Fuse,
      ( position: Vector2 ) => this.circuit.fuseGroup.createNextElement( ...this.circuit.createVertexPairArray( position, FUSE_LENGTH ) ), {
        tandem: this.parentTandem.createTandem( 'fuseToolNode' ),
        lifelikeIconHeight: 15,
        schematicIconHeight: 14
      }
    );
  }

  /**
   * @param {number} count - the number that can be dragged out at once
   * @returns {CircuitElementToolNode}
   * @public
   */
  createCapacitorToolNode( count = 10 ) {
    const capacitor = new Capacitor(
      new Vertex( Vector2.ZERO ),
      new Vertex( new Vector2( CCKCConstants.CAPACITOR_LENGTH, 0 ) ),
      Tandem.OPTIONAL
    );
    return this.createCircuitElementToolNode( capacitorString, count,
      ( tandem, viewTypeProperty ) => new CapacitorCircuitElementNode( null, null, capacitor, viewTypeProperty, tandem.createTandem( 'capacitorIcon' ), {
        isIcon: true
      } ),
      circuitElement => circuitElement instanceof Capacitor,
      ( position: Vector2 ) => this.circuit.capacitorGroup.createNextElement( ...this.circuit.createVertexPairArray( position, CCKCConstants.CAPACITOR_LENGTH ) ), {
        tandem: this.parentTandem.createTandem( 'capacitorToolNode' )
      } );
  }

  /**
   * @returns {CircuitElementToolNode}
   * @public
   */
  createInductorToolNode() {
    const inductorModel = new Inductor(
      new Vertex( Vector2.ZERO ),
      new Vertex( new Vector2( CCKCConstants.INDUCTOR_LENGTH, 0 ) ),
      Tandem.OPTIONAL
    );
    const count = CCKCQueryParameters.moreInductors ? 10 : 1;
    return this.createCircuitElementToolNode( inductorString, count,
      ( tandem, viewTypeProperty ) => new InductorNode( null, null, inductorModel, viewTypeProperty, tandem.createTandem( 'inductorIcon' ), {
        isIcon: true,
        scale: 0.75
      } ),
      circuitElement => circuitElement instanceof Inductor,
      ( position: Vector2 ) => this.circuit.inductorGroup.createNextElement( ...this.circuit.createVertexPairArray( position, CCKCConstants.INDUCTOR_LENGTH ) ), {
        tandem: this.parentTandem.createTandem( 'inductorToolNode' ),
        lifelikeIconHeight: 22,
        schematicIconHeight: 6
      } );
  }

  /**
   * @returns {CircuitElementToolNode}
   * @public
   */
  createSwitchToolNode() {
    return this.createCircuitElementToolNode( switchString, 5,
      ( tandem, viewTypeProperty ) => new SwitchNode( null, null,
        new Switch(
          new Vertex( Vector2.ZERO ),
          new Vertex( new Vector2( SWITCH_LENGTH, 0 ) ),
          Tandem.OPTIONAL
        ), viewTypeProperty, tandem.createTandem( 'switchIcon' ), {
          isIcon: true
        } ),
      circuitElement => circuitElement instanceof Switch,
      ( position: Vector2 ) => this.circuit.switchGroup.createNextElement( ...this.circuit.createVertexPairArray( position, SWITCH_LENGTH ) ), {
        tandem: this.parentTandem.createTandem( 'switchToolNode' ),
        lifelikeIconHeight: 22,
        schematicIconHeight: 16
      } );
  }

  /**
   * @returns {CircuitElementToolNode}
   * @public
   */
  createPaperClipToolNode() {
    return this.createResistorToolNode( {
      count: 1,
      resistorType: ResistorType.PAPER_CLIP,
      tandemName: 'paperClipIcon',
      labelString: paperClipString
    } );
  }

  // @public - Same docs as for createPaperClipToolNode
  createCoinToolNode() {
    return this.createResistorToolNode( {
      count: 1,
      resistorType: ResistorType.COIN,
      tandemName: 'coinIcon',
      labelString: coinString,
      lifelikeIconHeight: 30
    } );
  }

  // @public - Same docs as as for createPaperClipToolNode
  createDollarBillToolNode() {
    return this.createResistorToolNode( {
      count: 1,
      resistorType: ResistorType.DOLLAR_BILL,
      tandemName: 'dollarBillToolNode',
      labelString: dollarBillString,
      lifelikeIconHeight: 22
    } );
  }

  // @public - Same docs as for createPaperClipToolNode
  createEraserToolNode() {
    return this.createResistorToolNode( {
      count: 1,
      resistorType: ResistorType.ERASER,
      tandemName: 'eraserToolNode',
      labelString: eraserString,
      lifelikeIconHeight: 17
    } );
  }

  // @public - Same docs as for createPaperClipToolNode
  createPencilToolNode() {
    return this.createResistorToolNode( {
      count: 1,
      resistorType: ResistorType.PENCIL,
      tandemName: 'pencilToolNode',
      labelString: pencilString,
      lifelikeIconHeight: 12
    } );
  }

  // @public - Same docs as for createPaperClipToolNode
  createHandToolNode() {
    return this.createResistorToolNode( {
      count: 1,
      resistorType: ResistorType.HAND,
      tandemName: 'handToolNode',
      labelString: handString,
      lifelikeIconHeight: 30
    } );
  }

  // @public - Same docs as for createPaperClipToolNode
  createDogToolNode() {
    return this.createResistorToolNode( {
      count: 1,
      resistorType: ResistorType.DOG,
      tandemName: 'dogToolNode',
      labelString: dogString,
      lifelikeIconHeight: 30
    } );
  }

  // @public - Same docs as for createPaperClipToolNode
  createHighResistanceResistorToolNode() {
    return this.createResistorToolNode( {
      count: 4,
      resistorType: ResistorType.HIGH_RESISTANCE_RESISTOR,
      tandemName: 'highResistanceResistorToolNode',
      labelString: resistorString
    } );
  }

  /**
   * @returns {CircuitElementToolNode}
   * @public
   */
  createHighVoltageBatteryToolNode() {
    return this.createCircuitElementToolNode( batteryString, 4,
      ( tandem, viewTypeProperty ) => new BatteryNode( null, null,
        new Battery(
          new Vertex( Vector2.ZERO ),
          new Vertex( new Vector2( CCKCConstants.BATTERY_LENGTH, 0 ) ),
          new NumberProperty( 0 ),
          'high-voltage',
          Tandem.OPTIONAL, {
            voltage: 1000
          }
        ), viewTypeProperty, tandem.createTandem( 'highVoltageBatteryToolNode' ), { isIcon: true } ),
      circuitElement => circuitElement instanceof Battery &&
                        circuitElement.initialOrientation === 'right' &&
                        circuitElement.batteryType === 'high-voltage', ( position: Vector2 ) => {
        return this.circuit.highVoltageBatteryGroup.createNextElement( ...this.circuit.createVertexPairArray( position, SWITCH_LENGTH ) );
      }, {
        tandem: this.parentTandem.createTandem( 'highVoltageBatteryToolNode' ),
        lifelikeIconHeight: 15
      } );
  }

  /**
   * @returns {CircuitElementToolNode}
   * @public
   */
  createHighResistanceBulbToolNode() {
    const vertexPair = LightBulb.createVertexPair( Vector2.ZERO, this.circuit, true );
    return this.createCircuitElementToolNode( lightBulbString, 4,
      ( tandem, viewTypeProperty ) => new CCKCLightBulbNode(
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
        new BooleanProperty( true ),
        viewTypeProperty,
        tandem.createTandem( 'highResistanceLightBulbToolNode' ), {
          isIcon: true
        } ),
      circuitElement => circuitElement instanceof LightBulb && circuitElement.highResistance,
      ( position: Vector2 ) => {
        const vertexPair = LightBulb.createVertexPair( position, this.circuit, false );
        return this.circuit.highResistanceLightBulbGroup.createNextElement( vertexPair.startVertex, vertexPair.endVertex );
      }, {
        tandem: this.parentTandem.createTandem( 'highResistanceBulbToolNode' )
      } );
  }
}

circuitConstructionKitCommon.register( 'CircuitElementToolFactory', CircuitElementToolFactory );
export default CircuitElementToolFactory;
