// Copyright 2025-2026, University of Colorado Boulder

/**
 * Keyboard listener that allows attaching a voltmeter probe to a vertex.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { toFixed } from '../../../../dot/js/util/toFixed.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import type Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../../CircuitConstructionKitCommonFluent.js';
import Vertex from '../../model/Vertex.js';
import type Voltmeter from '../../model/Voltmeter.js';
import type CircuitNode from '../CircuitNode.js';
import CircuitDescription from '../description/CircuitDescription.js';
import AttachmentKeyboardListener from './AttachmentKeyboardListener.js';

export default class VoltmeterProbeNodeAttachmentKeyboardListener extends AttachmentKeyboardListener<Vertex> {

  public constructor( probeNode: Node, circuitNode: CircuitNode, probePositionProperty: Vector2Property, voltmeter: Voltmeter ) {
    const circuit = circuitNode.circuit;

    const getItems = () => {
      const vertices = CircuitDescription.getOrderedVertices( circuit );

      return vertices.map( vertex => {
        return {
          value: vertex as Vertex | null,
          createNode: () => new Text( circuitNode.getVertexNode( vertex ).attachmentName )
        };
      } );
    };

    super( {
      triggerNode: probeNode,
      circuitNode: circuitNode,
      getItems: getItems,
      getInitialPosition: () => probePositionProperty.value.copy(),
      getHighlightPosition: selectedVertex => selectedVertex ? selectedVertex.positionProperty.value : probePositionProperty.value,
      applySelection: ( _selection, targetPosition ) => {
        probePositionProperty.value = targetPosition.copy();
      },
      onOpen: () => {
        circuitNode.showProbeSelectionHighlight( probeNode );
      },
      onClose: () => {
        circuitNode.hideProbeSelectionHighlight();
      },
      onCancel: () => {
        circuitNode.hideProbeSelectionHighlight();
      },
      onSelectionApplied: () => {

        // Announce the voltage reading after the probe is moved
        const voltage = voltmeter.voltageProperty.value;
        const contextResponse = voltage === null ?
                                CircuitConstructionKitCommonFluent.a11y.voltmeterNode.noReadingStringProperty :
                                CircuitConstructionKitCommonFluent.a11y.voltmeterNode.voltageVolts.format( {
                                  voltage: toFixed( voltage, 2 )
                                } );
        probeNode.addAccessibleContextResponse( contextResponse );
      }
    } );

    // Change the accessible role description based on whether there are any attachment options.
    // Only listen to topology changes (not position/property changes) for performance.
    const updateRoleDescription = () => {
      const items = getItems();
      probeNode.accessibleRoleDescription = items.length === 0 ? 'movable' : 'measurement options button';
    };

    // Listen ONLY to topology changes (not position/property changes). Whenever a circuit element is created/disposed, it changes
    // the vertex count, and whenever a circuit element is cut/connected, it creates or disposes vertices. So this is sufficient to
    // keep the role description up to date.
    circuit.vertexGroup.elementCreatedEmitter.addListener( updateRoleDescription );
    circuit.vertexGroup.elementDisposedEmitter.addListener( updateRoleDescription );

    // Clean up when voltmeter is disposed
    voltmeter.disposeEmitter.addListener( () => {
      circuit.vertexGroup.elementCreatedEmitter.removeListener( updateRoleDescription );
      circuit.vertexGroup.elementDisposedEmitter.removeListener( updateRoleDescription );
    } );

    // Initial computation
    updateRoleDescription();
  }
}

circuitConstructionKitCommon.register( 'VoltmeterProbeNodeAttachmentKeyboardListener', VoltmeterProbeNodeAttachmentKeyboardListener );
