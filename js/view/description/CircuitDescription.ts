// Copyright 2025, University of Colorado Boulder

/**
 * CircuitDescription provides descriptions for circuits.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import { getPDOMFocusedNode } from '../../../../scenery/js/accessibility/pdomFocusProperty.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../../CircuitConstructionKitCommonFluent.js';
import Battery from '../../model/Battery.js';
import Capacitor from '../../model/Capacitor.js';
import Circuit from '../../model/Circuit.js';
import CircuitElement from '../../model/CircuitElement.js';
import CircuitElementType from '../../model/CircuitElementType.js';
import Inductor from '../../model/Inductor.js';
import LightBulb from '../../model/LightBulb.js';
import Resistor from '../../model/Resistor.js';
import ResistorType from '../../model/ResistorType.js';
import Switch from '../../model/Switch.js';
import Vertex from '../../model/Vertex.js';
import CircuitNode from '../CircuitNode.js';

// Household item ResistorTypes that have a max of 1 in the circuit
const HOUSEHOLD_RESISTOR_TYPES = [
  ResistorType.COIN,
  ResistorType.PAPER_CLIP,
  ResistorType.PENCIL,
  ResistorType.ERASER,
  ResistorType.HAND,
  ResistorType.DOLLAR_BILL
];

/**
 * Gets the description type string for a circuit element. For household item resistors,
 * returns their specific type (e.g., 'coin', 'paperClip'). For other elements, returns
 * the standard CircuitElementType.
 */
const getDescriptionType = ( circuitElement: CircuitElement ): string => {
  if ( circuitElement instanceof Resistor ) {
    const resistorType = circuitElement.resistorType;
    if ( resistorType === ResistorType.COIN ) { return 'coin'; }
    if ( resistorType === ResistorType.PAPER_CLIP ) { return 'paperClip'; }
    if ( resistorType === ResistorType.PENCIL ) { return 'pencil'; }
    if ( resistorType === ResistorType.ERASER ) { return 'eraser'; }
    if ( resistorType === ResistorType.HAND ) { return 'hand'; }
    if ( resistorType === ResistorType.DOLLAR_BILL ) { return 'dollarBill'; }
  }
  return circuitElement.type;
};

/**
 * Returns true if the circuit element is a household item that can only have one instance.
 */
const isSingleMaxItem = ( circuitElement: CircuitElement ): boolean => {
  return circuitElement instanceof Resistor &&
         HOUSEHOLD_RESISTOR_TYPES.includes( circuitElement.resistorType );
};

// Track properties for each circuit element so we can dispose them when updating
const positionedPropertiesMap = new WeakMap<CircuitElement, {
  showValuesAsStringProperty: TReadOnlyProperty<string>;
}>();

// Constants for preferred ordering of circuit elements in groups
const GROUPED_CIRCUIT_ELEMENT_TYPE_ORDER: CircuitElementType[] = [ 'battery', 'resistor', 'lightBulb', 'wire' ];

/**
 * Gets the human-readable label for a circuit element type or description type.
 * Accepts both CircuitElementType and description types like 'coin', 'paperClip', etc.
 */
const getCircuitElementTypeLabel = ( type: CircuitElementType | string ): string => {
  switch( type ) {
    case 'wire':
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.wireStringProperty.value;
    case 'battery':
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.batteryStringProperty.value;
    case 'resistor':
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.resistorStringProperty.value;
    case 'capacitor':
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.capacitorStringProperty.value;
    case 'inductor':
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.inductorStringProperty.value;
    case 'lightBulb':
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.lightBulbStringProperty.value;
    case 'acSource':
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.acSourceStringProperty.value;
    case 'fuse':
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.fuseStringProperty.value;
    case 'switch':
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.switchStringProperty.value;
    case 'voltmeter':
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.voltmeterStringProperty.value;
    case 'ammeter':
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.ammeterStringProperty.value;
    case 'stopwatch':
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.stopwatchStringProperty.value;
    // Household item types
    case 'coin':
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.coinStringProperty.value;
    case 'paperClip':
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.paperClipStringProperty.value;
    case 'pencil':
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.pencilStringProperty.value;
    case 'eraser':
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.eraserStringProperty.value;
    case 'hand':
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.handStringProperty.value;
    case 'dollarBill':
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.dollarBillStringProperty.value;
    default:
      return type;
  }
};

