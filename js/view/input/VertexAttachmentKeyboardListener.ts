// Copyright 2025-2026, University of Colorado Boulder

/**
 * Keyboard listener that allows attaching a vertex to another attachable vertex.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Text from '../../../../scenery/js/nodes/Text.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import Vertex from '../../model/Vertex.js';
import type CircuitNode from '../CircuitNode.js';
import CircuitDescription from '../description/CircuitDescription.js';
import VertexNode from '../VertexNode.js';
import AttachmentKeyboardListener from './AttachmentKeyboardListener.js';

export default class VertexAttachmentKeyboardListener extends AttachmentKeyboardListener<Vertex> {
  public constructor( vertexNode: VertexNode, circuitNode: CircuitNode, vertex: Vertex ) {
    const circuit = circuitNode.circuit;

    const getItems = () => {
      const orderedVertices = CircuitDescription.getOrderedVertices( circuit );
      const neighborVertices = circuit.getNeighboringVertices( vertex );
      const attachableVertices = orderedVertices.filter( v => v.attachableProperty.get() &&
                                                              v !== vertex &&
                                                              !neighborVertices.includes( v ) &&
                                                              !circuit.findAllFixedVertices( vertex ).includes( v ) &&

                                                              // A wire vertex cannot double connect to an object, creating a tiny short circuit
                                                              _.intersection( circuit.getNeighboringVertices( v ), neighborVertices ).length === 0 );

      return attachableVertices.map( attachableVertex => {
        return {
          value: attachableVertex as Vertex | null,
          createNode: () => new Text( circuitNode.getVertexNode( attachableVertex ).attachmentName )
        };
      } );
    };
    super( {
      triggerNode: vertexNode,
      circuitNode: circuitNode,
      getItems: getItems,
      getInitialPosition: () => vertex.positionProperty.value.copy(),
      getHighlightPosition: selectedVertex => selectedVertex ? selectedVertex.positionProperty.value : vertex.positionProperty.value,
      applySelection: ( _selection, targetPosition ) => {
        const dropPosition = targetPosition.copy();
        circuitNode.dragVertex( vertexNode.parentToGlobalPoint( dropPosition ), vertex, true );
        circuitNode.endDrag( vertex, true );

        // When attaching with the keyboard, the vertex is supposed to be selected when the combo box opens and deselected after a successful attachment.
        // See
        if ( circuitNode.circuit.selectionProperty.value === vertex ) {
          circuitNode.circuit.selectionProperty.value = null;
        }
      },
      onOpen: () => {
        vertex.hasBeenKeyboardActivated = true;

        circuitNode.vertexAttachmentListenerCount++;
        circuitNode.circuit.selectionProperty.value = vertexNode.vertex;
        circuitNode.vertexAttachmentListenerCount--;
        circuitNode.startDragVertex( vertexNode.parentToGlobalPoint( vertex.positionProperty.value ), vertex, vertex );
      },
      targetDisposeEmitter: vertex.disposeEmitter,

      // Prefer vertices in the same group as the selected vertex
      getPreferredInitialValue: availableItems => {
        const sameGroupVertices = circuit.findAllConnectedVertices( vertex );
        const sameGroupItem = availableItems.find( item => item.value && sameGroupVertices.includes( item.value ) );
        return sameGroupItem?.value ?? null;
      }
    } );

    // Change the accessible role description based on whether there are any attachable vertices, see https://github.com/phetsims/circuit-construction-kit-common/issues/1129#issuecomment-3666436903
    circuit.circuitChangedEmitter.addListener( () => {
      const items = getItems();

      if ( items.length === 0 ) {
        vertexNode.accessibleRoleDescription = 'movable';
      }
      else {
        vertexNode.accessibleRoleDescription = 'connection options button'; // see https://github.com/phetsims/circuit-construction-kit-common/issues/1083
      }
    } );
  }
}

circuitConstructionKitCommon.register( 'VertexAttachmentKeyboardListener', VertexAttachmentKeyboardListener );
