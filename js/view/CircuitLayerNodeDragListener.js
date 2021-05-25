// Copyright 2020-2021, University of Colorado Boulder

/**
 * Guards against dragging immobile CircuitElementNodes and VertexNodes.
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DragListener from '../../../scenery/js/listeners/DragListener.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

class CircuitLayerNodeDragListener extends DragListener {

  /**
   * @param {CircuitLayerNode} circuitLayerNode
   * @param {function[]} vertexGetters
   * @param {Object} [options]
   */
  constructor( circuitLayerNode, vertexGetters, options ) {
    super( options );

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
  press( event, targetNode, callback ) {

    const vertices = this.vertexGetters.map( vertexGetter => vertexGetter() );

    const allVerticesDraggable = _.every( vertices, vertex => this.circuitLayerNode.canDragVertex( vertex ) );
    if ( allVerticesDraggable ) {

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