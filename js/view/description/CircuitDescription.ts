// Copyright 2025, University of Colorado Boulder

/**
 * CircuitDescription provides descriptions for circuits.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Node from '../../../../scenery/js/nodes/Node.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import Circuit from '../../model/Circuit.js';
import CircuitElement from '../../model/CircuitElement.js';
import CircuitElementType from '../../model/CircuitElementType.js';
import Vertex from '../../model/Vertex.js';
import CircuitNode from '../CircuitNode.js';

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
 * Formats an accessible name for a circuit element, including position if there are multiple of the same type.
 */
const formatCircuitElementAccessibleName = ( type: CircuitElementType, position: number, total: number ): string => {
  const baseLabel = getCircuitElementTypeLabel( type );
  return total > 1 ? `${baseLabel} ${position} of ${total}` : baseLabel;
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

      // Set the full accessible name on the node
      circuitElementNode.accessibleName = formatCircuitElementAccessibleName( type, indexForType, totalForType );

      // Store the brief name for use in descriptions
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
   * Updates PDOM order and accessible names for single (ungrouped) circuit elements.
   * Returns the PDOM order and a Map of brief names for these elements.
   */
  private static updateSingleCircuitElements(
    singleElementCircuits: CircuitElement[],
    circuitNode: CircuitNode
  ): { pdomOrder: Node[]; briefNames: Map<CircuitElement, string> } {
    const pdomOrder: Node[] = [];

    const briefNames = this.assignAccessibleNamesToElements( singleElementCircuits, circuitNode );

    singleElementCircuits.forEach( circuitElement => {
      const circuitElementNode = circuitNode.getCircuitElementNode( circuitElement );
      const startVertexNode = circuitNode.getVertexNode( circuitElement.startVertexProperty.value );
      const endVertexNode = circuitNode.getVertexNode( circuitElement.endVertexProperty.value );
      pdomOrder.push( circuitElementNode, startVertexNode, endVertexNode );
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

      // Collect circuit element nodes
      const circuitElementNodes = sortedCircuitElements.map( circuitElement =>
        circuitNode.getCircuitElementNode( circuitElement )
      );

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
      } );

      // Build PDOM order for this group
      const groupPDOMOrder: Node[] = [
        ...circuitElementNodes,
        ...group.vertices.map( vertex => circuitNode.getVertexNode( vertex ) )
      ];

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

    if ( !hasElements ) {
      circuitNode.constructionAreaContainer.accessibleParagraph = EMPTY_CONSTRUCTION_AREA_MESSAGE;
      circuitNode.circuitElementsSection.visible = false;
    }
    else {

      circuitNode.constructionAreaContainer.accessibleParagraph = null;

      // Update single circuit elements section and collect brief names
      const singleElementsResult = this.updateSingleCircuitElements( singleElementCircuits, circuitNode );
      circuitNode.circuitElementsSection.pdomOrder = singleElementsResult.pdomOrder;
      circuitNode.circuitElementsSection.visible = singleElementsResult.pdomOrder.length > 0;

      // Clear and rebuild grouped elements
      circuitNode.groupsContainer.children.forEach( child => child.dispose() );
      circuitNode.groupsContainer.children = [];

      // Update grouped circuit elements, passing the brief names map for use in junction descriptions
      const groupNodes = this.updateGroupedCircuitElements( multiElementGroups, circuitNode, circuit, singleElementsResult.briefNames );

      // Build construction area PDOM order
      const constructionAreaPDOMOrder: Node[] = [];
      if ( circuitNode.circuitElementsSection.visible ) {
        constructionAreaPDOMOrder.push( circuitNode.circuitElementsSection );
      }
      constructionAreaPDOMOrder.push( ...groupNodes );

      circuitNode.constructionAreaContainer.pdomOrder = constructionAreaPDOMOrder;
    }

    // Build main PDOM order
    pdomOrder.push( circuitNode.constructionAreaContainer );
    circuitNode.screenView.circuitElementEditContainerNode && pdomOrder.push( circuitNode.screenView.circuitElementEditContainerNode );

    // Set the final PDOM order
    circuitNode.pdomOrder = pdomOrder;
  }
}

circuitConstructionKitCommon.register( 'CircuitDescription', CircuitDescription );