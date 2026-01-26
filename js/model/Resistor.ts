// Copyright 2015-2025, University of Colorado Boulder

/**
 * Model for a resistor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import type Property from '../../../axon/js/Property.js';
import affirm from '../../../perennial-alias/js/browser-and-node/affirm.js';
import optionize from '../../../phet-core/js/optionize.js';
import type IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import Tandem from '../../../tandem/js/Tandem.js';
import EnumerationIO from '../../../tandem/js/types/EnumerationIO.js';
import IOType from '../../../tandem/js/types/IOType.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElement, { type CircuitElementState } from './CircuitElement.js';
import FixedCircuitElement, { type FixedCircuitElementOptions } from './FixedCircuitElement.js';
import PowerDissipatedProperty from './PowerDissipatedProperty.js';
import ResistorType from './ResistorType.js';
import type Vertex from './Vertex.js';

type SelfOptions = {
  isMetallic: boolean;
  resistorType: ResistorType;
};
export type ResistorOptions = SelfOptions & FixedCircuitElementOptions;

type ResistorSelfState = {
  resistorType: string;
};
type ResistorState = ResistorSelfState & CircuitElementState;

export default class Resistor extends FixedCircuitElement {

  // the resistance in ohms
  public readonly resistanceProperty: NumberProperty;

  public readonly resistorType: ResistorType;

  public isColorCodeVisibleProperty: BooleanProperty;
  private readonly powerDissipatedProperty: PowerDissipatedProperty;

  public static readonly RESISTANCE_DECIMAL_PLACES = 1;
  public static readonly HIGH_RESISTANCE_DECIMAL_PLACES = 0;

  public readonly isTraversableProperty = new BooleanProperty( true );

  /**
   * @param startVertex
   * @param endVertex
   * @param resistorType
   * @param tandem
   * @param [providedOptions]
   */
  public constructor( startVertex: Vertex, endVertex: Vertex, resistorType: ResistorType, tandem: Tandem, providedOptions?: ResistorOptions ) {
    const options = optionize<ResistorOptions, SelfOptions, FixedCircuitElementOptions>()( {

      // TODO: Remove isFlammable since everything except the resistor dog is flammable. See https://github.com/phetsims/circuit-construction-kit-common/issues/882
      isFlammable: true,
      phetioType: Resistor.ResistorIO,
      numberOfDecimalPlaces: resistorType === ResistorType.RESISTOR ? 1 : 0
    }, providedOptions );

    affirm( !options.hasOwnProperty( 'resistance' ), 'Resistance should be passed through resistorType' );
    affirm( !options.hasOwnProperty( 'isMetallic' ), 'isMetallic is given by the resistorType' );

    options.isMetallic = resistorType.isMetallic;

    const isHouseholdObject = resistorType !== ResistorType.RESISTOR && resistorType !== ResistorType.EXTREME_RESISTOR;

    if ( isHouseholdObject ) {
      options.isEditablePropertyOptions = {
        tandem: Tandem.OPT_OUT
      };
    }

    super( 'resistor', startVertex, endVertex, resistorType.length, tandem, options );

    this.resistorType = resistorType;

    affirm( typeof this.resistorType.isMetallic === 'boolean' );

    this.resistanceProperty = new NumberProperty( resistorType.defaultResistance, {
      tandem: tandem.createTandem( 'resistanceProperty' ),

      // Specify the Property range for seamless PhET-iO interoperation
      range: this.resistorType.range,
      phetioFeatured: true
    } );

    this.powerDissipatedProperty = new PowerDissipatedProperty( this.currentProperty, this.resistanceProperty, tandem.createTandem( 'powerDissipatedProperty' ) );

    this.isColorCodeVisibleProperty = new BooleanProperty( true, {
      tandem: this.resistorType === ResistorType.RESISTOR ? tandem.createTandem( 'isColorCodeVisibleProperty' ) :
              Tandem.OPT_OUT,
      phetioDocumentation: 'Whether the view can display the resistor color code bands',
      phetioFeatured: true
    } );
  }

  /**
   * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
   */
  public override dispose(): void {
    this.resistanceProperty.dispose();
    this.powerDissipatedProperty.dispose();
    this.isColorCodeVisibleProperty.dispose();
    super.dispose();
  }

  /**
   * Returns true if the resistance is editable.  Household item resistance is not editable.
   */
  public isResistanceEditable(): boolean {
    return this.resistorType === ResistorType.EXTREME_RESISTOR ||
           this.resistorType === ResistorType.RESISTOR;
  }

  /**
   * Get the properties so that the circuit can be solved when changed.
   */
  public getCircuitProperties(): Property<IntentionalAny>[] {
    return [ this.resistanceProperty ];
  }

  public static readonly ResistorIO = new IOType<Resistor, ResistorState, ResistorSelfState>( 'ResistorIO', {
    valueType: Resistor,
    supertype: CircuitElement.CircuitElementIO,
    stateSchema: {
      resistorType: EnumerationIO( ResistorType )
    },
    toStateObject: ( resistor: Resistor ): ResistorState => {
      const stateObject = CircuitElement.CircuitElementIO.toStateObject( resistor );

      return _.merge<ResistorSelfState, CircuitElementState>( {
        resistorType: EnumerationIO( ResistorType ).toStateObject( resistor.resistorType )
      }, stateObject );
    },

    stateObjectToCreateElementArguments( stateObject: ResistorState ) {
      const args = CircuitElement.CircuitElementIO.stateObjectToCreateElementArguments( stateObject );
      args.push( EnumerationIO( ResistorType ).fromStateObject( stateObject.resistorType ) );
      return args;
    }
  } );
}

circuitConstructionKitCommon.register( 'Resistor', Resistor );