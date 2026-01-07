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
import type Circuit from '../model/Circuit.js';
import CircuitElement from '../model/CircuitElement.js';
import CCKCRoundPushButton from './CCKCRoundPushButton.js';
import CircuitDescription from './description/CircuitDescription.js';

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
    // and BOTH vertices allow cutting (either detached or isCuttableProperty = true)
    const enabledProperty = new DerivedProperty( [ circuit.selectionProperty ], selection => {
      if ( selection instanceof CircuitElement ) {
        const startVertex = selection.startVertexProperty.value;
        const endVertex = selection.endVertexProperty.value;

        const startNeighbors = circuit.getNeighborCircuitElements( startVertex );
        const endNeighbors = circuit.getNeighborCircuitElements( endVertex );

        // Must have at least one connection to cut
        const hasConnectionToCut = startNeighbors.length > 1 || endNeighbors.length > 1;

        // A side allows cutting if it's either already detached (no other neighbors) OR isCuttableProperty is true
        const startAllowsCut = startNeighbors.length <= 1 || startVertex.isCuttableProperty.value;
        const endAllowsCut = endNeighbors.length <= 1 || endVertex.isCuttableProperty.value;

        return hasConnectionToCut && startAllowsCut && endAllowsCut;
      }
      return false;
    } );

    // Recompute when circuit topology changes (elements connected/disconnected)
    circuit.circuitChangedEmitter.addListener( () => enabledProperty.recomputeDerivation() );

    // Build accessible name reactively from selection (showValues=false for disconnect button)
    const accessibleNameProperty = new DerivedProperty(
      [ circuit.selectionProperty ],
      selection => {
        if ( selection instanceof CircuitElement ) {
          return CircuitDescription.buildAccessibleName( selection, false, 0, 0, false );
        }
        return '';
      }
    );

    super( {
      accessibleName: CircuitConstructionKitCommonFluent.a11y.disconnectButton.accessibleName.createProperty( {
        accessibleName: accessibleNameProperty
      } ),
      touchAreaDilation: 5,
      content: scissorsIcon,
      enabledProperty: enabledProperty,
      isDisposable: false,
      tandem: tandem,
      phetioVisiblePropertyInstrumented: false
    } );

    // Add listener after super() so we can reference 'this' for focus restoration
    this.addListener( () => {
      const circuitElement = circuit.selectionProperty.value;
      if ( circuitElement instanceof CircuitElement ) {

        // Only permit disconnection when not being dragged
        if ( !circuitElement.startVertexProperty.value.isDragged && !circuitElement.endVertexProperty.value.isDragged ) {

          const startVertex = circuitElement.startVertexProperty.value;
          const endVertex = circuitElement.endVertexProperty.value;

          // Check if the start vertex is connected to other elements and can be cut
          const startNeighbors = circuit.getNeighborCircuitElements( startVertex );
          if ( startNeighbors.length > 1 && startVertex.isCuttableProperty.value ) {

            // Create a new vertex at the same position for this circuit element
            const newStartVertex = circuit.vertexGroup.createNextElement( startVertex.positionProperty.value );
            circuitElement.startVertexProperty.value = newStartVertex;
          }

          // Check if the end vertex is connected to other elements and can be cut
          const endNeighbors = circuit.getNeighborCircuitElements( endVertex );
          if ( endNeighbors.length > 1 && endVertex.isCuttableProperty.value ) {

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

          // Restore selection since vertex creation clears it
          circuit.selectionProperty.value = circuitElement;

          // Notify that circuit topology changed so solder nodes update visibility
          circuit.circuitChangedEmitter.emit();

          // Restore focus to this button (which is now disabled)
          this.focus();
        }
      }
    } );
  }
}

circuitConstructionKitCommon.register( 'CCKCDisconnectButton', CCKCDisconnectButton );
