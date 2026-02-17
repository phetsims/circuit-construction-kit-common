// Copyright 2025-2026, University of Colorado Boulder

/**
 * CircuitDescription provides descriptions for circuits.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import type { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import ParallelDOM from '../../../../scenery/js/accessibility/pdom/ParallelDOM.js';
import { getPDOMFocusedNode } from '../../../../scenery/js/accessibility/pdomFocusProperty.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import CCKCQueryParameters from '../../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../../CircuitConstructionKitCommonFluent.js';
import Capacitor from '../../model/Capacitor.js';
import Circuit from '../../model/Circuit.js';
import CircuitElement from '../../model/CircuitElement.js';
import CircuitElementType from '../../model/CircuitElementType.js';
import CircuitElementViewType from '../../model/CircuitElementViewType.js';
import Fuse from '../../model/Fuse.js';
import Inductor from '../../model/Inductor.js';
import LightBulb from '../../model/LightBulb.js';
import Resistor from '../../model/Resistor.js';
import Switch from '../../model/Switch.js';
import Vertex from '../../model/Vertex.js';
import VoltageSource from '../../model/VoltageSource.js';
import AmmeterNode from '../AmmeterNode.js';
import CircuitNode from '../CircuitNode.js';
import VoltmeterNode from '../VoltmeterNode.js';
import CircuitDescriptionUtils from './CircuitDescriptionUtils.js';
import CircuitGroupDescription from './CircuitGroupDescription.js';

// Track properties for each circuit element so we can dispose them when updating
const positionedPropertiesMap = new WeakMap<CircuitElement, {
  accessibleNameWithSelectionProperty: TReadOnlyProperty<string>;
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
  public static getGroupIndex = CircuitDescriptionUtils.getGroupIndex;
  public static formatTerminalDescription = CircuitDescriptionUtils.formatTerminalDescription;

  /**
   * Builds an accessible name string for a circuit element by composing parts with a separator.
   * Order: type name + position (space-separated), then value, internal resistance, modifiers (comma-separated).
   */
  public static buildAccessibleName(
    circuitElement: CircuitElement,
    showValues: boolean,
    position: number,
    total: number,
    shouldShowPosition: boolean,
    isSchematic: boolean
  ): string {
    const separator = CircuitConstructionKitCommonFluent.a11y.circuitComponent.separatorStringProperty.value;
    const parts: string[] = [];

    // 1. Type name + position out of total (e.g., "Battery 1 of 2") or just type name
    const descriptionType = CircuitDescription.getDescriptionType( circuitElement );
    const typeName = CircuitDescription.getCircuitElementTypeLabel( descriptionType );
    if ( shouldShowPosition ) {
      parts.push( CircuitConstructionKitCommonFluent.a11y.circuitComponent.nameWithPosition.format(
        { typeName: typeName, position: position, total: total }
      ) );
    }
    else {
      parts.push( typeName );
    }

    // 2. Brightness (light bulbs only, always shown regardless of showValues)
    // Skip brightness in schematic mode since schematic light bulbs don't glow
    if ( circuitElement instanceof LightBulb && !isSchematic ) {
      const brightness = circuitElement.computeBrightness();
      if ( brightness <= LightBulb.BRIGHTNESS_OFF_THRESHOLD ) {
        parts.push( CircuitConstructionKitCommonFluent.a11y.circuitComponent.brightness.offStringProperty.value );
      }
      else {

        // Round to nearest percent
        const percentString = toFixed( brightness * 100, 0 );
        parts.push( CircuitConstructionKitCommonFluent.a11y.circuitComponent.brightness.percent.format( { percent: percentString } ) );
      }
    }

    // 3. Value (depends on type)
    if ( showValues ) {
      if ( circuitElement instanceof Resistor || circuitElement instanceof LightBulb ) {
        // Resistors, light bulbs (including extreme variants) show resistance in ohms
        parts.push( CircuitConstructionKitCommonFluent.a11y.circuitComponent.values.resistanceOhms.format( { resistance: circuitElement.resistanceProperty.value } ) );
      }
      else if ( circuitElement instanceof VoltageSource ) {
        // Batteries, extreme batteries, AC sources show voltage
        parts.push( CircuitConstructionKitCommonFluent.a11y.circuitComponent.values.voltageVolts.format( { voltage: circuitElement.voltageProperty.value } ) );
      }
      else if ( circuitElement instanceof Capacitor ) {
        parts.push( CircuitConstructionKitCommonFluent.a11y.circuitComponent.values.capacitanceFarads.format( { capacitance: circuitElement.capacitanceProperty.value } ) );
      }
      else if ( circuitElement instanceof Inductor ) {
        parts.push( CircuitConstructionKitCommonFluent.a11y.circuitComponent.values.inductanceHenries.format( { inductance: circuitElement.inductanceProperty.value } ) );
      }
      else if ( circuitElement instanceof Fuse ) {
        if ( circuitElement.isTrippedProperty.value ) {
          // Tripped fuse shows infinite ohms
          parts.push( CircuitConstructionKitCommonFluent.a11y.circuitComponent.values.infiniteOhmsStringProperty.value );
        }
        else {
          // Non-tripped fuse shows milliohms
          parts.push( CircuitConstructionKitCommonFluent.a11y.circuitComponent.values.resistanceMilliohms.format( { resistance: circuitElement.resistanceProperty.value * 1000 } ) );
        }
        // Fuse always shows current rating
        parts.push( CircuitConstructionKitCommonFluent.a11y.circuitComponent.values.currentRatingAmps.format( { currentRating: toFixed( circuitElement.currentRatingProperty.value, 1 ) } ) );
      }
    }

    // Switch always shows state (regardless of showValues)
    if ( circuitElement instanceof Switch ) {
      const state = circuitElement.isClosedProperty.value ? 'closed' : 'open';
      parts.push( state === 'closed' ? CircuitConstructionKitCommonFluent.a11y.circuitComponent.switchStates.closedStringProperty.value
                                     : CircuitConstructionKitCommonFluent.a11y.circuitComponent.switchStates.openStringProperty.value );
    }

    // 4. Internal resistance (voltage sources only, if above threshold)
    if ( showValues && circuitElement instanceof VoltageSource ) {
      const internalResistance = circuitElement.internalResistanceProperty.value;
      if ( internalResistance > CCKCQueryParameters.batteryMinimumResistance ) {
        parts.push( CircuitConstructionKitCommonFluent.a11y.circuitComponent.values.resistanceOhms.format(
          { resistance: internalResistance }
        ) );
      }
    }

    // 5. Modifiers
    if ( circuitElement instanceof VoltageSource && circuitElement.isOnFireProperty.value ) {
      parts.push( CircuitConstructionKitCommonFluent.a11y.circuitComponent.modifiers.onFireStringProperty.value );
    }
    if ( circuitElement instanceof Fuse && circuitElement.isTrippedProperty.value ) {
      parts.push( CircuitConstructionKitCommonFluent.a11y.circuitComponent.modifiers.brokenStringProperty.value );
    }

    return parts.join( separator );
  }

  /**
   * Cleans up old group nodes by disposing them and removing from groupsContainer.
   * Should be called at the start of updateCircuitNode to ensure stale PDOM elements are removed.
   */
  private static cleanupGroupNodes( circuitNode: CircuitNode ): void {
    // Clear pdomOrder arrays first to prevent PDOM elements from being referenced in multiple places
    if ( this.myGroupNodes ) {
      this.myGroupNodes.forEach( group => {
        group.pdomOrder = [];
      } );
    }

    // Remove all children from groupsContainer
    circuitNode.groupsContainer.removeAllChildren();

    // Dispose old group nodes (removes their PDOM elements)
    if ( this.myGroupNodes ) {
      this.myGroupNodes.forEach( group => {
        group.dispose();
      } );
      this.myGroupNodes = null;
    }
  }

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
   * @param circuitElements - the circuit elements to assign names to
   * @param circuitNode - the circuit node
   * @param groupIndex - optional 1-based group index; if provided, appends ", Group X" to accessible names
   */
  private static assignAccessibleNamesToElements(
    circuitElements: CircuitElement[],
    circuitNode: CircuitNode,
    groupIndex?: number
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
    let elementIndex = 0; // Track position for group suffix (only first element gets it)

    circuitElements.forEach( circuitElement => {
      const circuitElementNode = circuitNode.getCircuitElementNode( circuitElement );
      const descriptionType = CircuitDescription.getDescriptionType( circuitElement );
      const indexForType = ( typeIndices.get( descriptionType ) || 0 ) + 1;
      typeIndices.set( descriptionType, indexForType );
      const totalForType = typeCounts.get( descriptionType ) || 0;

      // Dispose any existing positioned properties for this element
      const oldProperties = positionedPropertiesMap.get( circuitElement );
      if ( oldProperties ) {
        oldProperties.accessibleNameWithSelectionProperty.dispose();
        positionedPropertiesMap.delete( circuitElement );
      }

      // For single-max items (household items), don't show position info
      const shouldShowPosition = !CircuitDescription.isSingleMaxItem( circuitElement );

      // Build the accessible name using composable parts
      const showValuesProperty = circuitNode.model.showValuesProperty;
      const isSchematic = circuitNode.model.viewTypeProperty.value === CircuitElementViewType.SCHEMATIC;

      // Add group suffix ONLY to first element in group (to reduce verbosity)
      let accessibleNameWithGroup = CircuitDescription.buildAccessibleName(
        circuitElement,
        showValuesProperty.value,
        indexForType,
        totalForType,
        shouldShowPosition,
        isSchematic
      );
      if ( groupIndex !== undefined && elementIndex === 0 ) {
        accessibleNameWithGroup += CircuitConstructionKitCommonFluent.a11y.circuitDescription.groupSuffixFirst.format( { groupIndex: groupIndex } );
      }
      elementIndex++;

      // Create a property that adds ", selected" suffix when this element is selected
      const selectionProperty = circuitNode.circuit.selectionProperty;
      const accessibleNameWithSelectionProperty = new DerivedProperty(
        [ selectionProperty ],
        ( selection ): string => {
          const isSelected = selection === circuitElement;
          return isSelected ?
                 CircuitConstructionKitCommonFluent.a11y.circuitDescription.accessibleNameWithSelected.format( {
                   accessibleName: accessibleNameWithGroup
                 } ) :
                 accessibleNameWithGroup;
        }
      );

      // Store for disposal on next update
      positionedPropertiesMap.set( circuitElement, {
        accessibleNameWithSelectionProperty: accessibleNameWithSelectionProperty
      } );

      // Dispose the properties when the circuit element is disposed
      circuitElement.disposeEmitterCircuitElement.addListener( () => {
        const props = positionedPropertiesMap.get( circuitElement );
        if ( props ) {
          props.accessibleNameWithSelectionProperty.dispose();
          positionedPropertiesMap.delete( circuitElement );
        }
      } );

      // Set the new property as the accessible name (includes ", selected" suffix when selected)
      circuitElementNode.accessibleName = accessibleNameWithSelectionProperty;

      // Store brief name for junction descriptions (type + number, no values)
      const briefName = CircuitDescription.formatCircuitElementBriefName( circuitElement, indexForType );
      briefNames.set( circuitElement, briefName );

      // Store brief name on the node for ammeter measurement lists
      circuitElementNode.measurementName = briefName;
    } );

    return briefNames;
  }

  /**
   * Returns just the neighbors description for a vertex — the part that describes what's connected,
   * without any "Connection X:" or "Connection Point X of Y:" prefix.
   * For 1 neighbor: returns terminal description (e.g., "Bottom of Light Bulb 1")
   * For 2-3 neighbors: comma-separated terminal descriptions
   * For 4+ neighbors: compressed form grouping by type (e.g., "2 Wires and 1 Battery")
   */
  private static getVertexNeighborsDescription(
    vertex: Vertex,
    neighbors: CircuitElement[],
    briefNames: Map<CircuitElement, string>
  ): string {
    if ( neighbors.length === 1 ) {
      const componentName = briefNames.get( neighbors[ 0 ] ) || '';
      return this.formatTerminalDescription( vertex, neighbors[ 0 ], componentName );
    }
    else if ( neighbors.length >= 4 ) {

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
            typeDescriptions.push( CircuitConstructionKitCommonFluent.a11y.circuitDescription.compressedSingular.format( {
              count: 1,
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

      return joinedTypes;
    }
    else {

      // 2-3 neighbors: comma-separated terminal descriptions
      return neighbors.map( neighbor => {
        const componentName = briefNames.get( neighbor ) || '';
        return this.formatTerminalDescription( vertex, neighbor, componentName );
      } ).join( ', ' );
    }
  }

  /**
   * Creates an accessible description for a vertex based on its connections.
   * Uses brief names for circuit elements to keep descriptions concise.
   * For vertices with 4+ connections, uses a compressed form grouping by type.
   * @param vertex
   * @param vertexIndex
   * @param totalVertices
   * @param neighbors
   * @param briefNames
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
    forAttachmentName: boolean
  ): string {
    // Use short format for attachment names in popup, full format for accessibleName
    const connectionLabel = forAttachmentName ?
                            `${CircuitConstructionKitCommonFluent.a11y.circuitDescription.connectionStringProperty.value} ${vertexIndex}` :
                            `${CircuitConstructionKitCommonFluent.a11y.circuitDescription.connectionPointStringProperty.value} ${vertexIndex} of ${totalVertices}`;

    const neighborsDescription = this.getVertexNeighborsDescription( vertex, neighbors, briefNames );

    if ( neighbors.length === 1 ) {
      vertex.completeDescription = null;

      // Skip "Connection Point" prefix only if element is fully disconnected.
      // Battery and light bulb terminals still get the prefix (e.g., "Connection Point 1 of 2: Negative Terminal of Battery 1")
      if ( isFullyDisconnected ) {
        return neighborsDescription;
      }
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.connectionDescription.format( {
        connectionLabel: connectionLabel,
        neighbors: neighborsDescription
      } );
    }
    else if ( neighbors.length >= 4 ) {

      // Compute the full description with all details for completeDescription
      const fullNeighborNames = neighbors.map( neighbor => {
        const componentName = briefNames.get( neighbor ) || '';
        return this.formatTerminalDescription( vertex, neighbor, componentName );
      } ).join( ', ' );

      // Store complete description on vertex for accessibility
      vertex.completeDescription = CircuitConstructionKitCommonFluent.a11y.circuitDescription.connectionDescription.format( {
        connectionLabel: connectionLabel,
        neighbors: fullNeighborNames
      } );

      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.connectionDescription.format( {
        connectionLabel: connectionLabel,
        neighbors: neighborsDescription
      } );
    }
    else {
      vertex.completeDescription = null;
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.connectionDescription.format( {
        connectionLabel: connectionLabel,
        neighbors: neighborsDescription
      } );
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
      const startVertex = circuitElement.startVertexProperty.value;
      const endVertex = circuitElement.endVertexProperty.value;
      const startVertexNode = circuitNode.getVertexNode( startVertex );
      const endVertexNode = circuitNode.getVertexNode( endVertex );

      // For fully disconnected elements, both vertices have only 1 neighbor so both are "not connected"
      startVertexNode.accessibleName = CircuitConstructionKitCommonFluent.a11y.circuitDescription.notConnected.format( {
        description: CircuitDescription.createVertexDescription( startVertex, 1, 2, [ circuitElement ], briefNames, false, false )
      } );
      endVertexNode.accessibleName = CircuitConstructionKitCommonFluent.a11y.circuitDescription.notConnected.format( {
        description: CircuitDescription.createVertexDescription( endVertex, 2, 2, [ circuitElement ], briefNames, false, false )
      } );

      startVertexNode.attachmentName = CircuitConstructionKitCommonFluent.a11y.circuitDescription.notConnected.format( {
        description: CircuitDescription.createVertexDescription( startVertex, 1, 2, [ circuitElement ], briefNames, true, true )
      } );
      endVertexNode.attachmentName = CircuitConstructionKitCommonFluent.a11y.circuitDescription.notConnected.format( {
        description: CircuitDescription.createVertexDescription( endVertex, 2, 2, [ circuitElement ], briefNames, true, true )
      } );

      // Disconnected elements have no group (groupIndex = 0)
      startVertexNode.attachmentGroupIndex = 0;
      startVertexNode.attachmentConnectionIndex = 0;
      endVertexNode.attachmentGroupIndex = 0;
      endVertexNode.attachmentConnectionIndex = 0;

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

      // Assign accessible names and get brief names for this group (pass 1-based group index)
      const groupBriefNames = this.assignAccessibleNamesToElements( sortedCircuitElements, circuitNode, groupIndex + 1 );

      // Merge group brief names into the overall brief names map
      groupBriefNames.forEach( ( briefName, circuitElement ) => {
        allBriefNames.set( circuitElement, briefName );
      } );

      // Assign accessible names to vertices using brief names
      // Only the LAST vertex gets the group suffix (to reduce verbosity)
      const groupSuffix = CircuitConstructionKitCommonFluent.a11y.circuitDescription.groupSuffixLast.format( { groupIndex: groupIndex + 1 } );
      const lastVertexIndex = group.vertices.length - 1;

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

        // Add ", not connected" for vertices with only 1 neighbor, then group suffix for last vertex.
        // Order: "Connection Point 3 of 3: ..., not connected, last item in Group 1"
        const isLastVertex = vertexIndex === lastVertexIndex;
        const isNotConnected = neighbors.length === 1;
        let accessibleName = isNotConnected ?
                             CircuitConstructionKitCommonFluent.a11y.circuitDescription.notConnected.format( {
                               description: accessibleNameDescription
                             } ) :
                             accessibleNameDescription;
        if ( isLastVertex ) {
          accessibleName += groupSuffix;
        }
        circuitNode.getVertexNode( vertex ).accessibleName = accessibleName;
        const vertexNode = circuitNode.getVertexNode( vertex );

        // Build attachment name as "Group X: neighbors[, not connected]"
        const neighborsDescription = CircuitDescription.getVertexNeighborsDescription( vertex, neighbors, allBriefNames );
        const groupAttachmentName = CircuitConstructionKitCommonFluent.a11y.circuitDescription.groupWithConnection.format( {
          groupIndex: groupIndex + 1,
          description: neighborsDescription
        } );
        vertexNode.attachmentName = neighbors.length === 1 ?
                                    CircuitConstructionKitCommonFluent.a11y.circuitDescription.notConnected.format( {
                                      description: groupAttachmentName
                                    } ) :
                                    groupAttachmentName;

        // Store numeric indices for sorting in attachment combo boxes
        vertexNode.attachmentGroupIndex = groupIndex + 1;
        vertexNode.attachmentConnectionIndex = vertexIndex + 1;
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
    circuitNode.constructionAreaContainer.accessibleParagraph = CircuitConstructionKitCommonFluent.a11y.circuitDescription.constructionAreaStringProperty;

    // Get sensors from sensorLayer (voltmeters before ammeters), sorted by phetioIndex
    // to ensure consistent PDOM order regardless of scenery z-ordering
    const voltmeterNodes = circuitNode.sensorLayer.children
      .filter( child => child instanceof VoltmeterNode )
      .sort( ( a, b ) => a.voltmeter.phetioIndex - b.voltmeter.phetioIndex );

    const ammeterNodes = circuitNode.sensorLayer.children
      .filter( child => child instanceof AmmeterNode )
      .sort( ( a, b ) => a.ammeter.phetioIndex - b.ammeter.phetioIndex );

    // Clean up old group nodes before rebuilding
    this.cleanupGroupNodes( circuitNode );

    if ( !hasElements ) {

      circuitNode.unconnectedCircuitElementsSection.visible = false;

      // Even with no circuit elements, sensors should still be in Construction Area
      circuitNode.constructionAreaContainer.pdomOrder = [
        ...voltmeterNodes,
        ...ammeterNodes
      ];
    }
    else {

      // Avoid having the old PDOM element appearing twice as we rebuild things.
      circuitNode.unconnectedCircuitElementsSection.pdomOrder = [];
      circuitNode.constructionAreaContainer.pdomOrder = [];

      // Update single circuit elements section and collect brief names
      const singleElementsResult = this.updateSingleCircuitElements( singleElementCircuits, circuitNode );
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

      if ( circuitNode.unconnectedCircuitElementsSection.visible ) {
        constructionAreaPDOMOrder.push( circuitNode.unconnectedCircuitElementsSection );
      }
      constructionAreaPDOMOrder.push( ...groupNodes );
      this.myGroupNodes = groupNodes;

      // Add sensors to PDOM order (voltmeters before ammeters)
      constructionAreaPDOMOrder.push( ...voltmeterNodes, ...ammeterNodes );

      circuitNode.constructionAreaContainer.pdomOrder = constructionAreaPDOMOrder;
    }

    // Build main PDOM order (only constructionAreaContainer, sensorLayer children are handled above)
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
