// Copyright 2020-2022, University of Colorado Boulder

/**
 * The DogNode is a ResistorNode that barks
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import SoundClip from '../../../tambo/js/sound-generators/SoundClip.js';
import soundManager from '../../../tambo/js/soundManager.js';
import Tandem from '../../../tandem/js/Tandem.js';
import dogBark_mp3 from '../../sounds/dogBark_mp3.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import BarkNode from './BarkNode.js';
import CCKCScreenView from './CCKCScreenView.js';
import CircuitLayerNode from './CircuitLayerNode.js';
import ResistorNode from './ResistorNode.js';
import Dog from '../model/Dog.js';

export default class DogNode extends ResistorNode {
  private readonly barkNode: BarkNode;
  private readonly isBarkingListener: ( isBarking: any ) => void;
  private readonly dog: Dog;
  private readonly boundsListener: () => void;

  /**
   * @param {CCKCScreenView|null} screenView - main screen view, null for isIcon
   * @param {CircuitLayerNode|null} circuitLayerNode, null for isIcon
   * @param {Dog} dog
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Tandem} tandem
   * @param {Object} [providedOptions]
   */
  constructor( screenView: CCKCScreenView | null, circuitLayerNode: CircuitLayerNode | null, dog: Dog,
               viewTypeProperty: Property<CircuitElementViewType>, tandem: Tandem, providedOptions?: any ) {
    super( screenView, circuitLayerNode, dog, viewTypeProperty, tandem, providedOptions );

    const soundClip = new SoundClip( dogBark_mp3 );
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

    this.boundsListener = () => positionBark();
    this.contentNode.boundsProperty.link( this.boundsListener );

    this.dog = dog;
    this.isBarkingListener = isBarking => {

      // Position next to the dog's mouth
      positionBark();

      this.barkNode.visible = isBarking;

      isBarking && soundClip.play();
    };
    dog.isBarkingProperty.link( this.isBarkingListener );
  }

  dispose() {
    super.dispose();
    this.dog.isBarkingProperty.unlink( this.isBarkingListener );
    this.contentNode.boundsProperty.unlink( this.boundsListener );
  }
}

circuitConstructionKitCommon.register( 'DogNode', DogNode );