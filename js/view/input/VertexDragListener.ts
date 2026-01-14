// Copyright 2025-2026, University of Colorado Boulder

/**
 * Movement and interaction for a Vertex via pointer drag input.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import type SceneryEvent from '../../../../scenery/js/input/SceneryEvent.js';
import sharedSoundPlayers from '../../../../tambo/js/sharedSoundPlayers.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import CCKCConstants from '../../CCKCConstants.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitNode from '../CircuitNode.js';
import VertexNode from '../VertexNode.js';
import CircuitNodeDragListener from './CircuitNodeDragListener.js';

export default class VertexDragListener extends CircuitNodeDragListener {

  public constructor(
    vertexNode: VertexNode,
    circuitNode: CircuitNode,
    tandem: Tandem
  ) {

    const vertex = vertexNode.vertex;

    let initialPoint: Vector2 | null = null;
    let latestPoint: Vector2 | null = null;
    let dragged = false;

    super( circuitNode, [ () => vertex ], {
      tandem: tandem,
      start: ( event: SceneryEvent ) => {
        sharedSoundPlayers.get( 'grab' ).play();
        initialPoint = event.pointer.point;
        latestPoint = event.pointer.point.copy();
        circuitNode.startDragVertex( event.pointer.point, vertex, vertex );
        dragged = false;
      },
      drag: ( event: SceneryEvent ) => {
        latestPoint = event.pointer.point.copy();
        dragged = true;
        circuitNode.dragVertex( event.pointer.point, vertex, true );
      },
      end: () => {

        sharedSoundPlayers.get( 'release' ).play();

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
      }
    } );
  }
}
circuitConstructionKitCommon.register( 'VertexDragListener', VertexDragListener );