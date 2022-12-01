// Copyright 2019-2022, University of Colorado Boulder

/**
 * Model for a capacitor, which stores charges on parallel plates.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import DynamicCircuitElement, { DynamicCircuitElementOptions } from './DynamicCircuitElement.js';
import Vertex from './Vertex.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import Property from '../../../axon/js/Property.js';
import optionize from '../../../phet-core/js/optionize.js';

type SelfOptions = {
  capacitance?: number;
};
type CapacitorOptions = SelfOptions & DynamicCircuitElementOptions;

export default class Capacitor extends DynamicCircuitElement {

  // the capacitance in farads
  public readonly capacitanceProperty: NumberProperty;
  public static readonly CAPACITANCE_RANGE = new Range( CCKCQueryParameters.capacitanceMin, CCKCQueryParameters.capacitanceMax );
  public static readonly NUMBER_OF_DECIMAL_PLACES = CCKCQueryParameters.capacitorNumberDecimalPlaces;
  public static readonly CAPACITANCE_DEFAULT = CCKCQueryParameters.capacitanceDefault;

  public constructor( startVertex: Vertex, endVertex: Vertex, tandem: Tandem, providedOptions?: CapacitorOptions ) {
    const options = optionize<CapacitorOptions, SelfOptions, DynamicCircuitElementOptions>()( {
      capacitance: Capacitor.CAPACITANCE_DEFAULT,

      // The number of decimal places is only used in the view, but we define it in the model as a convenient way to
      // associate the value with the component
      numberOfDecimalPlaces: Capacitor.NUMBER_OF_DECIMAL_PLACES
    }, providedOptions );

    super( startVertex, endVertex, CCKCConstants.CAPACITOR_LENGTH, tandem, options );

    this.capacitanceProperty = new NumberProperty( options.capacitance, {
      range: Capacitor.CAPACITANCE_RANGE,
      tandem: tandem.createTandem( 'capacitanceProperty' )
    } );

    this.capacitanceProperty.lazyLink( ( c2, c1 ) => {

      const v1 = this.endVertexProperty.value.voltageProperty.value -
                 this.startVertexProperty.value.voltageProperty.value;

      // we want Q to remain constant under a change of C, so we must adjust V accordingly.
      // Q1 = C1V1
      // Q2 = C2V2
      // Q1 = Q2
      // C1V1 = C2V2
      // V2 = C1V1/C2

      const v2 = c1 * v1 / c2;

      // Reflect this in the adjacent local vertices. It doesn't need to flow throughout the circuit because it only affects open circuits
      const a = this.startVertexProperty.value.voltageProperty.value;
      const b = this.endVertexProperty.value.voltageProperty.value;
      const currentDiff = b - a;
      const desiredDiff = v2;
      const adjustment = ( desiredDiff - currentDiff ) / 2; // share between the vertices

      this.startVertexProperty.value.voltageProperty.value -= adjustment;
      this.endVertexProperty.value.voltageProperty.value += adjustment;
      // this.voltageDiffereneProperty is computed based on those changed values.

      // For debugging
      // console.log( v2, this.endVertexProperty.value.voltageProperty.value - this.startVertexProperty.value.voltageProperty.value, this.voltageDifferenceProperty.value );
      // const q1 = c1 * v1;
      // const q2 = c2 * v2;
      // console.log( 'q1q2', q1, q2 );
      this.mnaVoltageDrop = -v2;
    } );
  }

  // Dispose of this and PhET-iO instrumented children, so they will be unregistered.
  public override dispose(): void {
    this.capacitanceProperty.dispose();
    super.dispose();
  }

  public getCircuitProperties(): Property<IntentionalAny>[] {
    return [ this.capacitanceProperty ];
  }
}

circuitConstructionKitCommon.register( 'Capacitor', Capacitor );