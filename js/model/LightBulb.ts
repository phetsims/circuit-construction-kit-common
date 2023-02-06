// Copyright 2015-2023, University of Colorado Boulder

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
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Circuit from './Circuit.js';
import CircuitElementViewType from './CircuitElementViewType.js';
import FixedCircuitElement, { FixedCircuitElementOptions } from './FixedCircuitElement.js';
import Vertex from './Vertex.js';
import PowerDissipatedProperty from './PowerDissipatedProperty.js';
import optionize from '../../../phet-core/js/optionize.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';

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

type SelfOptions = {
  isExtreme?: boolean;
  isReal?: boolean;
};

type LightBulbOptions = SelfOptions & FixedCircuitElementOptions;

export default class LightBulb extends FixedCircuitElement {

  // true if R is a function of current. Not an enum because in the future we may have a isReal high resistance bulb.
  public readonly isReal: boolean;

  // true if the light bulb is a high resistance light bulb
  public readonly isExtreme: boolean;

  // the resistance of the light bulb which can be edited with the UI
  public readonly resistanceProperty: NumberProperty;
  private readonly viewTypeProperty: Property<CircuitElementViewType>;

  public static createAtPosition( startVertex: Vertex,
                                  endVertex: Vertex,
                                  circuit: Circuit,
                                  resistance: number,
                                  viewTypeProperty: Property<CircuitElementViewType>,
                                  tandem: Tandem,
                                  providedOptions?: LightBulbOptions ): LightBulb {
    return new LightBulb( startVertex, endVertex, resistance, viewTypeProperty, tandem, providedOptions );
  }

  public static createVertexPair( position: Vector2, circuit: Circuit, icon = false ): { startVertex: Vertex; endVertex: Vertex } {
    const points = LightBulb.createSamplePoints( position );

    // start vertex is at the bottom
    const startVertex = icon ? new Vertex( points[ 0 ], circuit.selectionProperty ) : circuit.vertexGroup.createNextElement( points[ 0 ] );
    const endVertex = icon ? new Vertex( points[ 1 ], circuit.selectionProperty ) : circuit.vertexGroup.createNextElement( points[ 1 ] );
    return { startVertex: startVertex, endVertex: endVertex };
  }

  public static createSamplePoints( position: Vector2 ): [ Vector2, Vector2 ] {
    const translation = new Vector2( 19, 10 );

    // Connect at the side and bottom
    const startPoint = new Vector2( position.x - DISTANCE_BETWEEN_VERTICES / 2, position.y ).plus( translation );

    // Position the vertices so the light bulb is upright
    const endPoint = startPoint.plus( Vector2.createPolar( DISTANCE_BETWEEN_VERTICES, -Math.PI / 4 ) );

    return [ startPoint, endPoint ];
  }

  public static vertexDelta: Vector2;
  private readonly powerDissipatedProperty: PowerDissipatedProperty;

  public constructor(
    startVertex: Vertex, // side
    endVertex: Vertex, // bottom
    resistance: number,
    viewTypeProperty: Property<CircuitElementViewType>,
    tandem: Tandem,
    providedOptions?: LightBulbOptions ) {
    const options = optionize<LightBulbOptions, SelfOptions, FixedCircuitElementOptions>()( {
      isExtreme: false,
      isReal: false
    }, providedOptions );
    assert && assert( !options.hasOwnProperty( 'numberOfDecimalPlaces' ), 'supplied by LightBulb' );
    options.numberOfDecimalPlaces = options.isExtreme ? 0 : 1;

    // getPathLength not available yet, so use a nonzero charge path length then override.
    super( startVertex, endVertex, 1, tandem, options );

    this.isReal = options.isReal;
    this.isExtreme = options.isExtreme;
    this.resistanceProperty = new NumberProperty( resistance, {
      tandem: tandem.createTandem( 'resistanceProperty' ),
      phetioFeatured: true,
      range: options.isExtreme ? new Range( 100, 10000 ) :
             options.isReal ? new Range( 0, Number.MAX_VALUE ) : // The non-ohmic bulb has its resistance computed in LinearTransientAnalysis.js
             new Range( 0, 120 )
    } );

    this.powerDissipatedProperty = new PowerDissipatedProperty( this.currentProperty, this.resistanceProperty, tandem.createTandem( 'powerDissipatedProperty' ) );

    this.viewTypeProperty = viewTypeProperty;

    // Fill in the chargePathLength
    this.chargePathLength = this.getPathLength();
  }

  // Updates the charge path length when the view changes between lifelike/schematic
  public updatePathLength(): void {
    this.chargePathLength = this.getPathLength();
  }

  // Determine the path length by measuring the segments.
  private getPathLength(): number {
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
   */
  private isResistanceEditable(): boolean {
    return true;
  }

  // Dispose of this and PhET-iO instrumented children, so they will be unregistered.
  public override dispose(): void {
    this.resistanceProperty.dispose();
    this.powerDissipatedProperty.dispose();
    super.dispose();
  }

  /**
   * Maps from the "as the crow flies" path to the circuitous path. It maps points with a transformation such that:
   * startPoint => origin, endPoint => endVertex position
   *
   * @param index
   * @param origin
   * @param samplePoints - the array of points to use for sampling
   */
  private static getFilamentPathPoint( index: number, origin: Vector2, samplePoints: Vector2[] ): Vector2 {
    const point = samplePoints[ index ];

    const startPoint = samplePoints[ 0 ];
    const endPoint = samplePoints[ samplePoints.length - 1 ];

    const x = Utils.linear( startPoint.x, endPoint.x, origin.x, origin.x + LightBulb.vertexDelta.x, point.x );
    const y = Utils.linear( startPoint.y, endPoint.y, origin.y, origin.y + LightBulb.vertexDelta.y, point.y );

    return new Vector2( x, y );
  }

  /**
   * Get the properties so that the circuit can be solved when changed.
   */
  public override getCircuitProperties(): Property<IntentionalAny>[] {
    return [ this.resistanceProperty ];
  }

  /**
   * Overrides CircuitElement.getPosition to describe the path the charge takes through the light bulb.
   *
   * @param distanceAlongWire - how far along the bulb's length the charge has traveled
   * @param matrix to be updated with the position and angle, so that garbage isn't created each time
   */
  public override updateMatrixForPoint( distanceAlongWire: number, matrix: Matrix3 ): void {

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

  public static readonly REAL_BULB_COLD_RESISTANCE = 10;
}

const samplePoints = LightBulb.createSamplePoints( Vector2.ZERO );
LightBulb.vertexDelta = samplePoints[ 1 ].minus( samplePoints[ 0 ] );

circuitConstructionKitCommon.register( 'LightBulb', LightBulb );