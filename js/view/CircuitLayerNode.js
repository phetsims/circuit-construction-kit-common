// Copyright 2015-2017, University of Colorado Boulder

/**
 * The Node that represents a Circuit, including all Wires and FixedLengthCircuitElements, Charge, Solder, etc.  It also
 * renders the voltmeter and ammeter. It can be zoomed in and out.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var WireNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/WireNode' );
  var SwitchNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SwitchNode' );
  var BatteryNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/BatteryNode' );
  var FixedLengthCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedLengthCircuitElementNode' );
  var CCKLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CCKLightBulbNode' );
  var ResistorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ResistorNode' );
  var SeriesAmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SeriesAmmeterNode' );
  var VertexNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/VertexNode' );
  var SolderNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SolderNode' );
  var Vector2 = require( 'DOT/Vector2' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedLengthCircuitElement' );
  var ChargeNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ChargeNode' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  var Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  var SeriesAmmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/SeriesAmmeter' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var ValueNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ValueNode' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );

  /**
   * @param {Circuit} circuit - the model Circuit
   * @param {CCKScreenView} circuitConstructionKitScreenView - for dropping CircuitElement instances back in the toolbox
   * @param {Tandem} tandem
   * @constructor
   */
  function CircuitLayerNode( circuit, circuitConstructionKitScreenView, tandem ) {
    var self = this;

    // @private {Property.<string>} - 'lifelike' | 'schematic'
    this.viewProperty = circuitConstructionKitScreenView.circuitConstructionKitModel.viewProperty;

    // @private (read-only)
    this.circuitConstructionKitModel = circuitConstructionKitScreenView.circuitConstructionKitModel;

    // @private (read-only) {Property.<Bounds2>}
    this.visibleBoundsProperty = circuitConstructionKitScreenView.visibleBoundsProperty;

    // @public (read-only) CircuitElementNodes add highlights directly to this layer when they are constructed
    this.highlightLayer = new Node();

    // @public (read-only) SeriesAmmeterNodes add to this layer when they are constructed
    // Shows the front panel of SeriesAmmeterNodes (which shows the current readout) so the electrons look like they
    // flow through.
    this.seriesAmmeterNodeReadoutPanelLayer = new Node();

    // @public (read-only) layer for vertex buttons
    this.buttonLayer = new Node();

    // @public (read-only) for "show values"
    this.valueLayer = new Node();

    // @public (read-only) so that additional Nodes may be interleaved
    this.mainLayer = new Node();

    // @public (read-only) but CCKLightBulbNode calls addChild/removeChild to add sockets to the front layer
    this.lightBulbSocketLayer = new Node();

    Node.call( this, {
      children: [
        this.mainLayer, // circuit elements, charges and meters
        this.valueLayer, // values
        this.lightBulbSocketLayer, // fronts of light bulbs
        this.seriesAmmeterNodeReadoutPanelLayer, // fronts of series ammeters
        this.highlightLayer, // highlights go in front of everything else
        this.buttonLayer // vertex buttons
      ]
    } );

    // @public {DerivedProperty.<Bounds2>} the visible bounds in the coordinate frame of the circuit
    this.visibleBoundsInCircuitCoordinateFrameProperty = new DerivedProperty( [
      circuitConstructionKitScreenView.circuitConstructionKitModel.currentZoomProperty,
      circuitConstructionKitScreenView.visibleBoundsProperty
    ], function( zoom, visibleBounds ) {
      return self.parentToLocalBounds( visibleBounds );
    } );

    // @public (read-only) - the Circuit model depicted by this view
    this.circuit = circuit;

    // @private - Map to find CircuitElement=>CircuitElementNode. key is CircuitElement.id, value is CircuitElementNode
    this.circuitElementNodeMap = {};

    // @public (read-only) the layer to display the gray solder
    this.solderNodes = [];

    // @public (read-only) the VertexNodes
    this.vertexNodes = [];

    // @public (read-only) the nodes to show
    this.chargeNodes = [];

    // When loading from a state object, the vertices could have been added first.  If so, move them in front
    var moveVerticesToFront = function( circuitElement ) {
      var startVertexNode = self.getVertexNode( circuitElement.startVertexProperty.get() );
      var endVertexNode = self.getVertexNode( circuitElement.endVertexProperty.get() );
      var startSolderNode = self.getSolderNode( circuitElement.startVertexProperty.get() );
      var endSolderNode = self.getSolderNode( circuitElement.endVertexProperty.get() );

      startVertexNode && startVertexNode.moveToFront();
      endVertexNode && endVertexNode.moveToFront();
      startSolderNode && startSolderNode.moveToFront();
      endSolderNode && endSolderNode.moveToFront();
    };

    /**
     * For each CircuitElement type, do the following:
     * (a) Add nodes for pre-existing model elements
     * (b) Add a listener that adds nodes when model elements are added
     * (c) Add a listener that removes nodes when model elements are removed
     *
     * @param {function} CircuitElementNodeConstructor constructor for the node type, such as BatteryNode
     * @param {function} type - the type of the CircuitElement, such as Battery or Wire
     * @param {Tandem} groupTandem
     */
    var initializeCircuitElementType = function( CircuitElementNodeConstructor, type, groupTandem ) {
      var addCircuitElement = function( circuitElement ) {
        if ( circuitElement instanceof type ) {
          var circuitElementNode = new CircuitElementNodeConstructor(
            circuitConstructionKitScreenView,
            self,
            circuitElement,
            self.circuitConstructionKitModel.exploreScreenRunningProperty,
            circuitConstructionKitScreenView.circuitConstructionKitModel.viewProperty,
            groupTandem.createNextTandem()
          );
          self.circuitElementNodeMap[ circuitElement.id ] = circuitElementNode;
          self.mainLayer.addChild( circuitElementNode );
          moveVerticesToFront( circuitElement );

          // series ammeters already show their own readouts
          if ( circuitElement instanceof FixedLengthCircuitElement && !(circuitElement instanceof SeriesAmmeter) ) {
            var valueNode = new ValueNode(
              circuitElement,
              self.circuitConstructionKitModel.showValuesProperty,
              tandem.createTandem( circuitElement.tandemName ).createTandem( 'valueNode' )
            );
            self.valueLayer.addChild( valueNode );

            circuitElement.disposeEmitter.addListener( function() {
              self.valueLayer.removeChild( valueNode );
              valueNode.dispose();
            } );
          }
        }
      };
      circuit.circuitElements.addItemAddedListener( addCircuitElement );
      circuit.circuitElements.forEach( addCircuitElement );
      circuit.circuitElements.addItemRemovedListener( function( circuitElement ) {
        if ( circuitElement instanceof type ) {

          var circuitElementNode = self.getCircuitElementNode( circuitElement );
          self.mainLayer.removeChild( circuitElementNode );
          circuitElementNode.dispose();

          delete self.circuitElementNodeMap[ circuitElement.id ];
        }
      } );
    };

    initializeCircuitElementType( WireNode, Wire, tandem.createGroupTandem( 'wireNode' ) );
    initializeCircuitElementType( BatteryNode, Battery, tandem.createGroupTandem( 'batteryNode' ) );
    initializeCircuitElementType( CCKLightBulbNode, LightBulb, tandem.createGroupTandem( 'lightBulbNode' ) );
    initializeCircuitElementType( ResistorNode, Resistor, tandem.createGroupTandem( 'resistorNode' ) );
    initializeCircuitElementType( SeriesAmmeterNode, SeriesAmmeter, tandem.createGroupTandem( 'seriesAmmeterNode' ) );
    initializeCircuitElementType( SwitchNode, Switch, tandem.createGroupTandem( 'switchNode' ) );

    // When a Vertex is added to the model, create the corresponding views
    var vertexNodeGroup = tandem.createGroupTandem( 'vertexNodes' );
    var addVertexNode = function( vertex ) {
      var solderNode = new SolderNode( self, vertex );
      self.solderNodes.push( solderNode );
      self.mainLayer.addChild( solderNode );

      var vertexNode = new VertexNode( self, vertex, vertexNodeGroup.createNextTandem() );
      self.vertexNodes.push( vertexNode );
      self.mainLayer.addChild( vertexNode );
    };
    circuit.vertices.addItemAddedListener( addVertexNode );

    // When a Vertex is removed from the model, remove and dispose the corresponding views
    circuit.vertices.addItemRemovedListener( function( vertex ) {
      var vertexNode = self.getVertexNode( vertex );
      self.mainLayer.removeChild( vertexNode );

      var index = self.vertexNodes.indexOf( vertexNode );
      if ( index > -1 ) {
        self.vertexNodes.splice( index, 1 );
      }
      vertexNode.dispose();

      assert && assert( self.getVertexNode( vertex ) === null, 'vertex node should have been removed' );

      var solderNode = self.getSolderNode( vertex );
      self.mainLayer.removeChild( solderNode );

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
        if ( !visibleBounds.containsPoint( vertex.positionProperty.get() ) ) {
          var closestPoint = visibleBounds.getClosestPoint(
            vertex.positionProperty.get().x,
            vertex.positionProperty.get().y
          );
          var delta = closestPoint.minus( vertex.positionProperty.get() );

          // Find all vertices connected by fixed length nodes.
          var vertices = circuit.findAllFixedVertices( vertex );
          self.translateVertexGroup( vertex, vertices, delta, null, [] );
        }
      }
    } );

    // When a charge is added, add the corresponding ChargeNode
    circuit.charges.addItemAddedListener( function( charge ) {
      var chargeNode = new ChargeNode(
        charge,
        circuitConstructionKitScreenView.circuitConstructionKitModel.revealingProperty || new BooleanProperty( true )
      );
      charge.disposeEmitter.addListener( function() {
        var index = self.chargeNodes.indexOf( chargeNode );
        self.chargeNodes.splice( index, 1 );
      } );
      self.chargeNodes.push( chargeNode );
      self.mainLayer.addChild( chargeNode );
    } );

    // @public - Filled in by black box study, if it is running.
    this.blackBoxNode = null;

    this.viewProperty.link( function() {
      circuitConstructionKitScreenView.circuitConstructionKitModel.circuit.vertices.forEach( function( vertex ) {
        self.fixSolderLayeringForVertex( vertex );
      } );
    } );
  }

  circuitConstructionKitCommon.register( 'CircuitLayerNode', CircuitLayerNode );

  return inherit( Node, CircuitLayerNode, {

    /**
     * Fix the solder layering for a given vertex.
     * For lifelike: Solder should be in front of wires but behind batteries and resistors.
     * For schematic: Solder should be in front of all components
     *
     * @param {Vertex} vertex
     * @public
     */
    fixSolderLayeringForVertex: function( vertex ) {
      var self = this;

      // wires in the back, then solder, then fixed length components.
      var solderNode = this.getSolderNode( vertex );
      var adjacentComponents = this.circuit.getNeighborCircuitElements( vertex );
      var adjacentWires = adjacentComponents.filter( function( component ) {return component instanceof Wire;} );
      var adjacentFixedLengthComponents = adjacentComponents.filter( function( component ) {
        return component instanceof FixedLengthCircuitElement;
      } );

      // TODO: call fixSolderLayering when this viewproperty changes
      if ( this.viewProperty.get() === 'lifelike' ) {
        if ( adjacentFixedLengthComponents.length > 0 ) {

          // move before the first fixed length component
          var nodes = adjacentFixedLengthComponents.map( function( c ) {return self.getCircuitElementNode( c );} );
          var lowestNode = _.minBy( nodes, function( node ) {return self.mainLayer.indexOfChild( node );} );
          var lowestIndex = self.mainLayer.indexOfChild( lowestNode );
          var solderIndex = self.mainLayer.indexOfChild( solderNode );
          if ( solderIndex >= lowestIndex ) {
            self.mainLayer.removeChild( solderNode );
            self.mainLayer.insertChild( lowestIndex, solderNode );
          }
        }
        else if ( adjacentWires.length > 0 ) {

          // move after the last wire
          var wireNodes = adjacentWires.map( function( c ) {return self.getCircuitElementNode( c );} );
          var topWireNode = _.maxBy( wireNodes, function( node ) {return self.mainLayer.indexOfChild( node );} );
          var topIndex = self.mainLayer.indexOfChild( topWireNode );
          var mySolderIndex = self.mainLayer.indexOfChild( solderNode );
          if ( mySolderIndex <= topIndex ) {
            self.mainLayer.removeChild( solderNode );
            self.mainLayer.insertChild( topIndex, solderNode );
          }
        }

        // Make sure black box vertices are behind the black box
        // TODO (black-box-study): This is duplicated below, factor it out.
        if ( self.blackBoxNode ) {
          var blackBoxNodeIndex = self.mainLayer.children.indexOf( self.blackBoxNode );
          if ( vertex.blackBoxInterfaceProperty.get() ) {
            self.mainLayer.removeChild( solderNode );
            self.mainLayer.insertChild( blackBoxNodeIndex, solderNode );
          }
        }
      }
      else {

        // in schematic mode, solder should be on top of every component, including wires
        self.mainLayer.removeChild( solderNode );
        self.mainLayer.addChild( solderNode );
      }
    },

    /**
     * Returns the circuit element node that matches the given circuit element.
     * @param {CircuitElement} circuitElement
     * @returns {CircuitElementNode}
     * @private
     */
    getCircuitElementNode: function( circuitElement ) {
      return this.circuitElementNodeMap[ circuitElement.id ];
    },

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

    /**
     * Get the solder node associated with the specified Vertex
     * @param {Vertex} vertex
     * @returns {SolderNode}
     */
    getSolderNode: function( vertex ) { return this.getNodeForVertex( this.solderNodes, vertex ); },

    /**
     * Get the VertexNode associated with the specified Vertex
     * @param {Vertex} vertex
     * @returns {VertexNode}
     */
    getVertexNode: function( vertex ) { return this.getNodeForVertex( this.vertexNodes, vertex ); },

    /**
     * Find drop targets for all the given vertices
     * @param {Vertex[]} vertices
     * @returns {Object[]}
     */
    getAllDropTargets: function( vertices ) {
      var allDropTargets = [];

      for ( var i = 0; i < vertices.length; i++ ) {
        var vertex = vertices[ i ];
        var targetVertex = this.circuit.getDropTarget(
          vertex,
          this.circuitConstructionKitModel.modeProperty.get(),
          this.circuitConstructionKitModel.blackBoxBounds
        );
        if ( targetVertex ) {
          allDropTargets.push( { src: vertex, dst: targetVertex } );
        }
      }
      return allDropTargets;
    },

    /**
     * Finds the closest drop target for any of the given vertices
     * @param {Vertex[]} vertices
     * @returns {Object}
     */
    getBestDropTarget: function( vertices ) {
      var allDropTargets = this.getAllDropTargets( vertices );
      if ( allDropTargets ) {
        var sorted = _.sortBy( allDropTargets, function( dropTarget ) {
          return dropTarget.src.unsnappedPositionProperty.get().distance( dropTarget.dst.positionProperty.get() );
        } );
        return sorted[ 0 ];
      }
      else {
        return null;
      }
    },

    /**
     * Updates the view
     */
    step: function() {

      // Any charges that are in a light bulb and above halfway through the filament should be in front of the base,
      // so they appear to tunnel through the socket and go in front of the socket on the right-hand side.
      // TODO: this seems like a performance problem. should we model the z-ordering in the model?
      // Or solve this with clipping?
      var children = this.mainLayer.children;
      for ( var i = 0; i < children.length; i++ ) {
        var child = children[ i ];
        if ( child instanceof ChargeNode ) {

          var shouldBeInFront = child.charge.circuitElement instanceof LightBulb &&
                                child.charge.distanceProperty.get() > child.charge.circuitElement.chargePathLength / 2;

          var isInFront = this.lightBulbSocketLayer.hasChild( child );

          if ( shouldBeInFront && !isInFront ) {
            this.lightBulbSocketLayer.addChild( child );
            this.mainLayer.removeChild( child );
          }
          else if ( !shouldBeInFront && isInFront ) {
            this.lightBulbSocketLayer.removeChild( child );
            this.mainLayer.addChild( child );
          }
        }
        else if ( child instanceof FixedLengthCircuitElementNode ) {

          // paint dirty fixed length circuit element nodes
          // TODO: see what is happening here
          child.step();
        }
      }
    },

    /**
     * Called when a Vertex drag begins, records the relative click point
     * @param {Vector2} point
     * @param {Vertex} vertex
     */
    startDragVertex: function( point, vertex ) {

      // If it is the edge of a fixed length circuit element, the element rotates and moves toward the mouse
      var vertexNode = this.getVertexNode( vertex );
      vertexNode.startOffset = vertexNode.globalToParentPoint( point ).minus( vertex.unsnappedPositionProperty.get() );
    },

    /**
     * Vertices connected to the black box cannot be moved, but they can be rotated.  Called when dragging a subcircuit.
     * @param {Vector2} point
     * @param {Vertex} vertex
     * @param {boolean} okToRotate
     * @param {VertexNode} vertexNode
     * @param {Vector2} position
     * @param {CircuitElement[]} neighbors
     * @param {Vertex[]} vertices
     *
     * @private
     */
    rotateAboutFixedPivot: function( point, vertex, okToRotate, vertexNode, position, neighbors, vertices ) {

      // Don't traverse across the black box interface, or it would rotate objects on the other side
      vertices = this.circuit.findAllFixedVertices( vertex, function( currentVertex ) {
        return !currentVertex.blackBoxInterfaceProperty.get();
      } );
      var fixedNeighbors = neighbors.filter( function( neighbor ) {
        return neighbor.getOppositeVertex( vertex ).blackBoxInterfaceProperty.get();
      } );
      if ( fixedNeighbors.length === 1 ) {
        var fixedNeighbor = fixedNeighbors[ 0 ];
        var fixedVertex = fixedNeighbor.getOppositeVertex( vertex );
        var desiredAngle = position.minus( fixedVertex.positionProperty.get() ).angle();

        var length = fixedNeighbor.distanceBetweenVertices;
        var indexOfFixedVertex = vertices.indexOf( fixedVertex );
        vertices.splice( indexOfFixedVertex, 1 );

        var dest = Vector2.createPolar( length, desiredAngle ).plus( fixedVertex.positionProperty.get() );
        var src = vertex.positionProperty.get();
        var delta = dest.minus( src );
        var relative = Vector2.createPolar( length, desiredAngle + Math.PI );

        // Do not propose attachments, since connections cannot be made from a rotation.
        var attachable = [];
        this.translateVertexGroup( vertex, vertices, delta, function() {
          vertex.unsnappedPositionProperty.set( fixedVertex.unsnappedPositionProperty.get().minus( relative ) );
        }, attachable );
      }
    },

    /**
     * When switching from "build" -> "investigate", the black box circuit elements must be moved behind the black box
     * or they will be visible in front of the black box.
     * @public
     */
    moveTrueBlackBoxElementsToBack: function() {
      var self = this;
      var circuitElementNodeToBack = function( circuitElementNode ) {
        circuitElementNode.circuitElement.insideTrueBlackBoxProperty.get() && circuitElementNode.moveToBack();
      };
      var vertexNodeToBack = function( nodeWithVertex ) {
        nodeWithVertex.vertex.insideTrueBlackBoxProperty.get() && nodeWithVertex.moveToBack();
      };

      this.solderNodes.forEach( vertexNodeToBack );
      this.vertexNodes.forEach( vertexNodeToBack );
      _.values( this.circuitElementNodeMap ).forEach( circuitElementNodeToBack() );

      // Move black box interface vertices behind the black box,
      // see https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/36
      var interfaceVertexBehindBox = function( nodeWithVertex ) {
        var blackBoxNodeIndex = self.mainLayer.children.indexOf( self.blackBoxNode );
        if ( nodeWithVertex.vertex.blackBoxInterfaceProperty.get() ) {
          self.mainLayer.removeChild( nodeWithVertex );
          self.mainLayer.insertChild( blackBoxNodeIndex, nodeWithVertex );
        }
      };

      this.solderNodes.forEach( interfaceVertexBehindBox );
      this.vertexNodes.forEach( interfaceVertexBehindBox );
    },

    /**
     * Drag a vertex.
     * @param {Vector2} point - the touch position
     * @param {Vertex} vertex - the vertex that is being dragged
     * @param {boolean} okToRotate - true if it is allowed to rotate adjacent CircuitElements
     * @public
     */
    dragVertex: function( point, vertex, okToRotate ) {
      var vertexNode = this.getVertexNode( vertex );
      var position = vertexNode.globalToParentPoint( point ).minus( vertexNode.startOffset );

      // If it is the edge of a fixed length circuit element, the element rotates and moves toward the mouse
      var neighbors = this.circuit.getNeighborCircuitElements( vertex );

      // Find all vertices connected by fixed length nodes.
      var vertices = this.circuit.findAllFixedVertices( vertex );

      // If any of the vertices connected by fixed length nodes is immobile, then the entire subgraph cannot be moved
      var rotated = false;
      for ( var i = 0; i < vertices.length; i++ ) {
        if ( !vertices[ i ].draggableProperty.get() ) {

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

        if ( vertex.unsnappedPositionProperty.get().x === vertex.positionProperty.get().x &&
             vertex.unsnappedPositionProperty.get().y === vertex.positionProperty.get().y ) {

          // Rotate the way the element is going.
          angle = position.minus( oppositeVertex.positionProperty.get() ).angle();
        }
        else {

          // Lock in the angle if a match is proposed, otherwise things rotate uncontrollably
          angle = vertex.positionProperty.get().minus( oppositeVertex.positionProperty.get() ).angle();
        }

        // Maintain fixed length
        var length = neighbors[ 0 ].distanceBetweenVertices;
        var relative = Vector2.createPolar( length, angle + Math.PI );
        var oppositePosition = position.plus( relative );

        var rotationDelta = oppositePosition.minus( oppositeVertex.unsnappedPositionProperty.get() );

        this.translateVertexGroup( vertex, vertices, rotationDelta, function() {
            vertex.unsnappedPositionProperty.set( oppositeVertex.unsnappedPositionProperty.get().minus( relative ) );
          },

          // allow either vertex to snap
          [ vertex, oppositeVertex ] );
      }
      else {
        var translationDelta = position.minus( vertex.unsnappedPositionProperty.get() );
        this.translateVertexGroup( vertex, vertices, translationDelta, null, vertices );
      }
    },

    /**
     * Translate a group of vertices, used when dragging by a circuit element or by a one-neighbor vertex
     * @param {Vertex} vertex - the vertex being dragged
     * @param {Array.<Vertex>} vertices - all the vertices in the group
     * @param {Vector2} unsnappedDelta - how far to move the group
     * @param {function|null} updatePositions - optional callback for updating positions after unsnapped positions update
     * @param {Array.<Vertex>} attachable - the nodes that are candidates for attachment
     * @public
     */
    translateVertexGroup: function( vertex, vertices, unsnappedDelta, updatePositions, attachable ) {

      var screenBounds = this.visibleBoundsProperty.get();
      var bounds = this.parentToLocalBounds( screenBounds );

      // Modify the delta to guarantee all vertices remain in bounds
      for ( i = 0; i < vertices.length; i++ ) {
        var proposedPosition = vertices[ i ].unsnappedPositionProperty.get().plus( unsnappedDelta );
        if ( !bounds.containsPoint( proposedPosition ) ) {
          var closestPosition = bounds.getClosestPoint( proposedPosition.x, proposedPosition.y );
          var keepInBoundsDelta = closestPosition.minus( proposedPosition );
          unsnappedDelta = unsnappedDelta.plus( keepInBoundsDelta );
        }
      }

      // Update the unsnapped position of the entire subgraph, i.e. where it would be if no matches are proposed.
      // Must do this before calling getBestDropTarget, because the unsnapped positions are used for target matching
      for ( var i = 0; i < vertices.length; i++ ) {
        var unsnappedPosition = vertices[ i ].unsnappedPositionProperty.get().plus( unsnappedDelta );
        vertices[ i ].unsnappedPositionProperty.set( unsnappedPosition );
      }

      updatePositions && updatePositions();

      // Is there a nearby vertex any of these could snap to?  If so, move to its location temporarily.
      // Find drop targets for *any* of the dragged vertices
      var bestDropTarget = this.getBestDropTarget( attachable );
      var delta = Vector2.ZERO;
      if ( bestDropTarget ) {
        var srcUnsnappedPosition = bestDropTarget.src.unsnappedPositionProperty.get();
        delta = bestDropTarget.dst.unsnappedPositionProperty.get().minus( srcUnsnappedPosition );
      }

      for ( i = 0; i < vertices.length; i++ ) {
        vertices[ i ].positionProperty.set( vertices[ i ].unsnappedPositionProperty.get().plus( delta ) );
      }
    },

    /**
     * End a vertex drag.
     *
     * @param {Object} event - event from scenery
     * @param {Vertex} vertex
     * @param {boolean} dragged - true if the vertex actually moved with at least 1 drag call
     * @public
     */
    endDrag: function( event, vertex, dragged ) {
      assert && assert( typeof dragged === 'boolean', 'didDrag must be supplied' );

      var vertexNode = this.getVertexNode( vertex );

      // Find all vertices connected by fixed length nodes.
      var vertices = this.circuit.findAllFixedVertices( vertex );

      // If any of the vertices connected by fixed length nodes is immobile, then the entire subgraph cannot be moved
      for ( var i = 0; i < vertices.length; i++ ) {
        if ( !vertices[ i ].draggableProperty.get() ) {
          return;
        }
      }

      var bestDropTarget = this.getBestDropTarget( vertices );
      if ( bestDropTarget && dragged ) {
        this.circuit.connect( bestDropTarget.src, bestDropTarget.dst );

        // Set the new reference point for next drag
        for ( i = 0; i < vertices.length; i++ ) {
          vertices[ i ].unsnappedPositionProperty.set( vertices[ i ].positionProperty.get() );
        }
      }
      vertexNode.startOffset = null;

      // Signify that something has been dropped in the play area, to show the edit panel (unless dropped in the toolbox)
      this.circuit.vertexDroppedEmitter.emit1( vertex );
    }
  } );
} );