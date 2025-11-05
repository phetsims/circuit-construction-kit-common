// Copyright 2025, University of Colorado Boulder

/**
 * CircuitDescription provides descriptions for circuits.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Node from '../../../../scenery/js/nodes/Node.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitElement from '../../model/CircuitElement.js';
import CircuitElementType from '../../model/CircuitElementType.js';
import CircuitNode from '../CircuitNode.js';

const GROUPED_CIRCUIT_ELEMENT_TYPE_ORDER: CircuitElementType[] = [ 'battery', 'resistor', 'lightBulb', 'wire' ];
const CIRCUIT_ELEMENT_TYPE_LABELS: Partial<Record<CircuitElementType, string>> = {
  battery: 'Battery',
  resistor: 'Resistor',
  lightBulb: 'Light bulb',
  wire: 'Wire'
};

const getCircuitElementTypeLabel = ( type: CircuitElementType ): string => {
  const mappedLabel = CIRCUIT_ELEMENT_TYPE_LABELS[ type ];
  if ( mappedLabel ) {
    return mappedLabel;
  }
  const withSpaces = type.replace( /([A-Z])/g, ' $1' );
  return withSpaces.charAt( 0 ).toUpperCase() + withSpaces.slice( 1 );
};

const formatCircuitElementAccessibleName = ( type: CircuitElementType, position: number, total: number ): string => {
  const baseLabel = getCircuitElementTypeLabel( type );
  return total > 1 ? `${baseLabel} ${position} of ${total}` : baseLabel;
};

export default class CircuitDescription {
  public static updateCircuitNode( circuitNode: CircuitNode ): void {
    const circuit = circuitNode.circuit;
    const pdomOrder: Node[] = [];

    const groups = circuit.getGroups();

    const circuitElements = groups.filter( group => group.circuitElements.length === 1 ).map( group => group.circuitElements[ 0 ] );
    const multiples = groups.filter( group => group.circuitElements.length > 1 );

    const circuitElementsPDOMOrder: Node[] = [];
    const circuitElementsTypeCounts = new Map<CircuitElementType, number>();
    circuitElements.forEach( circuitElement => {
      const count = circuitElementsTypeCounts.get( circuitElement.type ) || 0;
      circuitElementsTypeCounts.set( circuitElement.type, count + 1 );
    } );
    const circuitElementsTypeIndices = new Map<CircuitElementType, number>();
    circuitElements.forEach( circuitElement => {
      const circuitElementNode = circuitNode.getCircuitElementNode( circuitElement );
      const type = circuitElement.type;
      const indexForType = ( circuitElementsTypeIndices.get( type ) || 0 ) + 1;
      circuitElementsTypeIndices.set( type, indexForType );
      const totalForType = circuitElementsTypeCounts.get( type ) || 0;
      circuitElementNode.accessibleName = formatCircuitElementAccessibleName( type, indexForType, totalForType );
      const vertexNode = circuitNode.getVertexNode( circuitElement.startVertexProperty.value );
      const vertexNode1 = circuitNode.getVertexNode( circuitElement.endVertexProperty.value );

      circuitElementsPDOMOrder.push( circuitElementNode, vertexNode, vertexNode1 );
    } );
    circuitNode.circuitElementsSection.pdomOrder = circuitElementsPDOMOrder;
    circuitNode.circuitElementsSection.visible = circuitElementsPDOMOrder.length > 0;

    pdomOrder.push( circuitNode.circuitElementsSection );

    circuitNode.groupsContainer.children.forEach( child => child.dispose() );
    circuitNode.groupsContainer.children = [];

    multiples.forEach( ( group, groupIndex ) => {
      const typeCounts = new Map<CircuitElementType, number>();
      group.circuitElements.forEach( circuitElement => {
        const count = typeCounts.get( circuitElement.type ) || 0;
        typeCounts.set( circuitElement.type, count + 1 );
      } );

      const typeIndices = new Map<CircuitElementType, number>();
      const sortedCircuitElements: CircuitElement[] = [];
      GROUPED_CIRCUIT_ELEMENT_TYPE_ORDER.forEach( type => {
        group.circuitElements.forEach( circuitElement => {
          if ( circuitElement.type === type ) {
            sortedCircuitElements.push( circuitElement );
          }
        } );
      } );
      group.circuitElements.forEach( circuitElement => {
        if ( !GROUPED_CIRCUIT_ELEMENT_TYPE_ORDER.includes( circuitElement.type ) ) {
          sortedCircuitElements.push( circuitElement );
        }
      } );

      const circuitElementNodes = sortedCircuitElements.map( circuitElement => {
        const node = circuitNode.getCircuitElementNode( circuitElement );
        const type = circuitElement.type;
        const indexForType = ( typeIndices.get( type ) || 0 ) + 1;
        typeIndices.set( type, indexForType );
        const totalForType = typeCounts.get( type ) || 0;
        node.accessibleName = formatCircuitElementAccessibleName( type, indexForType, totalForType );
        return node;
      } );

      const groupPDOMOrder: Node[] = [
        ...circuitElementNodes,
        ...group.vertices.map( vertex => circuitNode.getVertexNode( vertex ) )
      ];

      group.vertices.forEach( ( vertex, vertexIndex ) => {

        const neighbors = circuit.getNeighborCircuitElements( vertex );

        if ( neighbors.length === 1 ) {
          circuitNode.getVertexNode( vertex ).accessibleName = 'Junction ' + ( vertexIndex + 1 ) + ' of ' + group.vertices.length + ', disconnected';
        }
        else if ( neighbors.length === 2 ) {

          circuitNode.getVertexNode( vertex ).accessibleName = 'Junction ' + ( vertexIndex + 1 ) + ' of ' + group.vertices.length + ', connects ' + circuitNode.getCircuitElementNode( neighbors[ 0 ] ).accessibleName + ' to ' + circuitNode.getCircuitElementNode( neighbors[ 1 ] ).accessibleName;
        }
        else {
          circuitNode.getVertexNode( vertex ).accessibleName = 'Junction ' + ( vertexIndex + 1 ) + ' of ' + group.vertices.length + ', connects ' + neighbors.map( neighbor => circuitNode.getCircuitElementNode( neighbor ).accessibleName ).join( ', ' );
        }
      } );

      const groupNode = new Node( {
        tagName: 'div',
        accessibleHeading: `Group ${groupIndex + 1} of ${multiples.length}`,
        pdomOrder: _.uniq( groupPDOMOrder )
      } );
      circuitNode.groupsContainer.addChild( groupNode );
      pdomOrder.push( groupNode );

    } );

    pdomOrder.push( circuitNode.screenView.circuitElementEditContainerNode );

    // Light bulb somehow gives duplicates, so filter them out
    circuitNode.pdomOrder = pdomOrder;
  }
}

circuitConstructionKitCommon.register( 'CircuitDescription', CircuitDescription );