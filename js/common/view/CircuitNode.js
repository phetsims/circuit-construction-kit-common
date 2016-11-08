// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var WireNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/WireNode' );
  var SwitchNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/SwitchNode' );
  var BatteryNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/BatteryNode' );
  var CCKLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CCKLightBulbNode' );
  var CCKLightBulbForegroundNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CCKLightBulbForegroundNode' );
  var ResistorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/ResistorNode' );
  var VertexNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/VertexNode' );
  var SolderNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/SolderNode' );
  var Vector2 = require( 'DOT/Vector2' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/FixedLengthCircuitElement' );
  var ElectronNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/ElectronNode' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Wire' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Battery' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/LightBulb' );
  var Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Switch' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Resistor' );
  var Property = require( 'AXON/Property' );

  /**
   *
   * @param {Circuit} circuit
   * @param {CircuitConstructionKitScreenView} circuitConstructionKitScreenView - for dropping circuit element back into the toolbox
   * @constructor
   */
  function CircuitNode( circuit, circuitConstructionKitScreenView, tandem ) {
    this.circuitConstructionKitModel = circuitConstructionKitScreenView.circuitConstructionKitModel;
    this.visibleBoundsProperty = circuitConstructionKitScreenView.visibleBoundsProperty;
    var runningProperty = this.circuitConstructionKitModel.exploreScreenRunningProperty;

    this.highlightLayer = new Node();

    // @public (read-only) so that additional Nodes may be interleaved
    this.mainLayer = new Node();
    var mainLayer = this.mainLayer;
    Node.call( this, {
      children: [
        this.mainLayer, // everything else
        this.highlightLayer // highlights go in front of everything else
      ]
    } );
    this.circuit = circuit;
    var self = this;

    // solder layer
    this.solderNodes = [];

    // in main layer
    this.batteryNodes = [];
    this.lightBulbNodes = [];
    this.lightBulbForegroundNodes = [];
    this.wireNodes = [];
    this.resistorNodes = [];
    this.switchNodes = [];
    this.vertexNodes = [];
    this.electronNodes = [];

    /**
     * For each type of circuitElement, create a listener that can be used to remove the corresponding nodes
     * @param {Array.<Node>} array - the list of nodes for that circuit element type, such as this.resistorNodes
     * @param {Function} getter - function that returns a {Node} for a {CircuitElement}
     * @returns {Function}
     */
    var createCircuitElementRemovedListener = function( array, getter ) {
      return function( circuitElement ) {
        var circuitElementNode = getter( circuitElement ); // like getBatteryNode(circuitElement)
        assert && assert( circuitElementNode, 'No circuit element node found for ' + circuitElement );

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
      self.getVertexNode( circuitElement.startVertex ) && self.getVertexNode( circuitElement.startVertex ).moveToFront();
      self.getVertexNode( circuitElement.endVertex ) && self.getVertexNode( circuitElement.endVertex ).moveToFront();

      self.getVertexNode( circuitElement.startVertex ) && self.getSolderNode( circuitElement.startVertex ).moveToFront();
      self.getVertexNode( circuitElement.endVertex ) && self.getSolderNode( circuitElement.endVertex ).moveToFront();
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
    var initializeCircuitElementType = function( CircuitElementNodeConstructor, modelObservableArray, nodeArray, getter, groupTandem ) {
      var addCircuitElement = function( circuitElement ) {
        var circuitElementNode = new CircuitElementNodeConstructor(
          circuitConstructionKitScreenView,
          self,
          circuitElement,
          runningProperty,
          groupTandem.createNextTandem()
        );
        nodeArray.push( circuitElementNode );
        mainLayer.addChild( circuitElementNode );
        moveVerticesToFront( circuitElement );
      };
      modelObservableArray.addItemAddedListener( addCircuitElement );
      modelObservableArray.forEach( addCircuitElement );
      modelObservableArray.addItemRemovedListener( createCircuitElementRemovedListener( nodeArray, getter ) );
    };

    initializeCircuitElementType( WireNode, circuit.wires, self.wireNodes, this.getWireNode.bind( this ), tandem.createGroupTandem( 'wireNode' ) );
    initializeCircuitElementType( BatteryNode, circuit.batteries, self.batteryNodes, this.getBatteryNode.bind( this ), tandem.createGroupTandem( 'batteryNode' ) );
    initializeCircuitElementType( CCKLightBulbNode, circuit.lightBulbs, self.lightBulbNodes, this.getCCKLightBulbNode.bind( this ), tandem.createGroupTandem( 'lightBulbNode' ) );
    initializeCircuitElementType( CCKLightBulbForegroundNode, circuit.lightBulbs, self.lightBulbForegroundNodes, this.getCCKLightBulbForegroundNode.bind( this ), tandem.createGroupTandem( 'lightBulbForegroundNode' ) );
    initializeCircuitElementType( ResistorNode, circuit.resistors, self.resistorNodes, this.getResistorNode.bind( this ), tandem.createGroupTandem( 'resistorNode' ) );
    initializeCircuitElementType( SwitchNode, circuit.switches, self.switchNodes, this.getSwitchNode.bind( this ), tandem.createGroupTandem( 'switchNode' ) );

    var vertexNodeGroup = tandem.createGroupTandem( 'vertexNodes' );
    var addVertexNode = function( vertex ) {
      var solderNode = new SolderNode( self, vertex );
      self.solderNodes.push( solderNode );
      mainLayer.addChild( solderNode );

      var vertexNode = new VertexNode( self, vertex, vertexNodeGroup.createNextTandem() );
      self.vertexNodes.push( vertexNode );
      mainLayer.addChild( vertexNode );
    };
    circuit.vertices.addItemAddedListener( addVertexNode );
    circuit.vertices.addItemRemovedListener( function( vertex ) {
      var vertexNode = self.getVertexNode( vertex );
      mainLayer.removeChild( vertexNode );

      var index = self.vertexNodes.indexOf( vertexNode );
      if ( index > -1 ) {
        self.vertexNodes.splice( index, 1 );
      }
      vertexNode.dispose();

      assert && assert( self.getVertexNode( vertex ) === null, 'vertex node should have been removed' );

      var solderNode = self.getSolderNode( vertex );
      mainLayer.removeChild( solderNode );

      var solderNodeIndex = self.solderNodes.indexOf( solderNode );
      if ( solderNodeIndex > -1 ) {
        self.solderNodes.splice( solderNodeIndex, 1 );
      }
      solderNode.dispose();

      assert && assert( self.getSolderNode( vertex ) === null, 'solder node should have been removed' );
    } );
    circuit.vertices.forEach( addVertexNode );

    // When the screen is resized, move all vertices into view.
    this.visibleBoundsProperty.link( function( visibleBounds ) {
      for ( var i = 0; i < circuit.vertices.length; i++ ) {
        var vertex = circuit.vertices.get( i );
        if ( !visibleBounds.containsPoint( vertex.position ) ) {
          var closestPoint = visibleBounds.getClosestPoint( vertex.position.x, vertex.position.y );
          var delta = closestPoint.minus( vertex.position );

          // Find all vertices connected by fixed length nodes.
          var vertices = circuit.findAllFixedVertices( vertex );
          self.translateVertexGroup( vertex, vertices, delta, null, [] );
        }
      }
    } );

    circuit.electrons.addItemAddedListener( function( electron ) {
      var electronNode = new ElectronNode(
        electron,
        circuitConstructionKitScreenView.circuitConstructionKitModel.revealingProperty || new Property( true )
      );
      electron.disposeEmitter.addListener( function x() {
        var index = self.electronNodes.indexOf( electron );
        self.electronNodes.splice( index, 1 );

        electron.disposeEmitter.removeListener( x );
      } );
      self.electronNodes.push( electronNode );
      self.mainLayer.addChild( electronNode );

      // Move light bulb foregrounds to the front so electron will go behind.
      self.lightBulbForegroundNodes.forEach( function( b ) {
        b.moveToFront();
      } );
    } );
  }

  circuitConstructionKitCommon.register( 'CircuitNode', CircuitNode );

  return inherit( Node, CircuitNode, {

    getSpecificCircuitElementNode: function( circuitElement ) {
      if ( circuitElement instanceof Wire ) {
        return this.getWireNode( circuitElement );
      }
      else if ( circuitElement instanceof LightBulb ) {
        return this.getCCKLightBulbNode( circuitElement );
      }
      else if ( circuitElement instanceof Battery ) {
        return this.getBatteryNode( circuitElement );
      }
      else if ( circuitElement instanceof Resistor ) {
        return this.getResistorNode( circuitElement );
      }
      else if ( circuitElement instanceof Switch ) {
        return this.getSwitchNode( circuitElement );
      }
      else {
        return null;
      }
    },
    /**
     * Get the CircuitElementNode for the corresponding CircuitElement
     * @param {Array.<CircuitElementNode>} nodeArray - the list of nodes to search
     * @param {CircuitElement} circuitElement
     * @returns {CircuitElementNode|null}
     */
    getCircuitElementNode: function( nodeArray, circuitElement ) {
      for ( var i = 0; i < nodeArray.length; i++ ) {
        if ( nodeArray[ i ].circuitElement === circuitElement ) {
          return nodeArray[ i ];
        }
      }
      return null;
    },

    getWireNode: function( wire ) { return this.getCircuitElementNode( this.wireNodes, wire ); },
    getCCKLightBulbNode: function( lightBulb ) { return this.getCircuitElementNode( this.lightBulbNodes, lightBulb ); },
    getCCKLightBulbForegroundNode: function( lightBulb ) { return this.getCircuitElementNode( this.lightBulbForegroundNodes, lightBulb ); },
    getBatteryNode: function( battery ) { return this.getCircuitElementNode( this.batteryNodes, battery ); },
    getResistorNode: function( resistor ) { return this.getCircuitElementNode( this.resistorNodes, resistor ); },
    getSwitchNode: function( switchModel ) { return this.getCircuitElementNode( this.switchNodes, switchModel ); },

    /**
     * Get the Node for a vertex
     * @param {Array.<Node>} nodeArray
     * @param {Vertex} vertex
     * @returns {Node|null}
     */
    getNodeForVertex: function( nodeArray, vertex ) {
      for ( var i = 0; i < nodeArray.length; i++ ) {
        if ( nodeArray[ i ].vertex === vertex ) {
          return nodeArray[ i ];
        }
      }
      return null;
    },
    getSolderNode: function( vertex ) { return this.getNodeForVertex( this.solderNodes, vertex ); },
    getVertexNode: function( vertex ) { return this.getNodeForVertex( this.vertexNodes, vertex ); },

    getAllDropTargets: function( vertices ) {
      var allDropTargets = [];

      for ( var i = 0; i < vertices.length; i++ ) {
        var vertex = vertices[ i ];
        var targetVertex = this.circuit.getDropTarget( vertex, this.circuitConstructionKitModel.mode, this.circuitConstructionKitModel.blackBoxBounds );
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

    step: function( dt ) {

      // Any electrons that are in a light bulb and above halfway should be in front of the base
      // TODO: does this code fight with the code that moves the bases to the front?
      // TODO: how to avoid moving electrons unnecessarily?
      var children = this.mainLayer.children;
      for ( var i = 0; i < children.length; i++ ) {
        var child = children[ i ];
        if ( child instanceof ElectronNode &&
             child.electron.circuitElement instanceof LightBulb ) {
          if ( child.electron.distance > child.electron.circuitElement.length / 2 ) {
            child.moveToFront();
          }
          else {
            var indexOfForeground = children.indexOf( this.getCCKLightBulbForegroundNode( child.electron.circuitElement ) );

            this.mainLayer.removeChild( child );
            this.mainLayer.insertChild( indexOfForeground - 2, child ); // TODO: I have no idea why -2 seems to work
          }
        }
      }
    },
    startDrag: function( point, vertex ) {

      // If it is the edge of a fixed length circuit element, the element rotates and moves toward the mouse
      var vertexNode = this.getVertexNode( vertex );
      vertexNode.startOffset = vertexNode.globalToParentPoint( point ).minus( vertex.unsnappedPosition );
    },

    // Vertices connected to the black box cannot be moved, but they can be rotated
    // @private
    rotateAboutFixedPivot: function( point, vertex, okToRotate, vertexNode, position, neighbors, vertices ) {

      // Don't traverse across the black box interface, or it would rotate objects on the other side
      vertices = this.circuit.findAllFixedVertices( vertex, function( currentVertex, neighbor ) {return !currentVertex.blackBoxInterface;} );
      var fixedNeighbors = neighbors.filter( function( neighbor ) {return neighbor.getOppositeVertex( vertex ).blackBoxInterface;} );
      if ( fixedNeighbors.length === 1 ) {
        var fixedNeighbor = fixedNeighbors[ 0 ];
        var fixedVertex = fixedNeighbor.getOppositeVertex( vertex );
        var desiredAngle = position.minus( fixedVertex.position ).angle();

        var length = fixedNeighbor.length;
        var indexOfFixedVertex = vertices.indexOf( fixedVertex );
        vertices.splice( indexOfFixedVertex, 1 );

        var dest = Vector2.createPolar( length, desiredAngle ).plus( fixedVertex.position );
        var src = vertex.position;
        var delta = dest.minus( src );
        var relative = Vector2.createPolar( length, desiredAngle + Math.PI );

        // Do not propose attachments, since connections cannot be made from a rotation.
        var attachable = [];
        this.translateVertexGroup( vertex, vertices, delta, function() {
          vertex.unsnappedPosition = fixedVertex.unsnappedPosition.minus( relative );
        }, attachable );
      }
    },

    /**
     * When switching from "build" -> "investigate", the black box circuit elements must be moved behind the black box
     * or they will be visible in front of the black box.
     */
    moveTrueBlackBoxElementsToBack: function() {
      var circuitElementNodeToBack = function( circuitElementNode ) {
        circuitElementNode.circuitElement.insideTrueBlackBox && circuitElementNode.moveToBack();
      };
      var vertexNodeToBack = function( nodeWithVertex ) {
        (nodeWithVertex.vertex.insideTrueBlackBox || nodeWithVertex.vertex.blackBoxInterface ) && nodeWithVertex.moveToBack();
      };
      this.solderNodes.forEach( vertexNodeToBack );
      this.vertexNodes.forEach( vertexNodeToBack );
      this.batteryNodes.forEach( circuitElementNodeToBack );
      this.lightBulbNodes.forEach( circuitElementNodeToBack );
      this.wireNodes.forEach( circuitElementNodeToBack );
      this.resistorNodes.forEach( circuitElementNodeToBack );
      this.switchNodes.forEach( circuitElementNodeToBack );
    },
    drag: function( point, vertex, okToRotate ) {
      var vertexNode = this.getVertexNode( vertex );
      var position = vertexNode.globalToParentPoint( point ).minus( vertexNode.startOffset );

      // If it is the edge of a fixed length circuit element, the element rotates and moves toward the mouse
      var neighbors = this.circuit.getNeighborCircuitElements( vertex );

      // Find all vertices connected by fixed length nodes.
      var vertices = this.circuit.findAllFixedVertices( vertex );

      // If any of the vertices connected by fixed length nodes is immobile, then the entire subgraph cannot be moved
      var rotated = false;
      for ( var i = 0; i < vertices.length; i++ ) {
        if ( !vertices[ i ].draggable ) {

          // See #108 multiple objects connected to the same origin vertex can cause problems.
          // Restrict ourselves to the case where one wire is attached
          if ( neighbors.length === 1 ) {
            this.rotateAboutFixedPivot( point, vertex, okToRotate, vertexNode, position, neighbors, vertices );
          }
          rotated = true;
        }
      }
      if ( rotated ) {
        return;
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
        var length = neighbors[ 0 ].lightBulbLength || neighbors[ 0 ].length;
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

      var bounds = this.visibleBoundsProperty.get();

      // Modify the delta to guarantee all vertices remain in bounds
      for ( i = 0; i < vertices.length; i++ ) {
        var proposedPosition = vertices[ i ].unsnappedPosition.plus( unsnappedDelta );
        if ( !bounds.containsPoint( proposedPosition ) ) {
          var closestPosition = bounds.getClosestPoint( proposedPosition.x, proposedPosition.y );
          var keepInBoundsDelta = closestPosition.minus( proposedPosition );
          unsnappedDelta = unsnappedDelta.plus( keepInBoundsDelta );
        }
      }

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
    /**
     *
     * @param event
     * @param vertex
     * @param {boolean} didDrag - true if the vertex actually moved with at least 1 drag call
     */
    endDrag: function( event, vertex, didDrag ) {
      assert && assert( typeof didDrag === 'boolean', 'didDrag must be supplied' );

      var vertexNode = this.getVertexNode( vertex );

      // Find all vertices connected by fixed length nodes.
      var vertices = this.circuit.findAllFixedVertices( vertex );

      // If any of the vertices connected by fixed length nodes is immobile, then the entire subgraph cannot be moved
      for ( var i = 0; i < vertices.length; i++ ) {
        if ( !vertices[ i ].draggable ) {
          return;
        }
      }

      var bestDropTarget = this.getBestDropTarget( vertices );
      if ( bestDropTarget && didDrag ) {
        this.circuit.connect( bestDropTarget.src, bestDropTarget.dst );

        // Set the new reference point for next drag
        for ( i = 0; i < vertices.length; i++ ) {
          vertices[ i ].unsnappedPosition = vertices[ i ].position;
        }
      }
      vertexNode.startOffset = null;

      // Signify that something has been dropped in the play area, to show the edit panel (unless dropped in the toolbox)
      this.circuit.vertexDroppedEmitter.emit1( vertex );
    }
  } );
} );