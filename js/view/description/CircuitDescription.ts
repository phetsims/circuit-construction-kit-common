// Copyright 2025, University of Colorado Boulder

/**
 * CircuitDescription provides descriptions for circuits.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import ParallelDOM from '../../../../scenery/js/accessibility/pdom/ParallelDOM.js';
import { getPDOMFocusedNode } from '../../../../scenery/js/accessibility/pdomFocusProperty.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../../CircuitConstructionKitCommonFluent.js';
import CircuitDescriptionUtils from '../../CircuitDescriptionUtils.js';
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
import CircuitGroupDescription from './CircuitGroupDescription.js';


// Track properties for each circuit element so we can dispose them when updating
const positionedPropertiesMap = new WeakMap<CircuitElement, {
  showValuesAsStringProperty: TReadOnlyProperty<string>;
}>();

// Constants for preferred ordering of circuit elements in groups
const GROUPED_CIRCUIT_ELEMENT_TYPE_ORDER: CircuitElementType[] = [ 'battery', 'resistor', 'lightBulb', 'wire' ];

export default class CircuitDescription {
  private static myGroupNodes: Node[] | null = null;

  // Delegate to CircuitDescriptionUtils for shared functionality
  public static getDescriptionType = CircuitDescriptionUtils.getDescriptionType;
  public static isSingleMaxItem = CircuitDescriptionUtils.isSingleMaxItem;
  public static getCircuitElementTypeLabel = CircuitDescriptionUtils.getCircuitElementTypeLabel;
  public static getPluralTypeLabel = CircuitDescriptionUtils.getPluralTypeLabel;
  public static formatCircuitElementBriefName = CircuitDescriptionUtils.formatCircuitElementBriefName;
  public static getElementPosition = CircuitDescriptionUtils.getElementPosition;
  public static getGroupIndex = CircuitDescriptionUtils.getGroupIndex;
  public static getTerminalType = CircuitDescriptionUtils.getTerminalType;
  public static formatTerminalDescription = CircuitDescriptionUtils.formatTerminalDescription;

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
      const descriptionType = CircuitDescription.getDescriptionType( circuitElement );
      const count = typeCounts.get( descriptionType ) || 0;
      typeCounts.set( descriptionType, count + 1 );
    } );

    // Second pass: assign names with position info
    const typeIndices = new Map<string, number>();
    const briefNames = new Map<CircuitElement, string>();

    circuitElements.forEach( circuitElement => {
      const circuitElementNode = circuitNode.getCircuitElementNode( circuitElement );
      const descriptionType = CircuitDescription.getDescriptionType( circuitElement );
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
      const shouldShowPosition = !CircuitDescription.isSingleMaxItem( circuitElement );

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
      briefNames.set( circuitElement, CircuitDescription.formatCircuitElementBriefName( circuitElement, indexForType ) );
    } );

    return briefNames;
  }

  /**
   * Creates an accessible description for a vertex based on its connections.
   * Uses brief names for circuit elements to keep descriptions concise.
   * For vertices with 4+ connections, uses a compressed form grouping by type.
   * @param isFullyDisconnected - true if this vertex belongs to a circuit element with both ends disconnected
   * @param forAttachmentName - true to use short format "Connection X" for popup, false to use full format "Connection Point X of Y" for accessibleName
   */
  private static createVertexDescription(
    vertex: Vertex,
    vertexIndex: number,
    totalVertices: number,
    neighbors: CircuitElement[],
    briefNames: Map<CircuitElement, string>,
    isFullyDisconnected: boolean,
    forAttachmentName = false
  ): string {
    // Use short format for attachment names in popup, full format for accessibleName
    const connectionLabel = forAttachmentName ?
                            `${CircuitConstructionKitCommonFluent.a11y.circuitDescription.connectionStringProperty.value} ${vertexIndex}` :
                            `${CircuitConstructionKitCommonFluent.a11y.circuitDescription.connectionPointStringProperty.value} ${vertexIndex} of ${totalVertices}`;

    if ( neighbors.length === 1 ) {
      const componentName = briefNames.get( neighbors[ 0 ] ) || '';
      const terminalDescription = this.formatTerminalDescription( vertex, neighbors[ 0 ], componentName );
      vertex.completeDescription = null;

      // Skip "Connection Point" prefix if:
      // 1. Element is fully disconnected, OR
      // 2. Terminal has a special name (battery terminals, light bulb terminals)
      const terminalType = this.getTerminalType( vertex, neighbors[ 0 ] );
      const hasSpecialTerminal = terminalType !== 'none';

      if ( isFullyDisconnected || hasSpecialTerminal ) {
        return terminalDescription;
      }
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.connectionDescription.format( {
        connectionLabel: connectionLabel,
        neighbors: terminalDescription
      } );
    }
    else if ( neighbors.length >= 4 ) {
      // Compute the full description with all details
      const neighborNames = neighbors.map( neighbor => {
        const componentName = briefNames.get( neighbor ) || '';
        return this.formatTerminalDescription( vertex, neighbor, componentName );
      } ).join( ', ' );
      const fullDescription = CircuitConstructionKitCommonFluent.a11y.circuitDescription.connectionDescription.format( {
        connectionLabel: connectionLabel,
        neighbors: neighborNames
      } );

      // Store complete description on vertex for accessibility
      vertex.completeDescription = fullDescription;

      // Create compressed form by counting description types (uses specific names for household items)
      const typeCounts = new Map<string, number>();
      neighbors.forEach( neighbor => {
        const descriptionType = CircuitDescription.getDescriptionType( neighbor );
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
            const typeLabel = CircuitDescription.getCircuitElementTypeLabel( type );
            // Use article "a" or "an" based on whether the type label starts with a vowel
            const startsWithVowel = /^[aeiou]/i.test( typeLabel ) ? 'true' : 'false';
            const article = CircuitConstructionKitCommonFluent.a11y.circuitDescription.article.format( {
              startsWithVowel: startsWithVowel
            } );
            typeDescriptions.push( CircuitConstructionKitCommonFluent.a11y.circuitDescription.compressedSingular.format( {
              article: article,
              typeLabel: typeLabel
            } ) );
          }
          else {
            const pluralLabel = CircuitDescription.getPluralTypeLabel( type );
            typeDescriptions.push( CircuitConstructionKitCommonFluent.a11y.circuitDescription.compressedPlural.format( {
              count: count,
              pluralLabel: pluralLabel
            } ) );
          }
        }
      } );

      // Join with commas and "and" before the last item
      let joinedTypes: string;
      if ( typeDescriptions.length === 1 ) {
        joinedTypes = typeDescriptions[ 0 ];
      }
      else if ( typeDescriptions.length === 2 ) {
        joinedTypes = CircuitConstructionKitCommonFluent.a11y.circuitDescription.listTwoItems.format( {
          first: typeDescriptions[ 0 ],
          second: typeDescriptions[ 1 ]
        } );
      }
      else {
        const lastType = typeDescriptions.pop()!;
        joinedTypes = typeDescriptions.join( ', ' ) + CircuitConstructionKitCommonFluent.a11y.circuitDescription.listFinalSeparator.format( {
          last: lastType
        } );
      }

      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.connectionDescription.format( {
        connectionLabel: connectionLabel,
        neighbors: joinedTypes
      } );
    }
    else {
      const neighborNames = neighbors.map( neighbor => {
        const componentName = briefNames.get( neighbor ) || '';
        return this.formatTerminalDescription( vertex, neighbor, componentName );
      } ).join( ', ' );
      vertex.completeDescription = null;
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.connectionDescription.format( {
        connectionLabel: connectionLabel,
        neighbors: neighborNames
      } );
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

      // For fully disconnected elements, both formats are the same (just terminal description)
      // since isFullyDisconnected=true skips the connection label
      startVertexNode.accessibleName = CircuitDescription.createVertexDescription( startVertex, 1, 2, [ circuitElement ], briefNames, false, false );
      endVertexNode.accessibleName = CircuitDescription.createVertexDescription( endVertex, 2, 2, [ circuitElement ], briefNames, false, false );

      startVertexNode.attachmentName = CircuitDescription.createVertexDescription( startVertex, 1, 2, [ circuitElement ], briefNames, true, true );
      endVertexNode.attachmentName = CircuitDescription.createVertexDescription( endVertex, 2, 2, [ circuitElement ], briefNames, true, true );

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

        // Full format for accessibleName: "Connection Point X of Y, ..."
        const accessibleNameDescription = CircuitDescription.createVertexDescription(
          vertex,
          vertexIndex + 1,
          group.vertices.length,
          neighbors,
          allBriefNames,
          false,
          false // forAttachmentName = false, use full format
        );

        // Short format for attachmentName in popup: "Connection X: ..."
        const attachmentNameDescription = CircuitDescription.createVertexDescription(
          vertex,
          vertexIndex + 1,
          group.vertices.length,
          neighbors,
          allBriefNames,
          false,
          true // forAttachmentName = true, use short format
        );

        circuitNode.getVertexNode( vertex ).accessibleName = accessibleNameDescription;
        circuitNode.getVertexNode( vertex ).attachmentName = CircuitConstructionKitCommonFluent.a11y.circuitDescription.groupWithConnection.format( {
          groupIndex: groupIndex + 1,
          description: attachmentNameDescription
        } );
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

      // Create a summary paragraph node to appear right after the heading
      const groupSummary = CircuitGroupDescription.getGroupSummary( group, circuit );
      const summaryNode = new Node( {
        tagName: 'p',
        innerContent: groupSummary
      } );

      // Create group node with summary node first in pdomOrder
      const groupNode = new Node( {
        tagName: 'div',
        accessibleHeading: CircuitConstructionKitCommonFluent.a11y.circuitDescription.groupHeading.format( {
          groupIndex: groupIndex + 1,
          totalGroups: multiElementGroups.length
        } ),
        children: [ summaryNode ],
        pdomOrder: [ summaryNode, ...uniquePDOMOrder ]
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

    circuitNode.constructionAreaContainer.accessibleParagraphBehavior = ParallelDOM.HELP_TEXT_BEFORE_CONTENT;
    circuitNode.constructionAreaContainer.accessibleParagraph = CircuitConstructionKitCommonFluent.a11y.circuitDescription.emptyConstructionAreaMessageStringProperty.value;

    if ( !hasElements ) {

      circuitNode.unconnectedCircuitElementsSection.visible = false;
    }
    else {

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
      circuitNode.unconnectedCircuitElementsSection.visible = singleElementsResult.pdomOrder.length > 0;

      // Remove old summary node if it exists (it's the only direct child we add)
      circuitNode.unconnectedCircuitElementsSection.removeAllChildren();

      // Create summary node for unconnected section (appears right after heading)
      if ( singleElementCircuits.length > 0 ) {
        const unconnectedSummary = CircuitGroupDescription.getUnconnectedSectionSummary( singleElementCircuits );
        const unconnectedSummaryNode = new Node( {
          tagName: 'p',
          innerContent: unconnectedSummary
        } );
        circuitNode.unconnectedCircuitElementsSection.addChild( unconnectedSummaryNode );
        circuitNode.unconnectedCircuitElementsSection.pdomOrder = [ unconnectedSummaryNode, ...singleElementsResult.pdomOrder ];
      }
      else {
        circuitNode.unconnectedCircuitElementsSection.pdomOrder = singleElementsResult.pdomOrder;
      }

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
