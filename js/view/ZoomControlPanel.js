// Copyright 2017-2020, University of Colorado Boulder

/**
 * The panel that appears in the bottom left which can be used to zoom in and out on the circuit. Exists for the life
 * of the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import MagnifyingGlassZoomButtonGroup from '../../../scenery-phet/js/MagnifyingGlassZoomButtonGroup.js';
import PhetColorScheme from '../../../scenery-phet/js/PhetColorScheme.js';
import RectangularButton from '../../../sun/js/buttons/RectangularButton.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

// constants
const ZOOMED_IN = 1;
const ZOOMED_OUT = 0.5;
const BUTTON_SPACING = 12;

class ZoomControlPanel extends MagnifyingGlassZoomButtonGroup {

  /**
   * @param {NumberProperty} selectedZoomProperty
   * @param {Object} [options]
   */
  constructor( selectedZoomProperty, options ) {
    options = merge( {
      spacing: BUTTON_SPACING,
      tandem: Tandem.REQUIRED,
      buttonOptions: {
        buttonAppearanceStrategy: RectangularButton.ThreeDAppearanceStrategy,
        baseColor: PhetColorScheme.BUTTON_YELLOW
      }
    }, options );
    super( selectedZoomProperty, options );
  }
}

ZoomControlPanel.ZOOMED_OUT = ZOOMED_OUT;
ZoomControlPanel.ZOOMED_IN = ZOOMED_IN;
circuitConstructionKitCommon.register( 'ZoomControlPanel', ZoomControlPanel );
export default ZoomControlPanel;