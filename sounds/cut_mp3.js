/* eslint-disable */
/* @formatter:off */

import asyncLoader from '../../phet-core/js/asyncLoader.js';
import base64SoundToByteArray from '../../tambo/js/base64SoundToByteArray.js';
import WrappedAudioBuffer from '../../tambo/js/WrappedAudioBuffer.js';
import phetAudioContext from '../../tambo/js/phetAudioContext.js';

const soundURI = 'data:audio/mpeg;base64,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BjePHtTG9//4y8vZvjvbW17038qyI/Vi8n1Inm2ExPbPov3m1vn7znH+/n6/+v/n////////dpo4EPgnb/rbynaLVkIraA+hZiFIT0CQ6Gj/+3LECIANyVdh3PQAAjCk59D0juCUytl+NJkLigWVDRKCIEhLAtI4WWkpjlGXGP6vFf+GlYaLJFY1WOo17tf4iq/4FrWLXWGvrv/41qaa/65rtai5aahr/++v4VrX/4hmj+Fg6Vi8YCwFcGmfiKo85YacQBBAGzdNVzV5dDiZGsyiemiW1oSjk8RB/IeJwaTKxHKQJC0QiEaP9XOlGXVAKYmfBtGKUJEvJCCjYPBwgYCBEykBJtTokyVHZNERPKWyjbtROyUP42jJWWer4NFUFIsoVByglg4PAoomB3Emmq1GZPkCrCaL82aMCiLapzDChYiLYlqchGm17uPlvUqa5M8EAADPYDqEZQ4TgIs3DTUSLLmS0P1UGshxfphYIo0DR5JJyieI1edu2e16m5dFKc2ocbjnl9WSWf/7cMQdgA49N0GHpG+BlxYo+PYNaK1JLNhRhpDbBe9qflGYib7qaHApQcKKMyeHl6cO+kOQnXyzzMWp8cv+A5FhCp/daSb3Cyu2z9iy7oxwJEoq34hEwB+QCZBhJ5dlyLqSdsJTEjrRQ0QC5Rtax8aumPPPauYsZj2rVyMjDB5IRkwtTzGmZKdzNGJvkJBKDnFFFmGMFllFHTDQmlufCbwEyiZusidjp3ui4HHeaSMtIXWfaqYsSACuZVWXZ8bwzYTUcqIUSbRqARzAzppilmmA5DKZpkPBuc8zvyZ1vtbB3xJ/LZ0Tc+PmfoxO+W25xyuHOmaQ9buXdsozt37dn/X16e7es5dW1f//fZHV/GZe/vudxXd4V+n/4pmBmSHCmaXZ2CwRhsRisEhwRplGzn/YgBTMBcrfiIn/+3LEQ4ANCKdDlPMACuKp5/8xQAAAogoU/4JpRKhQwhySw44P1DCQfUG6oYOOYZaFliUA/wj8PSGSDIPiPySDZw1SLmTHNHwMqNT4kRkQUZMiRDBcReJk8iv9EljpqTA9DtMXQJ4hxbV/EojJCbSCkRWRxDS8TRXJ1jpFVOXf+T4yQ4CeNSuRpDyeHNGSJk8ktFjFBN0f/rdS00lGzB6VgyEDwCfV/tAxnKXF/1A0AAAAtAAAEAH/Zd//////ER4SjDwNLDQiVUxBTUUzLjk5LjVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/7cMRFg8MUAve8AQAwAAA0gAAABFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';
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