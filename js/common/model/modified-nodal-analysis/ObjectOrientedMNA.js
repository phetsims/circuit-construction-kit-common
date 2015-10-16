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
  var LinearCircuitSolution = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/modified-nodal-analysis/LinearCircuitSolution' );
  
  /**
   *
   * @constructor
   */
  function ObjectOrientedMNA() {
  }

  circuitConstructionKitBasics.register( 'ObjectOrientedMNA', ObjectOrientedMNA );

  return inherit( Object, ObjectOrientedMNA, {}, {
    solve: function() {

      return new LinearCircuitSolution();
    }
  } );
} );