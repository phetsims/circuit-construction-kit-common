// Copyright 2021-2022, University of Colorado Boulder

/**
 * Circuits schematic mode can be rendered as IEC or IEEE
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import StringEnumerationProperty from '../../../axon/js/StringEnumerationProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import AmmeterReadoutType, { AmmeterReadoutTypeValues } from '../model/AmmeterReadoutType.js';

const ammeterReadoutTypeProperty = new StringEnumerationProperty( AmmeterReadoutTypeValues, CCKCQueryParameters.ammeterReadout as AmmeterReadoutType, {
  tandem: Tandem.GENERAL_VIEW.createTandem( 'ammeterReadoutTypeProperty' )
} );

circuitConstructionKitCommon.register( 'ammeterReadoutTypeProperty', ammeterReadoutTypeProperty );
export default ammeterReadoutTypeProperty;