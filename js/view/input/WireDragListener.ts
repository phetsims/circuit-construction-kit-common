// Copyright 2025, University of Colorado Boulder

/**
 * Movement and interaction for WireNode via drag input.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import type SceneryEvent from '../../../../scenery/js/input/SceneryEvent.js';
import sharedSoundPlayers from '../../../../tambo/js/sharedSoundPlayers.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CCKCScreenView from '../CCKCScreenView.js';
import CircuitNode from '../CircuitNode.js';
import WireNode from '../WireNode.js';
import CircuitNodeDragListener from './CircuitNodeDragListener.js';

export default class WireDragListener extends CircuitNodeDragListener {

  public constructor(
    wireNode: WireNode,
    circuitNode: CircuitNode,
    screenView: CCKCScreenView,
    tandem: Tandem
  ) {

    const wire = wireNode.circuitElement;

    // Keep track of the start point to see if it was dragged or tapped to be selected
    let initialPoint: Vector2 | null = null;
    let latestPoint: Vector2 | null = null;

    // Keep track of whether it was dragged
    let dragged = false;

    super( circuitNode, [
        () => wire.startVertexProperty.get(),
        () => wire.endVertexProperty.get()
      ], {
        tandem: tandem,
        start: ( event: SceneryEvent ) => {
          if ( wire.interactiveProperty.get() ) {

            sharedSoundPlayers.get( 'grab' ).play();

            // Start drag by starting a drag on start and end vertices
            circuitNode.startDragVertex( event.pointer.point, wire.startVertexProperty.get(), wire );
            circuitNode.startDragVertex( event.pointer.point, wire.endVertexProperty.get(), wire );
            dragged = false;
            initialPoint = event.pointer.point.copy();
            latestPoint = event.pointer.point.copy();
          }
        },
        drag: ( event: SceneryEvent ) => {
          if ( wire.interactiveProperty.get() ) {

            latestPoint = event.pointer.point.copy();

            // Drag by translating both of the vertices
            circuitNode.dragVertex( event.pointer.point, wire.startVertexProperty.get(), false );
            circuitNode.dragVertex( event.pointer.point, wire.endVertexProperty.get(), false );
            dragged = true;
          }
        },
        end: () => {
          sharedSoundPlayers.get( 'release' ).play();
          wireNode.endDrag( wireNode, [
            wire.startVertexProperty.get(),
            wire.endVertexProperty.get()
          ], screenView, circuitNode, initialPoint!, latestPoint!, dragged, true );
        }
      }
    );
  }
}

circuitConstructionKitCommon.register( 'WireDragListener', WireDragListener );