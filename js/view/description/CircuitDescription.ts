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
import Resistor from '../../model/Resistor.js';
import Switch from '../../model/Switch.js';
import Vertex from '../../model/Vertex.js';
import CircuitNode from '../CircuitNode.js';

// Track properties for each circuit element so we can dispose them when updating
const positionedPropertiesMap = new WeakMap<CircuitElement, {
  showValuesAsStringProperty: TReadOnlyProperty<string>;
}>();

// Constants for preferred ordering of circuit elements in groups
const GROUPED_CIRCUIT_ELEMENT_TYPE_ORDER: CircuitElementType[] = [ 'battery', 'resistor', 'lightBulb', 'wire' ];

// Human-readable labels for circuit element types
const CIRCUIT_ELEMENT_TYPE_LABELS: Record<CircuitElementType, string> = {
  wire: 'Wire',
  battery: 'Battery',
  resistor: 'Resistor',
  capacitor: 'Capacitor',
  inductor: 'Inductor',
  lightBulb: 'Light bulb',
  acSource: 'AC Source',
  fuse: 'Fuse',
  switch: 'Switch',
  voltmeter: 'Voltmeter',
  ammeter: 'Ammeter',
  stopwatch: 'Stopwatch'
};

// String constants for vertex descriptions
const JUNCTION_LABEL = 'Junction';
const DISCONNECTED_LABEL = 'disconnected';
const CONNECTS_LABEL = 'connects';
const GROUP_LABEL = 'Group';
const EMPTY_CONSTRUCTION_AREA_MESSAGE = 'Create circuit elements to get started';

/**
 * Gets the human-readable label for a circuit element type.
 */
const getCircuitElementTypeLabel = ( type: CircuitElementType ): string => {
  return CIRCUIT_ELEMENT_TYPE_LABELS[ type ];
};

/**
 * Formats a brief name for a circuit element for use in junction descriptions and other contexts.
 * Uses just the type and position number without "of total" suffix.
 */
