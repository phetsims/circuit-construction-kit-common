// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

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

  // constants
  var SOLDER_COLOR = '#ae9f9e';

  /**
   *
   * @constructor
   */
  function SolderNode( circuitNode, vertex ) {
    var self = this;
    var circuit = circuitNode.circuit;
    this.vertex = vertex;
    this.startOffset = null;// @public - added by CircuitNode during dragging, used for relative drag location.

    // @public (read-only) - for hit testing with probes
    this.dottedLineNodeRadius = 11.2;

    // Start as a dotted line, becomes solid when connected to >1 element.
    var dottedLineNode = new Circle( this.dottedLineNodeRadius );

    Node.call( this, {
      children: [ dottedLineNode ]
    } );

    var updateShape = function() {
      var edgeCount = circuit.countCircuitElements( vertex );
      dottedLineNode.fill = edgeCount > 1 ? SOLDER_COLOR : null;
    };
    circuit.vertices.addItemAddedListener( updateShape );
    circuit.vertices.addItemRemovedListener( updateShape );

    // In Black Box, other wires can be detached from a vertex and this should also update the solder
    circuit.circuitElements.addItemAddedListener( updateShape );
    circuit.circuitElements.addItemRemovedListener( updateShape );

    var updateSolderNodePosition = function( position ) {
      dottedLineNode.center = position;
    };
    vertex.positionProperty.link( updateSolderNodePosition );

    var relayerListener = function() {
      circuitNode.fixSolderLayeringForVertex( self.vertex );
    };
    vertex.relayerEmitter.addListener( relayerListener );

    this.disposeSolderNode = function() {
      vertex.positionProperty.unlink( updateSolderNodePosition );

      circuit.vertices.removeItemAddedListener( updateShape );
      circuit.vertices.removeItemRemovedListener( updateShape );

      // In Black Box, other wires can be detached from a vertex and this should also update the solder
      circuit.circuitElements.removeItemAddedListener( updateShape );
      circuit.circuitElements.removeItemRemovedListener( updateShape );

      vertex.relayerEmitter.removeListener( relayerListener );
    };

    updateShape();
  }

  circuitConstructionKitCommon.register( 'SolderNode', SolderNode );

  return inherit( Node, SolderNode, {
    dispose: function() {
      this.disposeSolderNode();
    }
  } );
} );