// Copyright 2025-2026, University of Colorado Boulder

/**
 * Keyboard listener that allows attaching an ammeter probe to the centroid of a circuit element.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type TProperty from '../../../../axon/js/TProperty.js';
import type { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import type Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../../CircuitConstructionKitCommonFluent.js';
import CircuitElement from '../../model/CircuitElement.js';
import type CircuitNode from '../CircuitNode.js';
import CircuitDescription from '../description/CircuitDescription.js';
import AttachmentKeyboardListener from './AttachmentKeyboardListener.js';

export default class AmmeterProbeNodeAttachmentKeyboardListener extends AttachmentKeyboardListener<CircuitElement> {
  public constructor( probeNode: Node, circuitNode: CircuitNode, probePositionProperty: TProperty<Vector2> ) {
    const circuit = circuitNode.circuit;

    const getItems = () => {
      const circuitElements = CircuitDescription.getOrderedCircuitElements( circuit );

      return circuitElements.map( circuitElement => {
        return {
          value: circuitElement as CircuitElement | null,
          createNode: () => {
            const accessibleNameOrProperty = circuitNode.getCircuitElementNode( circuitElement ).accessibleName;

            // Get the string value from either the property or directly
            let displayText: string;
            if ( typeof accessibleNameOrProperty === 'string' ) {
              displayText = accessibleNameOrProperty;
            }
            else if ( accessibleNameOrProperty && typeof ( accessibleNameOrProperty as TReadOnlyProperty<string> ).value === 'string' ) {
              displayText = ( accessibleNameOrProperty as TReadOnlyProperty<string> ).value;
            }
            else {
              displayText = circuitElement.type;
            }

            // Remove "of N" pattern (e.g., "Battery 1 of 2" -> "Battery 1")
            displayText = displayText.replace( / of \d+/g, '' );

            // Add group prefix if the element is in a multi-element group
            const groupIndex = CircuitDescription.getGroupIndex( circuit, circuitElement );
            if ( groupIndex !== null ) {
              const groupLabel = CircuitConstructionKitCommonFluent.a11y.circuitDescription.groupStringProperty.value;
              displayText = `${groupLabel} ${groupIndex}, ${displayText}`;
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
        circuitNode.showProbeSelectionHighlight( probeNode );
      },
      onClose: () => {
        circuitNode.hideProbeSelectionHighlight();
      },
      onCancel: () => {
        circuitNode.hideProbeSelectionHighlight();
      }
    } );

    // Change the accessible role description based on whether there are any attachment options
    circuit.circuitChangedEmitter.addListener( () => {
      const items = getItems();

      if ( items.length === 0 ) {
        probeNode.accessibleRoleDescription = 'movable';
      }
      else {
        probeNode.accessibleRoleDescription = 'measurement options button';
      }
    } );
  }
}

circuitConstructionKitCommon.register( 'AmmeterProbeNodeAttachmentKeyboardListener', AmmeterProbeNodeAttachmentKeyboardListener );
