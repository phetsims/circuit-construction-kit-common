// Copyright 2021, University of Colorado Boulder

/**
 * Circuits schematic mode can be rendered as IEC or IEEE
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import StringEnumerationProperty from '../../../axon/js/StringEnumerationProperty.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import AmmeterReadoutType, { AmmeterReadoutTypeValues } from '../model/AmmeterReadoutType.js';

const ammeterReadoutTypeProperty = new StringEnumerationProperty( AmmeterReadoutTypeValues, CCKCQueryParameters.ammeterReadout as AmmeterReadoutType );

circuitConstructionKitCommon.register( 'ammeterReadoutTypeProperty', ammeterReadoutTypeProperty );
export default ammeterReadoutTypeProperty;