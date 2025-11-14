// Copyright 2025, University of Colorado Boulder

/**
 * Movement and interaction for CircuitNodes via keyboard input.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import SoundKeyboardDragListener from '../../../../scenery-phet/js/SoundKeyboardDragListener.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitElement from '../../model/CircuitElement.js';
import CCKCScreenView from '../CCKCScreenView.js';
import CircuitNode from '../CircuitNode.js';
import FixedCircuitElementNode from '../FixedCircuitElementNode.js';

export default class FixedCircuitElementKeyboardListener extends SoundKeyboardDragListener {

  public constructor(
    circuitElementNode: FixedCircuitElementNode,
    circuitNode: CircuitNode,
    screenView: CCKCScreenView,
    tandem: Tandem ) {
    const circuitElement: CircuitElement = circuitElementNode.circuitElement;
    const vertexGetters = [ () => circuitElement.endVertexProperty.get() ];

    let initialPosition: Vector2 | null = null;
    let position: Vector2 | null = null;
    let dragged = false;

    super( {

      // TODO: Some duplication with DragListener, see https://github.com/phetsims/circuit-construction-kit-common/issues/1034
      start: () => {

        const vertices = vertexGetters.map( vertexGetter => vertexGetter() );

        const allVerticesDraggable = _.every( vertices, vertex => circuitNode.canDragVertex( vertex ) );
        if ( allVerticesDraggable && circuitElement.interactiveProperty.value ) {
          vertices.forEach( vertex => circuitNode.setVerticesDragging( vertex ) );

          circuitElementNode.moveToFront();
          position = circuitElementNode.globalBounds.center;
          initialPosition = position.copy();
          circuitNode.startDragVertex( position, circuitElement.endVertexProperty.get(), circuitElement );
          dragged = false;
        }

      },
      drag: ( _event, listener ) => {

        position!.addXY( listener.modelDelta.x, listener.modelDelta.y );
        if ( circuitElement.interactiveProperty.get() ) {
          circuitNode.dragVertex( position!, circuitElement.endVertexProperty.get(), false );
        }

        dragged = true;
      },
      end: () => {
        circuitElementNode.endDrag( circuitElementNode.contentNode, [ circuitElement.endVertexProperty.get() ],
          screenView, circuitNode, initialPosition!, position!, dragged, false );
      },

      dragSpeed: 300,
      shiftDragSpeed: 20,
      tandem: tandem
    } );
  }
}

circuitConstructionKitCommon.register( 'FixedCircuitElementKeyboardListener', FixedCircuitElementKeyboardListener );