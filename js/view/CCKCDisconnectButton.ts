// Copyright 2025, University of Colorado Boulder

/**
 * CCKCDisconnectButton is a round push button with scissors icon that appears in the circuit element edit panel.
 * When pressed, it disconnects the selected circuit element from neighboring circuit elements by creating new
 * vertices and moving the element 50px down and 50px right.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Path from '../../../scenery/js/nodes/Path.js';
import scissorsShape from '../../../sherpa/js/fontawesome-4/scissorsShape.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import Battery from '../model/Battery.js';
import Capacitor from '../model/Capacitor.js';
import type Circuit from '../model/Circuit.js';
import CircuitElement from '../model/CircuitElement.js';
import Inductor from '../model/Inductor.js';
import Resistor from '../model/Resistor.js';
import CCKCRoundPushButton from './CCKCRoundPushButton.js';

// Offset to move the disconnected element (in view coordinates)
const DISCONNECT_OFFSET = new Vector2( 50, 50 );

export default class CCKCDisconnectButton extends CCKCRoundPushButton {

  public constructor( circuit: Circuit, tandem: Tandem ) {

    const scissorsIcon = new Path( scissorsShape, {
      fill: 'black',
      rotation: -Math.PI / 2, // scissors point up

      // Make the same size as the delete button
      maxWidth: 28
    } );

    // The button is enabled when the selected circuit element is connected to other elements
    const enabledProperty = new DerivedProperty( [ circuit.selectionProperty ], selection => {
      if ( selection instanceof CircuitElement ) {
        // isSingle returns true when the element is NOT connected to anything else
        return !circuit.isSingle( selection );
      }
      return false;
    } );

    super( {
      accessibleName: CircuitConstructionKitCommonFluent.a11y.disconnectButton.accessibleName.createProperty( {
        type: circuit.selectionProperty.derived( selection => selection instanceof CircuitElement ? selection.type : 'wire' ),
        resistance: circuit.selectionProperty.derived( selection => selection instanceof Resistor ? selection.resistanceProperty.value : 0 ),
        voltage: circuit.selectionProperty.derived( selection => selection instanceof Battery ? selection.voltageProperty.value : 0 ),
        capacitance: circuit.selectionProperty.derived( selection => selection instanceof Capacitor ? selection.capacitanceProperty.value : 0 ),
        inductance: circuit.selectionProperty.derived( selection => selection instanceof Inductor ? selection.inductanceProperty.value : 0 ),
        switchState: 'open',
        hasPosition: 'false',
        position: 0,
        total: 0,
        displayMode: 'name'
      } ),
      touchAreaDilation: 5,
      content: scissorsIcon,
      enabledProperty: enabledProperty,
      listener: () => {
        const circuitElement = circuit.selectionProperty.value;
        if ( circuitElement instanceof CircuitElement ) {

          // Only permit disconnection when not being dragged
          if ( !circuitElement.startVertexProperty.value.isDragged && !circuitElement.endVertexProperty.value.isDragged ) {

            const startVertex = circuitElement.startVertexProperty.value;
            const endVertex = circuitElement.endVertexProperty.value;

            // Check if the start vertex is connected to other elements
            const startNeighbors = circuit.getNeighborCircuitElements( startVertex );
            if ( startNeighbors.length > 1 ) {
              // Create a new vertex at the same position for this circuit element
              const newStartVertex = circuit.vertexGroup.createNextElement( startVertex.positionProperty.value );
              circuitElement.startVertexProperty.value = newStartVertex;
            }

            // Check if the end vertex is connected to other elements
            const endNeighbors = circuit.getNeighborCircuitElements( endVertex );
            if ( endNeighbors.length > 1 ) {
              // Create a new vertex at the same position for this circuit element
              const newEndVertex = circuit.vertexGroup.createNextElement( endVertex.positionProperty.value );
              circuitElement.endVertexProperty.value = newEndVertex;
            }

            // Move the disconnected element 50px down and 50px right
            // Use setPosition to update both positionProperty and unsnappedPositionProperty
            // Note: Must get the current vertices since they may have been replaced with new ones above
            const currentStartVertex = circuitElement.startVertexProperty.value;
            const currentEndVertex = circuitElement.endVertexProperty.value;

            currentStartVertex.setPosition( currentStartVertex.positionProperty.value.plus( DISCONNECT_OFFSET ) );
            currentEndVertex.setPosition( currentEndVertex.positionProperty.value.plus( DISCONNECT_OFFSET ) );
          }
        }
      },
      isDisposable: false,
      tandem: tandem,
      phetioVisiblePropertyInstrumented: false
    } );
  }
}

circuitConstructionKitCommon.register( 'CCKCDisconnectButton', CCKCDisconnectButton );
