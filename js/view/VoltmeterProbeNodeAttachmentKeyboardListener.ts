// Copyright 2025, University of Colorado Boulder

/**
 * Keyboard listener that allows attaching a voltmeter probe to a vertex.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2Property from '../../../dot/js/Vector2Property.js';
import Text from '../../../scenery/js/nodes/Text.js';
import multiSelectionSoundPlayerFactory from '../../../tambo/js/multiSelectionSoundPlayerFactory.js';
import AttachmentKeyboardListener from './AttachmentKeyboardListener.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Vertex from '../model/Vertex.js';
import type CircuitNode from './CircuitNode.js';
import type Node from '../../../scenery/js/nodes/Node.js';

export default class VoltmeterProbeNodeAttachmentKeyboardListener extends AttachmentKeyboardListener<Vertex> {
  public constructor( probeNode: Node, circuitNode: CircuitNode, probePositionProperty: Vector2Property ) {
    const circuit = circuitNode.circuit;

    super( {
      triggerNode: probeNode,
      circuitNode: circuitNode,
      getItems: () => {
        const vertices = circuit.vertexGroup.filter( () => true );

        return vertices.map( vertex => {
          return {
            value: vertex as Vertex | null,
            createNode: () => new Text( circuitNode.getVertexNode( vertex ).attachmentName )
          };
        } );
      },
      getInitialPosition: () => probePositionProperty.value.copy(),
      getHighlightPosition: selectedVertex => selectedVertex ? selectedVertex.positionProperty.value : probePositionProperty.value,
      applySelection: ( _selection, targetPosition ) => {
        probePositionProperty.value = targetPosition.copy();
      },
      onItemFocused: ( value, index ) => {
        if ( value instanceof Vertex || value === null ) {
          const soundPlayer = multiSelectionSoundPlayerFactory.getSelectionSoundPlayer( index );
          soundPlayer.play();
        }
      }
    } );
  }
}

circuitConstructionKitCommon.register( 'VoltmeterProbeNodeAttachmentKeyboardListener', VoltmeterProbeNodeAttachmentKeyboardListener );
