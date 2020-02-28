// Copyright 2016-2020, University of Colorado Boulder

/**
 * Parent class for the panels in CCK so they have similar look and feel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import Panel from '../../../sun/js/Panel.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

class CCKCPanel extends Panel {

  /**
   * @param {Node} content - what will appear in the panel
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( content, tandem, options ) {
    options = merge( {
      fill: CCKCConstants.PANEL_COLOR,
      lineWidth: CCKCConstants.PANEL_LINE_WIDTH,
      xMargin: 15,
      yMargin: 15,
      tandem: tandem,
      cornerRadius: CCKCConstants.CORNER_RADIUS
    }, options );
    super( content, options );
  }
}

circuitConstructionKitCommon.register( 'CCKCPanel', CCKCPanel );
export default CCKCPanel;