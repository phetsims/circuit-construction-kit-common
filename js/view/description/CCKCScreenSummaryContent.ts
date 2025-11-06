// Copyright 2025, University of Colorado Boulder

/**
 * CCKCScreenSummaryContent describes the play and control areas, current state, and interaction hint for every
 * CCK screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import ScreenSummaryContent from '../../../../joist/js/ScreenSummaryContent.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../../CircuitConstructionKitCommonFluent.js';
import CircuitConstructionKitModel from '../../model/CircuitConstructionKitModel.js';
import CCKCScreenView from '../CCKCScreenView.js';

export default class CCKCScreenSummaryContent extends ScreenSummaryContent {

  public constructor( model: CircuitConstructionKitModel, screenView: CCKCScreenView ) {
    super( {
      playAreaContent: CircuitConstructionKitCommonFluent.a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: CircuitConstructionKitCommonFluent.a11y.screenSummary.controlArea.createProperty( {
        advancedControls: screenView.showAdvancedControls ? 'present' : 'absent'
      } ),
      currentDetailsContent: CircuitConstructionKitCommonFluent.a11y.screenSummary.currentDetailsStringProperty,
      interactionHintContent: CircuitConstructionKitCommonFluent.a11y.screenSummary.interactionHintStringProperty
    } );
  }
}

circuitConstructionKitCommon.register( 'CCKCScreenSummaryContent', CCKCScreenSummaryContent );
