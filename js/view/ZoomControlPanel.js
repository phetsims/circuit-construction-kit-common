// Copyright 2017-2020, University of Colorado Boulder

/**
 * The panel that appears in the bottom left which can be used to zoom in and out on the circuit. Exists for the life
 * of the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import ZoomButton from '../../../scenery-phet/js/buttons/ZoomButton.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

// constants
const ZOOMED_IN = 1;
const ZOOMED_OUT = 0.5;
const BUTTON_SPACING = 12;

class ZoomControlPanel extends HBox {

  /**
   * @param {Property.<number>} selectedZoomProperty
   * @param {Object} [options]
   */
  constructor( selectedZoomProperty, options ) {
    options = merge( {
      spacing: BUTTON_SPACING,
      tandem: Tandem.REQUIRED
    }, options );
    const zoomOutButton = new ZoomButton( {
      in: false,
      touchAreaXDilation: BUTTON_SPACING / 2,
      touchAreaYDilation: BUTTON_SPACING / 2,
      listener: () => selectedZoomProperty.set( ZOOMED_OUT ),
      tandem: options.tandem.createTandem( 'zoomOutButton' )
    } );
    const zoomInButton = new ZoomButton( {
      in: true,
      touchAreaXDilation: BUTTON_SPACING / 2,
      touchAreaYDilation: BUTTON_SPACING / 2,
      listener: () => selectedZoomProperty.set( ZOOMED_IN ),
      tandem: options.tandem.createTandem( 'zoomInButton' )
    } );
    options.children = [
      zoomOutButton,
      zoomInButton
    ];
    super( options );
    selectedZoomProperty.link( zoomLevel => {
      zoomInButton.setEnabled( zoomLevel === ZOOMED_OUT );
      zoomOutButton.setEnabled( zoomLevel === ZOOMED_IN );
    } );
  }
}

ZoomControlPanel.ZOOMED_OUT = ZOOMED_OUT;
ZoomControlPanel.ZOOMED_IN = ZOOMED_IN;
circuitConstructionKitCommon.register( 'ZoomControlPanel', ZoomControlPanel );
export default ZoomControlPanel;