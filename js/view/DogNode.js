// Copyright 2020, University of Colorado Boulder

/**
 * The DogNode is a ResistorNode that barks
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
import dogBarkingImage from '../../images/dog-bark_png.js';
import dogImage from '../../images/dog_png.js';
import dogBarkSound from '../../sounds/dog-bark_mp3.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import ResistorNode from './ResistorNode.js';

// sounds

class DogNode extends ResistorNode {

  /**
   * @param {CCKCScreenView|null} screenView - main screen view, null for isIcon
   * @param {CircuitLayerNode|null} circuitLayerNode, null for isIcon
   * @param {Resistor} dog
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( screenView, circuitLayerNode, dog, viewTypeProperty, tandem, options ) {
    super( screenView, circuitLayerNode, dog, viewTypeProperty, tandem, options );

    const soundClip = new SoundClip( dogBarkSound );
    soundManager.addSoundGenerator( soundClip );

    dog.isBarkingProperty.link( isBarking => {
      this.lifelikeResistorImageNode.image = isBarking ? dogBarkingImage : dogImage;
    } );

    dog.isBarkingProperty.lazyLink( isBarking => {
      isBarking && soundClip.play();
    } );
  }
}

circuitConstructionKitCommon.register( 'DogNode', DogNode );
export default DogNode;