/**
 * Returns the plural form for a circuit element type or description type.
 * Hard-coded for now; will eventually move to strings YAML.
 */
const getPluralTypeLabel = ( type: CircuitElementType | string ): string => {
  switch( type ) {
    case 'wire':
      return 'Wires';
    case 'battery':
      return 'Batteries';
    case 'resistor':
      return 'Resistors';
    case 'capacitor':
      return 'Capacitors';
    case 'inductor':
      return 'Inductors';
    case 'lightBulb':
      return 'Light Bulbs';
    case 'acSource':
      return 'AC Sources';
    case 'fuse':
      return 'Fuses';
    case 'switch':
      return 'Switches';
    case 'voltmeter':
      return 'Voltmeters';
    case 'ammeter':
      return 'Ammeters';
    case 'stopwatch':
      return 'Stopwatches';
    // Household items (max 1, so plurals unlikely but included for completeness)
    case 'coin':
      return 'Coins';
    case 'paperClip':
      return 'Paper Clips';
    case 'pencil':
      return 'Pencils';
    case 'eraser':
      return 'Erasers';
    case 'hand':
      return 'Hands';
    case 'dollarBill':
      return 'Dollar Bills';
    default:
      return type + 's';
  }
};

/**
 * Formats a brief name for a circuit element for use in junction descriptions and other contexts.
 * For household items (single-max), just returns the name without position.
 */
const formatCircuitElementBriefName = ( circuitElement: CircuitElement, position: number, total: number ): string => {
  const descriptionType = getDescriptionType( circuitElement );
  const baseLabel = getCircuitElementTypeLabel( descriptionType );

  // For single-max items (household items), don't show position numbers
  if ( isSingleMaxItem( circuitElement ) ) {
    return baseLabel;
  }
  return `${baseLabel} ${position}`;
};

export default class CircuitDescription {
  private static myGroupNodes: Node[] | null = null;

  /**
   * Sorts circuit elements by the preferred type order, with unlisted types at the end.
   */
  private static sortCircuitElementsByType( circuitElements: CircuitElement[] ): CircuitElement[] {
    return circuitElements.slice().sort( ( a, b ) => {
      const aIndex = GROUPED_CIRCUIT_ELEMENT_TYPE_ORDER.indexOf( a.type );
      const bIndex = GROUPED_CIRCUIT_ELEMENT_TYPE_ORDER.indexOf( b.type );
      const aOrder = aIndex === -1 ? Infinity : aIndex;
      const bOrder = bIndex === -1 ? Infinity : bIndex;
      return aOrder - bOrder;
    } );
  }

  /**
   * Returns circuit elements in PDOM order: disconnected elements first (sorted by type),
   * then grouped elements (sorted by type within each group).
   */
  public static getOrderedCircuitElements( circuit: Circuit ): CircuitElement[] {
    const groups = circuit.getGroups();

    // Separate disconnected (single-element) and connected (multi-element) groups
    const singleElementCircuits = groups
      .filter( group => group.circuitElements.length === 1 )
      .map( group => group.circuitElements[ 0 ] );
    const multiElementGroups = groups.filter( group => group.circuitElements.length > 1 );

    // Sort disconnected elements by type
    const sortedSingleElements = this.sortCircuitElementsByType( singleElementCircuits );

    // Sort elements within each group by type, then flatten
    const sortedGroupedElements: CircuitElement[] = [];
    multiElementGroups.forEach( group => {
      const sortedGroup = this.sortCircuitElementsByType( group.circuitElements );
      sortedGroupedElements.push( ...sortedGroup );
    } );

    return [ ...sortedSingleElements, ...sortedGroupedElements ];
  }

