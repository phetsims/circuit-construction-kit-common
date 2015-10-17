// Copyright 2002-2015, University of Colorado Boulder

/**
 * This class represents a sparse solution containing only the solved unknowns in MNA.
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
   * @param {object.<number,number>} nodeVoltages
   * @param {element[]} elements, with currentSolution
   * @constructor
   */
  function LinearCircuitSolution( nodeVoltages, elements ) {
    this.nodeVoltages = nodeVoltages;
    this.elements = elements;
  }

  circuitConstructionKitBasics.register( 'LinearCircuitSolution', LinearCircuitSolution );

  return inherit( Object, LinearCircuitSolution, {
    approxEquals: function() {
      return false;
    },
    getCurrent: function() {
      return 0;
    },
    getNodeVoltage: function( node ) {
      return this.nodeVoltages[ node ];
    }

  } );
} );