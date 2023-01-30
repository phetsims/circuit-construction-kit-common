// Copyright 2020-2023, University of Colorado Boulder

/**
 * Guards against dragging immobile CircuitElementNodes and VertexNodes.
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { DragListener, DragListenerOptions, Node, PressListenerEvent } from '../../../scenery/js/imports.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Vertex from '../model/Vertex.js';
import CircuitNode from './CircuitNode.js';

export default class CircuitNodeDragListener extends DragListener {
  private readonly circuitNode: CircuitNode;
  private readonly vertexGetters: ( () => Vertex )[];

  /**
   * @param circuitNode
   * @param vertexGetters
   * @param [providedOptions]
   */
  public constructor( circuitNode: CircuitNode, vertexGetters: ( () => Vertex )[], providedOptions?: DragListenerOptions<DragListener> ) {
    super( providedOptions );

    this.circuitNode = circuitNode;
    this.vertexGetters = vertexGetters;
  }

  /**
   * Overrides press to add a side effect to mutate Vertex.isDragging.  Cannot use canStartPress instead due to this side
   * effect.
   * @param event
   * @param [targetNode] - If provided, will take the place of the targetNode for this call. Useful for
   *                              forwarded presses.
   * @param [callback] - to be run at the end of the function, but only on success
   */
  public override press( event: PressListenerEvent, targetNode: Node | undefined, callback: () => void ): boolean {

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