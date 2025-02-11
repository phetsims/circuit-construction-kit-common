// Copyright 2016-2025, University of Colorado Boulder

/**
 * Parent class for the panels in CCK so they have similar look and feel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { combineOptions } from '../../../phet-core/js/optionize.js';
import type Node from '../../../scenery/js/nodes/Node.js';
import Panel, { type PanelOptions } from '../../../sun/js/Panel.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CCKCColors from './CCKCColors.js';

export type CCKCPanelOptions = PanelOptions;

export default class CCKCPanel extends Panel {

  /**
   * @param content - what will appear in the panel
   * @param tandem
   * @param [providedOptions]
   */
  public constructor( content: Node, tandem: Tandem, providedOptions?: PanelOptions ) {
    providedOptions = combineOptions<PanelOptions>( {
      fill: CCKCColors.panelFillProperty,
      stroke: CCKCColors.panelStrokeProperty,
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