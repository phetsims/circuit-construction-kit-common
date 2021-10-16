// Copyright 2019-2021, University of Colorado Boulder

/**
 * Button that clears the magnetic field from an inductor or electric field from a capacitor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Matrix3 from '../../../dot/js/Matrix3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Shape from '../../../kite/js/Shape.js';
import BannedNode from '../../../scenery-phet/js/BannedNode.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Path from '../../../scenery/js/nodes/Path.js';
import Color from '../../../scenery/js/util/Color.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import DynamicCircuitElement from '../model/DynamicCircuitElement.js';
import CCKCRoundPushButton from './CCKCRoundPushButton.js';
import Circuit from '../model/Circuit.js';
import Tandem from '../../../tandem/js/Tandem.js';

// constants
const SCALE = 0.032;

// @ts-ignore
const SHAPE_MATRIX = Matrix3.createFromPool( SCALE, 0, 0, 0, -SCALE, 0, 0, 0, 1 ); // to create a unity-scale icon

class ClearDynamicsButton extends CCKCRoundPushButton {

  /**
   * @param {Circuit} circuit
   * @param {Tandem} tandem
   */
  constructor( circuit: Circuit, tandem: Tandem ) {

    // This SVG data was exported from assets/flip_battery_icon.ai, which was created by @arouinfar.  Using illustrator,
    // save the AI file as SVG, then inspect the file to get the path declaration.
    const icon = new Path( new Shape( 'M885 970q18 -20 7 -44l-540 -1157q-13 -25 -42 -25q-4 0 -14 2q-17 5 -25.5 19t-4.5 30l197 808l-406 -101q-4 -1 -12 -1q-18 0 -31 11q-18 15 -13 39l201 825q4 14 16 23t28 9h328q19 0 32 -12.5t13 -29.5q0 -8 -5 -18l-171 -463l396 98q8 2 12 2q19 0 34 -15z' ).transformed( SHAPE_MATRIX ), {
      scale: 0.45,
      fill: Color.BLACK,
      center: Vector2.ZERO
    } );

    super( {
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
        const dynamicCircuitElement = circuit.selectedCircuitElementProperty.value;
        if ( dynamicCircuitElement instanceof DynamicCircuitElement ) {
          dynamicCircuitElement.clear();
        }
      },
      tandem: tandem
    } );
  }

  // @public
  dispose() {
    assert && assert( false, 'should not be disposed' );
  }
}

circuitConstructionKitCommon.register( 'ClearDynamicsButton', ClearDynamicsButton );
export default ClearDynamicsButton;