  /**
   * Returns vertices derived from the circuit element order. For each circuit element (in order),
   * adds startVertex then endVertex, skipping duplicates.
   */
  public static getOrderedVertices( circuit: Circuit ): Vertex[] {
    const orderedElements = this.getOrderedCircuitElements( circuit );
    const vertices: Vertex[] = [];
    const seen = new Set<Vertex>();

    orderedElements.forEach( circuitElement => {
      const startVertex = circuitElement.startVertexProperty.value;
      const endVertex = circuitElement.endVertexProperty.value;

      if ( !seen.has( startVertex ) ) {
        seen.add( startVertex );
        vertices.push( startVertex );
      }
      if ( !seen.has( endVertex ) ) {
        seen.add( endVertex );
        vertices.push( endVertex );
      }
    } );

    return vertices;
  }

  /**
   * Assigns accessible names to circuit elements based on their type and position among elements of the same type.
   * Returns a Map from CircuitElement to its brief name for use in descriptions.
   */
  private static assignAccessibleNamesToElements(
    circuitElements: CircuitElement[],
    circuitNode: CircuitNode
  ): Map<CircuitElement, string> {
    // First pass: count how many of each description type (uses specific names for household items)
    const typeCounts = new Map<string, number>();
    circuitElements.forEach( circuitElement => {
      const descriptionType = getDescriptionType( circuitElement );
      const count = typeCounts.get( descriptionType ) || 0;
      typeCounts.set( descriptionType, count + 1 );
    } );

    // Second pass: assign names with position info
    const typeIndices = new Map<string, number>();
    const briefNames = new Map<CircuitElement, string>();

    circuitElements.forEach( circuitElement => {
      const circuitElementNode = circuitNode.getCircuitElementNode( circuitElement );
      const descriptionType = getDescriptionType( circuitElement );
      const indexForType = ( typeIndices.get( descriptionType ) || 0 ) + 1;
      typeIndices.set( descriptionType, indexForType );
      const totalForType = typeCounts.get( descriptionType ) || 0;

      // Dispose any existing positioned properties for this element
      const oldProperties = positionedPropertiesMap.get( circuitElement );
      if ( oldProperties ) {
        oldProperties.showValuesAsStringProperty.dispose();
        positionedPropertiesMap.delete( circuitElement );
      }

      // Create a new Fluent property with position information
      const showValuesProperty = circuitNode.model.showValuesProperty;
      const showValuesAsStringProperty = showValuesProperty.derived( value => value ? 'true' : 'false' );

      // For single-max items (household items), don't show position info
      const shouldShowPosition = !isSingleMaxItem( circuitElement );

      // Use type assertion since descriptionType is always a valid Fluent type key
      const accessibleName = CircuitConstructionKitCommonFluent.a11y.circuitComponent.accessibleName.format( {
        displayMode: showValuesProperty.value ? 'countAndValue' :
                     !showValuesProperty.value ? 'count' :
                     'name',
        type: descriptionType as CircuitElementType,
        voltage: circuitElement instanceof Battery ? circuitElement.voltageProperty : 0,
        resistance: circuitElement instanceof Resistor ? circuitElement.resistanceProperty : 0,
        capacitance: circuitElement instanceof Capacitor ? circuitElement.capacitanceProperty : 0,
        inductance: circuitElement instanceof Inductor ? circuitElement.inductanceProperty : 0,
        switchState: circuitElement instanceof Switch ? circuitElement.isClosedProperty.derived( value => value ? 'closed' : 'open' ) : 'open',
        hasPosition: shouldShowPosition ? 'true' : 'false',
        position: indexForType,
        total: totalForType
      } );

      // Store for disposal on next update
      positionedPropertiesMap.set( circuitElement, {
        showValuesAsStringProperty: showValuesAsStringProperty
      } );

      // Dispose the properties when the circuit element is disposed
      circuitElement.disposeEmitterCircuitElement.addListener( () => {
        const props = positionedPropertiesMap.get( circuitElement );
        if ( props ) {
          props.showValuesAsStringProperty.dispose();
          positionedPropertiesMap.delete( circuitElement );
        }
      } );

      // Set the new property as the accessible name
      circuitElementNode.accessibleName = accessibleName;

      // Store brief name for junction descriptions (type + number, no values)
      briefNames.set( circuitElement, formatCircuitElementBriefName( circuitElement, indexForType, totalForType ) );
    } );

    return briefNames;
  }

