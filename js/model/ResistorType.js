// Copyright 2017, University of Colorado Boulder

/**
 * Enumeration for the different resistor types.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );

  const ResistorType = {
    RESISTOR: 'RESISTOR',
    HIGH_RESISTANCE_RESISTOR: 'HIGH_RESISTANCE_RESISTOR',
    COIN: 'COIN',
    PAPER_CLIP: 'PAPER_CLIP',
    PENCIL: 'PENCIL',
    ERASER: 'ERASER',
    HAND: 'HAND',
    DOG: 'DOG',
    DOLLAR_BILL: 'DOLLAR_BILL'
  };

  circuitConstructionKitCommon.register( 'ResistorType', ResistorType );

  ResistorType.VALUES = _.keys( ResistorType );

  ResistorType.isMetallic = type => type === ResistorType.COIN || type === ResistorType.PAPER_CLIP;

  // verify that enum is immutable, without the runtime penalty in production code
  assert && Object.freeze( ResistorType );

  return ResistorType;
} );