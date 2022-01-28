// Copyright 2015-2022, University of Colorado Boulder

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
import EnumerationIO from '../../../tandem/js/types/EnumerationIO.js';
import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import PowerProperty from './PowerProperty.js';

type ResistorOptions = {
  isMetallic: boolean,
  resistorType: any
};

class Resistor extends FixedCircuitElement {

  // the resistance in ohms
  readonly resistanceProperty: NumberProperty;

  readonly resistorType: ResistorType;

  static ResistorIO: IOType;
  static RESISTANCE_DECIMAL_PLACES = 1;
  static HIGH_RESISTANCE_DECIMAL_PLACES = 0;
  isColorCodeVisibleProperty: BooleanProperty;
  private readonly powerProperty: PowerProperty;

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

    this.resistanceProperty = new NumberProperty( resistorType.defaultResistance, {
      tandem: tandem.createTandem( 'resistanceProperty' ),

      // Specify the Property range for seamless PhET-iO interoperation
      range: this.resistorType.range
    } );

    this.powerProperty = new PowerProperty( this.currentProperty, this.resistanceProperty, tandem.createTandem( 'powerProperty' ) );

    this.isColorCodeVisibleProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isColorCodeVisibleProperty' ),
      phetioDocumentation: 'Whether the view can display the resistor color code bands'
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
    resistorType: EnumerationIO( ResistorType )
  },
  toStateObject: ( resistor: Resistor ) => {
    const stateObject = CircuitElement.CircuitElementIO.toStateObject( resistor );
    stateObject.resistorType = EnumerationIO( ResistorType ).toStateObject( resistor.resistorType );
    return stateObject;
  },

  stateToArgsForConstructor( stateObject: any ) {
    const args = CircuitElement.CircuitElementIO.stateToArgsForConstructor( stateObject );
    args.push( EnumerationIO( ResistorType ).fromStateObject( stateObject.resistorType ) );
    return args;
  }
} );

circuitConstructionKitCommon.register( 'Resistor', Resistor );
export type { ResistorOptions };
export default Resistor;