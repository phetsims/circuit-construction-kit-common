// Copyright 2025-2026, University of Colorado Boulder

/**
 * Keyboard listener that allows attaching an ammeter probe to the centroid of a circuit element.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type TProperty from '../../../../axon/js/TProperty.js';
import { toFixed } from '../../../../dot/js/util/toFixed.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import type Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../../CircuitConstructionKitCommonFluent.js';
import type Ammeter from '../../model/Ammeter.js';
import CircuitElement from '../../model/CircuitElement.js';
import type CircuitNode from '../CircuitNode.js';
import CircuitDescription from '../description/CircuitDescription.js';
import AttachmentKeyboardListener from './AttachmentKeyboardListener.js';

export default class AmmeterProbeNodeAttachmentKeyboardListener extends AttachmentKeyboardListener<CircuitElement> {
  public constructor( probeNode: Node, circuitNode: CircuitNode, probePositionProperty: TProperty<Vector2>, ammeter: Ammeter ) {
    const circuit = circuitNode.circuit;

    const getItems = () => {
      const circuitElements = CircuitDescription.getOrderedCircuitElements( circuit );

      return circuitElements.map( circuitElement => {
        return {
          value: circuitElement as CircuitElement | null,
          createNode: () => {

            // Use the brief measurement name (e.g., "Battery 1", "Wire 2") set by CircuitDescription
            let displayText = circuitNode.getCircuitElementNode( circuitElement ).measurementName;

            // Add group prefix if the element is in a multi-element group
            const groupIndex = CircuitDescription.getGroupIndex( circuit, circuitElement );
            if ( groupIndex !== null ) {
              displayText = CircuitConstructionKitCommonFluent.a11y.circuitDescription.groupWithConnection.format( {
                groupIndex: groupIndex,
                description: displayText
              } );
            }

            return new Text( displayText );
          }
        };
      } );
    };

    super( {
      triggerNode: probeNode,
      circuitNode: circuitNode,
      getItems: getItems,
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
      onOpen: () => {
        circuitNode.anyProbeActivated = true;
        circuitNode.probeGrabReleaseCueNode.visible = false;
        circuitNode.showProbeSelectionHighlight( probeNode );
      },
      onClose: () => {
        circuitNode.hideProbeSelectionHighlight();
      },
      onCancel: () => {
        circuitNode.hideProbeSelectionHighlight();
      },
      onSelectionApplied: () => {

        // Announce the current reading after the probe is moved
        const current = ammeter.currentProperty.value;
        const contextResponse = current === null ?
                                CircuitConstructionKitCommonFluent.a11y.ammeterNode.noReadingStringProperty :
                                CircuitConstructionKitCommonFluent.a11y.ammeterNode.currentAmps.format( {
                                  current: toFixed( Math.abs( current ), 2 )
                                } );
        probeNode.addAccessibleContextResponse( contextResponse );
      },

      noItemsContextResponse: CircuitConstructionKitCommonFluent.a11y.attachmentKeyboardListener.nothingToMeasureStringProperty
    } );
  }
}

circuitConstructionKitCommon.register( 'AmmeterProbeNodeAttachmentKeyboardListener', AmmeterProbeNodeAttachmentKeyboardListener );
