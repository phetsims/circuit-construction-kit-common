// Copyright 2020, University of Colorado Boulder

/**
 * The DogNode is a ResistorNode that barks
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
import dogBarkSound from '../../sounds/dog-bark_mp3.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import BarkNode from './BarkNode.js';
import ResistorNode from './ResistorNode.js';

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

    this.barkNode = new BarkNode( {
      scale: 1.2
    } );
    this.addChild( this.barkNode );

    const positionBark = () => {
      if ( dog.isBarkingProperty.value ) {
        this.barkNode.right = this.contentNode.left + 20;
        this.barkNode.centerY = this.contentNode.centerY - 46;
      }
    };

    this.contentNode.boundsProperty.link( bounds => positionBark() );

    dog.isBarkingProperty.link( isBarking => {

      // Position next to the dog's mouth
      positionBark();

      this.barkNode.visible = isBarking;
    } );

    dog.isBarkingProperty.lazyLink( isBarking => {
      isBarking && soundClip.play();
    } );
  }
}

circuitConstructionKitCommon.register( 'DogNode', DogNode );
export default DogNode;