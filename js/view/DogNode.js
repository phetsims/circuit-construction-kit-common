// Copyright 2020-2021, University of Colorado Boulder

/**
 * The DogNode is a ResistorNode that barks
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
//TODO: https://github.com/phetsims/circuit-construction-kit-common/issues/702: What is the convention for naming of these?
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

    // @private
    this.barkNode = new BarkNode( {
      maxWidth: 60
    } );
    this.addChild( this.barkNode );

    const positionBark = () => {
      if ( dog.isBarkingProperty.value ) {
        const startPosition = this.circuitElement.startVertexProperty.value.positionProperty.value;
        const endPosition = this.circuitElement.endVertexProperty.value.positionProperty.value;
        const angle = endPosition.minus( startPosition ).getAngle();
        const unitVector = endPosition.minus( startPosition ).normalized();
        const normalVector = unitVector.getPerpendicular();
        const translation = startPosition.plus( normalVector.timesScalar( 100 ) ).plus( unitVector.timesScalar( 12 ) );

        this.barkNode.setRotation( angle );
        this.barkNode.setTranslation( translation );
      }
    };

    this.contentNode.boundsProperty.link( () => positionBark() );

    dog.isBarkingProperty.link( isBarking => {

      // Position next to the dog's mouth
      positionBark();

      this.barkNode.visible = isBarking;
    } );

    dog.isBarkingProperty.lazyLink( isBarking => isBarking && soundClip.play() );
  }
}

circuitConstructionKitCommon.register( 'DogNode', DogNode );
export default DogNode;