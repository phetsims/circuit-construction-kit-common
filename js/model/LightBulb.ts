// Copyright 2015-2022, University of Colorado Boulder

/**
 * The LightBulb is a CircuitElement that shines when current flows through it.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Range from '../../../dot/js/Range.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Circuit from './Circuit.js';
import CircuitElementViewType from './CircuitElementViewType.js';
import FixedCircuitElement, { FixedCircuitElementOptions } from './FixedCircuitElement.js';
import Vertex from './Vertex.js';

// constants

// The distance (as the crow flies) between start and end vertex
const DISTANCE_BETWEEN_VERTICES = 36;

// Tinker with coordinates to get thing to match up
const LEFT_CURVE_X_SCALE = 1.5;
const TOP_Y_SCALE = 0.6;
const RIGHT_CURVE_X_SCALE = 0.87;

// The sampled points for the wire/filament curves
const LIFELIKE_SAMPLE_POINTS = [
  new Vector2( 0.623, 2.063 ),                                          // bottom center
  new Vector2( 0.623, 1.014 * 0.75 ),                                   // first curve
  new Vector2( 0.314 * LEFT_CURVE_X_SCALE, 0.704 * TOP_Y_SCALE * 1.1 ), // left curve 1
  new Vector2( 0.314 * LEFT_CURVE_X_SCALE, 0.639 * TOP_Y_SCALE ),       // left curve 2
  new Vector2( 0.394 * LEFT_CURVE_X_SCALE, 0.560 * TOP_Y_SCALE ),       // left curve 3
  new Vector2( 0.823 * RIGHT_CURVE_X_SCALE, 0.565 * TOP_Y_SCALE ),      // top right 1
  new Vector2( 0.888 * RIGHT_CURVE_X_SCALE, 0.600 * TOP_Y_SCALE ),      // top right 2
  new Vector2( 0.922 * RIGHT_CURVE_X_SCALE, 0.699 * TOP_Y_SCALE ),      // top right 3
  new Vector2( 0.927 * RIGHT_CURVE_X_SCALE, 1.474 ),                    // exit notch
  new Vector2( 0.927 * 0.8 * 1.2, 1.474 )                               // exit
];

const SCHEMATIC_SAMPLE_POINTS = [
  new Vector2( 0.50, 2.06 ),                                            // bottom left
  new Vector2( 0.50, 0.34 ),                                            // top left
  new Vector2( 0.89, 0.34 ),                                            // top right
  new Vector2( 0.89, 1.474 )                                            // bottom right
];

type LightBulbOptions = {
  highResistance: boolean
  real: boolean
} & FixedCircuitElementOptions;

class LightBulb extends FixedCircuitElement {
  readonly real: boolean;
  readonly highResistance: boolean;
  readonly resistanceProperty: NumberProperty;
  private readonly viewTypeProperty: Property<CircuitElementViewType>;

  // TODO: improve types
  static createAtPosition: ( startVertex: Vertex, endVertex: Vertex, circuit: Circuit, resistance: number, viewTypeProperty: Property<CircuitElementViewType>, tandem: Tandem, providedOptions?: any ) => LightBulb;
  static createVertexPair: ( position: Vector2, circuit: Circuit, icon?: boolean ) => { startVertex: Vertex; endVertex: Vertex; };
  static createSamplePoints: ( position: Vector2 ) => [ Vector2, Vector2 ];
  static vertexDelta: Vector2;

  /**
   * @param {Vertex} startVertex - the side Vertex
   * @param {Vertex} endVertex - the bottom Vertex
   * @param {number} resistance - in ohms
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Tandem} tandem
   * @param {Object} [providedOptions]
   */
  constructor( startVertex: Vertex, endVertex: Vertex, resistance: number, viewTypeProperty: Property<CircuitElementViewType>, tandem: Tandem, providedOptions?: Partial<LightBulbOptions> ) {
    const filledOptions = merge( {
      highResistance: false,
      real: false
    }, providedOptions ) as LightBulbOptions;
    assert && assert( !filledOptions.hasOwnProperty( 'numberOfDecimalPlaces' ), 'supplied by LightBulb' );
    filledOptions.numberOfDecimalPlaces = filledOptions.highResistance ? 0 : 1;

    // getPathLength not available yet, so use a nonzero charge path length then override.
    super( startVertex, endVertex, 1, tandem, filledOptions );

    // @public (read-only) {boolean} - true if R is constant, false if R is a function of current

    // @public {boolean} - Not an enum because in the future we may have a real high resistance bulb.
    this.real = filledOptions.real;

    // @public (read-only) {boolean} - true if the light bulb is a high resistance light bulb
    this.highResistance = filledOptions.highResistance;

    // @public {Property.<number>} - the resistance of the light bulb which can be edited with the UI
    this.resistanceProperty = new NumberProperty( resistance, {
      tandem: tandem.createTandem( 'resistanceProperty' ),
      range: filledOptions.highResistance ? new Range( 100, 10000 ) :
             filledOptions.real ? new Range( 0, Number.MAX_VALUE ) : // The non-ohmic bulb has its resistance computed in LinearTransientAnalysis.js
             new Range( 0, 120 )
    } );

    this.viewTypeProperty = viewTypeProperty;

    // Fill in the chargePathLength
    this.chargePathLength = this.getPathLength();
  }

  /**
   * Updates the charge path length when the view changes between lifelike/schematic
   * @public
   */
  updatePathLength() {
    this.chargePathLength = this.getPathLength();
  }

  /**
   * Determine the path length by measuring the segments.
   * @returns {number}
   */
  private getPathLength() {
    let pathLength = 0;
    const samplePoints = this.viewTypeProperty.value === CircuitElementViewType.LIFELIKE ? LIFELIKE_SAMPLE_POINTS : SCHEMATIC_SAMPLE_POINTS;
    let currentPoint = LightBulb.getFilamentPathPoint( 0, Vector2.ZERO, samplePoints );
    for ( let i = 1; i < samplePoints.length; i++ ) {
      const nextPoint = LightBulb.getFilamentPathPoint( i, Vector2.ZERO, samplePoints );
      pathLength += nextPoint.distance( currentPoint );
      currentPoint = nextPoint;
    }
    return pathLength;
  }

  /**
   * Returns true because all light bulbs can have their resistance changed.
   * @returns {boolean}
   * @public
   */
  isResistanceEditable() {
    return true;
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
   * Maps from the "as the crow flies" path to the circuitous path. It maps points with a transformation such that:
   * startPoint => origin, endPoint => endVertex position
   *
   * @param {number} index
   * @param {Vector2} origin
   * @param {Vector2[]} samplePoints - the array of points to use for sampling
   * @returns {Vector2}
   */
  private static getFilamentPathPoint( index: number, origin: Vector2, samplePoints: Vector2[] ) {
    const point = samplePoints[ index ];

    const startPoint = samplePoints[ 0 ];
    const endPoint = samplePoints[ samplePoints.length - 1 ];

    const x = Utils.linear( startPoint.x, endPoint.x, origin.x, origin.x + LightBulb.vertexDelta.x, point.x );
    const y = Utils.linear( startPoint.y, endPoint.y, origin.y, origin.y + LightBulb.vertexDelta.y, point.y );

    return new Vector2( x, y );
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
   * Overrides CircuitElement.getPosition to describe the path the charge takes through the light bulb.
   *
   * @param {number} distanceAlongWire - how far along the bulb's length the charge has traveled
   * @param {Matrix3} matrix to be updated with the position and angle, so that garbage isn't created each time
   * @override
   * @public
   */
  updateMatrixForPoint( distanceAlongWire: number, matrix: Matrix3 ) {

    super.updateMatrixForPoint( distanceAlongWire, matrix );

    let previousAccumulatedDistance = 0;
    let accumulatedDistance = 0;
    const samplePoints = this.viewTypeProperty.value === CircuitElementViewType.LIFELIKE ? LIFELIKE_SAMPLE_POINTS : SCHEMATIC_SAMPLE_POINTS;
    let currentPoint = LightBulb.getFilamentPathPoint( 0, this.startVertexProperty.get().positionProperty.get(), samplePoints );
    for ( let i = 1; i < samplePoints.length; i++ ) {
      const nextPoint = LightBulb.getFilamentPathPoint( i, this.startVertexProperty.get().positionProperty.get(), samplePoints );
      accumulatedDistance += nextPoint.distance( currentPoint );

      // Find what segment the charge is in
      if ( distanceAlongWire <= accumulatedDistance ) {

        // Choose the right point along the segment
        const fractionAlongSegment = Utils.linear( previousAccumulatedDistance, accumulatedDistance, 0, 1, distanceAlongWire );
        const positionAlongSegment = currentPoint.blend( nextPoint, fractionAlongSegment );

        // rotate the point about the start vertex
        const startPoint = this.startPositionProperty.get();
        const vertexDelta = this.endPositionProperty.get().minus( startPoint );
        const relativeAngle = vertexDelta.angle - LightBulb.vertexDelta.angle;
        const position = positionAlongSegment.rotatedAboutPoint( startPoint, relativeAngle );
        const angle = nextPoint.minus( currentPoint ).angle;

        // sampled from createAtPosition
        matrix.setToTranslationRotationPoint( position, angle + matrix.getRotation() + 0.7851354708011367 );
        return;
      }
      previousAccumulatedDistance = accumulatedDistance;
      currentPoint = nextPoint;
    }

    throw new Error( 'exceeded charge path bounds' );
  }

  static REAL_BULB_COLD_RESISTANCE = 10;
}

// Create a LightBulb at the specified position
LightBulb.createAtPosition = ( startVertex, endVertex, circuit, resistance, viewTypeProperty, tandem, options ) => {
  options = merge( { icon: false }, options );
  return new LightBulb( startVertex, endVertex, resistance, viewTypeProperty, tandem, options );
};

LightBulb.createSamplePoints = ( position: Vector2 ): [ Vector2, Vector2 ] => {
  const translation = new Vector2( 19, 10 );

  // Connect at the side and bottom
  const startPoint = new Vector2( position.x - DISTANCE_BETWEEN_VERTICES / 2, position.y ).plus( translation );

  // Position the vertices so the light bulb is upright
  const endPoint = startPoint.plus( Vector2.createPolar( DISTANCE_BETWEEN_VERTICES, -Math.PI / 4 ) );

  return [ startPoint, endPoint ];
};

LightBulb.createVertexPair = ( position, circuit, icon = false ) => {
  const points = LightBulb.createSamplePoints( position );

  // start vertex is at the bottom
  const startVertex = icon ? new Vertex( points[ 0 ] ) : circuit.vertexGroup.createNextElement( points[ 0 ] );
  const endVertex = icon ? new Vertex( points[ 1 ] ) : circuit.vertexGroup.createNextElement( points[ 1 ] );
  return { startVertex: startVertex, endVertex: endVertex };
};

const samplePoints = LightBulb.createSamplePoints( Vector2.ZERO );
LightBulb.vertexDelta = samplePoints[ 1 ].minus( samplePoints[ 0 ] );

circuitConstructionKitCommon.register( 'LightBulb', LightBulb );
export default LightBulb;