// Copyright 2017-2025, University of Colorado Boulder

/**
 * AccordionBox that is customized with constants for Circuit Construction Kit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import type { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import { combineOptions, EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import type Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import AccordionBox, { type AccordionBoxOptions } from '../../../sun/js/AccordionBox.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CCKCColors from './CCKCColors.js';

// constants
const BUTTON_MARGIN = 8;

type SelfOptions = EmptySelfOptions;
export type CCKCAccordionBoxOptions = SelfOptions & AccordionBoxOptions;

export default class CCKCAccordionBox extends AccordionBox {

  /**
   * @param content - the content to display in the accordion box when it is expanded
   * @param title - the text to display in the title bar
   * @param tandem
   * @param [providedOptions]
   */
  public constructor( content: Node, title: TReadOnlyProperty<string>, tandem: Tandem, providedOptions?: CCKCAccordionBoxOptions ) {

    const options = providedOptions;

    super( content, combineOptions<AccordionBoxOptions>( {
      fill: CCKCColors.panelFillProperty,
      stroke: CCKCColors.panelStrokeProperty,
      cornerRadius: CCKCConstants.CORNER_RADIUS,
      titleXMargin: 10,
      buttonXMargin: BUTTON_MARGIN,
      buttonYMargin: BUTTON_MARGIN,
      titleYMargin: 4,
      titleXSpacing: 14,
      contentYSpacing: 0,
      lineWidth: CCKCConstants.PANEL_LINE_WIDTH,
      minWidth: CCKCConstants.RIGHT_SIDE_PANEL_MIN_WIDTH,
      expandedProperty: new BooleanProperty( false, {
        tandem: tandem.createTandem( 'expandedProperty' ),
        phetioFeatured: true
      } ),

      // Expand touch area to match the margins
      expandCollapseButtonOptions: {
        touchAreaYDilation: BUTTON_MARGIN,
        touchAreaXDilation: BUTTON_MARGIN
      },
      titleNode: new Text( title, {
        fontSize: CCKCConstants.FONT_SIZE,
        maxWidth: 175,
        fill: CCKCColors.textFillProperty,
        tandem: tandem.createTandem( 'titleText' )
      } ),
      tandem: tandem
    }, options ) );
  }
}

circuitConstructionKitCommon.register( 'CCKCAccordionBox', CCKCAccordionBox );