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
      },

      // Sort items by group number, then by connection number within each group
      sortItems: items => {
        return items.slice().sort( ( a, b ) => {
          const aNode = a.value ? circuitNode.getVertexNode( a.value ) : null;
          const bNode = b.value ? circuitNode.getVertexNode( b.value ) : null;

          const aGroup = aNode?.attachmentGroupIndex ?? 0;
          const bGroup = bNode?.attachmentGroupIndex ?? 0;
          const aConnection = aNode?.attachmentConnectionIndex ?? 0;
          const bConnection = bNode?.attachmentConnectionIndex ?? 0;

          // Items without group (groupIndex = 0) come first (disconnected terminals)
          if ( aGroup === 0 && bGroup === 0 ) { return 0; }
          if ( aGroup === 0 ) { return -1; }
          if ( bGroup === 0 ) { return 1; }

          // Sort by group number first
          if ( aGroup !== bGroup ) { return aGroup - bGroup; }

          // Then by connection number within group
          return aConnection - bConnection;
        } );
      }
    } );

    // Change the accessible role description based on whether there are any attachable vertices.
    // Only listen to topology changes (not position/property changes) for performance.
    // See https://github.com/phetsims/circuit-construction-kit-common/issues/1129#issuecomment-3666436903
    const updateRoleDescription = () => {
      const items = getItems();
      vertexNode.accessibleRoleDescription = items.length === 0 ? 'movable' : 'connection options button'; // see https://github.com/phetsims/circuit-construction-kit-common/issues/1083
    };

    // Listen ONLY to topology changes (not position/property changes). Whenever a circuit element is created/disposed, it changes
    // the vertex count, and whenever a circuit element is cut/connected, it creates or disposes vertices. So this is sufficient to
    // keep the role description up to date.
    circuit.vertexGroup.elementCreatedEmitter.addListener( updateRoleDescription );
    circuit.vertexGroup.elementDisposedEmitter.addListener( updateRoleDescription );

    // Clean up when vertex is disposed (fixes existing memory leak)
    vertex.disposeEmitter.addListener( () => {
      circuit.vertexGroup.elementCreatedEmitter.removeListener( updateRoleDescription );
      circuit.vertexGroup.elementDisposedEmitter.removeListener( updateRoleDescription );
    } );

    // Initial computation
    updateRoleDescription();
  }
}

circuitConstructionKitCommon.register( 'VertexAttachmentKeyboardListener', VertexAttachmentKeyboardListener );
