// Copyright 2025, University of Colorado Boulder

/**
 * Movement and interaction for FixedCircuitElementNodes via drag input.
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
import FixedCircuitElementNode from '../FixedCircuitElementNode.js';
import CircuitNodeDragListener from './CircuitNodeDragListener.js';

export default class FixedCircuitElementDragListener extends CircuitNodeDragListener {

  public constructor(
    circuitElementNode: FixedCircuitElementNode,
    circuitNode: CircuitNode,
    screenView: CCKCScreenView,
    tandem: Tandem
  ) {

    const circuitElement = circuitElementNode.circuitElement;

    // Use whatever the start node currently is (it can change), and let the circuit manage the dependent vertices
    let initialPoint: Vector2 | null = null;
    let latestPoint: Vector2 | null = null;
    let dragged = false;

    super( circuitNode, [ () => circuitElement.endVertexProperty.get() ], {
      start: ( event: SceneryEvent ) => {
        sharedSoundPlayers.get( 'grab' ).play();
        circuitElementNode.moveToFront();
        if ( event.pointer && event.pointer.point ) {
          initialPoint = event.pointer.point.copy();
          latestPoint = event.pointer.point.copy();
          circuitElement.interactiveProperty.get() && circuitNode.startDragVertex(
            event.pointer.point,
            circuitElement.endVertexProperty.get(),
            circuitElement
          );
          dragged = false;
        }
      },
      drag: ( event: SceneryEvent ) => {
        if ( event.pointer.point ) {
          latestPoint = event.pointer.point.copy();
          circuitElement.interactiveProperty.get() && circuitNode.dragVertex(
            event.pointer.point,
            circuitElement.endVertexProperty.get(),
            false
          );
          dragged = true;
        }
      },
      end: () => {
        sharedSoundPlayers.get( 'release' ).play();
        circuitElementNode.endDrag( circuitElementNode.contentNode, [ circuitElement.endVertexProperty.get() ], screenView, circuitNode,
          initialPoint!, latestPoint!, dragged, true );
      },
      tandem: tandem
    } );
  }
}

circuitConstructionKitCommon.register( 'FixedCircuitElementDragListener', FixedCircuitElementDragListener );