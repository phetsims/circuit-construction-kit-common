// Copyright 2016-2026, University of Colorado Boulder

/**
 * Panel to facilitate visual layout of the controls in the CircuitElementEditContainerNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import HBox from '../../../scenery/js/layout/nodes/HBox.js';
import type Node from '../../../scenery/js/nodes/Node.js';
import Panel from '../../../sun/js/Panel.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CCKCColors from './CCKCColors.js';

export default class EditPanel extends Panel {
  private readonly hbox: HBox;

  public constructor( children: Node[] ) {
    const hbox = new HBox( {
      spacing: 20,
      align: 'bottom',
      children: children
    } );
    super( hbox, {
      fill: CCKCColors.editPanelFillProperty,
      stroke: null,
      xMargin: 10,
      yMargin: 10,
      cornerRadius: 10,
      align: 'center'
    } );
    this.hbox = hbox;
  }

  public override dispose(): void {
    this.hbox.dispose();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'EditPanel', EditPanel );
