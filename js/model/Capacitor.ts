// Copyright 2019-2021, University of Colorado Boulder

/**
 * Model for a capacitor, which stores charges on parallel plates.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import DynamicCircuitElement, { DynamicCircuitElementOptions } from './DynamicCircuitElement.js';
import Vertex from './Vertex.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';

type CapacitorOptions = {
  capacitance: number
} & DynamicCircuitElementOptions;

class Capacitor extends DynamicCircuitElement {
  readonly capacitanceProperty: NumberProperty;

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Tandem} tandem
   * @param {Object} [providedOptions]
   */
  constructor( startVertex: Vertex, endVertex: Vertex, tandem: Tandem, providedOptions?: Partial<CapacitorOptions> ) {
    const options = merge( {
      capacitance: CCKCQueryParameters.capacitanceDefault,

      // The number of decimal places is only used in the view, but we define it in the model as a convenient way to
      // associate the value with the component
      numberOfDecimalPlaces: CCKCQueryParameters.capacitorNumberDecimalPlaces
    }, providedOptions ) as CapacitorOptions;

    super( startVertex, endVertex, CCKCConstants.CAPACITOR_LENGTH, tandem, options );

    // @public {Property.<number>} the capacitance in farads
    this.capacitanceProperty = new NumberProperty( options.capacitance, {
      range: new Range( CCKCQueryParameters.capacitanceMin, CCKCQueryParameters.capacitanceMax ),
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

  /**
   * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
   * @public
   */
  dispose() {
    this.capacitanceProperty.dispose();
    super.dispose();
  }

  /**
   * Get the Properties that may change the circuit solution, so that the circuit can be re-solved when they change.
   * @override
   * @returns {Property.<*>[]}
   * @public
   */
  getCircuitProperties() {
    return [ this.capacitanceProperty ];
  }
}

circuitConstructionKitCommon.register( 'Capacitor', Capacitor );

export default Capacitor;