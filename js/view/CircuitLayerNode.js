// Copyright 2015-2017, University of Colorado Boulder

/**
 * The Node that represents a Circuit, including all Wires and FixedCircuitElements, Charge, Solder and Sensors.
 * It also renders the voltmeter and ammeter. It can be zoomed in and out.
 *
 * Each CircuitElementNode may node parts that appear in different layers, such as the highlight and the light bulb
 * socket.  Having the light bulb socket in another layer makes it possible to show the charges going "through" the
 * socket (in z-ordering). The CircuitElementNode constructors populate different layers of the CircuitLayerNode in
 * their constructors and depopulate in their dispose functions.
 *
 * Exists for the life of the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Denzell Barnett (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  var BatteryNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/BatteryNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var ChargeNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ChargeNode' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  var CCKCUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCUtil' );
  var CCKCLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CCKCLightBulbNode' );
  var CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElementViewType' );
  var CustomLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CustomLightBulbNode' );
  var FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );
  var FixedCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedCircuitElementNode' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Property = require( 'AXON/Property' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  var ResistorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ResistorNode' );
  var RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  var SeriesAmmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/SeriesAmmeter' );
  var SeriesAmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SeriesAmmeterNode' );
  var SolderNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SolderNode' );
  var Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  var SwitchNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SwitchNode' );
  var Tandem = require( 'TANDEM/Tandem' );
  var ValueNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ValueNode' );
  var Vector2 = require( 'DOT/Vector2' );
  var VertexNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/VertexNode' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );
  var WireNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/WireNode' );

  // constants

  // In https://github.com/phetsims/circuit-construction-kit-dc/issues/140 we decided to test every platform with
  // svg rendering to avoid svg/webgl lag issues and have a consistent renderer across platforms.  However, we will
  // leave in all of the WebGL code in case we have performance problems on a platform that require WebGL to be restored?
  var RENDERER = 'svg';

  /**
   * @param {Circuit} circuit - the model Circuit
   * @param {CCKCScreenView} screenView - for dropping CircuitElement instances back in the toolbox
   * @param {Tandem} tandem
   * @constructor
   */
  function CircuitLayerNode( circuit, screenView, tandem ) {
    var self = this;

    // @private {Property.<CircuitElementViewType>}
    this.viewTypeProperty = screenView.model.viewTypeProperty;

    // @private (read-only) {CircuitConstructionKitModel}
    this.model = screenView.model;

    // @private (read-only) {Property.<Bounds2>} - the part of the screen that can be seen in view coordinates
    this.visibleBoundsProperty = screenView.visibleBoundsProperty;

    // @private {Node} - the layer behind the control panels
    this.circuitLayerNodeBackLayer = screenView.circuitLayerNodeBackLayer;

    // @public {Node} - CircuitElementNodes add highlights directly to this layer when they are constructed
    this.highlightLayer = new Node();

    // @public {Node} - SeriesAmmeterNodes add to this layer when they are constructed
    // Shows the front panel of SeriesAmmeterNodes (which shows the current readout) so the charges look like they
    // flow through.
    this.seriesAmmeterNodeReadoutPanelLayer = new Node();

    // @public {Node} - layer for vertex buttons
    this.buttonLayer = new Node();

    // @public {Node} - layer for "show values"
    this.valueLayer = new Node();

    // @public {Node} - layer for light rays, since it cannot be rendered in WebGL
    this.lightRaysLayer = new Node();

    // @public {Node} - layer that contains the wires
    this.wireLayer = new Node( {
      renderer: RENDERER,

      // preallocate sprite sheet
      children: [ new Node( {
        visible: false,
        children: WireNode.webglSpriteNodes
      } ) ]
    } );

    // @public {Node} - layer that shows the solder joints
    this.solderLayer = new Node( {
      renderer: RENDERER,

      // preallocate sprite sheet
      children: [ new Node( {
        visible: false,
        children: SolderNode.webglSpriteNodes
      } ) ]
    } );

    // @public {Node} - layer that shows the Vertex instances
    this.vertexLayer = new Node( {
      renderer: RENDERER,

      // preallocate sprite sheet
      children: [ new Node( {
        visible: false,
        children: VertexNode.webglSpriteNodes
      } ) ]
    } );

    // @public {Node} - contains FixedCircuitElements
    this.fixedCircuitElementLayer = new Node( {

      // add a child eagerly so the WebGL block is all allocated when 1st object is dragged out of toolbox
      renderer: RENDERER,
      children: [ new Node( {
        visible: false,
        children: []
          .concat( BatteryNode.webglSpriteNodes )
          .concat( ResistorNode.webglSpriteNodes )
          .concat( FixedCircuitElementNode.webglSpriteNodes )
          .concat( CustomLightBulbNode.webglSpriteNodes )
      } ) ]
    } );

    // @public {Node} - CCKCLightBulbNode calls addChild/removeChild to add sockets to the front layer
    this.lightBulbSocketLayer = new Node( {
      renderer: RENDERER,

      // preallocate sprite sheet
      children: [ new Node( {
        visible: false,
        children: CustomLightBulbNode.webglSpriteNodes
      } ) ]
    } );

    // @public {Node} - layer that shows the Charge instances
    this.chargeLayer = new Node( {
      renderer: RENDERER,

      // preallocate sprite sheet
      children: [ new Node( {
        visible: false,
        children: ChargeNode.webglSpriteNodes
      } ) ]
    } );

    Property.multilink( [ screenView.model.isValueDepictionEnabledProperty, screenView.model.revealingProperty ], function( isValueDepictionEnabled, revealing ) {
      self.chargeLayer.visible = isValueDepictionEnabled && revealing;
    } );

    // @public {Node} - layer that shows the Voltmeter and Ammeter (but not the SeriesAmmeter, which is shown in the fixedCircuitElementLayer)
    this.sensorLayer = new Node();

    // @public (circuit-construction-kit-black-box-study)
    this.beforeCircuitElementsLayer = new Node();
    this.afterCircuitElementsLayer = new Node();

    // For lifelike: Solder should be in front of wires but behind batteries and resistors.
    var lifelikeLayering = [
      this.lightRaysLayer,
      this.beforeCircuitElementsLayer,
      this.wireLayer, // wires go behind other circuit elements
      this.solderLayer,
      this.fixedCircuitElementLayer, // circuit elements and meters
      this.vertexLayer,
      this.chargeLayer,
      this.lightBulbSocketLayer, // fronts of light bulbs
      this.seriesAmmeterNodeReadoutPanelLayer, // fronts of series ammeters
      this.afterCircuitElementsLayer,
      this.sensorLayer,
      this.highlightLayer, // highlights go in front of everything else
      this.valueLayer, // values
      this.buttonLayer // vertex buttons
    ];

    // For schematic: Solder should be in front of all components
    var schematicLayering = [
      this.lightRaysLayer,
      this.beforeCircuitElementsLayer,
      this.wireLayer,
      this.fixedCircuitElementLayer,
      this.solderLayer,
      this.vertexLayer,
      this.chargeLayer,
      this.lightBulbSocketLayer,
      this.seriesAmmeterNodeReadoutPanelLayer,
      this.afterCircuitElementsLayer,
      this.sensorLayer,
      this.highlightLayer,
      this.valueLayer,
      this.buttonLayer
    ];
    Node.call( this );

    // choose layering for schematic vs lifelike.  HEADS UP, this means circuitLayerNode.addChild() will get overwritten
    // so all nodes must be added as children in the array above.
    screenView.model.viewTypeProperty.link( function( view ) {
      self.children = (view === CircuitElementViewType.LIFELIKE) ? lifelikeLayering : schematicLayering;
    } );

    // @public {Property.<Bounds2>} the visible bounds in the coordinate frame of the circuit.  Initialized with a
    // placeholder value until it is filled in by CCKCScreenView (after attached to a parent)
    this.visibleBoundsInCircuitCoordinateFrameProperty = new Property( new Bounds2( 0, 0, 1, 1 ) );

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
     * @param {function} type - the type of the CircuitElement, such as Battery or Wire
     * @param {Node} layer
     * @param {Tandem} groupTandem
     * @param {function} createCircuitElement - creates the node, given a circuitElement and tandem BatteryNode
     */
    var initializeCircuitElementType = function( type, layer, groupTandem, createCircuitElement ) {
      var addCircuitElement = function( circuitElement ) {
        if ( circuitElement instanceof type ) {
          var circuitElementNode = createCircuitElement( circuitElement, groupTandem.createNextTandem() );
          self.circuitElementNodeMap[ circuitElement.id ] = circuitElementNode;

          layer.addChild( circuitElementNode );

          // Show the ValueNode for readouts, though series ammeters already show their own readouts and Wires do not
          // have readouts
          if ( circuitElement instanceof FixedCircuitElement && !(circuitElement instanceof SeriesAmmeter) ) {
            var valueNode = new ValueNode(
              circuitElement,
              self.model.showValuesProperty,
              self.model.viewTypeProperty,
              tandem.createTandem( circuitElement.tandemName ).createTandem( 'valueNode' )
            );

            var updateShowValues = function( showValues ) {
              CCKCUtil.setInSceneGraph( showValues, self.valueLayer, valueNode );
            };
            self.model.showValuesProperty.link( updateShowValues );

            circuitElement.disposeEmitter.addListener( function() {
              self.model.showValuesProperty.unlink( updateShowValues );
              CCKCUtil.setInSceneGraph( false, self.valueLayer, valueNode );
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
          layer.removeChild( circuitElementNode );
          circuitElementNode.dispose();

          delete self.circuitElementNodeMap[ circuitElement.id ];
        }
      } );
    };

    initializeCircuitElementType( Wire, this.wireLayer, tandem.createGroupTandem( 'wireNode' ), function( circuitElement, tandem ) {
      return new WireNode( screenView, self, circuitElement, self.model.viewTypeProperty, tandem );
    } );
    initializeCircuitElementType( Battery, this.fixedCircuitElementLayer, tandem.createGroupTandem( 'batteryNode' ), function( circuitElement, tandem ) {
      return new BatteryNode( screenView, self, circuitElement, self.model.viewTypeProperty, tandem );
    } );
    initializeCircuitElementType( LightBulb, this.fixedCircuitElementLayer, tandem.createGroupTandem( 'lightBulbNode' ), function( circuitElement, tandem ) {
      return new CCKCLightBulbNode( screenView, self, circuitElement, self.model.isValueDepictionEnabledProperty, self.model.viewTypeProperty, tandem );
    } );
    initializeCircuitElementType( Resistor, this.fixedCircuitElementLayer, tandem.createGroupTandem( 'resistorNode' ), function( circuitElement, tandem ) {
      return new ResistorNode( screenView, self, circuitElement, self.model.viewTypeProperty, tandem );
    } );
    initializeCircuitElementType( SeriesAmmeter, this.fixedCircuitElementLayer, tandem.createGroupTandem( 'seriesAmmeterNode' ), function( circuitElement, tandem ) {
      return new SeriesAmmeterNode( screenView, self, circuitElement, tandem );
    } );
    initializeCircuitElementType( Switch, this.fixedCircuitElementLayer, tandem.createGroupTandem( 'switchNode' ), function( circuitElement, tandem ) {
      return new SwitchNode( screenView, self, circuitElement, self.model.viewTypeProperty, tandem );
    } );

    // When a vertex is selected, a cut button is shown near to the vertex.  If the vertex is connected to >1 circuit
    // element, the button is enabled.  Pressing the button will cut the vertex from the neighbors.  Only one cutButton
    // is allocated for all vertices (per screen) to use because it is too performance demanding to create these
    // dynamically when circuit elements are dragged from the toolbox.  Also, only one vertex can be selected at once
    // so there is only a need for one cut button.
    var cutIcon = new FontAwesomeNode( 'cut', {
      rotation: -Math.PI / 2, // scissors point up
      scale: CCKCConstants.FONT_AWESOME_ICON_SCALE
    } );

    // @public (read-only)
    this.cutButton = new RoundPushButton( {
      baseColor: 'yellow',
      content: cutIcon,
      minXMargin: 10,
      minYMargin: 10,
      tandem: Tandem.createStaticTandem( 'cutButton' )
    } );
    this.cutButton.addListener( function() {
      assert && assert( circuit.getSelectedVertex(), 'Button should only be available if a vertex is selected' );
      circuit.cutVertex( circuit.getSelectedVertex() );

      // Make sure no vertices got nudged out of bounds during a cut, see https://github.com/phetsims/circuit-construction-kit-dc/issues/138
      moveVerticesInBounds( self.visibleBoundsInCircuitCoordinateFrameProperty.value );
    } );

    // When a Vertex is added to the model, create the corresponding views
    var vertexNodeGroup = tandem.createGroupTandem( 'vertexNodes' );
    var addVertexNode = function( vertex ) {
      var solderNode = new SolderNode( self, vertex );
      self.solderNodes[ vertex.index ] = solderNode;
      self.solderLayer.addChild( solderNode );

      var vertexNode = new VertexNode( self, vertex, vertexNodeGroup.createNextTandem() );
      self.vertexNodes[ vertex.index ] = vertexNode;
      self.vertexLayer.addChild( vertexNode );
    };
    circuit.vertices.addItemAddedListener( addVertexNode );

    // When a Vertex is removed from the model, remove and dispose the corresponding views
    circuit.vertices.addItemRemovedListener( function( vertex ) {
      var vertexNode = self.getVertexNode( vertex );
      self.vertexLayer.removeChild( vertexNode );
      delete self.vertexNodes[ vertex.index ];
      vertexNode.dispose();
      assert && assert( !self.getVertexNode( vertex ), 'vertex node should have been removed' );

      var solderNode = self.getSolderNode( vertex );
      self.solderLayer.removeChild( solderNode );
      delete self.solderNodes[ vertex.index ];
      solderNode.dispose();
      assert && assert( !self.getSolderNode( vertex ), 'solder node should have been removed' );
    } );
    circuit.vertices.forEach( addVertexNode );

    // When the screen is resized or zoomed, move all vertices into view.
    var moveVerticesInBounds = function( localBounds ) {

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
    };
    this.visibleBoundsInCircuitCoordinateFrameProperty.link( moveVerticesInBounds );

    // When a charge is added, add the corresponding ChargeNode (removed it its dispose call)
    circuit.charges.addItemAddedListener( function( charge ) {
      self.chargeLayer.addChild( new ChargeNode( charge ) );
    } );
  }

  circuitConstructionKitCommon.register( 'CircuitLayerNode', CircuitLayerNode );

  return inherit( Node, CircuitLayerNode, {

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
     * @returns {Object[]} candidates for connection, each Object has {src:Vertex,dst:Vertex} indicating what can snap
     * @public
     */
    getAllDropTargets: function( vertices ) {
      var allDropTargets = [];

      for ( var i = 0; i < vertices.length; i++ ) {
        var vertex = vertices[ i ];
        var targetVertex = this.circuit.getDropTarget(
          vertex,
          this.model.modeProperty.get(),
          this.model.blackBoxBounds
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
     * @returns {Object|null} Object that indicates the two vertices best suited for connecting as { src: Vertex, dst: Vertex },
     *                        or null if no match is suitable.
     * @private
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
    },

    /**
     * Returns whether the vertex can be dragged
     * @param {Vertex} vertex
     * @returns {boolean}
     */
    canDragVertex: function( vertex ) {
      var vertices = this.circuit.findAllFixedVertices( vertex );

      // If any of the vertices in the subgraph is already being dragged, then this vertex cannot be dragged.
      for ( var i = 0; i < vertices.length; i++ ) {
        if ( vertices[ i ].isDragged ) {
          return false;
        }
      }

      return true;
    },

    /**
     * Mark the vertex and its fixed connected vertices as being dragged, so they cannot be dragged by any other pointer.
     * @param {Vertex} vertex
     * @public
     */
    setVerticesDragging: function( vertex ) {
      var vertices = this.circuit.findAllFixedVertices( vertex );
      for ( var i = 0; i < vertices.length; i++ ) {
        vertices[ i ].isDragged = true;
      }
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
        assert && assert( !isNaN( desiredAngle ), 'angle should be a number' );

        var length = fixedNeighbor.distanceBetweenVertices || fixedNeighbor.lengthProperty.get();
        var indexOfFixedVertex = vertices.indexOf( fixedVertex );
        vertices.splice( indexOfFixedVertex, 1 );

        var dest = Vector2.createPolar( length, desiredAngle ).plus( fixedVertex.positionProperty.get() );
        var src = vertex.positionProperty.get();
        var delta = dest.minus( src );
        var relative = Vector2.createPolar( length, desiredAngle + Math.PI );
        assert && assert( !isNaN( relative.x ), 'x should be a number' );
        assert && assert( !isNaN( relative.y ), 'y should be a number' );

        // Do not propose attachments, since connections cannot be made from a rotation.
        var attachable = [];
        this.translateVertexGroup( vertex, vertices, delta, function() {
          vertex.unsnappedPositionProperty.set( fixedVertex.unsnappedPositionProperty.get().minus( relative ) );
        }, attachable );
      }
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

      // Guard against the case in which the battery is flipped while dragging, see https://github.com/phetsims/circuit-construction-kit-common/issues/416
      if ( vertexNode.startOffset ) {
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

        if ( okToRotate && neighbors.length === 1 && neighbors[ 0 ] instanceof FixedCircuitElement ) {

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

            // allow any vertex connected by fixed length elements to snap, see https://github.com/phetsims/circuit-construction-kit-common/issues/254
            vertices
          );
        }
        else {
          var translationDelta = position.minus( vertex.unsnappedPositionProperty.get() );
          this.translateVertexGroup( vertex, vertices, translationDelta, null, vertices );
        }
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
        assert && assert( !isNaN( delta.x ), 'x should be a number' );
        assert && assert( !isNaN( delta.y ), 'y should be a number' );
      }

      // Translate all nodes as a batch before notifying observers so we don't end up with a bad transient state
      // in which two or more vertices from one FixedCircuitElement have the same location.
      // See https://github.com/phetsims/circuit-construction-kit-common/issues/412
      for ( i = 0; i < vertices.length; i++ ) {
        var newPosition = vertices[ i ].unsnappedPositionProperty.get().plus( delta );
        var positionReference = vertices[ i ].positionProperty.get();
        positionReference.x = newPosition.x;
        positionReference.y = newPosition.y;
      }
      for ( i = 0; i < vertices.length; i++ ) {
        vertices[ i ].positionProperty.notifyListenersStatic();
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
        vertices[ i ].isDragged = false;
      }

      // If any of the vertices connected by fixed length nodes is immobile, then the entire subgraph cannot be moved
      for ( i = 0; i < vertices.length; i++ ) {
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
    },

    /**
     * When the zoom level changes, recompute the visible bounds in the coordinate frame of the CircuitLayerNode so
     * that objects cannot be dragged outside the boundary.
     * @param {Bounds2} visibleBounds - view coordinates for the visible region
     * @public
     */
    updateTransform: function( visibleBounds ) {
      this.visibleBoundsInCircuitCoordinateFrameProperty.set( this.parentToLocalBounds( visibleBounds ) );
    }
  } );
} );