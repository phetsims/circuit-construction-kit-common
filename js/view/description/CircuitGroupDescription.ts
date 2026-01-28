// Copyright 2026, University of Colorado Boulder

/**
 * CircuitGroupDescription provides summary descriptions for circuit groups and unconnected elements.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../../CircuitConstructionKitCommonFluent.js';
import CircuitDescriptionUtils from './CircuitDescriptionUtils.js';
import Circuit from '../../model/Circuit.js';
import CircuitElement from '../../model/CircuitElement.js';
import Vertex from '../../model/Vertex.js';

// Preferred ordering for component types in lists
const COMPONENT_TYPE_ORDER = [ 'battery', 'extremeBattery', 'resistor', 'extremeResistor', 'lightBulb', 'extremeLightBulb', 'capacitor', 'inductor', 'acSource', 'fuse', 'switch', 'wire' ];

export default class CircuitGroupDescription {

  /**
   * Creates a summary for the unconnected circuit elements section.
   * Example: "4 unconnected circuit components. 2 light bulbs and 2 wires."
   */
  public static getUnconnectedSectionSummary( elements: CircuitElement[] ): string {
    if ( elements.length === 0 ) {
      return '';
    }

    const componentList = this.formatComponentList( elements );

    return CircuitConstructionKitCommonFluent.a11y.circuitGroupDescription.unconnectedSummary.format( {
      count: elements.length,
      componentList: componentList
    } );
  }

  /**
   * Creates a summary for a connected group.
   * Example: "4 connected components: 2 batteries, 1 resistor and a wire. All connection points connected.
   *           Current is flowing through all circuit components."
   */
  public static getGroupSummary(
    group: { circuitElements: CircuitElement[]; vertices: Vertex[] },
    circuit: Circuit
  ): string {
    const elements = group.circuitElements;

    // Component list
    const componentList = this.formatComponentList( elements );
    const groupSummary = CircuitConstructionKitCommonFluent.a11y.circuitGroupDescription.groupSummary.format( {
      count: elements.length,
      componentList: componentList
    } );

    // Connection status
    const allConnected = this.areAllConnectionsComplete( group, circuit );
    const connectionStatus = CircuitConstructionKitCommonFluent.a11y.circuitGroupDescription.connectionStatus.format( {
      allConnected: allConnected ? 'true' : 'false'
    } );

    // Current flow status with rate information
    const showCurrent = circuit.showCurrentProperty.value;
    const { flowLevel, rateCount } = this.getCurrentFlowStatus( elements, showCurrent );
    const currentStatus = CircuitConstructionKitCommonFluent.a11y.circuitGroupDescription.currentFlowStatus.format( {
      flowLevel: flowLevel,
      rateCount: rateCount
    } );

    return `${groupSummary} ${connectionStatus} ${currentStatus}`;
  }

  /**
   * Formats a list of circuit elements by type.
   * Example: "2 batteries, 1 resistor and a wire"
   */
  private static formatComponentList( elements: CircuitElement[] ): string {
    // Count each description type
    const typeCounts = new Map<string, number>();
    elements.forEach( element => {
      const descriptionType = CircuitDescriptionUtils.getDescriptionType( element );
      const count = typeCounts.get( descriptionType ) || 0;
      typeCounts.set( descriptionType, count + 1 );
    } );

    // Build descriptions in preferred order
    const typeDescriptions: string[] = [];
    const orderedTypes = [ ...COMPONENT_TYPE_ORDER ];

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
          const typeLabel = CircuitDescriptionUtils.getCircuitElementTypeLabel( type );
          typeDescriptions.push( `1 ${typeLabel}` );
        }
        else {
          const pluralLabel = CircuitDescriptionUtils.getPluralTypeLabel( type );
          typeDescriptions.push( `${count} ${pluralLabel}` );
        }
      }
    } );

    // Join with commas and "and" before the last item
    if ( typeDescriptions.length === 1 ) {
      return typeDescriptions[ 0 ];
    }
    else if ( typeDescriptions.length === 2 ) {
      return CircuitConstructionKitCommonFluent.a11y.circuitDescription.listTwoItems.format( {
        first: typeDescriptions[ 0 ],
        second: typeDescriptions[ 1 ]
      } );
    }
    else {
      const lastType = typeDescriptions.pop()!;
      return typeDescriptions.join( ', ' ) + CircuitConstructionKitCommonFluent.a11y.circuitDescription.listFinalSeparator.format( {
        last: lastType
      } );
    }
  }

  /**
   * Checks if all vertices in a group have 2+ neighbor circuit elements (i.e., are connected).
   */
  private static areAllConnectionsComplete(
    group: { vertices: Vertex[] },
    circuit: Circuit
  ): boolean {
    return group.vertices.every( vertex =>
      circuit.getNeighborCircuitElements( vertex ).length >= 2
    );
  }

  /**
   * Determines the current flow status for a group of elements.
   * Returns both the flow level (all/some/none/notShown) and the count of distinct non-zero current rates.
   * A current value of 0 does not count toward the rate count.
   */
  private static getCurrentFlowStatus(
    elements: CircuitElement[],
    showCurrent: boolean
  ): { flowLevel: 'all' | 'some' | 'none' | 'notShown'; rateCount: number } {
    if ( !showCurrent ) {
      return { flowLevel: 'notShown', rateCount: 0 };
    }

    const elementsWithCurrent = elements.filter( element =>
      Math.abs( element.currentProperty.value ) > 1e-10
    );

    // Count distinct non-zero current magnitudes using tolerance-based comparison
    // to avoid roundoff/numerical noise. Only elements with non-zero current are compared.
    const CURRENT_TOLERANCE = 1e-4;
    const distinctCurrentMagnitudes: number[] = [];
    elementsWithCurrent.forEach( element => {
      const magnitude = Math.abs( element.currentProperty.value );
      // Check if this magnitude is distinct from all previously seen magnitudes
      const isDistinct = !distinctCurrentMagnitudes.some(
        existingMagnitude => Math.abs( magnitude - existingMagnitude ) < CURRENT_TOLERANCE
      );
      if ( isDistinct ) {
        distinctCurrentMagnitudes.push( magnitude );
      }
    } );
    const rateCount = distinctCurrentMagnitudes.length;

    if ( elementsWithCurrent.length === elements.length ) {
      return { flowLevel: 'all', rateCount: rateCount };
    }
    else if ( elementsWithCurrent.length > 0 ) {
      return { flowLevel: 'some', rateCount: rateCount };
    }
    return { flowLevel: 'none', rateCount: 0 };
  }
}

circuitConstructionKitCommon.register( 'CircuitGroupDescription', CircuitGroupDescription );
