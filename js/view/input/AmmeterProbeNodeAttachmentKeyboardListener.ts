// Copyright 2025, University of Colorado Boulder

/**
 * Keyboard listener that allows attaching an ammeter probe to the centroid of a circuit element.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type TProperty from '../../../../axon/js/TProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import type Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import multiSelectionSoundPlayerFactory from '../../../../tambo/js/multiSelectionSoundPlayerFactory.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitElement from '../../model/CircuitElement.js';
import type CircuitNode from '../CircuitNode.js';
import CircuitDescription from '../description/CircuitDescription.js';
import AttachmentKeyboardListener from './AttachmentKeyboardListener.js';

export default class AmmeterProbeNodeAttachmentKeyboardListener extends AttachmentKeyboardListener<CircuitElement> {
  public constructor( probeNode: Node, circuitNode: CircuitNode, probePositionProperty: TProperty<Vector2>, highlightNode: Node ) {
    const circuit = circuitNode.circuit;

    super( {
      triggerNode: probeNode,
      circuitNode: circuitNode,
      getItems: () => {
        const circuitElements = CircuitDescription.getOrderedCircuitElements( circuit );

        return circuitElements.map( circuitElement => {
          return {
            value: circuitElement as CircuitElement | null,
            createNode: () => {
              const accessibleName = circuitNode.getCircuitElementNode( circuitElement ).accessibleName || circuitElement.type;
              return new Text( accessibleName );
            }
          };
        } );
      },
      getInitialPosition: () => probeNode.center.copy(),
      getHighlightPosition: selectedCircuitElement => selectedCircuitElement ?
                              Vector2.average( [
                                selectedCircuitElement.startVertexProperty.value.positionProperty.value,
                                selectedCircuitElement.endVertexProperty.value.positionProperty.value
                              ] ) :
                              probeNode.center.copy(),
      applySelection: ( _selection, targetPosition ) => {
        const centerOffset = probeNode.center.minus( probeNode.centerTop );
        const verticalFudge = -5; // pixels to move the probe so its center visually aligns with the target
        const dropPosition = targetPosition.copy().minus( centerOffset ).plusXY( 0, -verticalFudge );
        probePositionProperty.value = dropPosition;
      },
      onItemFocused: ( value, index ) => {
        if ( value instanceof CircuitElement || value === null ) {
          const soundPlayer = multiSelectionSoundPlayerFactory.getSelectionSoundPlayer( index );
          soundPlayer.play();
        }
      },
      onOpen: () => {
        highlightNode.visible = true;
      },
      onClose: () => {
        highlightNode.visible = false;
      },
      onCancel: () => {
        highlightNode.visible = false;
      }
    } );
  }
}

circuitConstructionKitCommon.register( 'AmmeterProbeNodeAttachmentKeyboardListener', AmmeterProbeNodeAttachmentKeyboardListener );
