// Copyright 2025, University of Colorado Boulder

/**
 * CCKCScreenSummaryContent describes the play and control areas, current state, and interaction hint for every
 * CCK screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import ScreenSummaryContent from '../../../../joist/js/ScreenSummaryContent.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../../CircuitConstructionKitCommonFluent.js';
import CircuitConstructionKitModel from '../../model/CircuitConstructionKitModel.js';
import CircuitElementViewType from '../../model/CircuitElementViewType.js';

export default class CCKCScreenSummaryContent extends ScreenSummaryContent {

  public constructor( model: CircuitConstructionKitModel ) {

    const circuit = model.circuit;

    // Derive the view type string from the viewTypeProperty
    const viewTypeStringProperty = new DerivedProperty(
      [ model.viewTypeProperty ],
      viewType => viewType === CircuitElementViewType.LIFELIKE ? 'lifelike' : 'schematic'
    );

    // Create a property that changes whenever the circuit topology changes
    const circuitChangedCountProperty = new NumberProperty( 0 );
    circuit.circuitChangedEmitter.addListener( () => {
      circuitChangedCountProperty.value++;
    } );

    // Helper to convert a number to a plural category string
    const toCountCategory = ( n: number ): 'zero' | 'one' | 'other' => {
      if ( n === 0 ) { return 'zero'; }
      if ( n === 1 ) { return 'one'; }
      return 'other';
    };

    // Count disconnected components (single-element groups) - as number for display
    const disconnectedCountNumberProperty = new DerivedProperty(
      [ circuitChangedCountProperty ],
      () => {
        const groups = circuit.getGroups();
        return groups.filter( group => group.circuitElements.length === 1 ).length;
      }
    );

    // Count disconnected components - as category for select_*
    const disconnectedCountProperty = new DerivedProperty(
      [ disconnectedCountNumberProperty ],
      toCountCategory
    );

    // Count multi-element groups - as number for display
    const groupCountNumberProperty = new DerivedProperty(
      [ circuitChangedCountProperty ],
      () => {
        const groups = circuit.getGroups();
        return groups.filter( group => group.circuitElements.length > 1 ).length;
      }
    );

    // Count multi-element groups - as category for select_*
    const groupCountProperty = new DerivedProperty(
      [ groupCountNumberProperty ],
      toCountCategory
    );

    // Count of components in multi-element groups (always a number for display)
    const connectedCountProperty = new DerivedProperty(
      [ circuitChangedCountProperty ],
      () => {
        const groups = circuit.getGroups();
        return groups
          .filter( group => group.circuitElements.length > 1 )
          .reduce( ( sum, group ) => sum + group.circuitElements.length, 0 );
      }
    );

    // Count groups with current flowing (as number for display)
    const groupsWithCurrentProperty = new DerivedProperty(
      [ circuitChangedCountProperty, circuit.hasCurrentFlowingProperty ],
      () => {
        const groups = circuit.getGroups().filter( group => group.circuitElements.length > 1 );
        return groups.filter( group =>
          group.circuitElements.some( element => Math.abs( element.currentProperty.value ) > 1e-10 )
        ).length;
      }
    );

    // Derive current status from the circuit's hasCurrentFlowingProperty
    const hasCurrentFlowingProperty = new DerivedProperty(
      [ circuit.hasCurrentFlowingProperty ],
      hasCurrentFlowing => hasCurrentFlowing ? 'flowing' as const : 'notFlowing' as const
    );

    // Create the phrase properties
    const connectivityPhraseProperty = CircuitConstructionKitCommonFluent.a11y.screenSummary.connectivityPhrase.createProperty( {
      disconnectedCount: disconnectedCountProperty,
      disconnectedCountNumber: disconnectedCountNumberProperty,
      groupCount: groupCountProperty,
      groupCountNumber: groupCountNumberProperty,
      connectedCount: connectedCountProperty
    } );

    const currentFlowingPhraseProperty = CircuitConstructionKitCommonFluent.a11y.screenSummary.currentFlowingPhrase.createProperty( {
      groupCountNumber: groupCountNumberProperty,
      hasCurrentFlowing: hasCurrentFlowingProperty,
      groupsWithCurrent: groupsWithCurrentProperty
    } );

    super( {
      playAreaContent: CircuitConstructionKitCommonFluent.a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: CircuitConstructionKitCommonFluent.a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: CircuitConstructionKitCommonFluent.a11y.screenSummary.currentDetails.createProperty( {
        componentCount: circuit.circuitElements.lengthProperty.derived( length => length === 0 ? 'zero' : length ),
        viewType: viewTypeStringProperty,
        connectivityPhrase: connectivityPhraseProperty,
        currentFlowingPhrase: currentFlowingPhraseProperty
      } ),
      interactionHintContent: CircuitConstructionKitCommonFluent.a11y.screenSummary.interactionHintStringProperty
    } );
  }
}

circuitConstructionKitCommon.register( 'CCKCScreenSummaryContent', CCKCScreenSummaryContent );
