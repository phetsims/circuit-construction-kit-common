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
    vertexNodeAttributes: { stroke: 'black', lineWidth: 3, cursor: 'pointer' },
    toolboxIconLength: 60, // Width or height for icons in the control panel
    toolboxItemSpacing: 30,
    wireColor: '#B87333',
    DEFAULT_RESISTANCE: 4.5
  } );
} );