// Copyright 2016-2017, University of Colorado Boulder

/**
 * Shows the silver solder at a connected vertex.  This is not interactive and is behind everything else.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Circle = require( 'SCENERY/nodes/Circle' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Node = require( 'SCENERY/nodes/Node' );

  // constants
  const SOLDER_COLOR = '#ae9f9e';

  // for hit testing with probes, in view coordinates
  const SOLDER_RADIUS = 11.2;

  // {Image} raster created by init() for WebGL usage
  const CIRCLE_NODE = new Circle( SOLDER_RADIUS, { fill: SOLDER_COLOR } ).toDataURLImageSynchronous();

  class SolderNode extends Node {

    /**
     * @param {CircuitLayerNode} circuitLayerNode
     * @param {Vertex} vertex
     */
    constructor( circuitLayerNode, vertex ) {
      assert && assert( CIRCLE_NODE, 'solder image should exist before creating SolderNode' );

      const circuit = circuitLayerNode.circuit;

      super( {
        children: [ CIRCLE_NODE ],

        // Avoid bounds computation for this node since it is not pickable, and it was showing up in the profiler
        preventFit: true,
        pickable: false
      } );

      // @public (read-only) {Vertex}
      this.vertex = vertex;

      // @public {Vector2|null} - added by CircuitLayerNode during dragging, used for relative drag location.
      this.startOffset = null;

      // Update the fill when the number of attached components changes.
      const updateFill = () => {

        // @private {boolean} - defensive copies for callbacks cause listeners to get called during disposal, avoid calling
        // Node API after diposed
        if ( !this.disposed ) {
          this.visible = circuit.countCircuitElements( vertex ) > 1;
        }
      };
      circuit.vertices.addItemAddedListener( updateFill );
      circuit.vertices.addItemRemovedListener( updateFill );

      // In Black Box, other wires can be detached from a vertex and this should also update the solder
      circuit.circuitElements.addItemAddedListener( updateFill );
      circuit.circuitElements.addItemRemovedListener( updateFill );

      const updateSolderNodePosition = this.setTranslation.bind( this );
      vertex.positionProperty.link( updateSolderNodePosition );

      // @private (read-only) {function} called by dispose()
      this.disposeSolderNode = () => {
        vertex.positionProperty.unlink( updateSolderNodePosition );

        circuit.vertices.removeItemAddedListener( updateFill );
        circuit.vertices.removeItemRemovedListener( updateFill );

        // In Black Box, other wires can be detached from a vertex and this should also update the solder
        circuit.circuitElements.removeItemAddedListener( updateFill );
        circuit.circuitElements.removeItemRemovedListener( updateFill );
      };

      updateFill();
    }

    /**
     * Eliminate resources when no longer used.
     * @public
     * @override
     */
    dispose() {
      this.disposeSolderNode();
      super.dispose();
    }
  }

  /**
   * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
   * @public {Array.<Image>}
   */
  SolderNode.webglSpriteNodes = [ CIRCLE_NODE ];

  // @public (read-only) {number} - radius of solder in model=view coordinates, for hit testing with probes
  SolderNode.SOLDER_RADIUS = SOLDER_RADIUS;

  return circuitConstructionKitCommon.register( 'SolderNode', SolderNode );
} );