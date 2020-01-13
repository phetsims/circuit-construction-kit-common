// Copyright 2019, University of Colorado Boulder

/**
 * The DogNode is a ResistorNode that barks
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const ResistorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ResistorNode' );
  const SoundClip = require( 'TAMBO/sound-generators/SoundClip' );
  const soundManager = require( 'TAMBO/soundManager' );

  // images
  const dogBarkingImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/dog-bark.png' );
  const dogImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/dog.png' );

  // sounds
  const dogBarkSound = require( 'sound!CIRCUIT_CONSTRUCTION_KIT_COMMON/dog-bark.mp3' );

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

  return circuitConstructionKitCommon.register( 'DogNode', DogNode );
} );