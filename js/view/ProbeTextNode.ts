// Copyright 2016-2023, University of Colorado Boulder

/**
 * Shows the title (above) and dynamic readout (below) for the ammeter and voltmeter.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Color, Node, Rectangle, Text, VBox, VBoxOptions } from '../../../scenery/js/imports.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Tandem from '../../../tandem/js/Tandem.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
import StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import CCKCColors from './CCKCColors.js';
import Bounds2 from '../../../dot/js/Bounds2.js';

// constants
const TEXT_BOX_WIDTH = 140;

type SelfOptions = {
  seriesAmmeter?: boolean;
};

export type ProbeTextNodeOptions = StrictOmit<SelfOptions & VBoxOptions, 'children'>;

export default class ProbeTextNode extends VBox {
  private readonly readoutText: Text;
  private readonly titleText: Text;
  private readonly disposeProbeTextNode: () => void;

  /**
   * @param stringProperty - the text that should be displayed
   * @param showResultsProperty - true if the text should be displayed
   * @param title - the title
   * @param tandem
   * @param [providedOptions]
   */
  public constructor( stringProperty: TReadOnlyProperty<string>, showResultsProperty: TReadOnlyProperty<boolean>, title: TReadOnlyProperty<string>, tandem: Tandem,
                      providedOptions?: ProbeTextNodeOptions ) {

    const options = optionize<ProbeTextNodeOptions, SelfOptions, VBoxOptions>()( {
      spacing: providedOptions && providedOptions.seriesAmmeter ? 0.5 : 3,
      seriesAmmeter: false,
      pickable: false
    }, providedOptions );

    const readoutText = new Text( stringProperty, {
      fontSize: options.seriesAmmeter ? 46 : 40,
      maxWidth: TEXT_BOX_WIDTH - 20,
      fill: CCKCColors.textFillProperty,
      tandem: tandem.createTandem( 'probeReadoutText' ),
      stringPropertyOptions: {
        phetioReadOnly: true
      }
    } );

    const textBox = new Rectangle( 0, 0, TEXT_BOX_WIDTH, 52, {
      cornerRadius: 10,
      lineWidth: 2,
      stroke: Color.BLACK,
      fill: Color.WHITE
    } );

    // Text bounds is not updated eagerly, so wait for the bounds to change for layout
    const boundsListener = ( bounds: Bounds2 ) => {
      if ( readoutText.string === MathSymbols.NO_VALUE ) {

        // --- is centered
        readoutText.centerX = textBox.centerX;
      }
      else {

        // numbers are right-aligned
        readoutText.right = textBox.right - 10;
      }

      // vertically center
      readoutText.centerY = textBox.centerY;
    };
    readoutText.boundsProperty.link( boundsListener );

    // Update visibility when show results property changes
    const updateVisibility = ( showResults: boolean ) => readoutText.setVisible( showResults );
    showResultsProperty.link( updateVisibility );

    // set the children
    const titleText = new Text( title, {
      fontSize: options.seriesAmmeter ? 33 : 42,
      maxWidth: TEXT_BOX_WIDTH,
      fill: CCKCColors.textFillProperty,
      tandem: options.seriesAmmeter ? tandem.createTandem( 'probeTitleText' ) : Tandem.OPT_OUT
    } );
    options.children = [ titleText, new Node( {
      children: [ textBox, readoutText ]
    } ) ];

    if ( options.seriesAmmeter ) {
      options.scale = 0.37;
    }

    super( options );

    this.readoutText = readoutText;
    this.titleText = titleText;

    this.disposeProbeTextNode = () => {
      readoutText.boundsProperty.unlink( boundsListener );
      textBox.dispose();
      showResultsProperty.unlink( updateVisibility );
    };
  }

  public override dispose(): void {
    this.disposeProbeTextNode();
    this.readoutText.dispose();
    this.titleText.dispose();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'ProbeTextNode', ProbeTextNode );