// Copyright 2015-2022, University of Colorado Boulder

/**
 * A wire whose length can change.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import optionize from '../../../phet-core/js/optionize.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Circuit from './Circuit.js';
import CircuitElement, { CircuitElementOptions } from './CircuitElement.js';
import Vertex from './Vertex.js';

// constants
// Conversion factor between model=view coordinates and meters, in order to use resistivity to compute resistance.
// Chosen so that a battery is around 5cm long.  See CCKCConstants for the default lengths of the elements in view
// coordinates.
const METERS_PER_VIEW_COORDINATE = 0.0005;

type SelfOptions = {
  wireStub?: boolean;
};

type WireOptions = SelfOptions & CircuitElementOptions;

export default class Wire extends CircuitElement {

  // if the wire is a small stub attached to the black box
  private readonly wireStub: boolean;

  // the resistance of the Wire in ohms
  public readonly resistanceProperty: NumberProperty;

  // the resistivity of the Wire in ohm-meters
  private readonly resistivityProperty: NumberProperty;

  // when the length changes layoutCharges must be called
  public override readonly lengthProperty: NumberProperty;
  private updateListener: () => void;

  public constructor( startVertex: Vertex, endVertex: Vertex, resistivityProperty: NumberProperty, tandem: Tandem, providedOptions?: WireOptions ) {
    assert && assert( typeof resistivityProperty !== 'number', 'property should not be a number' );
    assert && assert( !startVertex.isDisposed, 'vertex should not be disposed' );
    assert && assert( !endVertex.isDisposed, 'vertex should not be disposed' );
    const options = optionize<WireOptions, SelfOptions, CircuitElementOptions>()( {
      wireStub: false,
      isMetallic: true,

      // Wires do not have these features, so opt out of PhET-iO instrumentation here
      isEditablePropertyOptions: {
        tandem: Tandem.OPT_OUT
      },
      isValueDisplayablePropertyOptions: {
        tandem: Tandem.OPT_OUT
      },
      labelStringPropertyOptions: {
        tandem: Tandem.OPT_OUT
      }
    }, providedOptions );
    const chargePathLength = startVertex.positionProperty.get().distance( endVertex.positionProperty.get() );
    super( startVertex, endVertex, chargePathLength, tandem, options );

    this.wireStub = options.wireStub;

    this.resistanceProperty = new NumberProperty( CCKCConstants.MINIMUM_WIRE_RESISTANCE );

    if ( phet.chipper.queryParameters.dev ) {
      this.resistanceProperty.link( console.log );
    }

    this.resistivityProperty = resistivityProperty;
    this.lengthProperty = new NumberProperty( 0 );
    this.updateListener = () => this.update();
    this.vertexMovedEmitter.addListener( this.updateListener );

    // When resistivity changes, update the resistance
    this.resistivityProperty.link( this.updateListener );

    this.update(); // initialize state
  }

  /**
   * Move forward in time
   * @param time - total elapsed time in seconds
   * @param dt - seconds since last step
   * @param circuit
   */
  public override step( time: number, dt: number, circuit: Circuit ): void {
    super.step( time, dt, circuit );
    this.update();
  }

  /**
   * Batch changes so that the length doesn't change incrementally when both vertices move one at a time.
   */
  private update(): void {
    const startPosition = this.startPositionProperty.get();
    const endPosition = this.endPositionProperty.get();
    const distanceBetweenVertices = startPosition.distance( endPosition ); // same as view coordinates
    const modelLength = distanceBetweenVertices * METERS_PER_VIEW_COORDINATE;
    this.lengthProperty.set( modelLength );

    // R = rho * L / A.  Resistance = resistivity * Length / cross sectional area.
    const resistance = this.resistivityProperty.get() * modelLength / CCKCConstants.WIRE_CROSS_SECTIONAL_AREA;

    const clampedResistance = Math.max( CCKCConstants.MINIMUM_WIRE_RESISTANCE, resistance );
    assert && assert( !isNaN( clampedResistance ), 'wire resistance should not be NaN' );
    this.resistanceProperty.set( clampedResistance );

    // Update the charge path length, but don't let it go less than a threshold, see https://github.com/phetsims/circuit-construction-kit-common/issues/405
    this.chargePathLength = Math.max( distanceBetweenVertices, 1E-6 );
  }

  /**
   * Get the properties so that the circuit can be solved when changed.
   */
  public getCircuitProperties(): Property<IntentionalAny>[] {
    return [ this.resistanceProperty ];
  }

  /**
   * Releases all resources related to the Wire, called when it will no longer be used.
   */
  public override dispose(): void {
    this.vertexMovedEmitter.removeListener( this.updateListener );
    this.resistivityProperty.unlink( this.updateListener );
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'Wire', Wire );