  /**
   * Returns the type-specific prefix for describing a vertex's connection to a circuit element.
   * For example, "Positive Terminal of " for a battery's endVertex, or "Bottom of " for a light bulb's endVertex.
   */
  private static getTypeSpecificPrefix( vertex: Vertex, circuitElement: CircuitElement ): string {
    if ( circuitElement.type === 'battery' ) {
      const battery = circuitElement as Battery;

      // endVertex is the positive terminal (higher voltage)
      return vertex === battery.endVertexProperty.value ? 'Positive Terminal of ' : 'Negative Terminal of ';
    }
    else if ( circuitElement.type === 'lightBulb' ) {
      const lightBulb = circuitElement as LightBulb;

      // startVertex is the side, endVertex is the bottom
      return vertex === lightBulb.endVertexProperty.value ? 'Side of ' : 'Bottom of ';
    }
    return '';
  }

  /**
   * Creates an accessible description for a vertex based on its connections.
   * Uses brief names for circuit elements to keep descriptions concise.
   * For vertices with 4+ connections, uses a compressed form grouping by type.
   * @param isFullyDisconnected - true if this vertex belongs to a circuit element with both ends disconnected
   */
  private static createVertexDescription(
    vertex: Vertex,
    vertexIndex: number,
    totalVertices: number,
    neighbors: CircuitElement[],
    briefNames: Map<CircuitElement, string>,
    isFullyDisconnected: boolean
  ): string {
    const connectionLabel = `${CircuitConstructionKitCommonFluent.a11y.circuitDescription.connectionStringProperty.value} ${vertexIndex}`;

    if ( neighbors.length === 1 ) {
      const prefix = this.getTypeSpecificPrefix( vertex, neighbors[ 0 ] );
      vertex.completeDescription = null;
      const briefName = briefNames.get( neighbors[ 0 ] ) || '';

      // For fully disconnected elements, use simplified format without "Connection X"
      if ( isFullyDisconnected ) {
        return `${prefix}${briefName}`;
      }
      return `${connectionLabel}: ${prefix}${briefName}`;
    }
    else if ( neighbors.length >= 4 ) {
      // Compute the full description with all details
      const neighborNames = neighbors.map( neighbor => {
        const prefix = this.getTypeSpecificPrefix( vertex, neighbor );
        return `${prefix}${briefNames.get( neighbor ) || ''}`;
      } ).join( ', ' );
      const fullDescription = `${connectionLabel}: ${neighborNames}`;

      // Store complete description on vertex for accessibility
      vertex.completeDescription = fullDescription;

      // Create compressed form by counting description types (uses specific names for household items)
      const typeCounts = new Map<string, number>();
      neighbors.forEach( neighbor => {
        const descriptionType = getDescriptionType( neighbor );
        const count = typeCounts.get( descriptionType ) || 0;
        typeCounts.set( descriptionType, count + 1 );
      } );

      // Build type descriptions in preferred order
      const typeDescriptions: string[] = [];
      const orderedTypes: string[] = [ ...GROUPED_CIRCUIT_ELEMENT_TYPE_ORDER ];

      // Add any types not in the preferred order
      typeCounts.forEach( ( _, type ) => {
        if ( !orderedTypes.includes( type ) ) {
          orderedTypes.push( type );
        }
      } );

      orderedTypes.forEach( type => {
        const count = typeCounts.get( type );
        if ( count !== undefined ) {
          if ( count === 1 ) {
            const typeLabel = getCircuitElementTypeLabel( type );
            // Use article "a" or "an"
            const article = /^[aeiou]/i.test( typeLabel ) ? 'an' : 'a';
            typeDescriptions.push( `${article} ${typeLabel}` );
          }
          else {
            const pluralLabel = getPluralTypeLabel( type );
            typeDescriptions.push( `${count} ${pluralLabel}` );
          }
        }
      } );

      // Join with commas and "and" before the last item
      let joinedTypes: string;
      if ( typeDescriptions.length === 1 ) {
        joinedTypes = typeDescriptions[ 0 ];
      }
      else if ( typeDescriptions.length === 2 ) {
        joinedTypes = `${typeDescriptions[ 0 ]} and ${typeDescriptions[ 1 ]}`;
      }
      else {
        const lastType = typeDescriptions.pop()!;
        joinedTypes = `${typeDescriptions.join( ', ' )}, and ${lastType}`;
      }

      return `${connectionLabel}: ${joinedTypes}`;
    }
    else {
      const neighborNames = neighbors.map( neighbor => {
        const prefix = this.getTypeSpecificPrefix( vertex, neighbor );
        return `${prefix}${briefNames.get( neighbor ) || ''}`;
      } ).join( ', ' );
      vertex.completeDescription = null;
      return `${connectionLabel}: ${neighborNames}`;
    }
  }

