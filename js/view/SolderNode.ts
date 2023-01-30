// Copyright 2016-2023, University of Colorado Boulder

/**
 * Shows the silver solder at a connected vertex.  This is not interactive and is behind everything else.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Vector2 from '../../../dot/js/Vector2.js';
import { Circle, Node } from '../../../scenery/js/imports.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Vertex from '../model/Vertex.js';
import CircuitNode from './CircuitNode.js';

// constants
const SOLDER_COLOR = '#ae9f9e';

// for hit testing with probes, in view coordinates
const SOLDER_RADIUS = 11.2;

// {Image} raster created by init() for WebGL usage
const CIRCLE_NODE = new Circle( SOLDER_RADIUS, { fill: SOLDER_COLOR } ).rasterized( { wrap: false } );

export default class SolderNode extends Node {
  public readonly vertex: Vertex;

  // added by CircuitNode during dragging, used for relative drag position.
  private readonly startOffset: Vector2 | null;
  private readonly disposeSolderNode: () => void;

  // Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
  public static readonly webglSpriteNodes = [ CIRCLE_NODE ];

  // radius of solder in model=view coordinates, for hit testing with probes
  public static readonly SOLDER_RADIUS = SOLDER_RADIUS;

  public constructor( circuitNode: CircuitNode, vertex: Vertex ) {
    assert && assert( CIRCLE_NODE, 'solder image should exist before creating SolderNode' );

    const circuit = circuitNode.circuit;

    super( {
      children: [ CIRCLE_NODE ],

      // Avoid bounds computation for this node since it is not pickable, and it was showing up in the profiler
      preventFit: true,
      pickable: false
    } );

    this.vertex = vertex;
    this.startOffset = null;

    // Update the fill when the number of attached components changes.
    const updateFill = () => {

      // defensive copies for callbacks cause listeners to get called during disposal, avoid calling
      // Node API after disposed
      if ( !this.isDisposed ) {
        this.visible = circuit.countCircuitElements( vertex ) > 1;
      }
    };
    circuit.vertexGroup.elementCreatedEmitter.addListener( updateFill );
    circuit.vertexGroup.elementDisposedEmitter.addListener( updateFill );

    // In Black Box, other wires can be detached from a vertex and this should also update the solder
    circuit.circuitElements.addItemAddedListener( updateFill );
    circuit.circuitElements.addItemRemovedListener( updateFill );

    const updateSolderNodePosition = this.setTranslation.bind( this );

    vertex.positionProperty.link( updateSolderNodePosition );

    this.disposeSolderNode = () => {

      vertex.positionProperty.unlink( updateSolderNodePosition );

      circuit.vertexGroup.elementCreatedEmitter.removeListener( updateFill );
      circuit.vertexGroup.elementDisposedEmitter.removeListener( updateFill );

      // In Black Box, other wires can be detached from a vertex and this should also update the solder
      circuit.circuitElements.removeItemAddedListener( updateFill );
      circuit.circuitElements.removeItemRemovedListener( updateFill );
    };

    updateFill();
  }

  /**
   * Eliminate resources when no longer used.
   */
  public override dispose(): void {
    this.disposeSolderNode();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'SolderNode', SolderNode );