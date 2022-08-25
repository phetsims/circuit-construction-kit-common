// Copyright 2020-2022, University of Colorado Boulder

/**
 * Circuits schematic mode can be rendered as IEC or IEEE
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import SchematicType from './SchematicType.js';

const schematicTypeProperty = new EnumerationProperty( CCKCQueryParameters.schematicStandard === 'ieee' ? SchematicType.IEEE :
                                                       CCKCQueryParameters.schematicStandard === 'iec' ? SchematicType.IEC :
                                                       SchematicType.BRITISH, {
  tandem: Tandem.PREFERENCES.createTandem( 'schematicTypeProperty' )
} );

circuitConstructionKitCommon.register( 'schematicTypeProperty', schematicTypeProperty );
export default schematicTypeProperty;