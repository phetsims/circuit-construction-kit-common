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

  //REVIEW*: I've mostly seen enums put under model (if they are used in the model), view, or in an enum subdirectory
  //REVIEW*: ('model/enum', or 'view/enum'). Would one of those solutions be better here for this and CurrentType?
  var CircuitElementViewType = {
    LIFELIKE: 'LIFELIKE',
    SCHEMATIC: 'SCHEMATIC'
  };

  circuitConstructionKitCommon.register( 'CircuitElementViewType', CircuitElementViewType );

  CircuitElementViewType.VALUES = [ CircuitElementViewType.LIFELIKE, CircuitElementViewType.SCHEMATIC ];

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( CircuitElementViewType ); }

  return CircuitElementViewType;
} );
