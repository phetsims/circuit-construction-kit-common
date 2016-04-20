// Copyright 2015-2016, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var WireNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/WireNode' );
  var BatteryNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/BatteryNode' );
  var CCKLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CCKLightBulbNode' );
  var ResistorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/ResistorNode' );
  var VertexNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/VertexNode' );
  var SolderNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/SolderNode' );
  var Vector2 = require( 'DOT/Vector2' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/FixedLengthCircuitElement' );

  /**
   *
   * @param {Circuit} circuit
   * @param {CircuitConstructionKitBasicsScreenView} circuitConstructionKitBasicsScreenView - for dropping circuit element back into the toolbox
   * @constructor
   */
  function CircuitNode( circuit, circuitConstructionKitBasicsScreenView ) {
    var solderLayer = new Node();

    // @public (read-only) so that additional Nodes may be interleaved
    this.mainLayer = new Node();
    var mainLayer = this.mainLayer;
    Node.call( this, {
      children: [
        solderLayer,
        this.mainLayer // everything else
      ]
    } );
    this.circuit = circuit;
    var circuitNode = this;

    // solder layer
    this.solderNodes = [];

    // in main layer
    this.batteryNodes = [];
    this.lightBulbNodes = [];
    this.wireNodes = [];
    this.resistorNodes = [];
    this.vertexNodes = [];

    /**
     * For each type of circuitElement, create a listener that can be used to remove the corresponding nodes
     * @param {Array.<Node>} array - the list of nodes for that circuit element type, such as this.resistorNodes
     * @param {Function} getter - function that returns a {Node} for a {CircuitElement}
     * @returns {Function}
     */
    var createCircuitElementRemovedListener = function( array, getter ) {
      return function( circuitElement ) {
        var circuitElementNode = getter( circuitElement ); // like getBatteryNode(circuitElement)

        mainLayer.removeChild( circuitElementNode );

        var index = array.indexOf( circuitElementNode );
        if ( index > -1 ) {
          array.splice( index, 1 );
        }
        circuitElementNode.dispose();

        assert && assert( getter( circuitElement ) === null, 'should have been removed' );
      };
    };

    // When loading from a state object, the vertices could have been added first.  If so, move them in front
    var moveVerticesToFront = function( circuitElement ) {
      circuitNode.getVertexNode( circuitElement.startVertex ) && circuitNode.getVertexNode( circuitElement.startVertex ).moveToFront();
      circuitNode.getVertexNode( circuitElement.endVertex ) && circuitNode.getVertexNode( circuitElement.endVertex ).moveToFront();
    };

    /**
     * For each CircuitElement type, do the following:
     * (a) Add nodes for pre-existing model elements
     * (b) Add a listener that adds nodes when model elements are added
     * (c) Add a listener that removes nodes when model elements are removed
     *
     * @param {function} CircuitElementNodeConstructor constructor for the node type, such as BatteryNode
     * @param {ObservableArray.<CircuitElement>} modelObservableArray
     * @param {Array.<CircuitElementNode>} nodeArray
     * @param {function} getter, given a {CircuitElement}, return the corresponding {CircuitElementNode}
     */
    var initializeCircuitElementType = function( CircuitElementNodeConstructor, modelObservableArray, nodeArray, getter ) {
      var addCircuitElement = function( circuitElement ) {
        var circuitElementNode = new CircuitElementNodeConstructor( circuitConstructionKitBasicsScreenView, circuitNode, circuitElement );
        nodeArray.push( circuitElementNode );
        mainLayer.addChild( circuitElementNode );
        moveVerticesToFront( circuitElement );
      };
      modelObservableArray.addItemAddedListener( addCircuitElement );
      modelObservableArray.forEach( addCircuitElement );
      modelObservableArray.addItemRemovedListener( createCircuitElementRemovedListener( nodeArray, getter ) );
    };

    initializeCircuitElementType( WireNode, circuit.wires, circuitNode.wireNodes, this.getWireNode.bind( this ) );
    initializeCircuitElementType( BatteryNode, circuit.batteries, circuitNode.batteryNodes, this.getBatteryNode.bind( this ) );
    initializeCircuitElementType( CCKLightBulbNode, circuit.lightBulbs, circuitNode.lightBulbNodes, this.getCCKLightBulbNode.bind( this ) );
    initializeCircuitElementType( ResistorNode, circuit.resistors, circuitNode.resistorNodes, this.getResistorNode.bind( this ) );

    // TODO: When an item is dropped in the toolbox, remove it from the model

    var addVertexNode = function( vertex ) {
      var vertexNode = new VertexNode( circuitNode, vertex );
      circuitNode.vertexNodes.push( vertexNode );
      mainLayer.addChild( vertexNode );

      var solderNode = new SolderNode( circuitNode, vertex );
      circuitNode.solderNodes.push( solderNode );
      solderLayer.addChild( solderNode );
    };
    circuit.vertices.addItemAddedListener( addVertexNode );
    circuit.vertices.addItemRemovedListener( function( vertex ) {
      var vertexNode = circuitNode.getVertexNode( vertex );
      mainLayer.removeChild( vertexNode );

      var index = circuitNode.vertexNodes.indexOf( vertexNode );
      if ( index > -1 ) {
        circuitNode.vertexNodes.splice( index, 1 );
      }
      vertexNode.dispose();

      assert && assert( circuitNode.getVertexNode( vertex ) === null, 'vertex node should have been removed' );

      var solderNode = circuitNode.getSolderNode( vertex );
      solderLayer.removeChild( solderNode );

      var solderNodeIndex = circuitNode.solderNodes.indexOf( solderNode );
      if ( solderNodeIndex > -1 ) {
        circuitNode.solderNodes.splice( solderNodeIndex, 1 );
      }
      solderNode.dispose();

      assert && assert( circuitNode.getSolderNode( vertex ) === null, 'solder node should have been removed' );
    } );
    circuit.vertices.forEach( addVertexNode );
  }

  return inherit( Node, CircuitNode, {
    // TODO: Duplicated
    getWireNode: function( wire ) {
      for ( var i = 0; i < this.wireNodes.length; i++ ) {
        var wireNode = this.wireNodes[ i ];
        if ( wireNode.wire === wire ) {
          return wireNode;
        }
      }
      return null;
    },
    // TODO: Duplicated
    getCCKLightBulbNode: function( lightBulb ) {
      for ( var i = 0; i < this.lightBulbNodes.length; i++ ) {
        var lightBulbNode = this.lightBulbNodes[ i ];
        if ( lightBulbNode.lightBulb === lightBulb ) {
          return lightBulbNode;
        }
      }
      return null;
    },
    getBatteryNode: function( battery ) {
      for ( var i = 0; i < this.batteryNodes.length; i++ ) {
        var batteryNode = this.batteryNodes[ i ];
        if ( batteryNode.battery === battery ) {
          return batteryNode;
        }
      }
      return null;
    },
    getResistorNode: function( resistor ) {
      for ( var i = 0; i < this.resistorNodes.length; i++ ) {
        var resistorNode = this.resistorNodes[ i ];
        if ( resistorNode.resistor === resistor ) {
          return resistorNode;
        }
      }
      return null;
    },
    getSolderNode: function( vertex ) {
      for ( var i = 0; i < this.solderNodes.length; i++ ) {
        var solderNode = this.solderNodes[ i ];
        if ( solderNode.vertex === vertex ) {
          return solderNode;
        }
      }
      return null;
    },
    getVertexNode: function( vertex ) {
      for ( var i = 0; i < this.vertexNodes.length; i++ ) {
        var vertexNode = this.vertexNodes[ i ];
        if ( vertexNode.vertex === vertex ) {
          return vertexNode;
        }
      }
      return null;
    },
    getAllDropTargets: function( vertices ) {
      var allDropTargets = [];

      for ( var i = 0; i < vertices.length; i++ ) {
        var vertex = vertices[ i ];
        var targetVertex = this.circuit.getDropTarget( vertex );
        if ( targetVertex ) {
          allDropTargets.push( { src: vertex, dst: targetVertex } );
        }
      }
      return allDropTargets;
    },
    getBestDropTarget: function( vertices ) {
      var allDropTargets = this.getAllDropTargets( vertices );
      if ( allDropTargets ) {
        var sorted = _.sortBy( allDropTargets, function( dropTarget ) {
          return dropTarget.src.unsnappedPosition.distance( dropTarget.dst.position );
        } );
        return sorted[ 0 ];
      }
      else {
        return null;
      }
    },
    startDrag: function( point, vertex, okToRotate ) {

      // If it is the edge of a fixed length circuit element, the element rotates and moves toward the mouse
      var vertexNode = this.getVertexNode( vertex ); // TODO: use event.currentTarget?
      vertexNode.startOffset = vertexNode.globalToParentPoint( point ).minus( vertex.unsnappedPosition );
    },
    drag: function( point, vertex, okToRotate ) {
      var vertexNode = this.getVertexNode( vertex ); // TODO: Is this too expensive?  Probably!
      var position = vertexNode.globalToParentPoint( point ).minus( vertexNode.startOffset );

      // If it is the edge of a fixed length circuit element, the element rotates and moves toward the mouse
      var neighbors = this.circuit.getNeighborCircuitElements( vertex );

      // Find all vertices connected by fixed length nodes.
      var vertices = this.circuit.findAllFixedVertices( vertex );

      // If any of the vertices connected by fixed length nodes is immobile, then the entire subgraph cannot be moved
      // TODO: How about being able to rotate a component attached to an undraggable vertex
      for ( var i = 0; i < vertices.length; i++ ) {
        if ( !vertices[ i ].draggable ) {
          return;
        }
      }

      if ( okToRotate && neighbors.length === 1 && neighbors[ 0 ] instanceof FixedLengthCircuitElement ) {

        var oppositeVertex = neighbors[ 0 ].getOppositeVertex( vertex );

        // Find the new relative angle
        var angle;

        if ( vertex.unsnappedPosition.x === vertex.position.x && vertex.unsnappedPosition.y === vertex.position.y ) {

          // Rotate the way the element is going.
          angle = position.minus( oppositeVertex.position ).angle();
        }
        else {

          // Lock in the angle if a match is proposed, otherwise things rotate uncontrollably
          angle = vertex.position.minus( oppositeVertex.position ).angle();
        }

        // Maintain fixed length
        var length = neighbors[ 0 ].length;
        var relative = Vector2.createPolar( length, angle + Math.PI );
        var oppositePosition = position.plus( relative );

        var rotationDelta = oppositePosition.minus( oppositeVertex.unsnappedPosition );

        this.translateVertexGroup( vertex, vertices, rotationDelta, function() {
          vertex.unsnappedPosition = oppositeVertex.unsnappedPosition.minus( relative );
        }, [ vertex ] );
      }
      else {
        var translationDelta = position.minus( vertex.unsnappedPosition );
        this.translateVertexGroup( vertex, vertices, translationDelta, null, vertices );
      }

      // TODO: Keep in bounds
    },

    /**
     * Translate a group of vertices, used when dragging by a circuit element or by a one-neighbor vertex
     * @param {Vertex} vertex - the vertex being dragged
     * @param {Array.<Vertex>} vertices - all the vertices in the group
     * @param {Vector2} unsnappedDelta - how far to move the group
     * @param {function|null} updatePositions - optional callback for updating positions after unsnapped positions updated
     * @param {Array.<Vertex>} attachable - the nodes that are candidates for attachment
     */
    translateVertexGroup: function( vertex, vertices, unsnappedDelta, updatePositions, attachable ) {

      // Update the unsnapped position of the entire subgraph, i.e. where it would be if no matches are proposed.
      // Must do this before calling getBestDropTarget, because the unsnapped positions are used for target matching
      for ( var i = 0; i < vertices.length; i++ ) {
        vertices[ i ].unsnappedPosition = vertices[ i ].unsnappedPosition.plus( unsnappedDelta );
      }

      updatePositions && updatePositions();

      // Is there a nearby vertex any of these could snap to?  If so, move to its location temporarily.
      // Find drop targets for *any* of the dragged vertices
      var bestDropTarget = this.getBestDropTarget( attachable );
      var delta = Vector2.ZERO;
      if ( bestDropTarget ) {
        delta = bestDropTarget.dst.unsnappedPosition.minus( bestDropTarget.src.unsnappedPosition );
      }

      for ( i = 0; i < vertices.length; i++ ) {
        vertices[ i ].position = vertices[ i ].unsnappedPosition.plus( delta );
      }

    },
    endDrag: function( event, vertex ) {

      var vertexNode = this.getVertexNode( vertex ); // TODO: Is this too expensive?  Probably!

      // Find all vertices connected by fixed length nodes.
      var vertices = this.circuit.findAllFixedVertices( vertex );

      // If any of the vertices connected by fixed length nodes is immobile, then the entire subgraph cannot be moved
      for ( var i = 0; i < vertices.length; i++ ) {
        if ( !vertices[ i ].draggable ) {
          return;
        }
      }

      var bestDropTarget = this.getBestDropTarget( vertices );
      if ( bestDropTarget ) {
        this.circuit.connect( bestDropTarget.src, bestDropTarget.dst );

        // Set the new reference point for next drag
        for ( i = 0; i < vertices.length; i++ ) {
          vertices[ i ].unsnappedPosition = vertices[ i ].position;
        }
      }
      vertexNode.startOffset = null;

      // Signify that something has been dropped in the play area.
      // TODO: Don't signify this if something dropped in the toolbox.  Later: Why not?
      this.circuit.circuitElementDroppedEmitter.emit();
    }
  } );
} );