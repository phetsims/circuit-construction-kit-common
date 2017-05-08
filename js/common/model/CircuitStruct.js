// Copyright 2016-2017, University of Colorado Boulder

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

  /**
   * @param {Vertex[]} vertices
   * @param {Wire[]} wires
   * @param {Resistor[]} resistors
   * @param {LightBulb[]} lightBulbs
   * @param {Battery[]} batteries
   * @param {Switch[]} switches
   * @constructor
   */
  function CircuitStruct( vertices, wires, resistors, lightBulbs, batteries, switches ) {

    // @private (read-only)
    this.vertices = vertices;

    // @private (read-only)
    this.wires = wires;

    // @private (read-only)
    this.resistors = resistors;

    // @private (read-only)
    this.lightBulbs = lightBulbs;

    // @private (read-only)
    this.batteries = batteries;

    // @private (read-only)
    this.switches = switches;
  }

  circuitConstructionKitCommon.register( 'CircuitStruct', CircuitStruct );

  return inherit( Object, CircuitStruct, {

    /**
     * Clear out the CircuitStruct. Used for Black Box Study to clear the records of user-created circuits in the black box.
     * @public
     */
    clear: function() {
      this.vertices.length = 0;
      this.wires.length = 0;
      this.batteries.length = 0;
      this.lightBulbs.length = 0;
      this.resistors.length = 0;
      this.switches.length = 0;
    },

    /**
     * Gets all the circuit elements.
     * @returns {CircuitElement[]}
     */
    get circuitElements() {
      return []
        .concat( this.wires )
        .concat( this.batteries )
        .concat( this.lightBulbs )
        .concat( this.switches )
        .concat( this.resistors );
    }
  }, {

    /**
     * Create a CircuitStruct from a plain object for deserialization.
     * @param {Object} circuitState
     * @param {NumberProperty} resistivityProperty - shared value for resistivity across all of the wires
     * @param {Tandem} tandem
     * @returns {CircuitStruct}
     * @public
     */
    fromStateObject: function( circuitState, resistivityProperty, tandem ) {
      var circuitStruct = new CircuitStruct( [], [], [], [], [], [] );
      tandem = tandem.createGroupTandem( 'circuitStructElement' );
      var options = null;
      for ( var i = 0; i < circuitState.vertices.length; i++ ) {
        options = circuitState.vertices[ i ].options || {};
        options.tandem = tandem.createNextTandem();
        circuitStruct.vertices.push( new Vertex( circuitState.vertices[ i ].x, circuitState.vertices[ i ].y, options ) );
      }
      for ( i = 0; i < circuitState.wires.length; i++ ) {
        options = circuitState.wires[ i ].options || {};
        circuitStruct.wires.push( new Wire(
          circuitStruct.vertices[ circuitState.wires[ i ].startVertex ],
          circuitStruct.vertices[ circuitState.wires[ i ].endVertex ],
          resistivityProperty,
          tandem.createNextTandem(),
          options
        ) );
      }
      for ( i = 0; i < circuitState.batteries.length; i++ ) {
        options = circuitState.batteries[ i ].options || {};
        circuitStruct.batteries.push( new Battery(
          circuitStruct.vertices[ circuitState.batteries[ i ].startVertex ],
          circuitStruct.vertices[ circuitState.batteries[ i ].endVertex ],
          null,
          tandem.createNextTandem(), {
            voltage: circuitState.batteries[ i ].voltage
          }
        ) );
      }
      for ( i = 0; i < circuitState.resistors.length; i++ ) {
        options = circuitState.resistors[ i ].options || {};
        circuitStruct.resistors.push( new Resistor(
          circuitStruct.vertices[ circuitState.resistors[ i ].startVertex ],
          circuitStruct.vertices[ circuitState.resistors[ i ].endVertex ],
          tandem.createNextTandem(), {
            resistance: circuitState.resistors[ i ].resistance
          }
        ) );
      }
      for ( i = 0; i < circuitState.lightBulbs.length; i++ ) {
        options = circuitState.lightBulbs[ i ].options || {};
        circuitStruct.lightBulbs.push( new LightBulb(
          circuitStruct.vertices[ circuitState.lightBulbs[ i ].startVertex ],
          circuitStruct.vertices[ circuitState.lightBulbs[ i ].endVertex ],
          circuitState.lightBulbs[ i ].resistance,
          tandem.createNextTandem(),
          options
        ) );
      }
      for ( i = 0; i < circuitState.switches.length; i++ ) {
        options = circuitState.switches[ i ].options || {};
        circuitStruct.switches.push( new Switch(
          circuitStruct.vertices[ circuitState.switches[ i ].startVertex ],
          circuitStruct.vertices[ circuitState.switches[ i ].endVertex ],
          circuitState.wires[ i ].resistivity,
          tandem.createNextTandem(),
          options
        ) );
      }
      return circuitStruct;
    }
  } );
} );