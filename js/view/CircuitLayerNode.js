// Copyright 2015-2017, University of Colorado Boulder

/**
 * The Node that represents a Circuit, including all Wires and FixedLengthCircuitElements, Charge, Solder and Sensors.
 * It also renders the voltmeter and ammeter. It can be zoomed in and out.
 *
 * Each CircuitElementNode may node parts that appear in different layers, such as the highlight and the light bulb
 * socket.  Having the light bulb socket in another layer makes it possible to show the electrons going "through" the
 * socket (in z-ordering). The CircuitElementNode constructors populate different layers of the CircuitLayerNode in
 * their constructors and depopulate in their dispose functions.
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
  var CircuitConstructionKitLightBulbNode =
    require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitConstructionKitLightBulbNode' );
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
  var CircuitConstructionKitCommonUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonUtil' );
  var CircuitConstructionKitCommonConstants =
    require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var CustomLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CustomLightBulbNode' );

  /**
   * @param {Circuit} circuit - the model Circuit
   * @param {CircuitConstructionKitScreenView} circuitConstructionKitScreenView - for dropping CircuitElement instances
   *                                                                            - back in the toolbox
   * @param {Tandem} tandem
   * @constructor
   */
  function CircuitLayerNode( circuit, circuitConstructionKitScreenView, tandem ) {
    var self = this;

    // @private {Property.<string>} - 'lifelike' | 'schematic'
    this.viewProperty = circuitConstructionKitScreenView.circuitConstructionKitModel.viewProperty;

    // @private (read-only) {CircuitConstructionKitModel}
    this.circuitConstructionKitModel = circuitConstructionKitScreenView.circuitConstructionKitModel;

    // @private (read-only) {Property.<Bounds2>} - the part of the screen that can be seen in view coordinates
    this.visibleBoundsProperty = circuitConstructionKitScreenView.visibleBoundsProperty;

    // @private {Node} - the layer behind the control panels
    this.circuitLayerNodeBackLayer = circuitConstructionKitScreenView.circuitLayerNodeBackLayer;

    // @public {Node} - CircuitElementNodes add highlights directly to this layer when they are constructed
    this.highlightLayer = new Node();

    // @public {Node} - SeriesAmmeterNodes add to this layer when they are constructed
    // Shows the front panel of SeriesAmmeterNodes (which shows the current readout) so the electrons look like they
    // flow through.
    this.seriesAmmeterNodeReadoutPanelLayer = new Node();

    // @public {Node} - layer for vertex buttons
    this.buttonLayer = new Node();

    // @public {Node} - layer for "show values"
    this.valueLayer = new Node();

    // @public {Node} - layer for light rays, since it cannot be rendered in WebGL
    this.lightRaysLayer = new Node();

    // We would like performance to be as fast as possible when adding CircuitElements to the mainLayer.  Therefore,
    // we try to preallocate as much of the WebGL spritesheet as possible
    var mainLayerWebGLSpriteNode = new Node( {
      visible: false,
      children: SolderNode.webglSpriteNodes
        .concat( ChargeNode.webglSpriteNodes )
        .concat( VertexNode.webglSpriteNodes )
        .concat( BatteryNode.webglSpriteNodes )
        .concat( ResistorNode.webglSpriteNodes )
        .concat( WireNode.webglSpriteNodes )
        .concat( FixedLengthCircuitElementNode.webglSpriteNodes )
        .concat( CustomLightBulbNode.webglSpriteNodes )
    } );
    var lightBulbSocketLayerWebGLSpriteNode = new Node( {
      visible: false,
      children: CustomLightBulbNode.webglSpriteNodes
    } );
    var lightBulbSocketElectronLayerWebGLSpriteNode = new Node( {
      visible: false,
      children: ChargeNode.webglSpriteNodes
    } );

    // @public {Node} - so that additional Nodes may be interleaved
    this.mainLayer = new Node( {

      // add a child eagerly so the WebGL block is all allocated when 1st object is dragged out of toolbox
      // @jonathanolson: is there a better way to do this?
      renderer: 'webgl',
      children: [ mainLayerWebGLSpriteNode ]
    } );

    // @public {Node} - CircuitConstructionKitLightBulbNode calls addChild/removeChild to add sockets to the front layer
    this.lightBulbSocketLayer = new Node( {
      renderer: 'webgl',
      children: [ lightBulbSocketLayerWebGLSpriteNode ]
    } );

    // @public {Node} - Electrons appear in this layer when they need to be in front of the socket (on the right hand
    // side of the bulb)
    this.lightBulbSocketElectronLayer = new Node( {
      renderer: 'webgl',
      children: [ lightBulbSocketElectronLayerWebGLSpriteNode ]
    } );

    Node.call( this, {
      children: [
        this.lightRaysLayer,
        this.mainLayer, // circuit elements, charges and meters
        this.lightBulbSocketLayer, // fronts of light bulbs
        this.lightBulbSocketElectronLayer, // electrons in front of the sockets
        this.valueLayer, // values
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

    // @public (read-only) {Circuit} - the Circuit model depicted by this view
    this.circuit = circuit;

    // @private {Object} - Map to find CircuitElement=>CircuitElementNode. key is CircuitElement.id, value is
    // CircuitElementNode
    this.circuitElementNodeMap = {};

    // @private {Object} - Map of Vertex.index => SolderNode
    this.solderNodes = {};

    // @public (read-only) {Object} Map of Vertex.index => VertexNode
    this.vertexNodes = {};

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
            self.circuitConstructionKitModel.isValueDepictionEnabledProperty,
            circuitConstructionKitScreenView.circuitConstructionKitModel.viewProperty,
            groupTandem.createNextTandem()
          );
          self.circuitElementNodeMap[ circuitElement.id ] = circuitElementNode;

          // Insert the circuit element node behind the vertex nodes.
          // Search backwards starting at the end until we find the last 2 vertex nodes
          var index = self.mainLayer.getChildrenCount() - 1;
          var vertexNodeCount = 0;
          while ( index >= 0 ) {
            if ( self.mainLayer.getChildAt( index ) ) {
              vertexNodeCount++;
              if ( vertexNodeCount >= 2 ) {
                break;
              }
            }
            index--;
          }
          assert && assert( index >= 0, 'missing vertex nodes' );
          self.mainLayer.insertChild( index - 1, circuitElementNode );

          // Show the ValueNode for readouts, though series ammeters already show their own readouts and Wires do not
          // have readouts
          if ( circuitElement instanceof FixedLengthCircuitElement && !(circuitElement instanceof SeriesAmmeter) ) {
            var valueNode = new ValueNode(
              circuitElement,
              self.circuitConstructionKitModel.showValuesProperty,
              tandem.createTandem( circuitElement.tandemName ).createTandem( 'valueNode' )
            );

            // self.valueLayer.addChild( valueNode );
            var updateShowValues = function( showValues ) {
              CircuitConstructionKitCommonUtil.setInSceneGraph( showValues, self.valueLayer, valueNode );
            };
            self.circuitConstructionKitModel.showValuesProperty.link( updateShowValues );

            circuitElement.disposeEmitter.addListener( function() {
              self.circuitConstructionKitModel.showValuesProperty.unlink( updateShowValues );
              CircuitConstructionKitCommonUtil.setInSceneGraph( false, self.valueLayer, valueNode );
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
    initializeCircuitElementType(
      CircuitConstructionKitLightBulbNode,
      LightBulb,
      tandem.createGroupTandem( 'lightBulbNode' )
    );
    initializeCircuitElementType( ResistorNode, Resistor, tandem.createGroupTandem( 'resistorNode' ) );
    initializeCircuitElementType( SeriesAmmeterNode, SeriesAmmeter, tandem.createGroupTandem( 'seriesAmmeterNode' ) );
    initializeCircuitElementType( SwitchNode, Switch, tandem.createGroupTandem( 'switchNode' ) );

    // @private - array of actions to be performed in the step function
    this.stepListeners = [];

    // When a Vertex is added to the model, create the corresponding views
    var vertexNodeGroup = tandem.createGroupTandem( 'vertexNodes' );
    var addVertexNode = function( vertex ) {
      var solderNode = new SolderNode( self, vertex );
      self.solderNodes[ vertex.index ] = solderNode;
      self.mainLayer.addChild( solderNode );

      var vertexNode = new VertexNode( self, vertex, vertexNodeGroup.createNextTandem() );
      self.vertexNodes[ vertex.index ] = vertexNode;
      self.mainLayer.addChild( vertexNode );

      // Schedule a step to make sure the solder is layered correctly.  This is necessary because vertices are added
      // before CircuitElements, but solder should be in front of Wires, see
      // https://github.com/phetsims/circuit-construction-kit-common/issues/386
      self.stepListeners.push( function() {
        self.fixSolderLayeringForVertex( vertex );
      } );
    };
    circuit.vertices.addItemAddedListener( addVertexNode );

    // When a Vertex is removed from the model, remove and dispose the corresponding views
    circuit.vertices.addItemRemovedListener( function( vertex ) {
      var vertexNode = self.getVertexNode( vertex );
      self.mainLayer.removeChild( vertexNode );
      delete self.vertexNodes[ vertex.index ];
      vertexNode.dispose();
      assert && assert( !self.getVertexNode( vertex ), 'vertex node should have been removed' );

      var solderNode = self.getSolderNode( vertex );
      self.mainLayer.removeChild( solderNode );
      delete self.solderNodes[ vertex.index ];
      solderNode.dispose();
      assert && assert( !self.getSolderNode( vertex ), 'solder node should have been removed' );
    } );
    circuit.vertices.forEach( addVertexNode );

    // When the screen is resized or zoomed, move all vertices into view.
    this.visibleBoundsInCircuitCoordinateFrameProperty.link( function( localBounds ) {

      // Check all vertices
      for ( var i = 0; i < circuit.vertices.length; i++ ) {
        var vertex = circuit.vertices.get( i );
        var position = vertex.positionProperty.get();

        // If any Vertex is out of bounds, move it and all connected Vertices (to preserve geometry) in bounds.
        if ( !localBounds.containsPoint( position ) ) {
          var closestPoint = localBounds.getClosestPoint( position.x, position.y );
          var delta = closestPoint.minus( position );

          // Find all vertices connected by fixed length nodes.
          var vertices = circuit.findAllConnectedVertices( vertex );
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

      // Any charges that are in a light bulb and above halfway through the filament should be in front of the base,
      // so they appear to tunnel through the socket and go in front of the socket on the right-hand side.
      if ( charge.onRightHandSideOfLightBulbProperty.get() ) {
        self.lightBulbSocketElectronLayer.addChild( chargeNode );
      }
      else {
        self.mainLayer.addChild( chargeNode );
      }

      var chargeLayerListener = function( onRightHandSideOfLightBulb ) {
        if ( onRightHandSideOfLightBulb ) {
          self.lightBulbSocketElectronLayer.addChild( chargeNode );
          self.mainLayer.removeChild( chargeNode );
        }
        else {
          self.lightBulbSocketElectronLayer.removeChild( chargeNode );
          self.mainLayer.addChild( chargeNode );
        }
      };
      charge.onRightHandSideOfLightBulbProperty.lazyLink( chargeLayerListener );
      charge.disposeEmitter.addListener( function() {
        charge.onRightHandSideOfLightBulbProperty.unlink( chargeLayerListener );
      } );
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
      var adjacentCircuitElements = this.circuit.getNeighborCircuitElements( vertex );
      var adjacentWires = adjacentCircuitElements.filter( function( component ) {return component instanceof Wire;} );
      var adjacentFixedLengthComponents = adjacentCircuitElements.filter( function( component ) {
        return component instanceof FixedLengthCircuitElement;
      } );

      // This method is called for all vertices when viewProperty value changes
      if ( this.viewProperty.get() === CircuitConstructionKitCommonConstants.LIFELIKE ) {
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

      // Make sure charges remain in front of the solder for wires.
      var chargeNodesToMoveToFront = [];
      self.mainLayer.children.forEach( function( child ) {
        if ( child instanceof ChargeNode &&
             child.charge.circuitElement instanceof Wire &&
             adjacentCircuitElements.indexOf( child.charge.circuitElement ) >= 0
        ) {
          chargeNodesToMoveToFront.push( child );
        }
      } );
      chargeNodesToMoveToFront.forEach( function( chargeNode ) {
        chargeNode.moveToFront();
      } );
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
     * Get the solder node associated with the specified Vertex
     * @param {Vertex} vertex
     * @returns {SolderNode}
     * @public
     */
    getSolderNode: function( vertex ) { return this.solderNodes[ vertex.index ]; },

    /**
     * Get the VertexNode associated with the specified Vertex
     * @param {Vertex} vertex
     * @returns {VertexNode}
     * @public
     */
    getVertexNode: function( vertex ) { return this.vertexNodes[ vertex.index ]; },

    /**
     * Find drop targets for all the given vertices
     * @param {Vertex[]} vertices
     * @returns {Object[]}
     * @public
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
     * @public
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
     * @public
     */
    step: function() {

      var self = this;

      // paint dirty fixed length circuit element nodes.  This batches changes instead of applying multiple changes
      // per frame
      this.circuit.circuitElements.getArray().forEach( function( circuitElement ) {
        self.getCircuitElementNode( circuitElement ).step();
      } );

      this.stepListeners.forEach( function( stepListener ) {
        stepListener();
      } );
      this.stepListeners.length = 0;
    },

    /**
     * Called when a Vertex drag begins, records the relative click point
     * @param {Vector2} point
     * @param {Vertex} vertex
     * @public
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

      _.values( this.solderNodes ).forEach( vertexNodeToBack );
      _.values( this.vertexNodes ).forEach( vertexNodeToBack );
      _.values( this.circuitElementNodeMap ).forEach( circuitElementNodeToBack );

      // Move black box interface vertices behind the black box,
      // see https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/36
      var interfaceVertexBehindBox = function( nodeWithVertex ) {
        var blackBoxNodeIndex = self.mainLayer.children.indexOf( self.blackBoxNode );
        if ( nodeWithVertex.vertex.blackBoxInterfaceProperty.get() ) {
          self.mainLayer.removeChild( nodeWithVertex );
          self.mainLayer.insertChild( blackBoxNodeIndex, nodeWithVertex );
        }
      };

      _.values( this.solderNodes ).forEach( interfaceVertexBehindBox );
      _.values( this.vertexNodes ).forEach( interfaceVertexBehindBox );
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
      var position = vertexNode.globalToParentPoint( point ).subtract( vertexNode.startOffset );

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
          [ vertex, oppositeVertex ]
        );
      }
      else {
        var translationDelta = position.minus( vertex.unsnappedPositionProperty.get() );
        this.translateVertexGroup( vertex, vertices, translationDelta, null, vertices );
      }
    },

    /**
     * Translate a group of vertices, used when dragging by a circuit element or by a one-neighbor vertex
     *
     * Note: Do not confuse this with Circuit.translateVertexGroup which does not consider connections while dragging
     *
     * @param {Vertex} vertex - the vertex being dragged
     * @param {Array.<Vertex>} vertices - all the vertices in the group
     * @param {Vector2} unsnappedDelta - how far to move the group
     * @param {function|null} updatePositions - optional callback for updating positions after unsnapped positions
     *                                        - update
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

      // Signify that something has been dropped in the play area, to show the edit panel, unless dropped in the toolbox
      this.circuit.vertexDroppedEmitter.emit1( vertex );
    },

    /**
     * Adds a child to a layer behind the control panels.
     * @param {Node} child - the Node to add
     * @public
     */
    addChildToBackground: function( child ) {
      this.circuitLayerNodeBackLayer.addChild( child );
    },

    /**
     * Removes a child from the layer behind the control panels.
     * @param {Node} child - the Node to remove
     * @public
     */
    removeChildFromBackground: function( child ) {
      this.circuitLayerNodeBackLayer.removeChild( child );
    }
  } );
} );