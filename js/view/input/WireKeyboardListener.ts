// Copyright 2025, University of Colorado Boulder

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
import CCKCScreenView from '../CCKCScreenView.js';
import CircuitNode from '../CircuitNode.js';
import WireNode from '../WireNode.js';

export default class WireKeyboardListener extends SoundKeyboardDragListener {

  public constructor(
    circuitElementNode: WireNode,
    circuitNode: CircuitNode,
    screenView: CCKCScreenView,
    tandem: Tandem ) {
    const wire = circuitElementNode.circuitElement;

    let initialPoint: Vector2 | null = null;
    let latestPoint: Vector2 | null = null;
    let dragged = false;

    super( {

      // TODO: Some duplication with DragListener, see https://github.com/phetsims/circuit-construction-kit-common/issues/1034
      start: () => {
        if ( wire.interactiveProperty.get() ) {

          initialPoint = circuitElementNode.globalBounds.center;
          latestPoint = circuitElementNode.globalBounds.center;

          // Start drag by starting a drag on start and end vertices
          circuitNode.startDragVertex( latestPoint, wire.startVertexProperty.get(), wire );
          circuitNode.startDragVertex( latestPoint, wire.endVertexProperty.get(), wire );
          dragged = false;
        }
      },
      drag: ( _event, listener ) => {
        if ( wire.interactiveProperty.get() ) {

          // get the global delta, so that the drag speed will be the same no matter the size of the window.
          // see https://github.com/phetsims/circuit-construction-kit-common/issues/1059
          const delta = circuitElementNode.localToGlobalDelta( listener.modelDelta );

          latestPoint!.addXY( delta.x, delta.y );

          // Drag by translating both of the vertices
          circuitNode.dragVertex( latestPoint!, wire.startVertexProperty.get(), false );
          circuitNode.dragVertex( latestPoint!, wire.endVertexProperty.get(), false );
          dragged = true;
        }
      },
      end: () => {
        circuitElementNode.endDrag( circuitElementNode, [
          wire.startVertexProperty.get(),
          wire.endVertexProperty.get()
        ], screenView, circuitNode, initialPoint!, latestPoint!, dragged, false );
      },

      dragSpeed: CCKCConstants.KEYBOARD_DRAG_SPEED,
      shiftDragSpeed: CCKCConstants.SHIFT_KEYBOARD_DRAG_SPEED,
      tandem: tandem
    } );
  }
}

circuitConstructionKitCommon.register( 'WireKeyboardListener', WireKeyboardListener );