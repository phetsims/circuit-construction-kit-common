/* eslint-disable */
import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,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';
const soundByteArray = base64SoundToByteArray( phetAudioContext, soundURI );
const unlock = asyncLoader.createLock( soundURI );
const wrappedAudioBuffer = new WrappedAudioBuffer();

// safe way to unlock
let unlocked = false;
const safeUnlock = () => {
  if ( !unlocked ) {
    unlock();
    unlocked = true;
  }
};

const onDecodeSuccess = decodedAudio => {
  if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
    wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
    safeUnlock();
  }
};
const onDecodeError = decodeError => {
  console.warn( 'decode of audio data failed, using stubbed sound, error: ' + decodeError );
  wrappedAudioBuffer.audioBufferProperty.set( phetAudioContext.createBuffer( 1, 1, phetAudioContext.sampleRate ) );
  safeUnlock();
};
const decodePromise = phetAudioContext.decodeAudioData( soundByteArray.buffer, onDecodeSuccess, onDecodeError );
if ( decodePromise ) {
  decodePromise
    .then( decodedAudio => {
      if ( wrappedAudioBuffer.audioBufferProperty.value === null ) {
        wrappedAudioBuffer.audioBufferProperty.set( decodedAudio );
        safeUnlock();
      }
    } )
    .catch( e => {
      console.warn( 'promise rejection caught for audio decode, error = ' + e );
      safeUnlock();
    } );
}
export default wrappedAudioBuffer;