  /**
   * Updates PDOM order and accessible names for single (ungrouped) circuit elements.
   * Returns the PDOM order and a Map of brief names for these elements.
   */
  private static updateSingleCircuitElements(
    singleElementCircuits: CircuitElement[],
    circuitNode: CircuitNode,
    circuit: Circuit
  ): { pdomOrder: Node[]; briefNames: Map<CircuitElement, string> } {
    const pdomOrder: Node[] = [];

    const briefNames = this.assignAccessibleNamesToElements( singleElementCircuits, circuitNode );

    singleElementCircuits.forEach( circuitElement => {
      const circuitElementNode = circuitNode.getCircuitElementNode( circuitElement );
      const startVertex = circuitElement.startVertexProperty.value;
      const endVertex = circuitElement.endVertexProperty.value;
      const startVertexNode = circuitNode.getVertexNode( startVertex );
      const endVertexNode = circuitNode.getVertexNode( endVertex );

      startVertexNode.accessibleName = CircuitDescription.createVertexDescription( startVertex, 1, 2, [ circuitElement ], briefNames, true );
      endVertexNode.accessibleName = CircuitDescription.createVertexDescription( endVertex, 2, 2, [ circuitElement ], briefNames, true );

      startVertexNode.attachmentName = startVertexNode.accessibleName;
      endVertexNode.attachmentName = endVertexNode.accessibleName;

      pdomOrder.push( circuitElementNode );
      pdomOrder.push( startVertexNode, endVertexNode );
    } );

    return { pdomOrder: pdomOrder, briefNames: briefNames };
  }

  /**
   * Updates PDOM order and accessible names for grouped circuit elements.
   * Returns an array of group Nodes to be added to the main PDOM order.
   * Also takes a Map of brief names from single elements to use when creating vertex descriptions.
   */
  private static updateGroupedCircuitElements(
    multiElementGroups: Array<{ circuitElements: CircuitElement[]; vertices: Vertex[] }>,
    circuitNode: CircuitNode,
    circuit: Circuit,
    allBriefNames: Map<CircuitElement, string>
  ): Node[] {
    const groupNodes: Node[] = [];

    multiElementGroups.forEach( ( group, groupIndex ) => {
      // Sort circuit elements by preferred type order
      const sortedCircuitElements = this.sortCircuitElementsByType( group.circuitElements );

      // Assign accessible names and get brief names for this group
      const groupBriefNames = this.assignAccessibleNamesToElements( sortedCircuitElements, circuitNode );

      // Merge group brief names into the overall brief names map
      groupBriefNames.forEach( ( briefName, circuitElement ) => {
        allBriefNames.set( circuitElement, briefName );
      } );

      // Assign accessible names to vertices using brief names
      group.vertices.forEach( ( vertex, vertexIndex ) => {
        const neighbors = circuit.getNeighborCircuitElements( vertex );
        const description = CircuitDescription.createVertexDescription(
          vertex,
          vertexIndex + 1,
          group.vertices.length,
          neighbors,
          allBriefNames,
          false
        );
        circuitNode.getVertexNode( vertex ).accessibleName = description;
        circuitNode.getVertexNode( vertex ).attachmentName = `${CircuitConstructionKitCommonFluent.a11y.circuitDescription.groupStringProperty.value} ${groupIndex + 1}, ${description}`;
      } );

      // Build PDOM order for this group
      const groupPDOMOrder: Node[] = [];
      sortedCircuitElements.forEach( circuitElement => {
        const circuitElementNode = circuitNode.getCircuitElementNode( circuitElement );
        groupPDOMOrder.push( circuitElementNode );
      } );
      group.vertices.forEach( vertex => {
        groupPDOMOrder.push( circuitNode.getVertexNode( vertex ) );
      } );

      // Remove duplicates from PDOM order using native Set
      const uniquePDOMOrder = Array.from( new Set( groupPDOMOrder ) );

      // Create group node
      const groupNode = new Node( {
        tagName: 'div',

        // TODO: Move the number to fluent/yaml, see https://github.com/phetsims/circuit-construction-kit-common/issues/1043
        accessibleHeading: `${CircuitConstructionKitCommonFluent.a11y.circuitDescription.groupStringProperty.value} ${groupIndex + 1} of ${multiElementGroups.length}`,
        pdomOrder: uniquePDOMOrder
      } );

      circuitNode.groupsContainer.addChild( groupNode );
      groupNodes.push( groupNode );
    } );

    return groupNodes;
  }

