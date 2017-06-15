// Copyright 2015-2017, University of Colorado Boulder

/**
 * Shows the silver solder at a connected vertex.  This is not interactive and is behind everything else.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Image = require( 'SCENERY/nodes/Image' );

  // constants
  var SOLDER_COLOR = '#ae9f9e';
  var SOLDER_IMAGE = null; // {Image} raster created by init() for WebGL usage

  // @public (read-only) {number} - for hit testing with probes
  var SOLDER_RADIUS = 11.2;

  /**
   * @param {CircuitLayerNode} circuitLayerNode
   * @param {Vertex} vertex
   * @constructor
   */
  function SolderNode( circuitLayerNode, vertex ) {
    assert && assert( SOLDER_IMAGE, 'solder image should exist before creating SolderNode' );

    var self = this;

    var circuit = circuitLayerNode.circuit;

    // @public (read-only) {Vertex}
    this.vertex = vertex;

    // @public {Vector2} - added by CircuitLayerNode during dragging, used for relative drag location.
    this.startOffset = null;

    Image.call( this, SOLDER_IMAGE, {

      // Avoid bounds computation for this node since it is not pickable, and it was showing up in the profiler
      preventFit: true,
      pickable: false
    } );

    // Update the fill when the number of attached components changes.
    var updateFill = function() {
      self.visible = circuit.countCircuitElements( vertex ) > 1;
    };
    circuit.vertices.addItemAddedListener( updateFill );
    circuit.vertices.addItemRemovedListener( updateFill );

    // In Black Box, other wires can be detached from a vertex and this should also update the solder
    circuit.circuitElements.addItemAddedListener( updateFill );
    circuit.circuitElements.addItemRemovedListener( updateFill );

    var updateSolderNodePosition = function( position ) {
      self.setTranslation( position.x - SOLDER_IMAGE.width / 2, position.y - SOLDER_IMAGE.height / 2 );
    };
    vertex.positionProperty.link( updateSolderNodePosition );

    var relayerListener = function() {
      circuitLayerNode.fixSolderLayeringForVertex( vertex );
    };
    vertex.relayerEmitter.addListener( relayerListener );

    // @private (read-only) {function} called by dispose()
    this.disposeSolderNode = function() {
      vertex.positionProperty.unlink( updateSolderNodePosition );

      circuit.vertices.removeItemAddedListener( updateFill );
      circuit.vertices.removeItemRemovedListener( updateFill );

      // In Black Box, other wires can be detached from a vertex and this should also update the solder
      circuit.circuitElements.removeItemAddedListener( updateFill );
      circuit.circuitElements.removeItemRemovedListener( updateFill );

      vertex.relayerEmitter.removeListener( relayerListener );
    };

    updateFill();
  }

  circuitConstructionKitCommon.register( 'SolderNode', SolderNode );

  return inherit( Image, SolderNode, {

    /**
     * Eliminate resources when no longer used.
     * @public
     */
    dispose: function() {
      this.disposeSolderNode();
      Node.prototype.dispose.call( this );
    }
  }, {

    /**
     * Rasterize images for use in WebGL
     * @param {function} callback - called once rasterization is complete
     */
    init: function( callback ) {
      new Circle( SOLDER_RADIUS, { fill: SOLDER_COLOR } ).toImage( function( image ) {
        SOLDER_IMAGE = image;
        callback();
      } );
    }
  } );
} );