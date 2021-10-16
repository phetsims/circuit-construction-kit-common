// Copyright 2020-2021, University of Colorado Boulder

/**
 * Circuits schematic mode can be rendered as IEC or IEEE
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import Property from '../../../axon/js/Property.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

// TODO: Can be simplified with new enums
const schematicTypeProperty = new Property( CCKCQueryParameters.schematicStandard === 'iec' ? 'iec' :
                                            CCKCQueryParameters.schematicStandard === 'british' ? 'british' :
                                            'ieee' );

circuitConstructionKitCommon.register( 'schematicTypeProperty', schematicTypeProperty );
export default schematicTypeProperty;