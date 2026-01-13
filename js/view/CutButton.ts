// Copyright 2025, University of Colorado Boulder

/**
 * CutButton is a round push button with scissors icon that appears near selected vertices.
 * When pressed, it cuts (separates) the vertex from its connected circuit elements.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import affirm from '../../../perennial-alias/js/browser-and-node/affirm.js';
import Path from '../../../scenery/js/nodes/Path.js';
import scissorsShape from '../../../sherpa/js/fontawesome-4/scissorsShape.js';
import RoundPushButton from '../../../sun/js/buttons/RoundPushButton.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
import Tandem from '../../../tandem/js/Tandem.js';
import cut_mp3 from '../../sounds/cut_mp3.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import type Circuit from '../model/Circuit.js';
import type Vertex from '../model/Vertex.js';

// How far in view coordinates the cut button appears from the vertex node
const DISTANCE_TO_CUT_BUTTON = 70;

const cutSoundPlayer = new SoundClip( cut_mp3 );
soundManager.addSoundGenerator( cutSoundPlayer );

export default class CutButton extends RoundPushButton {

  public constructor( private readonly circuit: Circuit, tandem: Tandem ) {

    const cutIcon = new Path( scissorsShape, {
      fill: 'black',
      rotation: -Math.PI / 2, // scissors point up
      maxWidth: 36
    } );

    super( {
      baseColor: 'yellow',
      content: cutIcon,
      xMargin: 10,
      yMargin: 10,
      tandem: tandem,
      phetioVisiblePropertyInstrumented: false,
      enabledPropertyOptions: {
        phetioReadOnly: true,
        phetioFeatured: false
      },
      soundPlayer: cutSoundPlayer,
      focusable: false // Delete with delete/backspace on the element rather than focusing this button itself
    } );

    this.addListener( () => {
      const selectedVertex = circuit.getSelectedVertex();
      affirm( selectedVertex, 'Button should only be available if a vertex is selected' );
      if ( selectedVertex ) {
        circuit.cutVertex( selectedVertex );
      }
    } );
  }

  /**
   * Computes the position for the cut button based on the vertex position and its neighbors.
   * The button is positioned in the direction least populated by adjacent circuit elements.
   *
   * @param vertex - the vertex that is selected
   * @param availableBounds - the bounds within which the button center must remain
   */
  public getPositionForVertex( vertex: Vertex, availableBounds: Bounds2 ): Vector2 {
    const position = vertex.positionProperty.get();
    const neighbors = this.circuit.getNeighborCircuitElements( vertex );

    // Compute an unweighted sum of adjacent element directions, and point in the opposite direction so the button
    // will appear in the least populated area.
    const sumOfDirections = new Vector2( 0, 0 );
    for ( let i = 0; i < neighbors.length; i++ ) {
      const v = vertex.positionProperty.get().minus(
        neighbors[ i ].getOppositeVertex( vertex ).positionProperty.get()
      );
      if ( v.magnitude > 0 ) {
        sumOfDirections.add( v.normalized() );
      }
    }
    if ( sumOfDirections.magnitude < 1E-6 ) {
      sumOfDirections.setXY( 0, -1 ); // Show the scissors above
    }

    const proposedPosition = position.plus( sumOfDirections.normalized().timesScalar( DISTANCE_TO_CUT_BUTTON ) );

    return availableBounds.closestPointTo( proposedPosition );
  }
}

circuitConstructionKitCommon.register( 'CutButton', CutButton );
