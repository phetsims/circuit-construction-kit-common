// Copyright 2019-2022, University of Colorado Boulder

/**
 * Circuit element with time-dependent dynamics, such as an inductor or capacitor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import Emitter from '../../../axon/js/Emitter.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import FixedCircuitElement, { FixedCircuitElementOptions } from './FixedCircuitElement.js';
import Vertex from './Vertex.js';

type DynamicCircuitElementSelfOptions = {};
export type DynamicCircuitElementOptions = DynamicCircuitElementSelfOptions & FixedCircuitElementOptions;

// This class should not be instantiated directly, instead subclasses should provide implementations for getCircuitProperties
// and the subclasses should be used instead.
export default abstract class DynamicCircuitElement extends FixedCircuitElement {
  mnaVoltageDrop: number;
  mnaCurrent: number;
  readonly clearEmitter: Emitter<[]>;
  isClearableProperty: BooleanProperty;

  constructor( startVertex: Vertex, endVertex: Vertex, length: number, tandem: Tandem, providedOptions?: DynamicCircuitElementOptions ) {
    super( startVertex, endVertex, length, tandem, providedOptions );

    // @public {number} - value of the voltage drop set and read by the modified nodal analysis.  This is in addition
    // to the typical voltage calculation which is based on vertices.
    this.mnaVoltageDrop = 0;

    // @public {number} - value of the current set and read by the modified nodal analysis.  This is an instantaneous
    // value based on the throughput computation at the final timestep, as opposed to the currentProperty.value which
    // takes a time average across the values, so we can show transient spikes,
    // see https://phet.unfuddle.com/a#/projects/9404/tickets/by_number/2270?cycle=true
    this.mnaCurrent = 0;

    // @public (listen-only)
    this.clearEmitter = new Emitter();

    this.isClearableProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isClearableProperty' ),
      phetioDocumentation: 'Determines whether the button to clear the component can be shown'
    } );
  }

  /**
   * Reset the dynamic variable for the modified nodal analysis solver. This has the effect of clearing the
   * electric field (capacitor) or clearing the magnetic field (inductor)
   * @public
   */
  clear() {
    assert && assert( this.isClearableProperty.value, 'isClearable must be true when clear() is called' );
    this.mnaVoltageDrop = 0;
    this.mnaCurrent = 0;
    this.clearEmitter.emit();
  }

  dispose() {
    this.clearEmitter.dispose();
    this.isClearableProperty.dispose();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'DynamicCircuitElement', DynamicCircuitElement );