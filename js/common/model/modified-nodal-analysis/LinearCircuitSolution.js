// Copyright 2002-2015, University of Colorado Boulder

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
  function LinearCircuitSolution() {
  }

  circuitConstructionKitBasics.register( 'LinearCircuitSolution', LinearCircuitSolution );

  return inherit( Object, LinearCircuitSolution, {
    approxEquals: function() {
      return false;
    },
    getCurrent: function() {
      return 0;
    }
  } );
} );