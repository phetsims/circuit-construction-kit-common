// Copyright 2020, University of Colorado Boulder

/**
 * Circuits schematic mode can be rendered as IEC or IEEE
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import Property from '../../../axon/js/Property.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import SchematicType from './SchematicType.js';

const schematicTypeProperty = new Property( CCKCQueryParameters.schematicStandard === 'iec' ? SchematicType.IEC : SchematicType.IEEE );

circuitConstructionKitCommon.register( 'schematicTypeProperty', schematicTypeProperty );
export default schematicTypeProperty;