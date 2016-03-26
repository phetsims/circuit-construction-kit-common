// Copyright 2015, University of Colorado Boulder

/**
 * Shows the silver solder at a connected vertex.  This is not interactive and is behind everything else.
 * TODO: Some duplication with VertexNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   *
   * @constructor
   */
  function SolderNode( circuitNode, vertex ) {
    var circuit = circuitNode.circuit;
    this.vertex = vertex;
    this.startOffset = null;// @public - added by CircuitNode during dragging, used for relative drag location.

    // @public (read-only) - for hit testing with probes
    this.dottedLineNodeRadius = 14;

    // Start as a dotted line, becomes solid when connected to >1 element.
    var dottedLineNode = new Circle( this.dottedLineNodeRadius );

    Node.call( this, {
      children: [ dottedLineNode ]
    } );

    var updateShape = function() {
      var edgeCount = circuit.countCircuitElements( vertex );
      dottedLineNode.fill = edgeCount > 1 ? CircuitConstructionKitBasicsConstants.solderColor : null;
    };
    circuit.vertices.addItemAddedListener( updateShape );
    circuit.vertices.addItemRemovedListener( updateShape );

    var updateSolderNodePosition = function( position ) {
      dottedLineNode.center = position;
    };
    vertex.positionProperty.link( updateSolderNodePosition );

    this.disposeSolderNode = function() {
      vertex.positionProperty.unlink( updateSolderNodePosition );
    };
  }

  circuitConstructionKitBasics.register( 'SolderNode', SolderNode );

  return inherit( Node, SolderNode, {
    dispose: function() {
      this.disposeSolderNode();
    }
  } );
} );