// Copyright 2020-2025, University of Colorado Boulder

/**
 * Movement and interaction for CircuitNodes via keyboard input.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import SoundKeyboardDragListener from '../../../../scenery-phet/js/SoundKeyboardDragListener.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import CCKCConstants from '../../CCKCConstants.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitNode from '../CircuitNode.js';
import VertexNode from '../VertexNode.js';

export default class VertexKeyboardListener extends SoundKeyboardDragListener {

  public constructor(
    vertexNode: VertexNode,
    circuitNode: CircuitNode
  ) {

    const vertex = vertexNode.vertex;

    let initialPoint: Vector2 | null = null;
    let latestPoint: Vector2 | null = null;
    let dragged = false;

    super( {

      // TODO: Some duplication with DragListener, see https://github.com/phetsims/circuit-construction-kit-common/issues/1034
      start: () => {
        initialPoint = vertexNode.globalBounds.center.copy();
        latestPoint = vertexNode.globalBounds.center.copy();
        circuitNode.startDragVertex( initialPoint, vertex, vertex );
        dragged = false;
      },
      drag: ( _event, listener ) => {

        latestPoint!.addXY( listener.modelDelta.x, listener.modelDelta.y );
        dragged = true;
        circuitNode.dragVertex( latestPoint!, vertex, true );
      },
      end: () => {

        // The vertex can only connect to something if it was actually moved.
        circuitNode.endDrag( vertex, dragged );

        // Only show on a tap, not on every drag.
        if (
          !vertex.isDisposed &&
          vertex.interactiveProperty.get() &&
          latestPoint!.distance( initialPoint! ) < CCKCConstants.TAP_THRESHOLD
        ) {

          vertex.selectionProperty.value = vertex;
        }
      },

      dragSpeed: 300,
      shiftDragSpeed: 20,
      tandem: Tandem.OPT_OUT
    } );
  }
}

circuitConstructionKitCommon.register( 'VertexKeyboardListener', VertexKeyboardListener );