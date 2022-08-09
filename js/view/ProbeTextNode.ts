// Copyright 2016-2022, University of Colorado Boulder

/**
 * Shows the title (above) and dynamic readout (below) for the ammeter and voltmeter. Exists for the life of the sim
 * and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import { Color, Node, Rectangle, Text, VBox, VBoxOptions } from '../../../scenery/js/imports.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';

// constants
const TEXT_BOX_WIDTH = 140;

export default class ProbeTextNode extends VBox {

  /**
   * @param textProperty - the text that should be displayed
   * @param showResultsProperty - true if the text should be displayed
   * @param title - the title
   * @param tandem
   * @param [providedOptions]
   */
  public constructor( textProperty: TReadOnlyProperty<string>, showResultsProperty: ReadOnlyProperty<boolean>, title: string, tandem: Tandem,
                      providedOptions?: VBoxOptions ) {

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

    textProperty.link( text => readout.setText( text ) );

    // Text bounds is not updated eagerly, so wait for the bounds to change for layout
    readout.boundsProperty.link( bounds => {
      if ( readout.text === MathSymbols.NO_VALUE ) {

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