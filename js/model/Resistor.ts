// Copyright 2015-2021, University of Colorado Boulder

/**
 * Model for a resistor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import validate from '../../../axon/js/validate.js';
import Range from '../../../dot/js/Range.js';
import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationIO from '../../../phet-core/js/EnumerationIO.js';
import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import IOType from '../../../tandem/js/types/IOType.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElement from './CircuitElement.js';
import FixedCircuitElement from './FixedCircuitElement.js';
import Vertex from './Vertex.js';

type ResistorOptions = {
  isMetallic: boolean,
  resistorType: any
};

type ResistorEnumGroup = {
  RESISTOR: ResistorEnumValue,
  HIGH_RESISTANCE_RESISTOR: ResistorEnumValue,
  COIN: ResistorEnumValue,
  PAPER_CLIP: ResistorEnumValue,
  PENCIL: ResistorEnumValue,
  ERASER: ResistorEnumValue,
  HAND: ResistorEnumValue,
  DOG: ResistorEnumValue,
  DOLLAR_BILL: ResistorEnumValue,
};

class Resistor extends FixedCircuitElement {
  readonly resistanceProperty: NumberProperty;
  private readonly resistorType: any;
  static ResistorIO: IOType;
  static ResistorType: ResistorEnumGroup;
  static Resistor: { [ key: string ]: ResistorEnumValue; };

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Resistor.ResistorType} resistorType
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( startVertex: Vertex, endVertex: Vertex, resistorType: any, tandem: Tandem, options?: Partial<ResistorOptions> ) {
    const filledOptions = merge( {
      isFlammable: true, // All resistors are flammable except for the dog, which automatically disconnects at high current.
      phetioType: Resistor.ResistorIO,
      numberOfDecimalPlaces: resistorType === Resistor.ResistorType.RESISTOR ? 1 : 0
    }, options ) as ResistorOptions;

    assert && assert( !filledOptions.hasOwnProperty( 'resistance' ), 'Resistance should be passed through resistorType' );

    // validate resistor type
    // @ts-ignore
    validate( resistorType, { valueType: Resistor.ResistorType } );

    // @public (read-only)
    assert && assert( !filledOptions.hasOwnProperty( 'isMetallic' ), 'isMetallic is given by the resistorType' );
    filledOptions.isMetallic = resistorType.isMetallic;

    super( startVertex, endVertex, resistorType.length, tandem, filledOptions );

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
    return this.resistorType === Resistor.ResistorType.HIGH_RESISTANCE_RESISTOR ||
           this.resistorType === Resistor.ResistorType.RESISTOR;
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

/**
 * Values for the ResistorTypeEnum
 */
class ResistorEnumValue {
  defaultResistance: number;
  range: Range;
  isMetallic: boolean;
  length: number;
  verticalOffset: number;

  /**
   * @param {number} defaultResistance - default value for resistance, in Ohms
   * @param {Range} resistanceRange - possible values for the resistance, in Ohms
   * @param {boolean} isMetallic - whether the item is metallic (non-insulated) and hence can have its value read at any point
   * @param {number} length
   * @param {number} [verticalOffset]
   */
  constructor( defaultResistance: number, resistanceRange: Range, isMetallic: boolean, length: number, verticalOffset: number = 0 ) {

    // @public (read-only) {number} - in Ohms
    this.defaultResistance = defaultResistance;

    // @public (read-only) {Range} - in Ohms
    this.range = resistanceRange;

    // @public (read-only) {boolean}
    this.isMetallic = isMetallic;

    // @public (read-only} {number} - in view coordinates
    this.length = length;

    // @public (read-only) {number} - amount the view is shifted down in view coordinates
    this.verticalOffset = verticalOffset;
  }

  /**
   * Convenience function for creating a fixed-resistance resistor, like a household item.
   * @param {number} resistance
   * @param {boolean} isMetallic
   * @param {number} length
   * @param {number} [verticalOffset]
   * @returns {ResistorEnumValue}
   * @private
   */
  static fixed( resistance: number, isMetallic: boolean, length: number, verticalOffset: number = 0 ) {
    return new ResistorEnumValue( resistance, new Range( resistance, resistance ), isMetallic, length, verticalOffset );
  }
}

// @public {Enumeration} - Enumeration for the different resistor types.
Resistor.ResistorType = Enumeration.byMap( {
  RESISTOR: new ResistorEnumValue( 10, new Range( 0, 120 ), false, CCKCConstants.RESISTOR_LENGTH ),
  HIGH_RESISTANCE_RESISTOR: new ResistorEnumValue( 1000, new Range( 100, 10000 ), false, CCKCConstants.RESISTOR_LENGTH ),
  COIN: ResistorEnumValue.fixed( 0, true, CCKCConstants.COIN_LENGTH ),
  PAPER_CLIP: ResistorEnumValue.fixed( 0, true, CCKCConstants.PAPER_CLIP_LENGTH ),
  PENCIL: ResistorEnumValue.fixed( 25, false, CCKCConstants.PENCIL_LENGTH ),
  ERASER: ResistorEnumValue.fixed( 1000000000, false, CCKCConstants.ERASER_LENGTH ),
  HAND: ResistorEnumValue.fixed( 100000, false, CCKCConstants.HAND_LENGTH, 15 ),

  // Adjust the dog so the charges travel along the tail/legs, see https://github.com/phetsims/circuit-construction-kit-common/issues/364
  DOG: ResistorEnumValue.fixed( 100000, false, CCKCConstants.DOG_LENGTH, -40 ),
  DOLLAR_BILL: ResistorEnumValue.fixed( 1000000000, false, CCKCConstants.DOLLAR_BILL_LENGTH )
} ) as unknown as ResistorEnumGroup;

// @public {IOType}
Resistor.ResistorIO = new IOType( 'ResistorIO', {
  valueType: Resistor,
  supertype: CircuitElement.CircuitElementIO,
  stateSchema: {
    // @ts-ignore
    resistorType: EnumerationIO( Resistor.ResistorType )
  },
  toStateObject: ( resistor: Resistor ) => {
    const stateObject = CircuitElement.CircuitElementIO.toStateObject( resistor );

    // @ts-ignore
    stateObject.resistorType = EnumerationIO( Resistor.ResistorType ).toStateObject( resistor.resistorType );
    return stateObject;
  },

  // @ts-ignore
  stateToArgsForConstructor( stateObject ) {
    const args = CircuitElement.CircuitElementIO.stateToArgsForConstructor( stateObject );
    // @ts-ignore
    args.push( EnumerationIO( Resistor.ResistorType ).fromStateObject( stateObject.resistorType ) );
    return args;
  }
} );

circuitConstructionKitCommon.register( 'Resistor', Resistor );
export { ResistorOptions };
export default Resistor;