  /**
   * Updates the circuit node's PDOM structure with accessible descriptions for all circuit elements and vertices.
   */
  public static updateCircuitNode( circuitNode: CircuitNode ): void {
    const circuit = circuitNode.circuit;
    const pdomOrder: Node[] = [];

    // Get grouped and ungrouped circuit elements
    const groups = circuit.getGroups();
    const singleElementCircuits = groups
      .filter( group => group.circuitElements.length === 1 )
      .map( group => group.circuitElements[ 0 ] );
    const multiElementGroups = groups.filter( group => group.circuitElements.length > 1 );

    // Check if construction area is empty
    const hasElements = singleElementCircuits.length > 0 || multiElementGroups.length > 0;

    // Update circuit elements in PDOM order for keyboard navigation
    circuit.circuitElementsInPDOMOrder.length = 0;
    circuit.circuitElementsInPDOMOrder.push( ...singleElementCircuits );
    multiElementGroups.forEach( group => {
      circuit.circuitElementsInPDOMOrder.push( ...this.sortCircuitElementsByType( group.circuitElements ) );
    } );

    const focusedElement = getPDOMFocusedNode();

    if ( !hasElements ) {
      circuitNode.constructionAreaContainer.accessibleParagraph = CircuitConstructionKitCommonFluent.a11y.circuitDescription.emptyConstructionAreaMessageStringProperty.value;
      circuitNode.unconnectedCircuitElementsSection.visible = false;
    }
    else {

      circuitNode.constructionAreaContainer.accessibleParagraph = null;

      // Avoid having the old PDOM element appearing twice as we rebuild things.
      // TODO: Maybe not all of these are necessary? See https://github.com/phetsims/circuit-construction-kit-common/issues/1081
      // TODO: Try just removing focusedElement from its parent pdom order. Walk up the PDOM instances, not the parents. see https://github.com/phetsims/circuit-construction-kit-common/issues/1081

      // circuitNode.pdomOrder = []; // this line was crashing during keyboard dragging a vertex
      circuitNode.unconnectedCircuitElementsSection.pdomOrder = [];
      circuitNode.constructionAreaContainer.pdomOrder = [];
      if ( this.myGroupNodes ) {
        this.myGroupNodes.forEach( group => {
          group.pdomOrder = [];
        } );
      }

      // Update single circuit elements section and collect brief names
      const singleElementsResult = this.updateSingleCircuitElements( singleElementCircuits, circuitNode, circuit );
      circuitNode.unconnectedCircuitElementsSection.pdomOrder = singleElementsResult.pdomOrder;
      circuitNode.unconnectedCircuitElementsSection.visible = singleElementsResult.pdomOrder.length > 0;

      // Update grouped circuit elements, passing the brief names map for use in junction descriptions
      const groupNodes = this.updateGroupedCircuitElements( multiElementGroups, circuitNode, circuit, singleElementsResult.briefNames );

      // Build construction area PDOM order
      const constructionAreaPDOMOrder: Node[] = [];

      // Add status node first (shows counts and help text)
      constructionAreaPDOMOrder.push( circuitNode.constructionAreaStatusNode );

      if ( circuitNode.unconnectedCircuitElementsSection.visible ) {
        constructionAreaPDOMOrder.push( circuitNode.unconnectedCircuitElementsSection );
      }
      constructionAreaPDOMOrder.push( ...groupNodes );
      this.myGroupNodes?.forEach( group => {
        group.dispose();
      } );
      this.myGroupNodes = groupNodes;

      circuitNode.constructionAreaContainer.pdomOrder = constructionAreaPDOMOrder;
    }

    // Build main PDOM order
    pdomOrder.push( circuitNode.constructionAreaContainer );

    // Set the final PDOM order
    circuitNode.pdomOrder = pdomOrder;


    // This may make the node re-announce itself.
    // If this proves to be too disruptive, consider:
    // Each CircuitElementNode could have its own child containerNode, which may or may not contain its edit panel
    // Or we can try splicing in the edit panel node at the right location in the pdomOrder array without resetting the whole array.
    // Or we can try a modal operation for the edit panel (removing other content from the PDOM while it's open).
    focusedElement && !focusedElement.isFocused() && focusedElement.focus();
  }

