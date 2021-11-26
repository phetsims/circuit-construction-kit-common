// Copyright 2020-2021, University of Colorado Boulder

/**
 * Guards against dragging immobile CircuitElementNodes and VertexNodes.
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { SceneryEvent } from '../../../scenery/js/imports.js';
import { DragListener } from '../../../scenery/js/imports.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Vertex from '../model/Vertex.js';
import CircuitLayerNode from './CircuitLayerNode.js';

class CircuitLayerNodeDragListener extends DragListener {
  private readonly circuitLayerNode: CircuitLayerNode;
  private readonly vertexGetters: ( () => Vertex )[];

  /**
   * @param {CircuitLayerNode} circuitLayerNode
   * @param {function[]} vertexGetters
   * @param {Object} [providedOptions]
   */
  constructor( circuitLayerNode: CircuitLayerNode, vertexGetters: ( () => Vertex )[], providedOptions?: any ) {
    super( providedOptions );

    // @private
    this.circuitLayerNode = circuitLayerNode;
    this.vertexGetters = vertexGetters;
  }

  /**
   * Overrides press to add a side effect to mutate Vertex.isDragging.  Cannot use canStartPress instead due to this side
   * effect.
   * @param {SceneryEvent} event
   * @param {Node} [targetNode] - If provided, will take the place of the targetNode for this call. Useful for
   *                              forwarded presses.
   * @param {function} [callback] - to be run at the end of the function, but only on success
   * @returns {boolean}
   * @public
   * @override
   */
  // @ts-ignore
  press( event: SceneryEvent, targetNode: Node | undefined, callback: () => void ) {

    const vertices = this.vertexGetters.map( vertexGetter => vertexGetter() );

    const allVerticesDraggable = _.every( vertices, vertex => this.circuitLayerNode.canDragVertex( vertex ) );
    if ( allVerticesDraggable ) {

      // @ts-ignore
      const success = super.press( event, targetNode, callback );

      if ( success ) {
        vertices.forEach( vertex => this.circuitLayerNode.setVerticesDragging( vertex ) );
        return true;
      }
    }
    return false;
  }
}

circuitConstructionKitCommon.register( 'CircuitLayerNodeDragListener', CircuitLayerNodeDragListener );
export default CircuitLayerNodeDragListener;