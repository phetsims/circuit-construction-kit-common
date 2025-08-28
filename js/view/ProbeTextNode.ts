// Copyright 2016-2025, University of Colorado Boulder

/**
 * Shows the title (above) and dynamic readout (below) for the ammeter and voltmeter.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import type Bounds2 from '../../../dot/js/Bounds2.js';
import optionize from '../../../phet-core/js/optionize.js';
import type StrictOmit from '../../../phet-core/js/types/StrictOmit.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import VBox, { type VBoxOptions } from '../../../scenery/js/layout/nodes/VBox.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Color from '../../../scenery/js/util/Color.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CCKCColors from './CCKCColors.js';

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

    const probeReadoutText = new Text( stringProperty, {
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
      if ( probeReadoutText.string === MathSymbols.NO_VALUE ) {

        // --- is centered
        probeReadoutText.centerX = textBox.centerX;
      }
      else {

        // numbers are right-aligned
        probeReadoutText.right = textBox.right - 10;
      }

      // vertically center
      probeReadoutText.centerY = textBox.centerY;
    };
    probeReadoutText.boundsProperty.link( boundsListener );

    // Update visibility when show results property changes
    const updateVisibility = ( showResults: boolean ) => probeReadoutText.setVisible( showResults );
    showResultsProperty.link( updateVisibility );

    // set the children
    const titleText = new Text( title, {
      fontSize: options.seriesAmmeter ? 33 : 42,
      maxWidth: TEXT_BOX_WIDTH,
      fill: CCKCColors.textFillProperty,
      tandem: options.seriesAmmeter ? tandem.createTandem( 'probeTitleText' ) : Tandem.OPT_OUT
    } );
    options.children = [ titleText, new Node( {
      children: [ textBox, probeReadoutText ]
    } ) ];

    if ( options.seriesAmmeter ) {
      options.scale = 0.37;
    }

    super( options );

    this.readoutText = probeReadoutText;
    this.titleText = titleText;

    this.disposeProbeTextNode = () => {
      probeReadoutText.boundsProperty.unlink( boundsListener );
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