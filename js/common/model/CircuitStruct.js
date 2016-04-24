// Copyright 2016, University of Colorado Boulder

/**
 * The CircuitStruct keeps track of the Circuit components but without wiring up listeners or solving physics.
 * It is necessary in order to keep track of black box state (user created circuit and black box circuit).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  function CircuitStruct( vertices, wires, resistors, lightBulbs, batteries ) {
    this.vertices = vertices;
    this.wires = wires;
    this.resistors = resistors;
    this.lightBulbs = lightBulbs;
    this.batteries = batteries;
  }

  return inherit( Object, CircuitStruct, {
    clear: function() {
      this.vertices.length = 0;
      this.wires.length = 0;
      this.batteries.length = 0;
      this.lightBulbs.length = 0;
      this.resistors.length = 0;
    },
    get circuitElements() {
      return []
        .concat( this.wires )
        .concat( this.batteries )
        .concat( this.lightBulbs )
        .concat( this.resistors );
    }
  } );
} );