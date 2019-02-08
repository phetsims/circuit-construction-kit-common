// Copyright 2017, University of Colorado Boulder

/**
 * Enumeration for how to render the circuit elements: lifelike or schematic
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );

  const CircuitElementViewType = {
    LIFELIKE: 'LIFELIKE',
    SCHEMATIC: 'SCHEMATIC'
  };

  circuitConstructionKitCommon.register( 'CircuitElementViewType', CircuitElementViewType );

  CircuitElementViewType.VALUES = [ CircuitElementViewType.LIFELIKE, CircuitElementViewType.SCHEMATIC ];

  // verify that enum is immutable, without the runtime penalty in production code
  assert && Object.freeze( CircuitElementViewType );

  return CircuitElementViewType;
} );
