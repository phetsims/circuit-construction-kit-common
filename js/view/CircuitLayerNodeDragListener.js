// Copyright 2020, University of Colorado Boulder

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
   * @param {SceneryEvent} event
   * @param {Node} [targetNode] - If provided, will take the place of the targetNode for this call. Useful for
   *                              forwarded presses.
   * @param {function} [callback] - to be run at the end of the function, but only on success
   * @returns {boolean}
   * @public
   * @override
   */
  //REVIEW: I don't know why we're overriding press, can we use canStartPress instead?
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