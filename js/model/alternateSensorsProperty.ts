// Copyright 2021-2024, University of Colorado Boulder

import CCKCQueryParameters from '../CCKCQueryParameters.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';

/**
 * This Property enables an alternate set of voltmeters and series ammeters
 *
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

const alternateSensorsProperty = new BooleanProperty( CCKCQueryParameters.alternateSensors, {
  tandem: Tandem.PREFERENCES.createTandem( 'alternateSensorsProperty' )
} );

circuitConstructionKitCommon.register( 'alternateSensorsProperty', alternateSensorsProperty );
export default alternateSensorsProperty;