// Copyright 2019-2023, University of Colorado Boulder

/**
 * Button that clears the magnetic field from an inductor or electric field from a capacitor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { m3 } from '../../../dot/js/Matrix3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import BannedNode from '../../../scenery-phet/js/BannedNode.js';
import { Color, Node, Path } from '../../../scenery/js/imports.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import DynamicCircuitElement from '../model/DynamicCircuitElement.js';
import CCKCRoundPushButton from './CCKCRoundPushButton.js';
import Circuit from '../model/Circuit.js';
import CircuitElement from '../model/CircuitElement.js';
import Vertex from '../model/Vertex.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import { RoundPushButtonOptions } from '../../../sun/js/buttons/RoundPushButton.js';

// constants
const SCALE = 0.032;

const SHAPE_MATRIX = m3( SCALE, 0, 0, 0, -SCALE, 0, 0, 0, 1 ); // to create a unity-scale icon

type SelfOptions = EmptySelfOptions;
type ClearDynamicsButtonOptions = SelfOptions & RoundPushButtonOptions;

export default class ClearDynamicsButton extends CCKCRoundPushButton {

  public constructor( circuit: Circuit, providedOptions?: ClearDynamicsButtonOptions ) {

    // This SVG data was exported from assets/flip_battery_icon.ai, which was created by @arouinfar.  Using illustrator,
    // save the AI file as SVG, then inspect the file to get the path declaration.
    const icon = new Path( new Shape( 'M885 970q18 -20 7 -44l-540 -1157q-13 -25 -42 -25q-4 0 -14 2q-17 5 -25.5 19t-4.5 30l197 808l-406 -101q-4 -1 -12 -1q-18 0 -31 11q-18 15 -13 39l201 825q4 14 16 23t28 9h328q19 0 32 -12.5t13 -29.5q0 -8 -5 -18l-171 -463l396 98q8 2 12 2q19 0 34 -15z' ).transformed( SHAPE_MATRIX ), {
      scale: 0.45,
      fill: Color.BLACK,
      center: Vector2.ZERO
    } );

    const options = optionize<ClearDynamicsButtonOptions, SelfOptions, RoundPushButtonOptions>()( {
      touchAreaDilation: 5, // radius dilation for touch area
      content: new Node( {
        children: [
          icon,
          new BannedNode( {
            lineWidth: 3,
            radius: 17
          } )
        ]
      } ),
      listener: () => {
        const dynamicCircuitElement = circuit.selectionProperty.value;
        if ( dynamicCircuitElement instanceof DynamicCircuitElement ) {
          dynamicCircuitElement.clear();
        }
      }
    }, providedOptions );

    super( options );

    const isClearableListener = ( isClearable: boolean ) => {
      this.visible = isClearable;
    };

    // This is reused across all batteries.  The button itself can be hidden by PhET-iO customization, but the parent
    // node is another gate for the visibility.
    circuit.selectionProperty.link( ( newCircuitElement: CircuitElement | Vertex | null, oldCircuitElement: CircuitElement | Vertex | null ) => {
      oldCircuitElement instanceof DynamicCircuitElement && oldCircuitElement.isClearableProperty.unlink( isClearableListener );
      newCircuitElement instanceof DynamicCircuitElement && newCircuitElement.isClearableProperty.link( isClearableListener );
    } );
  }

  public override dispose(): void {
    assert && assert( false, 'should not be disposed' );
  }
}

circuitConstructionKitCommon.register( 'ClearDynamicsButton', ClearDynamicsButton );