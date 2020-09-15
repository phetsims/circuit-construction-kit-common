// Copyright 2020, University of Colorado Boulder

/**
 * Circuits schematic mode can be rendered as IEC or IEEE
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import Enumeration from '../../../phet-core/js/Enumeration.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

const SchematicType = Enumeration.byKeys( [ 'IEC', 'IEEE' ] );

circuitConstructionKitCommon.register( 'SchematicType', SchematicType );
export default SchematicType;