// Copyright 2017, University of Colorado Boulder

/**
 * Enumeration for the different types of Battery, NORMAL or HIGH_VOLTAGE
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );

  const BatteryType = {
    NORMAL: 'NORMAL',
    HIGH_VOLTAGE: 'HIGH_VOLTAGE'
  };

  circuitConstructionKitCommon.register( 'BatteryType', BatteryType );

  BatteryType.VALUES = [ BatteryType.NORMAL, BatteryType.HIGH_VOLTAGE ];

  // verify that enum is immutable, without the runtime penalty in production code
  assert && Object.freeze( BatteryType );

  return BatteryType;
} );