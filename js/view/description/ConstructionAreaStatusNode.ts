// Copyright 2025, University of Colorado Boulder

/**
 * ConstructionAreaStatusNode displays a dynamic list and help text describing the current state of the
 * construction area. It shows counts of wires, additional components, and connections, along with
 * context-appropriate help text.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import AccessibleListNode from '../../../../scenery-phet/js/accessibility/AccessibleListNode.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../../CircuitConstructionKitCommonFluent.js';
import Circuit from '../../model/Circuit.js';
import Wire from '../../model/Wire.js';

export default class ConstructionAreaStatusNode extends AccessibleListNode {

  public constructor( circuit: Circuit ) {

    // Count wires
    const wireCountProperty = new DerivedProperty(
      [ circuit.circuitElements.lengthProperty ],
      () => circuit.circuitElements.filter( element => element instanceof Wire ).length
    );

    // Count non-wire components
    const additionalComponentCountProperty = new DerivedProperty(
      [ circuit.circuitElements.lengthProperty ],
      () => circuit.circuitElements.filter( element => !( element instanceof Wire ) ).length
    );

    // Count connections (vertices with more than 1 neighbor)
    // Depends on both element count and vertex count since connecting/disconnecting changes vertex count
    const connectionCountProperty = new DerivedProperty(
      [ circuit.circuitElements.lengthProperty, circuit.vertexGroup.countProperty ],
      () => {
        const vertices = new Set( circuit.circuitElements.flatMap( element => [
          element.startVertexProperty.value,
          element.endVertexProperty.value
        ] ) );
        let connectionCount = 0;
        vertices.forEach( vertex => {
          const neighbors = circuit.getNeighborCircuitElements( vertex );
          if ( neighbors.length > 1 ) {
            connectionCount++;
          }
        } );
        return connectionCount;
      }
    );

    // Determine current level (low/medium/high) based on max current magnitude
    const currentLevelProperty: TReadOnlyProperty<'low' | 'medium' | 'high'> = new DerivedProperty(
      [ circuit.hasCurrentFlowingProperty, circuit.circuitElements.lengthProperty ],
      hasCurrentFlowing => {
        if ( !hasCurrentFlowing ) {
          return 'low' as const;
        }
        // Find max current magnitude across all elements
        let maxCurrent = 0;
        circuit.circuitElements.forEach( element => {
          maxCurrent = Math.max( maxCurrent, Math.abs( element.currentProperty.value ) );
        } );
        // Categorize: low < 0.5A, medium < 2A, high >= 2A
        if ( maxCurrent < 0.5 ) {
          return 'low' as const;
        }
        else if ( maxCurrent < 2 ) {
          return 'medium' as const;
        }
        else {
          return 'high' as const;
        }
      }
    );

    // Leading paragraph changes based on whether current is flowing
    const leadingParagraphStringProperty = new DerivedProperty(
      [ circuit.hasCurrentFlowingProperty, currentLevelProperty ],
      ( hasCurrentFlowing, currentLevel ) => {
        if ( !hasCurrentFlowing ) {
          return CircuitConstructionKitCommonFluent.a11y.constructionAreaStatus.leadingNoCircuitStringProperty.value;
        }
        else {
          return CircuitConstructionKitCommonFluent.a11y.constructionAreaStatus.leadingCircuitActive.format( {
            currentLevel: currentLevel
          } );
        }
      }
    );

    // Create list item string properties
    const wireCountStringProperty = CircuitConstructionKitCommonFluent.a11y.constructionAreaStatus.wireCount.createProperty( {
      count: wireCountProperty
    } );

    const additionalComponentCountStringProperty = CircuitConstructionKitCommonFluent.a11y.constructionAreaStatus.additionalComponentCount.createProperty( {
      count: additionalComponentCountProperty
    } );

    const connectionCountStringProperty = CircuitConstructionKitCommonFluent.a11y.constructionAreaStatus.connectionCount.createProperty( {
      count: connectionCountProperty
    } );

    // Determine which help text case to use
    // Case 1: insufficient components (need wire + at least 2 other components)
    // Case 2: has components but no complete circuit (no current flowing)
    // Case 3: circuit is complete, current flowing
    const helpTextProperty = new DerivedProperty(
      [ wireCountProperty, additionalComponentCountProperty, circuit.hasCurrentFlowingProperty ],
      ( wireCount, additionalCount, hasCurrentFlowing ) => {
        if ( hasCurrentFlowing ) {
          return CircuitConstructionKitCommonFluent.a11y.constructionAreaStatus.helpTextCase3StringProperty.value;
        }
        else if ( wireCount >= 1 && additionalCount >= 2 ) {
          // Has enough components to potentially make a circuit, but no current yet
          return CircuitConstructionKitCommonFluent.a11y.constructionAreaStatus.helpTextCase2StringProperty.value;
        }
        else {
          // Insufficient components
          return CircuitConstructionKitCommonFluent.a11y.constructionAreaStatus.helpTextCase1StringProperty.value;
        }
      }
    );

    // Create visibility property - show when there are any elements
    const hasElementsProperty = new DerivedProperty(
      [ circuit.circuitElements.lengthProperty ],
      length => length > 0
    );

    super( [
      wireCountStringProperty,
      additionalComponentCountStringProperty,
      connectionCountStringProperty
    ], {
      leadingParagraphStringProperty: leadingParagraphStringProperty,
      visibleProperty: hasElementsProperty
    } );

    // Set accessibleHelpText dynamically
    this.accessibleHelpText = helpTextProperty;
  }
}

circuitConstructionKitCommon.register( 'ConstructionAreaStatusNode', ConstructionAreaStatusNode );
