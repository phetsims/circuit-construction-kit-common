// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * The node that represents a Circuit, including all Wires and FixedLengthCircuitElements, Charge, Solder, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
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
  var LightBulbSocketNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/LightBulbSocketNode' );
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
   *
   * @param {Circuit} circuit
   * @param {CCKScreenView} circuitConstructionKitScreenView - for dropping circuit element back into the toolbox
   * @param {Tandem} tandem
   * @constructor
   */
  function CircuitNode( circuit, circuitConstructionKitScreenView, tandem ) {
    var self = this;

    // @private
    this.viewProperty = circuitConstructionKitScreenView.circuitConstructionKitModel.viewProperty;

    this.circuitConstructionKitModel = circuitConstructionKitScreenView.circuitConstructionKitModel;
    this.visibleBoundsProperty = circuitConstructionKitScreenView.visibleBoundsProperty;
    var runningProperty = this.circuitConstructionKitModel.exploreScreenRunningProperty;

    this.highlightLayer = new Node();
    this.seriesAmmeterNodeReadoutPanelLayer = new Node(); // used for readout of current and 'Current' string
    this.buttonLayer = new Node();
    this.valueLayer = new Node(); // for "show values"

    // @public (read-only) so that additional Nodes may be interleaved
    this.mainLayer = new Node();
    var mainLayer = this.mainLayer; // TODO: get rid of main layer, use a11y for showing highlights?
    Node.call( this, {
      children: [
        this.mainLayer, // everything else
        this.valueLayer,
        this.seriesAmmeterNodeReadoutPanelLayer,
        this.highlightLayer, // highlights go in front of everything else
        this.buttonLayer
      ]
    } );

    // @public
    this.visibleBoundsInCircuitCoordinateFrameProperty = new DerivedProperty( [
      circuitConstructionKitScreenView.circuitConstructionKitModel.currentZoomProperty,
      circuitConstructionKitScreenView.visibleBoundsProperty
    ], function( zoom, visibleBounds ) {
      return self.parentToLocalBounds( visibleBounds );
    } );
    this.circuit = circuit;

    // solder layer
    this.solderNodes = [];

    // in main layer
    // TODO: eliminate these arrays?
    this.batteryNodes = [];
    this.lightBulbNodes = [];
    this.lightBulbForegroundNodes = [];
    this.wireNodes = [];
    this.resistorNodes = [];
    this.switchNodes = [];
    this.vertexNodes = [];
    this.chargeNodes = [];
    this.seriesAmmeterNodes = [];

    // When loading from a state object, the vertices could have been added first.  If so, move them in front
    var moveVerticesToFront = function( circuitElement ) {
      self.getVertexNode( circuitElement.startVertexProperty.get() ) && self.getVertexNode( circuitElement.startVertexProperty.get() ).moveToFront();
      self.getVertexNode( circuitElement.endVertexProperty.get() ) && self.getVertexNode( circuitElement.endVertexProperty.get() ).moveToFront();

      self.getSolderNode( circuitElement.startVertexProperty.get() ) && self.getSolderNode( circuitElement.startVertexProperty.get() ).moveToFront();
      self.getSolderNode( circuitElement.endVertexProperty.get() ) && self.getSolderNode( circuitElement.endVertexProperty.get() ).moveToFront();
    };

    /**
     * For each CircuitElement type, do the following:
     * (a) Add nodes for pre-existing model elements
     * (b) Add a listener that adds nodes when model elements are added
     * (c) Add a listener that removes nodes when model elements are removed
     *
     * @param {function} CircuitElementNodeConstructor constructor for the node type, such as BatteryNode
     * @param {function} type - the type of the CircuitElement, such as Battery or Wire
     * @param {Array.<CircuitElementNode>} nodeArray
     * @param {function} getter, given a {CircuitElement}, return the corresponding {CircuitElementNode}
     * @param {Tandem} groupTandem
     */
    var initializeCircuitElementType = function( CircuitElementNodeConstructor, type, nodeArray, getter, groupTandem ) {
      var addCircuitElement = function( circuitElement ) {
        if ( circuitElement instanceof type ) {
          var circuitElementNode = new CircuitElementNodeConstructor(
            circuitConstructionKitScreenView,
            self,
            circuitElement,
            runningProperty,
            circuitConstructionKitScreenView.circuitConstructionKitModel.viewProperty,
            groupTandem.createNextTandem()
          );
          nodeArray.push( circuitElementNode );
          mainLayer.addChild( circuitElementNode );
          moveVerticesToFront( circuitElement );

          if ( circuitElement instanceof FixedLengthCircuitElement &&

               // don't double add for light bulbs
               !(circuitElementNode instanceof LightBulbSocketNode) &&

               // series ammeters already show their own readouts
               !(circuitElement instanceof SeriesAmmeter)
          ) {
            var valueNode = new ValueNode( circuitElement, self.circuitConstructionKitModel.showValuesProperty, tandem.createTandem( circuitElement.tandemName ).createTandem( 'valueNode' ) );
            circuitElement.valueNode = valueNode;
            self.valueLayer.addChild( valueNode );
          }
        }
      };
      circuit.circuitElements.addItemAddedListener( addCircuitElement );
      circuit.circuitElements.forEach( addCircuitElement );
      circuit.circuitElements.addItemRemovedListener( function( circuitElement ) {
        if ( circuitElement instanceof type ) {

          // Remove associated ValueNode, if any
          if ( circuitElement.valueNode ) {
            self.valueLayer.removeChild( circuitElement.valueNode );
            circuitElement.valueNode = null;
          }

          var circuitElementNode = getter( circuitElement );
          mainLayer.removeChild( circuitElementNode );

          var index = nodeArray.indexOf( circuitElementNode );
          if ( index > -1 ) {
            nodeArray.splice( index, 1 );
          }
          circuitElementNode.dispose();

          assert && assert( getter( circuitElement ) === null, 'should have been removed' );
        }
      } );
    };

    // var all = function() {return true;};
    // var isResistor = function( circuitElement ) { return circuitElement.resistorType === 'resistor'; };
    // var isGrabBagItem = function( circuitElement ) { return !isResistor( circuitElement ); };
    initializeCircuitElementType( WireNode, Wire, self.wireNodes, this.getWireNode.bind( this ), tandem.createGroupTandem( 'wireNode' ) );
    initializeCircuitElementType( BatteryNode, Battery, self.batteryNodes, this.getBatteryNode.bind( this ), tandem.createGroupTandem( 'batteryNode' ) );
    initializeCircuitElementType( CCKLightBulbNode, LightBulb, self.lightBulbNodes, this.getCCKLightBulbNode.bind( this ), tandem.createGroupTandem( 'lightBulbNode' ) );
    initializeCircuitElementType( LightBulbSocketNode, LightBulb, self.lightBulbForegroundNodes, this.getCCKLightBulbForegroundNode.bind( this ), tandem.createGroupTandem( 'lightBulbForegroundNode' ) );
    initializeCircuitElementType( ResistorNode, Resistor, self.resistorNodes, this.getResistorNode.bind( this ), tandem.createGroupTandem( 'resistorNode' ) );
    initializeCircuitElementType( SeriesAmmeterNode, SeriesAmmeter, self.seriesAmmeterNodes, this.getSeriesAmmeterNode.bind( this ), tandem.createGroupTandem( 'seriesAmmeterNode' ) );
    initializeCircuitElementType( SwitchNode, Switch, self.switchNodes, this.getSwitchNode.bind( this ), tandem.createGroupTandem( 'switchNode' ) );
    // initializeCircuitElementType( GrabBagItemNode, Resistor, isGrabBagItem, self.switchNodes, this.getSwitchNode.bind( this ), tandem.createGroupTandem( 'switchNode' ) );

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
        if ( !visibleBounds.containsPoint( vertex.positionProperty.get() ) ) {
          var closestPoint = visibleBounds.getClosestPoint( vertex.positionProperty.get().x, vertex.positionProperty.get().y );
          var delta = closestPoint.minus( vertex.positionProperty.get() );

          // Find all vertices connected by fixed length nodes.
          var vertices = circuit.findAllFixedVertices( vertex );
          self.translateVertexGroup( vertex, vertices, delta, null, [] );
        }
      }
    } );

    circuit.charges.addItemAddedListener( function( charge ) {
      var chargeNode = new ChargeNode(
        charge,
        circuitConstructionKitScreenView.circuitConstructionKitModel.revealingProperty || new BooleanProperty( true )
      );
      charge.disposeEmitter.addListener( function x() {
        var index = self.chargeNodes.indexOf( charge );
        self.chargeNodes.splice( index, 1 );

        charge.disposeEmitter.removeListener( x );
      } );
      self.chargeNodes.push( chargeNode );
      self.mainLayer.addChild( chargeNode );
    } );

    // Filled in by black box study, if it is running.
    this.blackBoxNode = null;

    this.viewProperty.link( function() {
      circuitConstructionKitScreenView.circuitConstructionKitModel.circuit.vertices.forEach( function( vertex ) {
        self.fixSolderLayeringForVertex( vertex );
      } );
    } );
  }

  circuitConstructionKitCommon.register( 'CircuitNode', CircuitNode );

  return inherit( Node, CircuitNode, {

    /**
     * Fix the solder layering for a given vertex.
     * For lifelike: Solder should be in front of wires but behind batteries and resistors.
     * For schematic: Solder should be in front of all components
     *
     * @param vertex
     * @public
     */
    fixSolderLayeringForVertex: function( vertex ) {
      var self = this;

      // wires in the back, then solder, then fixed length components.
      var solderNode = this.getSolderNode( vertex );
      var adjacentComponents = this.circuit.getNeighborCircuitElements( vertex );
      var adjacentWires = adjacentComponents.filter( function( component ) {return component instanceof Wire;} );
      var adjacentFixedLengthComponents = adjacentComponents.filter( function( component ) {return component instanceof FixedLengthCircuitElement;} );

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
        // TODO: This is duplicated below, factor it out.
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
      else if ( circuitElement instanceof SeriesAmmeter ) {
        return this.getSeriesAmmeterNode( circuitElement );
      }
      else {
        assert && assert( 'no node found for circuit element' );
        return null;
      }
    },
    /**
     * Get the CircuitElementNode for the corresponding CircuitElement
     * @param {Array.<CircuitElementNode>} nodeArray - the list of nodes to search
     * @param {CircuitElement} circuitElement
     * @returns {CircuitElementNode|null}
     * @private
     */
    getCircuitElementNodeFromArray: function( nodeArray, circuitElement ) {
      for ( var i = 0; i < nodeArray.length; i++ ) {
        if ( nodeArray[ i ].circuitElement === circuitElement ) {
          return nodeArray[ i ];
        }
      }
      return null;
    },

    // TODO: do we really need these?  If so, document them.
    getWireNode: function( wire ) { return this.getCircuitElementNodeFromArray( this.wireNodes, wire ); },
    getCCKLightBulbNode: function( lightBulb ) { return this.getCircuitElementNodeFromArray( this.lightBulbNodes, lightBulb ); },
    getCCKLightBulbForegroundNode: function( lightBulb ) { return this.getCircuitElementNodeFromArray( this.lightBulbForegroundNodes, lightBulb ); },
    getBatteryNode: function( battery ) { return this.getCircuitElementNodeFromArray( this.batteryNodes, battery ); },
    getResistorNode: function( resistor ) { return this.getCircuitElementNodeFromArray( this.resistorNodes, resistor ); },
    getSeriesAmmeterNode: function( seriesAmmeter ) { return this.getCircuitElementNodeFromArray( this.seriesAmmeterNodes, seriesAmmeter ); },
    getSwitchNode: function( switchModel ) { return this.getCircuitElementNodeFromArray( this.switchNodes, switchModel ); },

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

    getAllDropTargets: function( vertices ) {
      var allDropTargets = [];

      for ( var i = 0; i < vertices.length; i++ ) {
        var vertex = vertices[ i ];
        var targetVertex = this.circuit.getDropTarget( vertex, this.circuitConstructionKitModel.modeProperty.get(), this.circuitConstructionKitModel.blackBoxBounds );
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
          return dropTarget.src.unsnappedPositionProperty.get().distance( dropTarget.dst.positionProperty.get() );
        } );
        return sorted[ 0 ];
      }
      else {
        return null;
      }
    },

    step: function() {

      // Move all sockets to the front
      var children = this.mainLayer.children;
      var child = null;
      for ( var i = 0; i < children.length; i++ ) {
        child = children[ i ];
        if ( child instanceof LightBulbSocketNode ) {
          child.moveToFront();
        }
      }

      // Any charges that are in a light bulb and above halfway through the filament should be in front of the base,
      // so they appear to tunnel through the socket and go in front of the socket on the right-hand side.
      children = this.mainLayer.children;
      for ( i = 0; i < children.length; i++ ) {
        child = children[ i ];
        if ( child instanceof ChargeNode &&
             child.charge.circuitElement instanceof LightBulb ) {

          // TODO: how to avoid moving charges unnecessarily?
          if ( child.charge.distanceProperty.get() > child.charge.circuitElement.chargePathLength / 2 ) {
            child.moveToFront();
          }
        }
        else if ( child instanceof FixedLengthCircuitElementNode ) {

          // paint dirty fixed length circuit element nodes
          child.step();
        }
      }
    },
    startDragVertex: function( point, vertex ) {

      // If it is the edge of a fixed length circuit element, the element rotates and moves toward the mouse
      var vertexNode = this.getVertexNode( vertex );
      vertexNode.startOffset = vertexNode.globalToParentPoint( point ).minus( vertex.unsnappedPositionProperty.get() );
    },

    // Vertices connected to the black box cannot be moved, but they can be rotated
    // @private
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
      this.batteryNodes.forEach( circuitElementNodeToBack );
      this.lightBulbNodes.forEach( circuitElementNodeToBack );
      this.wireNodes.forEach( circuitElementNodeToBack );
      this.resistorNodes.forEach( circuitElementNodeToBack );
      this.switchNodes.forEach( circuitElementNodeToBack );

      // Move black box interface vertices behind the black box, see https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/36
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

        if ( vertex.unsnappedPositionProperty.get().x === vertex.positionProperty.get().x && vertex.unsnappedPositionProperty.get().y === vertex.positionProperty.get().y ) {

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
     * @param {function|null} updatePositions - optional callback for updating positions after unsnapped positions updated
     * @param {Array.<Vertex>} attachable - the nodes that are candidates for attachment
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
        vertices[ i ].unsnappedPositionProperty.set( vertices[ i ].unsnappedPositionProperty.get().plus( unsnappedDelta ) );
      }

      updatePositions && updatePositions();

      // Is there a nearby vertex any of these could snap to?  If so, move to its location temporarily.
      // Find drop targets for *any* of the dragged vertices
      var bestDropTarget = this.getBestDropTarget( attachable );
      var delta = Vector2.ZERO;
      if ( bestDropTarget ) {
        delta = bestDropTarget.dst.unsnappedPositionProperty.get().minus( bestDropTarget.src.unsnappedPositionProperty.get() );
      }

      for ( i = 0; i < vertices.length; i++ ) {
        vertices[ i ].positionProperty.set( vertices[ i ].unsnappedPositionProperty.get().plus( delta ) );
      }
    },
    /**
     *
     * @param event
     * @param vertex
     * @param {boolean} dragged - true if the vertex actually moved with at least 1 drag call
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