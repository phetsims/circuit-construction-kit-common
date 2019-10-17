// Copyright 2016-2019, University of Colorado Boulder

/**
 * The CircuitStruct keeps track of the Circuit components but without wiring up listeners or solving physics.
 * It is necessary in order to keep track of black box state (user created circuit and black box circuit).
 *
 * TODO: Use new save/load feature instead
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  const merge = require( 'PHET_CORE/merge' );
  const Property = require( 'AXON/Property' );
  const Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  const Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  const Vector2 = require( 'DOT/Vector2' );
  const Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );

  class CircuitStruct {
    constructor() {

      // @public {Vertex[]}
      this.vertices = [];

      // @public {Wire[]}
      this.wires = [];

      // @public {Resistor[]}
      this.resistors = [];

      // @public {LightBulb[]}
      this.lightBulbs = [];

      // @public {Battery[]}
      this.batteries = [];

      // @public {Switch[]}
      this.switches = [];
    }

    /**
     * Clear out the CircuitStruct. Used for Black Box Study to clear the records of user-created circuits in the black
     * box.
     * @public
     */
    clear() {
      this.vertices.length = 0;
      this.wires.length = 0;
      this.batteries.length = 0;
      this.lightBulbs.length = 0;
      this.resistors.length = 0;
      this.switches.length = 0;
    }

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
  }

  /**
   * Create a CircuitStruct from a plain object for deserialization.
   * @param {Object} circuitState
   * @param {NumberProperty} resistivityProperty - shared value for resistivity across all of the wires
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @returns {CircuitStruct}
   * @public
   */
  CircuitStruct.fromStateObject = ( circuit, circuitState, resistivityProperty, tandem, options ) => {
    const circuitStruct = new CircuitStruct();
    tandem = tandem.createGroupTandem( 'circuitStructElement' );
    options = merge( {

      // See CircuitElement.js for options
    }, options );
    for ( let i = 0; i < circuitState.vertices.length; i++ ) {
      options = circuitState.vertices[ i ].options || {};
      options.tandem = tandem.createNextTandem();
      const vertex = circuit.vertexGroup.createNextMember( new Vector2( circuitState.vertices[ i ].x, circuitState.vertices[ i ].y ), options );
      circuitStruct.vertices.push( vertex );
    }
    for ( let i = 0; i < circuitState.wires.length; i++ ) {
      options = circuitState.wires[ i ].options || {};
      circuitStruct.wires.push( new Wire(
        circuitStruct.vertices[ circuitState.wires[ i ].startVertex ],
        circuitStruct.vertices[ circuitState.wires[ i ].endVertex ],
        resistivityProperty,
        tandem.createNextTandem(),
        options
      ) );
    }
    for ( let i = 0; i < circuitState.batteries.length; i++ ) {
      options = circuitState.batteries[ i ].options || {};
      circuitStruct.batteries.push( new Battery(
        circuitStruct.vertices[ circuitState.batteries[ i ].startVertex ],
        circuitStruct.vertices[ circuitState.batteries[ i ].endVertex ],
        new Property( 0 ),
        Battery.BatteryType.NORMAL, // TODO(phet-io): save/restore battery type
        tandem.createNextTandem(), {
          voltage: circuitState.batteries[ i ].voltage
        }
      ) );
    }
    for ( let i = 0; i < circuitState.resistors.length; i++ ) {
      options = circuitState.resistors[ i ].options || {};
      circuitStruct.resistors.push( new Resistor(
        circuitStruct.vertices[ circuitState.resistors[ i ].startVertex ],
        circuitStruct.vertices[ circuitState.resistors[ i ].endVertex ],
        tandem.createNextTandem(), {
          resistance: circuitState.resistors[ i ].resistance
        }
      ) );
    }
    for ( let i = 0; i < circuitState.lightBulbs.length; i++ ) {
      options = circuitState.lightBulbs[ i ].options || {};
      circuitStruct.lightBulbs.push( new LightBulb(
        circuitStruct.vertices[ circuitState.lightBulbs[ i ].startVertex ],
        circuitStruct.vertices[ circuitState.lightBulbs[ i ].endVertex ],
        circuitState.lightBulbs[ i ].resistance,
        null, // TODO (phet-io) pass this value somehow
        tandem.createNextTandem(),
        options
      ) );
    }
    for ( let i = 0; i < circuitState.switches.length; i++ ) {
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
  };

  return circuitConstructionKitCommon.register( 'CircuitStruct', CircuitStruct );
} );