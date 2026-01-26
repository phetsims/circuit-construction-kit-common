// Copyright 2020-2025, University of Colorado Boulder

/**
 * Common behavior for DragListener that may pull other vertices along with it.
 * Guards against dragging immobile CircuitElementNodes and VertexNodes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DragListener, { type DragListenerOptions } from '../../../../scenery/js/listeners/DragListener.js';
import { type PressListenerEvent } from '../../../../scenery/js/listeners/PressListener.js';
import type Node from '../../../../scenery/js/nodes/Node.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import type Vertex from '../../model/Vertex.js';
import type CircuitNode from '../CircuitNode.js';

export default abstract class CircuitNodeDragListener extends DragListener {

  protected constructor(
    private readonly circuitNode: CircuitNode,
    private readonly vertexGetters: ( () => Vertex )[],
    providedOptions?: DragListenerOptions
  ) {
    super( providedOptions );
  }

  /**
   * Overrides press to add a side effect to mutate Vertex.isDragging.  Cannot use canStartPress instead due to this side
   * effect.
   * @param event
   * @param [targetNode] - If provided, will take the place of the targetNode for this call. Useful for
   *                              forwarded presses.
   * @param [callback] - to be run at the end of the function, but only on success
   */
  public override press( event: PressListenerEvent, targetNode?: Node, callback?: () => void ): boolean {

    const vertices = this.vertexGetters.map( vertexGetter => vertexGetter() );

    const allVerticesDraggable = _.every( vertices, vertex => this.circuitNode.canDragVertex( vertex ) );
    if ( allVerticesDraggable ) {

      const success = super.press( event, targetNode, callback );

      if ( success ) {
        vertices.forEach( vertex => this.circuitNode.setVerticesDragging( vertex ) );
        return true;
      }
    }
    return false;
  }
}

circuitConstructionKitCommon.register( 'CircuitNodeDragListener', CircuitNodeDragListener );