// Copyright 2021-2024, University of Colorado Boulder

/**
 * Circuits schematic mode can be rendered as IEC or IEEE
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import AmmeterReadoutType from '../model/AmmeterReadoutType.js';

const ammeterReadoutTypeProperty = new EnumerationProperty( CCKCQueryParameters.ammeterReadout === 'magnitude' ? AmmeterReadoutType.MAGNITUDE : AmmeterReadoutType.SIGNED, {
  tandem: Tandem.PREFERENCES.createTandem( 'ammeterReadoutTypeProperty' ),
  phetioFeatured: true
} );

circuitConstructionKitCommon.register( 'ammeterReadoutTypeProperty', ammeterReadoutTypeProperty );
export default ammeterReadoutTypeProperty;