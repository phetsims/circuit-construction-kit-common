// Copyright 2021-2022, University of Colorado Boulder

/**
 * The CircuitStruct keeps track of the Circuit components but without wiring up listeners or solving physics.
 * It is necessary in order to keep track of black box state (user created circuit and black box circuit).
 *
 * TODO (black-box-study): Use new save/load feature instead
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Battery from './Battery.js';
import CircuitElement from './CircuitElement.js';
import LightBulb from './LightBulb.js';
import Resistor from './Resistor.js';
import ResistorType from './ResistorType.js';
import Switch from './Switch.js';
import Vertex from './Vertex.js';
import Wire from './Wire.js';
import CircuitElementViewType from './CircuitElementViewType.js';
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';

class CircuitStruct {
  vertices: Vertex[];
  wires: Wire[];
  resistors: Resistor[];
  lightBulbs: LightBulb[];
  batteries: Battery[];
  switches: Switch[];
  static fromStateObject: ( circuit: any, circuitState: any, resistivityProperty: any, tandem: any, options: any ) => CircuitStruct;

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
   * @public
   */
  get circuitElements() {
    return ( [] as CircuitElement[] )
      .concat( this.wires )
      .concat( this.batteries )
      .concat( this.lightBulbs )
      .concat( this.switches )
      .concat( this.resistors );
  }
}

/**
 * Create a CircuitStruct from a plain object for deserialization.
 * @param {Object} circuit
 * @param {Object} circuitState
 * @param {Property.<number>} resistivityProperty - shared value for resistivity across all of the wires
 * @param {Tandem} tandem
 * @param {Object} [options]
 * @returns {CircuitStruct}
 * @public
 */
CircuitStruct.fromStateObject = ( circuit, circuitState, resistivityProperty, tandem, options ) => {
  const circuitStruct = new CircuitStruct();
  options = merge( {

    // See CircuitElement.js for options
  }, options );
  for ( let i = 0; i < circuitState.vertices.length; i++ ) {
    options = circuitState.vertices[ i ].options || {};
    const vertex = circuit.vertexGroup.createNextElement( new Vector2( circuitState.vertices[ i ].x, circuitState.vertices[ i ].y ), options );
    circuitStruct.vertices.push( vertex );
  }
  for ( let i = 0; i < circuitState.wires.length; i++ ) {
    options = circuitState.wires[ i ].options || {};
    circuitStruct.wires.push( new Wire(
      circuitStruct.vertices[ circuitState.wires[ i ].startVertex ],
      circuitStruct.vertices[ circuitState.wires[ i ].endVertex ],
      resistivityProperty,
      Tandem.OPT_OUT,
      options
    ) );
  }
  for ( let i = 0; i < circuitState.batteries.length; i++ ) {
    options = circuitState.batteries[ i ].options || {};
    circuitStruct.batteries.push( new Battery(
      circuitStruct.vertices[ circuitState.batteries[ i ].startVertex ],
      circuitStruct.vertices[ circuitState.batteries[ i ].endVertex ],
      new NumberProperty( 0 ),
      'normal', // TODO (black-box-study): save/restore battery type
      Tandem.OPT_OUT, {
        voltage: circuitState.batteries[ i ].voltage,
        numberOfDecimalPlaces: Battery.VOLTAGE_DECIMAL_PLACES
      }
    ) );
  }
  for ( let i = 0; i < circuitState.resistors.length; i++ ) {
    options = circuitState.resistors[ i ].options || {};
    circuitStruct.resistors.push( new Resistor(
      circuitStruct.vertices[ circuitState.resistors[ i ].startVertex ],
      circuitStruct.vertices[ circuitState.resistors[ i ].endVertex ],
      ResistorType.RESISTOR,
      Tandem.OPT_OUT // TODO (black-box-study): a way to set the resistance
    ) );
  }
  const p = new EnumerationProperty( CircuitElementViewType.LIFELIKE );
  for ( let i = 0; i < circuitState.lightBulbs.length; i++ ) {
    options = circuitState.lightBulbs[ i ].options || {};
    circuitStruct.lightBulbs.push( new LightBulb(
      circuitStruct.vertices[ circuitState.lightBulbs[ i ].startVertex ],
      circuitStruct.vertices[ circuitState.lightBulbs[ i ].endVertex ],
      circuitState.lightBulbs[ i ].resistance,
      p, // TODO (black-box-study) pass this value somehow
      Tandem.OPT_OUT,
      options
    ) );
  }
  for ( let i = 0; i < circuitState.switches.length; i++ ) {
    options = circuitState.switches[ i ].options || {};
    circuitStruct.switches.push( new Switch(
      circuitStruct.vertices[ circuitState.switches[ i ].startVertex ],
      circuitStruct.vertices[ circuitState.switches[ i ].endVertex ],
      Tandem.OPT_OUT,
      options
    ) );
  }
  return circuitStruct;
};

circuitConstructionKitCommon.register( 'CircuitStruct', CircuitStruct );
export default CircuitStruct;