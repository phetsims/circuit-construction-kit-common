// Copyright 2017-2023, University of Colorado Boulder

/**
 * The panel that appears in the bottom left which can be used to zoom in and out on the circuit. Exists for the life
 * of the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import MagnifyingGlassZoomButtonGroup, { MagnifyingGlassZoomButtonGroupOptions } from '../../../scenery-phet/js/MagnifyingGlassZoomButtonGroup.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import RectangularButton from '../../../sun/js/buttons/RectangularButton.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

// constants
const BUTTON_SPACING = 20;

type ZoomButtonGroupOptions = MagnifyingGlassZoomButtonGroupOptions;

export default class CCKCZoomButtonGroup extends MagnifyingGlassZoomButtonGroup {

  public constructor( selectedZoomProperty: NumberProperty, providedOptions?: ZoomButtonGroupOptions ) {
    providedOptions = combineOptions<ZoomButtonGroupOptions>( {
      spacing: BUTTON_SPACING,
      buttonOptions: {
        buttonAppearanceStrategy: RectangularButton.ThreeDAppearanceStrategy,
        baseColor: PhetColorScheme.BUTTON_YELLOW,
        phetioReadOnly: true
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