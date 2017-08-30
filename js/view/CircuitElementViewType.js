// Copyright 2017, University of Colorado Boulder

/**
 * Enumeration for how to render the circuit elements: lifelike or schematic
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );

  //REVIEW*: Was expecting this in the model directory, since it is used in the model
  var CircuitElementViewType = {
    LIFELIKE: 'LIFELIKE',
    SCHEMATIC: 'SCHEMATIC'
  };

  circuitConstructionKitCommon.register( 'CircuitElementViewType', CircuitElementViewType );

  CircuitElementViewType.VALUES = [ CircuitElementViewType.LIFELIKE, CircuitElementViewType.SCHEMATIC ];

  // verify that enum is immutable, without the runtime penalty in production code
  assert && Object.freeze( CircuitElementViewType );

  return CircuitElementViewType;
} );
