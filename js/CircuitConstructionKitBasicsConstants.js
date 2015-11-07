// Copyright 2015, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );

  /**
   *
   * @constructor
   */
  function CircuitConstructionKitBasicsConstants() {
  }

  circuitConstructionKitBasics.register( 'CircuitConstructionKitBasicsConstants', CircuitConstructionKitBasicsConstants );

  return inherit( Object, CircuitConstructionKitBasicsConstants, {}, {
    terminalNodeAttributes: { stroke: 'black', lineWidth: 3, lineDash: [ 8, 6 ], cursor: 'pointer' }
  } );
} );