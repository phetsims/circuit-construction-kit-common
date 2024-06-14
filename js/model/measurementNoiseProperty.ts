// Copyright 2021-2024, University of Colorado Boulder

import Property from '../../../axon/js/Property.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';

/**
 * Measurement noise can be turned on or off to simulate uncertainty in voltage and current measurements
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

const measurementNoiseProperty = new BooleanProperty( CCKCQueryParameters.measurementNoise, {
  tandem: Tandem.PREFERENCES.createTandem( 'measurementNoiseProperty' )
} );

circuitConstructionKitCommon.register( 'measurementNoiseProperty', measurementNoiseProperty );
export default measurementNoiseProperty;