// Copyright 2025, University of Colorado Boulder

/**
 * CCKCScreenSummaryContent describes the play and control areas, current state, and interaction hint for every
 * CCK screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import ScreenSummaryContent from '../../../../joist/js/ScreenSummaryContent.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../../CircuitConstructionKitCommonFluent.js';
import CircuitElementViewType from '../../model/CircuitElementViewType.js';
import CircuitConstructionKitModel from '../../model/CircuitConstructionKitModel.js';
import CCKCScreenView from '../CCKCScreenView.js';

export default class CCKCScreenSummaryContent extends ScreenSummaryContent {

  public constructor( model: CircuitConstructionKitModel, screenView: CCKCScreenView ) {

    const circuit = model.circuit;

    // Derive the view type string from the viewTypeProperty
    const viewTypeStringProperty = new DerivedProperty(
      [ model.viewTypeProperty ],
      viewType => viewType === CircuitElementViewType.LIFELIKE ? 'lifelike' : 'schematic'
    );

    // Derive current status from the circuit's hasCurrentFlowingProperty
    const currentStatusProperty = new DerivedProperty(
      [ circuit.hasCurrentFlowingProperty ],
      hasCurrentFlowing => hasCurrentFlowing ? 'flowing' as const : 'notFlowing' as const
    );

    super( {
      playAreaContent: CircuitConstructionKitCommonFluent.a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: CircuitConstructionKitCommonFluent.a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: CircuitConstructionKitCommonFluent.a11y.screenSummary.currentDetails.createProperty( {
        componentCount: circuit.circuitElements.lengthProperty,
        viewType: viewTypeStringProperty,
        currentStatus: currentStatusProperty
      } ),
      interactionHintContent: CircuitConstructionKitCommonFluent.a11y.screenSummary.interactionHintStringProperty
    } );
  }
}

circuitConstructionKitCommon.register( 'CCKCScreenSummaryContent', CCKCScreenSummaryContent );
