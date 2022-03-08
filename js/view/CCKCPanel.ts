// Copyright 2016-2022, University of Colorado Boulder

/**
 * Parent class for the panels in CCK so they have similar look and feel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import Panel, { PanelOptions } from '../../../sun/js/Panel.js';
import Tandem from '../../../tandem/js/Tandem.js';
import { Node } from '../../../scenery/js/imports.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

class CCKCPanel extends Panel {

  /**
   * @param {Node} content - what will appear in the panel
   * @param {Tandem} tandem
   * @param {Object} [providedOptions]
   */
  constructor( content: Node, tandem: Tandem, providedOptions?: Partial<PanelOptions> ) {
    providedOptions = merge( {
      fill: CCKCConstants.PANEL_COLOR,
      lineWidth: CCKCConstants.PANEL_LINE_WIDTH,
      xMargin: 15,
      yMargin: 15,
      tandem: tandem,
      cornerRadius: CCKCConstants.CORNER_RADIUS
    }, providedOptions );
    super( content, providedOptions );
  }
}

circuitConstructionKitCommon.register( 'CCKCPanel', CCKCPanel );
export default CCKCPanel;