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
  function OOCircuit( batteries, resistors, currentSources ) {
  }

  circuitConstructionKitBasics.register( 'OOCircuit', OOCircuit );

  return inherit( Object, OOCircuit, {} );
} );