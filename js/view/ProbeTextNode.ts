// Copyright 2016-2021, University of Colorado Boulder

/**
 * Shows the title (above) and dynamic readout (below) for the ammeter and voltmeter. Exists for the life of the sim
 * and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import Color from '../../../scenery/js/util/Color.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Property from '../../../axon/js/Property.js';
import Tandem from '../../../tandem/js/Tandem.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';

// constants
const TEXT_BOX_WIDTH = 140;

class ProbeTextNode extends VBox {

  /**
   * @param {Property.<string>} textProperty - the text that should be displayed
   * @param {Property.<boolean>} showResultsProperty - true if the text should be displayed
   * @param {string} title - the title
   * @param {Tandem} tandem
   * @param {Object} [providedOptions]
   */
  constructor( textProperty: Property<string>, showResultsProperty: Property<boolean>, title: string, tandem: Tandem,
               providedOptions?: any ) {

    providedOptions = merge( {
      spacing: 3
    }, providedOptions );

    const readout = new Text( textProperty.value, {
      fontSize: 40,
      maxWidth: TEXT_BOX_WIDTH - 20,
      tandem: tandem.createTandem( 'readoutText' )
    } );

    const textBox = new Rectangle( 0, 0, TEXT_BOX_WIDTH, 52, {
      cornerRadius: 10,
      lineWidth: 2,
      stroke: Color.BLACK,
      fill: Color.WHITE
    } );

    textProperty.link( text => {
      readout.setText( text );
      if ( text === MathSymbols.NO_VALUE ) {

        // --- is centered
        readout.centerX = textBox.centerX;
      }
      else {

        // numbers are right-aligned
        readout.right = textBox.right - 10;
      }

      // vertically center
      readout.centerY = textBox.centerY;
    } );

    // Update visibility when show results property changes
    showResultsProperty.linkAttribute( readout, 'visible' );

    // set the children
    providedOptions.children = [ new Text( title, {
      fontSize: 42,
      maxWidth: 190,
      tandem: tandem.createTandem( 'titleText' )
    } ), new Node( {
      children: [ textBox, readout ]
    } ) ];

    super( providedOptions );
  }
}

circuitConstructionKitCommon.register( 'ProbeTextNode', ProbeTextNode );
export default ProbeTextNode;