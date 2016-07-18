// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * The CircuitStruct keeps track of the Circuit components but without wiring up listeners or solving physics.
 * It is necessary in order to keep track of black box state (user created circuit and black box circuit).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Vertex' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Wire' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Battery' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/LightBulb' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Resistor' );
  var Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Switch' );

  function CircuitStruct( vertices, wires, resistors, lightBulbs, batteries, switches ) {
    this.vertices = vertices;
    this.wires = wires;
    this.resistors = resistors;
    this.lightBulbs = lightBulbs;
    this.batteries = batteries;
    this.switches = switches;
  }

  circuitConstructionKitCommon.register( 'CircuitStruct', CircuitStruct );

  return inherit( Object, CircuitStruct, {
    clear: function() {
      this.vertices.length = 0;
      this.wires.length = 0;
      this.batteries.length = 0;
      this.lightBulbs.length = 0;
      this.resistors.length = 0;
      this.switches.length = 0;
    },
    get circuitElements() {
      return []
        .concat( this.wires )
        .concat( this.batteries )
        .concat( this.lightBulbs )
        .concat( this.switches )
        .concat( this.resistors );
    }
  }, {
    fromStateObject: function( circuitState ) { // TODO: Tandem - Pass tandems through
      var circuit = new CircuitStruct( [], [], [], [], [], [] );
      var options = null;
      for ( var i = 0; i < circuitState.vertices.length; i++ ) {
        options = circuitState.vertices[ i ].options || {};
        circuit.vertices.push( new Vertex( circuitState.vertices[ i ].x, circuitState.vertices[ i ].y, options ) );
      }
      for ( i = 0; i < circuitState.wires.length; i++ ) {
        options = circuitState.wires[ i ].options || {};
        circuit.wires.push( new Wire(
          circuit.vertices[ circuitState.wires[ i ].startVertex ],
          circuit.vertices[ circuitState.wires[ i ].endVertex ],
          circuitState.wires[ i ].resistivity,
          options
        ) );
      }
      for ( i = 0; i < circuitState.batteries.length; i++ ) {
        options = circuitState.batteries[ i ].options || {};
        circuit.batteries.push( new Battery(
          circuit.vertices[ circuitState.batteries[ i ].startVertex ],
          circuit.vertices[ circuitState.batteries[ i ].endVertex ],
          circuitState.batteries[ i ].voltage,
          options
        ) );
      }
      for ( i = 0; i < circuitState.resistors.length; i++ ) {
        options = circuitState.resistors[ i ].options || {};
        circuit.resistors.push( new Resistor(
          circuit.vertices[ circuitState.resistors[ i ].startVertex ],
          circuit.vertices[ circuitState.resistors[ i ].endVertex ],
          circuitState.resistors[ i ].resistance,
          options
        ) );
      }
      for ( i = 0; i < circuitState.lightBulbs.length; i++ ) {
        options = circuitState.lightBulbs[ i ].options || {};
        circuit.lightBulbs.push( new LightBulb(
          circuit.vertices[ circuitState.lightBulbs[ i ].startVertex ],
          circuit.vertices[ circuitState.lightBulbs[ i ].endVertex ],
          circuitState.lightBulbs[ i ].resistance,
          options
        ) );
      }
      for ( i = 0; i < circuitState.switches.length; i++ ) {
        options = circuitState.switches[ i ].options || {};
        circuit.switches.push( new Switch(
          circuit.vertices[ circuitState.switches[ i ].startVertex ],
          circuit.vertices[ circuitState.switches[ i ].endVertex ],
          circuitState.wires[ i ].resistivity,
          options
        ) );
      }
      return circuit;
    }
  } );
} );