// Copyright 2015-2021, University of Colorado Boulder

/**
 * Model for a resistor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import validate from '../../../axon/js/validate.js';
import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import IOType from '../../../tandem/js/types/IOType.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElement from './CircuitElement.js';
import FixedCircuitElement from './FixedCircuitElement.js';
import ResistorType from './ResistorType.js';
import Vertex from './Vertex.js';
import RichEnumerationIO from '../../../axon/js/RichEnumerationIO.js';

type ResistorOptions = {
  isMetallic: boolean,
  resistorType: any
};

class Resistor extends FixedCircuitElement {
  readonly resistanceProperty: NumberProperty;
  readonly resistorType: any;
  static ResistorIO: IOType;

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Resistor.ResistorType} resistorType
   * @param {Tandem} tandem
   * @param {Object} [providedOptions]
   */
  constructor( startVertex: Vertex, endVertex: Vertex, resistorType: any, tandem: Tandem, providedOptions?: Partial<ResistorOptions> ) {
    const options = merge( {
      isFlammable: true, // All resistors are flammable except for the dog, which automatically disconnects at high current.
      phetioType: Resistor.ResistorIO,
      numberOfDecimalPlaces: resistorType === ResistorType.RESISTOR ? 1 : 0
    }, providedOptions ) as ResistorOptions;

    assert && assert( !options.hasOwnProperty( 'resistance' ), 'Resistance should be passed through resistorType' );

    // validate resistor type
    // @ts-ignore
    validate( resistorType, { valueType: Resistor.ResistorType } );

    // @public (read-only)
    assert && assert( !options.hasOwnProperty( 'isMetallic' ), 'isMetallic is given by the resistorType' );
    options.isMetallic = resistorType.isMetallic;

    super( startVertex, endVertex, resistorType.length, tandem, options );

    // @public (read-only) {Resistor.ResistorType} indicates one of ResistorType values
    this.resistorType = resistorType;

    assert && assert( typeof this.resistorType.isMetallic === 'boolean' );

    // @public {Property.<number>} the resistance in ohms
    this.resistanceProperty = new NumberProperty( resistorType.defaultResistance, {
      tandem: tandem.createTandem( 'resistanceProperty' ),

      // Specify the Property range for seamless PhET-iO interoperation
      range: this.resistorType.range
    } );
  }

  /**
   * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
   * @public
   */
  dispose() {
    this.resistanceProperty.dispose();
    super.dispose();
  }

  /**
   * Returns true if the resistance is editable.  Household item resistance is not editable.
   * @returns {boolean}
   * @public
   */
  isResistanceEditable() {
    return this.resistorType === ResistorType.HIGH_RESISTANCE_RESISTOR ||
           this.resistorType === ResistorType.RESISTOR;
  }

  /**
   * Get the properties so that the circuit can be solved when changed.
   * @override
   * @returns {Property.<*>[]}
   * @public
   */
  getCircuitProperties() {
    return [ this.resistanceProperty ];
  }
}

// @public {IOType}
Resistor.ResistorIO = new IOType( 'ResistorIO', {
  valueType: Resistor,
  supertype: CircuitElement.CircuitElementIO,
  stateSchema: {
    resistorType: RichEnumerationIO( ResistorType )
  },
  toStateObject: ( resistor: Resistor ) => {
    const stateObject = CircuitElement.CircuitElementIO.toStateObject( resistor );
    stateObject.resistorType = RichEnumerationIO( ResistorType ).toStateObject( resistor.resistorType );
    return stateObject;
  },

  stateToArgsForConstructor( stateObject: any ) {
    const args = CircuitElement.CircuitElementIO.stateToArgsForConstructor( stateObject );
    args.push( RichEnumerationIO( ResistorType ).fromStateObject( stateObject.resistorType ) );
    return args;
  }
} );

circuitConstructionKitCommon.register( 'Resistor', Resistor );
export type { ResistorOptions };
export default Resistor;