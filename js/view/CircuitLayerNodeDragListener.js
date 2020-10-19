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
    this.circuitLayerNode = circuitLayerNode;
    this.vertexGetters = vertexGetters;
  }

  // @public
  // @override
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