// Copyright 2017, University of Colorado Boulder

/**
 * Enumeration for how to render the circuit elements: lifelike or schematic.
 * Because of how this file is used in the model and query parameter file, it must be declared separately
 * to avoid circular module loading errors.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );

  const CircuitElementViewType = new Enumeration( [ 'LIFELIKE', 'SCHEMATIC' ] );

  return circuitConstructionKitCommon.register( 'CircuitElementViewType', CircuitElementViewType );
} );