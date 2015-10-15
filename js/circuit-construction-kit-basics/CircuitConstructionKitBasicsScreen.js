// Copyright 2002-2015, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var CircuitConstructionKitBasicsModel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuit-construction-kit-basics/model/CircuitConstructionKitBasicsModel' );
  var CircuitConstructionKitBasicsScreenView = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuit-construction-kit-basics/view/CircuitConstructionKitBasicsScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var circuitConstructionKitBasicsSimString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_BASICS/circuit-construction-kit-basics.title' );

  /**
   * @constructor
   */
  function CircuitConstructionKitBasicsScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = null;

    Screen.call( this, circuitConstructionKitBasicsSimString, icon,
      function() { return new CircuitConstructionKitBasicsModel(); },
      function( model ) { return new CircuitConstructionKitBasicsScreenView( model ); },
      { backgroundColor: 'white' }
    );
  }

  return inherit( Screen, CircuitConstructionKitBasicsScreen );
} );