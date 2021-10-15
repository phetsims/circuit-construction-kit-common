// Copyright 2017-2020, University of Colorado Boulder

/**
 * AccordionBox that is customized with constants for Circuit Construction Kit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import merge from '../../../phet-core/js/merge.js';
import HBox from '../../../scenery/js/nodes/HBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import HStrut from '../../../scenery/js/nodes/HStrut.js';
import Text from '../../../scenery/js/nodes/Text.js';
import AccordionBox from '../../../sun/js/AccordionBox.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

// constants
const BUTTON_MARGIN = 8;

type CCKCAccordionBoxOptions = {
  strutWidth: number
} & AccordionBoxOptions;

class CCKCAccordionBox extends AccordionBox {

  /**
   * @param {Node} content - the content to display in the accordion box when it is expanded
   * @param {string} title - the text to display in the title bar
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( content: Node, title: string, tandem: Tandem, options?: Partial<CCKCAccordionBoxOptions> ) {

    options = options || {};
    super( content, merge( {
      fill: CCKCConstants.PANEL_COLOR,
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
        tandem: tandem.createTandem( 'expandedProperty' )
      } ),

      // Expand touch area to match the margins
      expandCollapseButtonOptions: {
        touchAreaYDilation: BUTTON_MARGIN,
        touchAreaXDilation: BUTTON_MARGIN
      },
      titleNode: new HBox( {
        children: [
          new HStrut( options.strutWidth || 10 ),
          new Text( title, {
            fontSize: CCKCConstants.FONT_SIZE,
            maxWidth: 175,
            tandem: tandem.createTandem( 'titleNode' )
          } )
        ]
      } ),
      tandem: tandem
    }, options ) );
  }
}

circuitConstructionKitCommon.register( 'CCKCAccordionBox', CCKCAccordionBox );
export { CCKCAccordionBoxOptions };
export default CCKCAccordionBox;