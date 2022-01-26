// Copyright 2020-2022, University of Colorado Boulder

/**
 * Circuits schematic mode can be rendered as IEC or IEEE
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import StringEnumerationProperty from '../../../axon/js/StringEnumerationProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import SchematicType, { SchematicTypeValues } from './SchematicType.js';

const schematicTypeProperty = new StringEnumerationProperty( SchematicTypeValues, CCKCQueryParameters.schematicStandard as SchematicType, {
  tandem: Tandem.GENERAL_VIEW.createTandem( 'schematicTypeProperty' )
} );

circuitConstructionKitCommon.register( 'schematicTypeProperty', schematicTypeProperty );
export default schematicTypeProperty;