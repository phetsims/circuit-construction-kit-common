// Copyright 2015, University of Colorado Boulder

/**
 * Constants used in all of the sims/screens/scenes.
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
    solderColor: '#ae9f9e',
    defaultResistance: 4.5,
    layoutInset: 14,
    tapThreshold: 10, // Number of pixels (screen coordinates) that constitutes a tap instead of a drag
    fontAwesomeIconScale: 0.85, // Uniform scaling for all font awesome node button icons
    highlightColor: 'yellow',
    highlightLineWidth: 5
  } );
} );