// Copyright 2017-2026, University of Colorado Boulder

/**
 * Creates CircuitElementToolNodes that can be used to create CircuitElements from the toolbox.  Exists for the life of
 * the sim and hence does not require disposal.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import type Property from '../../../axon/js/Property.js';
import type { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import affirm from '../../../perennial-alias/js/browser-and-node/affirm.js';
import optionize from '../../../phet-core/js/optionize.js';
import type PickRequired from '../../../phet-core/js/types/PickRequired.js';
import AlignGroup from '../../../scenery/js/layout/constraints/AlignGroup.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Line from '../../../scenery/js/nodes/Line.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Color from '../../../scenery/js/util/Color.js';
import ToggleNode from '../../../sun/js/ToggleNode.js';
import type PhetioGroup from '../../../tandem/js/PhetioGroup.js';
import Tandem from '../../../tandem/js/Tandem.js';
import wireIcon_png from '../../images/wireIcon_png.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import ACVoltage from '../model/ACVoltage.js';
import Battery from '../model/Battery.js';
import Capacitor from '../model/Capacitor.js';
import type Circuit from '../model/Circuit.js';
import type CircuitElement from '../model/CircuitElement.js';
import type CircuitElementType from '../model/CircuitElementType.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import Fuse from '../model/Fuse.js';
import Inductor from '../model/Inductor.js';
import LightBulb from '../model/LightBulb.js';
import Resistor from '../model/Resistor.js';
import ResistorType from '../model/ResistorType.js';
import Switch from '../model/Switch.js';
import Vertex from '../model/Vertex.js';
import Wire from '../model/Wire.js';
import ACVoltageNode from './ACVoltageNode.js';
import BatteryNode from './BatteryNode.js';
import CapacitorCircuitElementNode from './CapacitorCircuitElementNode.js';
import CCKCLightBulbNode from './CCKCLightBulbNode.js';
import CircuitElementToolNode, { type CircuitElementToolNodeOptions } from './CircuitElementToolNode.js';
import FuseNode from './FuseNode.js';
import InductorNode from './InductorNode.js';
import ResistorNode from './ResistorNode.js';
import SwitchNode from './SwitchNode.js';

const acSourceStringProperty = CircuitConstructionKitCommonFluent.acSourceStringProperty;
const capacitorStringProperty = CircuitConstructionKitCommonFluent.capacitorStringProperty;
const inductorStringProperty = CircuitConstructionKitCommonFluent.inductorStringProperty;
const batteryStringProperty = CircuitConstructionKitCommonFluent.batteryStringProperty;
const coinStringProperty = CircuitConstructionKitCommonFluent.coinStringProperty;
const dollarBillStringProperty = CircuitConstructionKitCommonFluent.dollarBillStringProperty;
const eraserStringProperty = CircuitConstructionKitCommonFluent.eraserStringProperty;
const fuseStringProperty = CircuitConstructionKitCommonFluent.fuseStringProperty;
const lightBulbStringProperty = CircuitConstructionKitCommonFluent.lightBulbStringProperty;
const paperClipStringProperty = CircuitConstructionKitCommonFluent.paperClipStringProperty;
const pencilStringProperty = CircuitConstructionKitCommonFluent.pencilStringProperty;
const thinPencilStringProperty = CircuitConstructionKitCommonFluent.thinPencilStringProperty;
const resistorStringProperty = CircuitConstructionKitCommonFluent.resistorStringProperty;
const switchStringProperty = CircuitConstructionKitCommonFluent.switchStringProperty;
const wireStringProperty = CircuitConstructionKitCommonFluent.wireStringProperty;

const extremeResistorStringProperty = CircuitConstructionKitCommonFluent.extremeResistorStringProperty;
const extremeBatteryStringProperty = CircuitConstructionKitCommonFluent.extremeBatteryStringProperty;
const extremeBulbStringProperty = CircuitConstructionKitCommonFluent.extremeBulbStringProperty;

// constants
const BATTERY_LENGTH = CCKCConstants.BATTERY_LENGTH;
const AC_VOLTAGE_LENGTH = CCKCConstants.AC_VOLTAGE_LENGTH;
const FUSE_LENGTH = CCKCConstants.FUSE_LENGTH;
const WIRE_LENGTH = CCKCConstants.WIRE_LENGTH;
const SWITCH_LENGTH = CCKCConstants.SWITCH_LENGTH;

// Separate icons are made for schematic/lifelike so they can be aligned
const iconAlignGroup = new AlignGroup();
const LIFELIKE_PROPERTY = new EnumerationProperty( CircuitElementViewType.LIFELIKE );
const SCHEMATIC_PROPERTY = new EnumerationProperty( CircuitElementViewType.SCHEMATIC );

type CreateCircuitElementToolNodeSelfOptions = {
  lifelikeIconHeight?: number;
  schematicIconHeight?: number;
};

type CreateResistorToolNodeSelfOptions = {
  count?: number;
  resistorType?: ResistorType;
  labelStringProperty?: TReadOnlyProperty<string>;
  tandemName?: string;
};

type CreateCircuitElementToolNodeProvidedOptions = CreateCircuitElementToolNodeSelfOptions & CircuitElementToolNodeOptions;
type CreateResistorToolNodeProvidedOptions = CreateResistorToolNodeSelfOptions & CreateCircuitElementToolNodeProvidedOptions;

export default class CircuitElementToolFactory {
  private readonly circuit: Circuit;
  private readonly showLabelsProperty: Property<boolean>;
  private readonly viewTypeProperty: Property<CircuitElementViewType>;
  private readonly globalToCircuitNodePoint: ( v: Vector2 ) => Vector2;
  private readonly parentTandem: Tandem;
  private wireToolNode: CircuitElementToolNode | null;

  /**
   * @param circuit
   * @param showLabelsProperty
   * @param viewTypeProperty
   * @param globalToCircuitNodePoint Vector2=>Vector2 global point to coordinate frame of circuitNode
   * @param parentTandem - parent tandem for the created tool nodes
   */
  public constructor( circuit: Circuit, showLabelsProperty: Property<boolean>, viewTypeProperty: Property<CircuitElementViewType>, globalToCircuitNodePoint: ( v: Vector2 ) => Vector2, parentTandem: Tandem ) {
    this.circuit = circuit;
    this.showLabelsProperty = showLabelsProperty;
    this.viewTypeProperty = viewTypeProperty;
    this.globalToCircuitNodePoint = globalToCircuitNodePoint;
    this.parentTandem = parentTandem;
    this.wireToolNode = null;
  }

  /**
   * Utility function that creates a CircuitElementToolNode
   * @param circuitElementType
   * @param labelStringProperty
   * @param count
   * @param createIcon
   * @param predicate - CircuitElement => boolean, used to count circuit elements of that kind.
   *                             - NOTE: All of the predicates are intended to cover all circuit elements and be
   *                             - mutually exclusive (so there is no double counting).  However, this is not enforced.
   * @param createElement - (Vector2) => CircuitElement Function that creates a CircuitElement at the given position
   *                                 - for most components it is the center of the component.  For Light Bulbs, it is
   *                                 - in the center of the socket
   * @param [providedOptions]
   */
  public createCircuitElementToolNode(
    circuitElementType: CircuitElementType,
    labelStringProperty: TReadOnlyProperty<string>,
    count: number,
    createIcon: ( t: Tandem, p: Property<CircuitElementViewType> ) => Node,
    predicate: ( circuitElement: CircuitElement ) => boolean,
    createElement: ( v: Vector2 ) => CircuitElement,
    providedOptions?: CreateCircuitElementToolNodeProvidedOptions & PickRequired<Node, 'tandem'> ): CircuitElementToolNode {

    affirm( Number.isInteger( count ), 'count should be an integer' );

    const options = optionize<CreateCircuitElementToolNodeProvidedOptions, CreateCircuitElementToolNodeSelfOptions, CircuitElementToolNodeOptions>()( {
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

    const toggleNode = new ToggleNode( this.viewTypeProperty, [
      {
        value: CircuitElementViewType.LIFELIKE,
        createNode: () => wrap( createIcon( Tandem.OPT_OUT, LIFELIKE_PROPERTY ), options.lifelikeIconHeight )
      },
      {
        value: CircuitElementViewType.SCHEMATIC,
        createNode: () => wrap( createIcon( Tandem.OPT_OUT, SCHEMATIC_PROPERTY ), options.schematicIconHeight )
      }
    ] );

    return new CircuitElementToolNode(
      circuitElementType,
      labelStringProperty,
      this.showLabelsProperty,
      this.viewTypeProperty,
      this.circuit,
      this.globalToCircuitNodePoint,
      iconAlignGroup.createBox( toggleNode, { yAlign: 'bottom' } ),
      count,
      this.createCounter( predicate ),
      createElement, {
        tandem: options.tandem,
        additionalProperty: options.additionalProperty
      }
    );
  }

  /**
   * Returns a function which counts the number of circuit elements (not counting those in the true black box).
   * @param predicate - CircuitElement => boolean
   * @returns - a no-arg function that returns the {number} of CircuitElements of the specified type
   */
  public createCounter( predicate: ( c: CircuitElement ) => boolean ): () => number {
    return () =>
      this.circuit.circuitElements.filter( circuitElement =>

        // Count according to the predicate, but don't count elements inside the true black box
        predicate( circuitElement ) && !circuitElement.insideTrueBlackBoxProperty.get()
      ).length;
  }

  public createWireToolNode( tandem: Tandem ): Node {
    return this.createCircuitElementToolNode( 'wire', wireStringProperty, CCKCConstants.NUMBER_OF_WIRES,
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
        tandem: tandem,
        lifelikeIconHeight: 9,
        schematicIconHeight: 2
      } );
  }

  /**
   * @param count - the number that can be dragged out at once
   */
  public createRightBatteryToolNode( tandem: Tandem, count = 10 ): CircuitElementToolNode {
    const batteryModel = new Battery(
      new Vertex( Vector2.ZERO, this.circuit.selectionProperty ), new Vertex( new Vector2( CCKCConstants.BATTERY_LENGTH, 0 ), this.circuit.selectionProperty ),
      new NumberProperty( 0 ), 'normal', Tandem.OPT_OUT
    );
    return this.createCircuitElementToolNode( 'battery', batteryStringProperty, count,
      ( tandem, viewTypeProperty ) => new BatteryNode( null, null, batteryModel, viewTypeProperty, tandem.createTandem( 'batteryIcon' ), { isIcon: true } ),
      circuitElement => circuitElement instanceof Battery &&
                        circuitElement.initialOrientation === 'right' &&
                        circuitElement.batteryType === 'normal',
      ( position: Vector2 ) => this.circuit.batteryGroup.createNextElement( ...this.circuit.createVertexPairArray( position, BATTERY_LENGTH ) ), {
        tandem: tandem,
        lifelikeIconHeight: 15
      } );
  }

  /**
   * @param count - the number that can be dragged out at once
   */
  public createACVoltageToolNode( tandem: Tandem, count = 10 ): CircuitElementToolNode {
    const acSource = new ACVoltage(
      new Vertex( Vector2.ZERO, this.circuit.selectionProperty ),
      new Vertex( new Vector2( AC_VOLTAGE_LENGTH, 0 ), this.circuit.selectionProperty ),
      new NumberProperty( 0 ),
      Tandem.OPT_OUT
    );
    return this.createCircuitElementToolNode( 'acSource', acSourceStringProperty, count,
      ( tandem, viewTypeProperty ) => new ACVoltageNode( null, null, acSource, viewTypeProperty, tandem.createTandem( 'acSourceIcon' ), {
        isIcon: true,
        scale: 0.68
      } ),
      circuitElement => circuitElement instanceof ACVoltage,
      ( position: Vector2 ) => this.circuit.acVoltageGroup!.createNextElement( ...this.circuit.createVertexPairArray( position, AC_VOLTAGE_LENGTH ) ), {
        tandem: tandem,
        lifelikeIconHeight: 27,
        schematicIconHeight: 27
      }
    );
  }

  public createLightBulbToolNode( tandem: Tandem, lightBulbGroup = this.circuit.lightBulbGroup, string = lightBulbStringProperty,
                                  real = false, addRealBulbsProperty: BooleanProperty | null = null ): CircuitElementToolNode {
    const vertexPair = LightBulb.createVertexPair( Vector2.ZERO, this.circuit, true );
    const lightBulbModel = LightBulb.createAtPosition(
      vertexPair.startVertex,
      vertexPair.endVertex,
      this.circuit,
      CCKCConstants.DEFAULT_RESISTANCE,
      this.viewTypeProperty,
      Tandem.OPT_OUT, {
        isExtreme: false,
        isReal: real
      } );
    return this.createCircuitElementToolNode( 'lightBulb', string, 10,
      ( tandem, viewTypeProperty ) => new CCKCLightBulbNode( null, null,
        lightBulbModel,
        new BooleanProperty( true ), viewTypeProperty, Tandem.OPT_OUT, { isIcon: true, scale: 0.85 } ),
      circuitElement => circuitElement instanceof LightBulb && !circuitElement.isExtreme,
      ( position: Vector2 ) => {
        const vertexPair = LightBulb.createVertexPair( position, this.circuit );
        return lightBulbGroup.createNextElement( vertexPair.startVertex, vertexPair.endVertex );
      }, {
        tandem: tandem,
        additionalProperty: addRealBulbsProperty || new BooleanProperty( true ),
        schematicIconHeight: 27
      } );
  }

  public createResistorToolNode( tandem: Tandem, group: PhetioGroup<Resistor, [ Vertex, Vertex ]> | PhetioGroup<Resistor, [ Vertex, Vertex, ResistorType ]> = this.circuit.resistorGroup, providedOptions?: CreateResistorToolNodeProvidedOptions ): CircuitElementToolNode {
    const options = optionize<CreateResistorToolNodeProvidedOptions, CreateResistorToolNodeSelfOptions, CreateCircuitElementToolNodeSelfOptions>()( {
      count: 10,
      resistorType: ResistorType.RESISTOR,
      lifelikeIconHeight: 15,
      schematicIconHeight: 14,
      labelStringProperty: resistorStringProperty,
      tandemName: 'resistorToolNode'
    }, providedOptions );
    const labelStringProperty = options.labelStringProperty;
    const resistorType = options.resistorType;

    // Create the icon model without using the PhetioGroup, so it will not be PhET-iO instrumented.
    const resistorModel = new Resistor(
      new Vertex( Vector2.ZERO, this.circuit.selectionProperty ),
      new Vertex( new Vector2( resistorType.length, 0 ), this.circuit.selectionProperty ),
      resistorType,
      Tandem.OPT_OUT
    );

    return this.createCircuitElementToolNode( 'resistor', labelStringProperty, options.count,
      ( tandem, viewTypeProperty ) => new ResistorNode( null, null, resistorModel, viewTypeProperty, tandem.createTandem( 'resistorIcon' ), {
        isIcon: true
      } ),
      circuitElement => circuitElement instanceof Resistor && circuitElement.resistorType === resistorType,
      ( position: Vector2 ) => {
        const vertices = this.circuit.createVertexPairArray( position, resistorType.length );
        return group.createNextElement( vertices[ 0 ], vertices[ 1 ], resistorType );// last arg ignored by some groups
      }, {
        tandem: tandem,
        lifelikeIconHeight: options.lifelikeIconHeight,
        schematicIconHeight: options.schematicIconHeight
      } );
  }

  public createFuseToolNode( tandem: Tandem ): CircuitElementToolNode {
    const fuseModel = new Fuse(
      new Vertex( Vector2.ZERO, this.circuit.selectionProperty ),
      new Vertex( new Vector2( CCKCConstants.RESISTOR_LENGTH, 0 ), this.circuit.selectionProperty ),
      Tandem.OPT_OUT,
      null
    );
    return this.createCircuitElementToolNode( 'fuse', fuseStringProperty, 10,
      ( tandem, viewTypeProperty ) => new FuseNode( null, null, fuseModel, viewTypeProperty, tandem.createTandem( 'fuseIcon' ), {
        isIcon: true
      } ),
      circuitElement => circuitElement instanceof Fuse,
      ( position: Vector2 ) => this.circuit.fuseGroup.createNextElement( ...this.circuit.createVertexPairArray( position, FUSE_LENGTH ) ), {
        tandem: tandem,
        lifelikeIconHeight: 15,
        schematicIconHeight: 14
      }
    );
  }

  /**
   * @param count - the number that can be dragged out at once
   */
  public createCapacitorToolNode( tandem: Tandem, count = 10 ): CircuitElementToolNode {
    const capacitor = new Capacitor(
      new Vertex( Vector2.ZERO, this.circuit.selectionProperty ),
      new Vertex( new Vector2( CCKCConstants.CAPACITOR_LENGTH, 0 ), this.circuit.selectionProperty ),
      Tandem.OPT_OUT
    );
    return this.createCircuitElementToolNode( 'capacitor', capacitorStringProperty, count,
      ( tandem, viewTypeProperty ) => new CapacitorCircuitElementNode( null, null, capacitor, viewTypeProperty, tandem.createTandem( 'capacitorIcon' ), {
        isIcon: true
      } ),
      circuitElement => circuitElement instanceof Capacitor,
      ( position: Vector2 ) => this.circuit.capacitorGroup!.createNextElement( ...this.circuit.createVertexPairArray( position, CCKCConstants.CAPACITOR_LENGTH ) ), {
        tandem: tandem
      } );
  }

  public createInductorToolNode( tandem: Tandem ): CircuitElementToolNode {
    const inductorModel = new Inductor(
      new Vertex( Vector2.ZERO, this.circuit.selectionProperty ),
      new Vertex( new Vector2( CCKCConstants.INDUCTOR_LENGTH, 0 ), this.circuit.selectionProperty ),
      Tandem.OPT_OUT
    );
    const count = CCKCQueryParameters.moreInductors ? 10 : 1;
    return this.createCircuitElementToolNode( 'inductor', inductorStringProperty, count,
      ( tandem, viewTypeProperty ) => new InductorNode( null, null, inductorModel, viewTypeProperty, tandem.createTandem( 'inductorIcon' ), {
        isIcon: true,
        scale: 0.75
      } ),
      circuitElement => circuitElement instanceof Inductor,
      ( position: Vector2 ) => this.circuit.inductorGroup!.createNextElement( ...this.circuit.createVertexPairArray( position, CCKCConstants.INDUCTOR_LENGTH ) ), {
        tandem: tandem,
        lifelikeIconHeight: 22,
        schematicIconHeight: 6
      } );
  }

  public createSwitchToolNode( tandem: Tandem ): CircuitElementToolNode {
    return this.createCircuitElementToolNode( 'switch', switchStringProperty, 10,
      ( tandem, viewTypeProperty ) => new SwitchNode( null, null,
        new Switch(
          new Vertex( Vector2.ZERO, this.circuit.selectionProperty ),
          new Vertex( new Vector2( SWITCH_LENGTH, 0 ), this.circuit.selectionProperty ),
          Tandem.OPT_OUT,
          null
        ), viewTypeProperty, tandem.createTandem( 'switchIcon' ), {
          isIcon: true
        } ),
      circuitElement => circuitElement instanceof Switch,
      ( position: Vector2 ) => this.circuit.switchGroup.createNextElement( ...this.circuit.createVertexPairArray( position, SWITCH_LENGTH ) ), {
        tandem: tandem,
        lifelikeIconHeight: 22,
        schematicIconHeight: 16
      } );
  }

  public createPaperClipToolNode( tandem: Tandem ): CircuitElementToolNode {
    return this.createResistorToolNode( tandem, this.circuit.householdObjectGroup, {
      count: 1,
      resistorType: ResistorType.PAPER_CLIP,
      tandemName: 'paperClipToolNode',
      labelStringProperty: paperClipStringProperty
    } );
  }

  // Same docs as for createPaperClipToolNode
  public createCoinToolNode( tandem: Tandem ): CircuitElementToolNode {
    return this.createResistorToolNode( tandem, this.circuit.householdObjectGroup, {
      count: 1,
      resistorType: ResistorType.COIN,
      tandemName: 'coinToolNode',
      labelStringProperty: coinStringProperty,
      lifelikeIconHeight: 30
    } );
  }

  // Same docs as for createPaperClipToolNode
  public createDollarBillToolNode( tandem: Tandem ): CircuitElementToolNode {
    return this.createResistorToolNode( tandem, this.circuit.householdObjectGroup, {
      count: 1,
      resistorType: ResistorType.DOLLAR_BILL,
      tandemName: 'dollarBillToolNode',
      labelStringProperty: dollarBillStringProperty,
      lifelikeIconHeight: 22
    } );
  }

  // Same docs as for createPaperClipToolNode
  public createEraserToolNode( tandem: Tandem ): CircuitElementToolNode {
    return this.createResistorToolNode( tandem, this.circuit.householdObjectGroup, {
      count: 1,
      resistorType: ResistorType.ERASER,
      tandemName: 'eraserToolNode',
      labelStringProperty: eraserStringProperty,
      lifelikeIconHeight: 17
    } );
  }

  // Same docs as for createPaperClipToolNode
  public createPencilToolNode( tandem: Tandem ): CircuitElementToolNode {
    return this.createResistorToolNode( tandem, this.circuit.householdObjectGroup, {
      count: 1,
      resistorType: ResistorType.PENCIL,
      tandemName: 'pencilToolNode',
      labelStringProperty: pencilStringProperty,
      lifelikeIconHeight: 12
    } );
  }

  // Same docs as for createPaperClipToolNode
  public createThinPencilToolNode( tandem: Tandem ): CircuitElementToolNode {

    // The thin pencil image is 36px tall while the regular pencil is 49px tall. Both images are 209px wide.
    // Scale the lifelikeIconHeight proportionally so both pencil icons have the same width in the carousel.
    const thinPencilLifelikeIconHeight = 12 * 36 / 49;

    return this.createResistorToolNode( tandem, this.circuit.householdObjectGroup, {
      count: 1,
      resistorType: ResistorType.THIN_PENCIL,
      tandemName: 'thinPencilToolNode',
      labelStringProperty: thinPencilStringProperty,
      lifelikeIconHeight: thinPencilLifelikeIconHeight
    } );
  }

  // Same docs as for createPaperClipToolNode
  public createExtremeResistorToolNode( tandem: Tandem ): CircuitElementToolNode {
    return this.createResistorToolNode( tandem, this.circuit.extremeResistorGroup!, {
      count: 4,
      resistorType: ResistorType.EXTREME_RESISTOR,
      tandemName: 'extremeResistorToolNode',
      labelStringProperty: extremeResistorStringProperty
    } );
  }

  public createExtremeBatteryToolNode( tandem: Tandem ): CircuitElementToolNode {
    return this.createCircuitElementToolNode( 'battery', extremeBatteryStringProperty, 4,
      ( tandem, viewTypeProperty ) => new BatteryNode( null, null,
        new Battery(
          new Vertex( Vector2.ZERO, this.circuit.selectionProperty ),
          new Vertex( new Vector2( CCKCConstants.BATTERY_LENGTH, 0 ), this.circuit.selectionProperty ),
          new NumberProperty( 0 ),
          'high-voltage',
          Tandem.OPT_OUT, {
            voltage: 1000,
            numberOfDecimalPlaces: Battery.HIGH_VOLTAGE_DECIMAL_PLACES
          }
        ), viewTypeProperty, tandem.createTandem( 'extremeBatteryToolNode' ), { isIcon: true } ),
      circuitElement => circuitElement instanceof Battery &&
                        circuitElement.initialOrientation === 'right' &&
                        circuitElement.batteryType === 'high-voltage', ( position: Vector2 ) => {
        return this.circuit.extremeBatteryGroup!.createNextElement( ...this.circuit.createVertexPairArray( position, SWITCH_LENGTH ) );
      }, {
        tandem: tandem,
        lifelikeIconHeight: 15
      } );
  }

  public createExtremeBulbToolNode( tandem: Tandem ): CircuitElementToolNode {
    const vertexPair = LightBulb.createVertexPair( Vector2.ZERO, this.circuit, true );
    return this.createCircuitElementToolNode( 'lightBulb', extremeBulbStringProperty, 4,
      ( tandem, viewTypeProperty ) => new CCKCLightBulbNode(
        null,
        null,
        LightBulb.createAtPosition(
          vertexPair.startVertex,
          vertexPair.endVertex,
          this.circuit,
          1000,
          this.viewTypeProperty,
          Tandem.OPT_OUT, {
            isExtreme: true
          } ),
        new BooleanProperty( true ),
        viewTypeProperty,
        tandem.createTandem( 'extremeLightBulbToolNode' ), {
          isIcon: true
        } ),
      circuitElement => circuitElement instanceof LightBulb && circuitElement.isExtreme,
      position => {
        const vertexPair = LightBulb.createVertexPair( position, this.circuit, false );
        return this.circuit.extremeLightBulbGroup!.createNextElement( vertexPair.startVertex, vertexPair.endVertex );
      }, {
        tandem: tandem
      } );
  }
}

circuitConstructionKitCommon.register( 'CircuitElementToolFactory', CircuitElementToolFactory );