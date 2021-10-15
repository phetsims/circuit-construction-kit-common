// Copyright 2017-2020, University of Colorado Boulder

/**
 * Enumeration for how to render the current: electrons or conventional (arrows).
 * Because of how this file is used in the model and query parameter file, it must be declared separately
 * to avoid circular module loading errors.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

type CurrentType = 'electrons' | 'conventional';
export default CurrentType;