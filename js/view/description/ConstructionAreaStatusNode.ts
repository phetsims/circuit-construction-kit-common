// Copyright 2025, University of Colorado Boulder

/**
 * ConstructionAreaStatusNode displays context-appropriate help text for the construction area.
 * The detailed component and connection counts are now shown as summaries within each group section.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../../CircuitConstructionKitCommonFluent.js';
import Circuit from '../../model/Circuit.js';
import Wire from '../../model/Wire.js';

export default class ConstructionAreaStatusNode extends Node {

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

    super( {
      tagName: 'p',
      visibleProperty: hasElementsProperty
    } );

    // Set accessibleHelpText dynamically
    this.accessibleHelpText = helpTextProperty;
  }
}

circuitConstructionKitCommon.register( 'ConstructionAreaStatusNode', ConstructionAreaStatusNode );
