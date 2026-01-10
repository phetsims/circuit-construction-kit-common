// Copyright 2025-2026, University of Colorado Boulder

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

      start: () => {

        vertex.isKeyboardDragging = true;

        initialPoint = vertexNode.globalBounds.center.copy();
        latestPoint = vertexNode.globalBounds.center.copy();
        circuitNode.startDragVertex( initialPoint, vertex, vertex );
        
        dragged = false;
      },
      drag: ( _event, listener ) => {
        
        dragged = true;

        // get the global delta, so that the drag speed will be the same no matter the size of the window.
        // see https://github.com/phetsims/circuit-construction-kit-common/issues/1059
        const delta = vertexNode.localToGlobalDelta( listener.modelDelta );

        latestPoint!.addXY( delta.x, delta.y );
        circuitNode.dragVertex( latestPoint!, vertex, true );
      },
      end: () => {

        vertex.isKeyboardDragging = false;

        // The vertex can only connect to something if it was actually moved.
        circuitNode.endDrag( vertex, dragged );

        dragged = false;
      },

      dragSpeed: CCKCConstants.KEYBOARD_DRAG_SPEED,
      shiftDragSpeed: CCKCConstants.SHIFT_KEYBOARD_DRAG_SPEED,
      tandem: Tandem.OPT_OUT
    } );
  }
}

circuitConstructionKitCommon.register( 'VertexKeyboardListener', VertexKeyboardListener );