// Copyright 2017-2026, University of Colorado Boulder

/**
 * The panel that appears in the bottom left which can be used to zoom in and out on the circuit. Exists for the life
 * of the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import type NumberProperty from '../../../axon/js/NumberProperty.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import MagnifyingGlassZoomButtonGroup, { type MagnifyingGlassZoomButtonGroupOptions } from '../../../scenery-phet/js/MagnifyingGlassZoomButtonGroup.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import RectangularButton from '../../../sun/js/buttons/RectangularButton.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';

// constants
const BUTTON_SPACING = 20;

type ZoomButtonGroupOptions = MagnifyingGlassZoomButtonGroupOptions;

export default class CCKCZoomButtonGroup extends MagnifyingGlassZoomButtonGroup {

  public constructor( selectedZoomProperty: NumberProperty, providedOptions?: ZoomButtonGroupOptions ) {

    const maxZoomLevel = CCKCConstants.ZOOM_SCALES.length;

    // Create a reactive Property for the 1-indexed zoom level (for user-facing display)
    const oneIndexedZoomLevelProperty = new DerivedProperty( [ selectedZoomProperty ], level => level + 1 );

    // Create a reactive Property that announces the current zoom level
    const zoomLevelResponseProperty = CircuitConstructionKitCommonFluent.a11y.zoomButtonGroup.zoomLevelResponse.createProperty( {
      level: oneIndexedZoomLevelProperty,
      max: maxZoomLevel
    } );

    providedOptions = combineOptions<ZoomButtonGroupOptions>( {
      spacing: BUTTON_SPACING,
      buttonOptions: {
        buttonAppearanceStrategy: RectangularButton.ThreeDAppearanceStrategy,
        baseColor: PhetColorScheme.BUTTON_YELLOW,
        phetioReadOnly: true
      },
      zoomInButtonOptions: {
        accessibleName: CircuitConstructionKitCommonFluent.a11y.zoomButtonGroup.zoomIn.accessibleNameStringProperty,
        accessibleHelpText: CircuitConstructionKitCommonFluent.a11y.zoomButtonGroup.zoomIn.accessibleHelpTextStringProperty,
        accessibleContextResponse: zoomLevelResponseProperty
      },
      zoomOutButtonOptions: {
        accessibleName: CircuitConstructionKitCommonFluent.a11y.zoomButtonGroup.zoomOut.accessibleNameStringProperty,
        accessibleHelpText: CircuitConstructionKitCommonFluent.a11y.zoomButtonGroup.zoomOut.accessibleHelpTextStringProperty,
        accessibleContextResponse: zoomLevelResponseProperty
      },
      magnifyingGlassNodeOptions: {
        scale: 0.7
      },
      touchAreaXDilation: 9,
      touchAreaYDilation: 10
    }, providedOptions );
    super( selectedZoomProperty, providedOptions );
  }
}

circuitConstructionKitCommon.register( 'CCKCZoomButtonGroup', CCKCZoomButtonGroup );