const formatCircuitElementBriefName = ( type: CircuitElementType, position: number, total: number ): string => {
  const baseLabel = getCircuitElementTypeLabel( type );
  return total > 1 ? `${baseLabel} ${position}` : baseLabel;
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
   * Assigns accessible names to circuit elements based on their type and position among elements of the same type.
   * Returns a Map from CircuitElement to its brief name for use in descriptions.
   */
  private static assignAccessibleNamesToElements(
    circuitElements: CircuitElement[],
    circuitNode: CircuitNode
  ): Map<CircuitElement, string> {
    // First pass: count how many of each type
    const typeCounts = new Map<CircuitElementType, number>();
    circuitElements.forEach( circuitElement => {
      const count = typeCounts.get( circuitElement.type ) || 0;
      typeCounts.set( circuitElement.type, count + 1 );
    } );

    // Second pass: assign names with position info
    const typeIndices = new Map<CircuitElementType, number>();
    const briefNames = new Map<CircuitElement, string>();

    circuitElements.forEach( circuitElement => {
      const circuitElementNode = circuitNode.getCircuitElementNode( circuitElement );
      const type = circuitElement.type;
      const indexForType = ( typeIndices.get( type ) || 0 ) + 1;
      typeIndices.set( type, indexForType );
      const totalForType = typeCounts.get( type ) || 0;

      // Dispose any existing positioned properties for this element
      const oldProperties = positionedPropertiesMap.get( circuitElement );
      if ( oldProperties ) {
        oldProperties.showValuesAsStringProperty.dispose();
        positionedPropertiesMap.delete( circuitElement );
      }

      // Create a new Fluent property with position information
      const showValuesProperty = circuitNode.model.showValuesProperty;
      const showValuesAsStringProperty = showValuesProperty.derived( value => value ? 'true' : 'false' );

      const numbered = totalForType > 1;
      const accessibleName = CircuitConstructionKitCommonFluent.a11y.circuitElement.accessibleName.format( {
        displayMode: showValuesProperty.value && numbered ? 'countAndValue' :
                     showValuesProperty.value && !numbered ? 'value' :
                     !showValuesProperty.value && numbered ? 'count' :
                     'name',
        type: circuitElement.type,
        voltage: circuitElement instanceof Battery ? circuitElement.voltageProperty : 0,
        resistance: circuitElement instanceof Resistor ? circuitElement.resistanceProperty : 0,
        capacitance: circuitElement instanceof Capacitor ? circuitElement.capacitanceProperty : 0,
        inductance: circuitElement instanceof Inductor ? circuitElement.inductanceProperty : 0,
        switchState: circuitElement instanceof Switch ? circuitElement.isClosedProperty.derived( value => value ? 'closed' : 'open' ) : 'open',
        hasPosition: 'true',
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
      briefNames.set( circuitElement, formatCircuitElementBriefName( type, indexForType, totalForType ) );
    } );

    return briefNames;
  }

  /**
   * Creates an accessible description for a vertex based on its connections.
   * Uses brief names for circuit elements to keep descriptions concise.
   */
  private static createVertexDescription(
    vertex: Vertex,
    vertexIndex: number,
    totalVertices: number,
    neighbors: CircuitElement[],
    briefNames: Map<CircuitElement, string>
  ): string {
    const baseLabel = `${JUNCTION_LABEL} ${vertexIndex + 1} of ${totalVertices}`;

    if ( neighbors.length === 1 ) {
      return `${baseLabel}, ${DISCONNECTED_LABEL}`;
    }
    else if ( neighbors.length === 2 ) {
      const name0 = briefNames.get( neighbors[ 0 ] ) || '';
      const name1 = briefNames.get( neighbors[ 1 ] ) || '';
      return `${baseLabel}, ${CONNECTS_LABEL} ${name0} to ${name1}`;
    }
    else {
      const neighborNames = neighbors.map( neighbor =>
        briefNames.get( neighbor ) || ''
      ).join( ', ' );
      return `${baseLabel}, ${CONNECTS_LABEL} ${neighborNames}`;
    }
  }

  /**
   * Creates a simple junction description for ungrouped circuit elements.
   * These junctions are numbered sequentially (1, 2) without "of X" since they're standalone.
   */
  private static createSimpleVertexDescription(
    vertexNumber: number,
    neighbors: CircuitElement[],
    briefNames: Map<CircuitElement, string>
  ): string {
    const baseLabel = `${JUNCTION_LABEL} ${vertexNumber}`;

    if ( neighbors.length === 1 ) {
      return `${baseLabel}, ${DISCONNECTED_LABEL}`;
    }
    else if ( neighbors.length === 2 ) {
      const name0 = briefNames.get( neighbors[ 0 ] ) || '';
      const name1 = briefNames.get( neighbors[ 1 ] ) || '';
      return `${baseLabel}, ${CONNECTS_LABEL} ${name0} to ${name1}`;
    }
    else {
      const neighborNames = neighbors.map( neighbor =>
        briefNames.get( neighbor ) || ''
      ).join( ', ' );
      return `${baseLabel}, ${CONNECTS_LABEL} ${neighborNames}`;
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

      // Set junction descriptions for the start and end vertices
      const startNeighbors = circuit.getNeighborCircuitElements( startVertex );
      const endNeighbors = circuit.getNeighborCircuitElements( endVertex );

      startVertexNode.accessibleName = this.createSimpleVertexDescription( 1, startNeighbors, briefNames );
      endVertexNode.accessibleName = this.createSimpleVertexDescription( 2, endNeighbors, briefNames );

      startVertexNode.attachmentName = 'start junction of a disconnected ' + circuitElement.type;
      endVertexNode.attachmentName = 'end junction of a disconnected ' + circuitElement.type;

      pdomOrder.push( circuitElementNode );

      if ( circuit.selectionProperty.value === circuitElement ) {
        pdomOrder.push( circuitNode.screenView.circuitElementEditContainerNode );
      }

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
        const description = this.createVertexDescription(
          vertex,
          vertexIndex,
          group.vertices.length,
          neighbors,
          allBriefNames
        );
        circuitNode.getVertexNode( vertex ).accessibleName = description;
        circuitNode.getVertexNode( vertex ).attachmentName = `junction ${vertexIndex + 1} of group ${groupIndex + 1}, which is connected to ${neighbors.length} circuit elements`;
      } );

      // Build PDOM order for this group
      const groupPDOMOrder: Node[] = [];
      sortedCircuitElements.forEach( circuitElement => {
        const circuitElementNode = circuitNode.getCircuitElementNode( circuitElement );
        groupPDOMOrder.push( circuitElementNode );

        if ( circuit.selectionProperty.value === circuitElement ) {
          groupPDOMOrder.push( circuitNode.screenView.circuitElementEditContainerNode );
        }
      } );
      group.vertices.forEach( vertex => {
        groupPDOMOrder.push( circuitNode.getVertexNode( vertex ) );
      } );

      // Remove duplicates from PDOM order using native Set
      const uniquePDOMOrder = Array.from( new Set( groupPDOMOrder ) );

      // Create group node
      const groupNode = new Node( {
        tagName: 'div',
        accessibleHeading: `${GROUP_LABEL} ${groupIndex + 1} of ${multiElementGroups.length}`,
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

    const focusedElement = getPDOMFocusedNode();

    if ( !hasElements ) {
      circuitNode.constructionAreaContainer.accessibleParagraph = EMPTY_CONSTRUCTION_AREA_MESSAGE;
      circuitNode.unconnectedCircuitElementsSection.visible = false;
    }
    else {

      circuitNode.constructionAreaContainer.accessibleParagraph = null;

      // Avoid having the old PDOM element appearing twice as we rebuild things.
      // TODO: Maybe not all of these are necessary? See https://github.com/phetsims/circuit-construction-kit-common/issues/1057
      // TODO: Try just removing focusedElement from its parent pdom order. Walk up the PDOM instances, not the parents. see https://github.com/phetsims/circuit-construction-kit-common/issues/1057

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
}

circuitConstructionKitCommon.register( 'CircuitDescription', CircuitDescription );
