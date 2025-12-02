// Copyright 2025, University of Colorado Boulder

/**
 * Keyboard listener that allows attaching a vertex to another attachable vertex.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Text from '../../../../scenery/js/nodes/Text.js';
import AttachmentKeyboardListener from './AttachmentKeyboardListener.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import Vertex from '../../model/Vertex.js';
import type CircuitNode from '../CircuitNode.js';
import type Node from '../../../../scenery/js/nodes/Node.js';

export default class VertexAttachmentKeyboardListener extends AttachmentKeyboardListener<Vertex> {
  public constructor( vertexNode: Node, circuitNode: CircuitNode, vertex: Vertex ) {
    const circuit = circuitNode.circuit;

    super( {
      triggerNode: vertexNode,
      circuitNode: circuitNode,
      getItems: () => {
        const attachableVertices = circuit.vertexGroup.filter( v => v.attachableProperty.get() &&
                                                                    v !== vertex &&
                                                                    !circuit.getNeighboringVertices( vertex ).includes( v ) &&
                                                                    !circuit.findAllFixedVertices( vertex ).includes( v ) );

        return attachableVertices.map( attachableVertex => {
          return {
            value: attachableVertex as Vertex | null,
            createNode: () => new Text( circuitNode.getVertexNode( attachableVertex ).attachmentName )
          };
        } );
      },
      getInitialPosition: () => vertex.positionProperty.value.copy(),
      getHighlightPosition: selectedVertex => selectedVertex ? selectedVertex.positionProperty.value : vertex.positionProperty.value,
      applySelection: ( _selection, targetPosition ) => {
        const dropPosition = targetPosition.copy();
        circuitNode.dragVertex( vertexNode.parentToGlobalPoint( dropPosition ), vertex, true );
        circuitNode.endDrag( vertex, true );
      },
      onOpen: () => {
        circuitNode.startDragVertex( vertexNode.parentToGlobalPoint( vertex.positionProperty.value ), vertex, vertex );
      }
    } );
  }
}

circuitConstructionKitCommon.register( 'VertexAttachmentKeyboardListener', VertexAttachmentKeyboardListener );
