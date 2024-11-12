// Copyright 2021-2024, University of Colorado Boulder

import CCKCQueryParameters from '../CCKCQueryParameters.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';

/**
 * Measurement noise can be turned on or off to simulate uncertainty in voltage and current measurements
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

const circuitElementNoiseProperty = new BooleanProperty( CCKCQueryParameters.circuitElementNoise, {
  tandem: Tandem.PREFERENCES.createTandem( 'circuitElementNoiseProperty' )
} );

circuitConstructionKitCommon.register( 'circuitElementNoiseProperty', circuitElementNoiseProperty );
export default circuitElementNoiseProperty;