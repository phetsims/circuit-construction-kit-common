// Copyright 2015-2022, University of Colorado Boulder

/**
 * A wire whose length can change.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
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

type WireSelfOptions = {
  wireStub?: boolean
};

type WireOptions = WireSelfOptions & CircuitElementOptions;

class Wire extends CircuitElement {
  private readonly wireStub: boolean;
  readonly resistanceProperty: NumberProperty;
  private readonly resistivityProperty: NumberProperty;
  readonly lengthProperty: NumberProperty;
  updateListener: () => void;

  constructor( startVertex: Vertex, endVertex: Vertex, resistivityProperty: NumberProperty, tandem: Tandem, providedOptions?: WireOptions ) {
    assert && assert( typeof resistivityProperty !== 'number', 'property should not be a number' );
    assert && assert( !startVertex.isDisposed, 'vertex should not be disposed' );
    assert && assert( !endVertex.isDisposed, 'vertex should not be disposed' );
    const options = optionize<WireOptions, WireSelfOptions, CircuitElementOptions>( {
      wireStub: false,
      isMetallic: true
    }, providedOptions );
    const chargePathLength = startVertex.positionProperty.get().distance( endVertex.positionProperty.get() );
    super( startVertex, endVertex, chargePathLength, tandem, options );

    // @public (read-only) {boolean} - if the wire is a small stub attached to the black box
    this.wireStub = options.wireStub;

    // @public {NumberProperty} - the resistance of the Wire in ohms
    this.resistanceProperty = new NumberProperty( CCKCConstants.MINIMUM_WIRE_RESISTANCE );

    if ( phet.chipper.queryParameters.dev ) {
      this.resistanceProperty.link( console.log );
    }

    // @public {Property.<number>} - the resistivity of the Wire in ohm-meters
    this.resistivityProperty = resistivityProperty;

    // @public {Property.<number>} - when the length changes layoutCharges must be called
    this.lengthProperty = new NumberProperty( 0 );

    this.updateListener = () => this.update();

    this.vertexMovedEmitter.addListener( this.updateListener );

    // When resistivity changes, update the resistance
    this.resistivityProperty.link( this.updateListener );

    this.update(); // initialize state
  }

  /**
   * Move forward in time
   * @param {number} time - total elapsed time in seconds
   * @param {number} dt - seconds since last step
   * @param {Circuit} circuit
   * @public
   */
  step( time: number, dt: number, circuit: Circuit ) {
    super.step( time, dt, circuit );
    this.update();
  }

  /**
   * Batch changes so that the length doesn't change incrementally when both vertices move one at a time.
   * @public
   */
  update() {
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
   * @override
   * @returns {Property.<*>[]}
   * @public
   */
  getCircuitProperties() {
    return [ this.resistanceProperty ];
  }

  /**
   * Releases all resources related to the Wire, called when it will no longer be used.
   * @public
   * @override
   */
  dispose() {
    this.vertexMovedEmitter.removeListener( this.updateListener );
    this.resistivityProperty.unlink( this.updateListener );
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'Wire', Wire );
export default Wire;