  /**
   * Surgically updates the edit panel position in the PDOM without rebuilding the entire structure.
   * This preserves focus on other elements (like vertices being dragged) while moving the edit panel.
   * See https://github.com/phetsims/circuit-construction-kit-common/issues/1064
   */
  public static updateEditPanelPosition( circuitNode: CircuitNode ): void {
    const circuit = circuitNode.circuit;
    const editPanel = circuitNode.screenView.circuitElementEditContainerNode;
    const selection = circuit.selectionProperty.value;

    // Helper to remove edit panel from a pdomOrder array if present
    const removeFromPdomOrder = ( pdomOrder: ( Node | null )[] | null ): ( Node | null )[] | null => {
      if ( !pdomOrder ) {
        return null;
      }
      const index = pdomOrder.indexOf( editPanel );
      if ( index !== -1 ) {
        const newOrder = pdomOrder.slice();
        newOrder.splice( index, 1 );
        return newOrder;
      }
      return null; // No change needed
    };

    // Remove edit panel from unconnectedCircuitElementsSection if present
    const unconnectedOrder = removeFromPdomOrder( circuitNode.unconnectedCircuitElementsSection.pdomOrder );
    if ( unconnectedOrder ) {
      circuitNode.unconnectedCircuitElementsSection.pdomOrder = unconnectedOrder;
    }

    // Remove edit panel from any group nodes if present
    if ( this.myGroupNodes ) {
      this.myGroupNodes.forEach( groupNode => {
        const groupOrder = removeFromPdomOrder( groupNode.pdomOrder );
        if ( groupOrder ) {
          groupNode.pdomOrder = groupOrder;
        }
      } );
    }

    // If a circuit element is selected, insert the edit panel after it
    if ( selection instanceof CircuitElement ) {
      const circuitElementNode = circuitNode.getCircuitElementNode( selection );

      // Check if it's in the unconnected section
      const unconnectedPdomOrder = circuitNode.unconnectedCircuitElementsSection.pdomOrder;
      if ( unconnectedPdomOrder ) {
        const elementIndex = unconnectedPdomOrder.indexOf( circuitElementNode );
        if ( elementIndex !== -1 ) {
          const newOrder = unconnectedPdomOrder.slice();
          newOrder.splice( elementIndex + 1, 0, editPanel );
          circuitNode.unconnectedCircuitElementsSection.pdomOrder = newOrder;
          return;
        }
      }

      // Check if it's in one of the group nodes
      if ( this.myGroupNodes ) {
        for ( const groupNode of this.myGroupNodes ) {
          const groupPdomOrder = groupNode.pdomOrder;
          if ( groupPdomOrder ) {
            const elementIndex = groupPdomOrder.indexOf( circuitElementNode );
            if ( elementIndex !== -1 ) {
              const newOrder = groupPdomOrder.slice();
              newOrder.splice( elementIndex + 1, 0, editPanel );
              groupNode.pdomOrder = newOrder;
              return;
            }
          }
        }
      }
    }
  }
}

circuitConstructionKitCommon.register( 'CircuitDescription', CircuitDescription );
