// Copyright 2020-2021, University of Colorado Boulder

/**
 * Circuits schematic mode can be rendered as IEC or IEEE
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import Property from '../../../axon/js/Property.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import AmmeterReadoutType from '../model/AmmeterReadoutType.js';

const ammeterReadoutTypeProperty = new Property<AmmeterReadoutType>( CCKCQueryParameters.ammeterReadout );

circuitConstructionKitCommon.register( 'ammeterReadoutTypeProperty', ammeterReadoutTypeProperty );
export default ammeterReadoutTypeProperty;