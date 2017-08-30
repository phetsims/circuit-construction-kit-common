// Copyright 2017, University of Colorado Boulder

/**
 * Enumeration for the different types of interaction, EXPLORE (used for open-ended exploration) or TEST (when testing out a black box circuit)
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );

  var InteractionMode = {
    EXPLORE: 'EXPLORE',
    TEST: 'TEST'
  };

  circuitConstructionKitCommon.register( 'InteractionMode', InteractionMode );

  InteractionMode.VALUES = [ InteractionMode.EXPLORE, InteractionMode.TEST ];

  // verify that enum is immutable, without the runtime penalty in production code
  assert && Object.freeze( InteractionMode );

  return InteractionMode;
} );