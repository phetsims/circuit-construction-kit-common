// Copyright 2017-2023, University of Colorado Boulder

/**
 * Button that reverses a battery.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Color, Path, VBox } from '../../../scenery/js/imports.js';
import syncAltSolidString from '../../../sherpa/js/fontawesome-5/syncAltSolidString.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Battery from '../model/Battery.js';
import CCKCRoundPushButton from './CCKCRoundPushButton.js';
import Circuit from '../model/Circuit.js';
import { RoundPushButtonOptions } from '../../../sun/js/buttons/RoundPushButton.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';

// constants
const ARROW_ICON_SCALE = 0.035;

type SelfOptions = EmptySelfOptions;
type ReverseBatteryButtonOptions = SelfOptions & RoundPushButtonOptions;

export default class BatteryReverseButton extends CCKCRoundPushButton {

  /**
   * @param circuit - the circuit that contains the battery
   * @param tandem
   */
  public constructor( circuit: Circuit, providedOptions?: ReverseBatteryButtonOptions ) {

    // This SVG data was exported from assets/flip_battery_icon.ai, which was created by @arouinfar.  Using illustrator,
    // save the AI file as SVG, then inspect the file to get the path declaration.
    const batteryIcon = new Path( 'M59.42,9.597v7.807c0,0.719-0.32,1.331-0.957,1.84c-0.641,0.508-1.411,0.762-2.312,0.762v3.254 ' +
                                  'c0,0.894-0.398,1.659-1.199,2.296s-1.762,0.956-2.887,0.956H4.666c-1.125,0-2.086-0.319-2.887-0.956S0.58,24.152,0.58,23.259V3.741 ' +
                                  'c0-0.894,0.398-1.659,1.199-2.297C2.58,0.809,3.541,0.489,4.666,0.489h47.398c1.125,0,2.086,0.319,2.887,0.955 ' +
                                  'c0.801,0.638,1.199,1.403,1.199,2.297v3.253c0.901,0,1.672,0.255,2.312,0.764C59.1,8.265,59.42,8.878,59.42,9.597z M52.88,17.403 ' +
                                  'h3.271V9.597H52.88V3.741c0-0.189-0.074-0.345-0.227-0.467c-0.153-0.122-0.351-0.184-0.589-0.184H4.666 ' +
                                  'c-0.238,0-0.433,0.062-0.589,0.184C3.925,3.396,3.85,3.552,3.85,3.741v19.518c0,0.189,0.075,0.345,0.228,0.467 ' +
                                  'c0.156,0.121,0.351,0.184,0.589,0.184h47.398c0.238,0,0.436-0.062,0.589-0.184c0.152-0.122,0.227-0.277,0.227-0.467V17.403z ' +
                                  'M43.614,2.819v21.486H3.866V2.819H43.614z', { scale: 0.45, fill: Color.BLACK } );

    // Split the 2 arrow definitions
    const syncAltSolidStringParts = syncAltSolidString.split( 'M' );
    const topShapeString = `M${syncAltSolidStringParts[ 1 ]}`;
    const bottomShapeString = `M${syncAltSolidStringParts[ 2 ]}`;

    const options = optionize<ReverseBatteryButtonOptions, SelfOptions, RoundPushButtonOptions>()( {
      touchAreaDilation: 5, // radius dilation for touch area
      content: new VBox( {
        spacing: 3,
        children: [

          new Path( topShapeString, {
            fill: Color.BLACK,
            scale: ARROW_ICON_SCALE
          } ),
          batteryIcon,

          new Path( bottomShapeString, {
            fill: Color.BLACK,
            scale: ARROW_ICON_SCALE
          } )
        ]
      } ),
      listener: () => {
        const battery = circuit.selectionProperty.value;

        if ( battery instanceof Battery ) {
          circuit.flip( battery );
          circuit.componentEditedEmitter.emit();
        }
        else {
          assert && assert( false, 'selected circuit element should have been a battery' );
        }
      }
    }, providedOptions );
    super( options );
  }

  public override dispose(): void {
    assert && assert( false, 'should not be disposed' );
  }
}

circuitConstructionKitCommon.register( 'BatteryReverseButton', BatteryReverseButton );