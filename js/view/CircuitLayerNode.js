// Copyright 2015-2020, University of Colorado Boulder

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

import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Node from '../../../scenery/js/nodes/Node.js';
import RoundPushButton from '../../../sun/js/buttons/RoundPushButton.js';
import FontAwesomeNode from '../../../sun/js/FontAwesomeNode.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCUtils from '../CCKCUtils.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import ACVoltage from '../model/ACVoltage.js';
import Battery from '../model/Battery.js';
import Capacitor from '../model/Capacitor.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import Dog from '../model/Dog.js';
import FixedCircuitElement from '../model/FixedCircuitElement.js';
import Fuse from '../model/Fuse.js';
import Inductor from '../model/Inductor.js';
import LightBulb from '../model/LightBulb.js';
import Resistor from '../model/Resistor.js';
import SeriesAmmeter from '../model/SeriesAmmeter.js';
import Switch from '../model/Switch.js';
import VoltageConnection from '../model/VoltageConnection.js';
import Wire from '../model/Wire.js';
import ACVoltageNode from './ACVoltageNode.js';
import BatteryNode from './BatteryNode.js';
import CapacitorCircuitElementNode from './CapacitorCircuitElementNode.js';
import CCKCLightBulbNode from './CCKCLightBulbNode.js';
import ChargeNode from './ChargeNode.js';
import CircuitElementNode from './CircuitElementNode.js';
import CustomLightBulbNode from './CustomLightBulbNode.js';
import DogNode from './DogNode.js';
import FixedCircuitElementNode from './FixedCircuitElementNode.js';
import FuseNode from './FuseNode.js';
import InductorNode from './InductorNode.js';
import ResistorNode from './ResistorNode.js';
import SeriesAmmeterNode from './SeriesAmmeterNode.js';
import SolderNode from './SolderNode.js';
import SwitchNode from './SwitchNode.js';
import ValueNode from './ValueNode.js';
import VertexNode from './VertexNode.js';
import WireNode from './WireNode.js';

// constants

// In https://github.com/phetsims/circuit-construction-kit-dc/issues/140 we decided to test every platform with
// svg rendering to avoid svg/webgl lag issues and have a consistent renderer across platforms.  However, we will
// leave in all of the WebGL code in case we have performance problems on a platform that require WebGL to be restored?
const RENDERER = 'svg';

class CircuitLayerNode extends Node {
  /**
   * @param {Circuit} circuit - the model Circuit
   * @param {CCKCScreenView} screenView - for dropping CircuitElement instances back in the toolbox
   * @param {Tandem} tandem
   */
  constructor( circuit, screenView, tandem ) {
    super();

    // @private {Property.<CircuitElementViewType>}
    this.viewTypeProperty = screenView.model.viewTypeProperty;

    // @public (read-only) {CircuitConstructionKitModel}
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
          .concat( FuseNode.webglSpriteNodes )
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

    Property.multilink( [ screenView.model.isValueDepictionEnabledProperty, screenView.model.revealingProperty ], ( isValueDepictionEnabled, revealing ) => {
      this.chargeLayer.visible = isValueDepictionEnabled && revealing;
    } );

    // @public {Node} - layer that shows the Voltmeter and Ammeter (but not the SeriesAmmeter, which is shown in the fixedCircuitElementLayer)
    this.sensorLayer = new Node();

    // @public (circuit-construction-kit-black-box-study)
    this.beforeCircuitElementsLayer = new Node();
    this.afterCircuitElementsLayer = new Node();

    // For lifelike: Solder should be in front of wires but behind batteries and resistors.
    const lifelikeLayering = [
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
    const schematicLayering = [
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

    // choose layering for schematic vs lifelike.  HEADS UP, this means circuitLayerNode.addChild() will get overwritten
    // so all nodes must be added as children in the array above.
    screenView.model.viewTypeProperty.link( view => {
      this.children = ( view === CircuitElementViewType.LIFELIKE ) ? lifelikeLayering : schematicLayering;
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
     * @param {function} predicate
     * @param {Node} layer
     * @param {Tandem} groupTandem
     * @param {function} createCircuitElement - creates the node, given a circuitElement and tandem BatteryNode
     */
    const initializeCircuitElementType = ( predicate, layer, groupTandem, createCircuitElement ) => {
      const addCircuitElement = circuitElement => {
        if ( predicate( circuitElement ) ) {
          const circuitElementNode = createCircuitElement( circuitElement, Tandem.OPTIONAL );
          this.circuitElementNodeMap[ circuitElement.id ] = circuitElementNode;

          layer.addChild( circuitElementNode );

          // Show the ValueNode for readouts, though series ammeters already show their own readouts and Wires do not
          // have readouts
          if ( circuitElement instanceof FixedCircuitElement && !( circuitElement instanceof SeriesAmmeter ) ) {
            const valueNode = new ValueNode(
              circuitElement,
              this.model.showValuesProperty,
              this.model.viewTypeProperty,
              Tandem.OPTIONAL
            );

            const updateShowValues = showValues => CCKCUtils.setInSceneGraph( showValues, this.valueLayer, valueNode );
            this.model.showValuesProperty.link( updateShowValues );

            circuitElement.disposeEmitterCircuitElement.addListener( () => {
              this.model.showValuesProperty.unlink( updateShowValues );
              CCKCUtils.setInSceneGraph( false, this.valueLayer, valueNode );
              valueNode.dispose();
            } );
          }
        }
      };
      circuit.circuitElements.addItemAddedListener( addCircuitElement );
      circuit.circuitElements.forEach( addCircuitElement );
      circuit.circuitElements.addItemRemovedListener( circuitElement => {
        if ( predicate( circuitElement ) ) {

          const circuitElementNode = this.getCircuitElementNode( circuitElement );
          layer.removeChild( circuitElementNode );
          circuitElementNode.dispose();

          delete this.circuitElementNodeMap[ circuitElement.id ];
        }
      } );
    };

    initializeCircuitElementType( e => e instanceof Wire, this.wireLayer, tandem.createGroupTandem( 'wireNode' ),
      ( circuitElement, tandem ) => new WireNode( screenView, this, circuitElement, this.model.viewTypeProperty, tandem ) );
    initializeCircuitElementType( e => e instanceof Battery, this.fixedCircuitElementLayer, tandem.createGroupTandem( 'batteryNode' ),
      ( circuitElement, tandem ) => new BatteryNode( screenView, this, circuitElement, this.model.viewTypeProperty, tandem ) );
    initializeCircuitElementType( e => e instanceof LightBulb, this.fixedCircuitElementLayer, tandem.createGroupTandem( 'lightBulbNode' ),
      ( circuitElement, tandem ) => new CCKCLightBulbNode( screenView, this, circuitElement, this.model.isValueDepictionEnabledProperty, this.model.viewTypeProperty, tandem ) );
    initializeCircuitElementType( e => e instanceof Resistor && !( e instanceof Dog ), this.fixedCircuitElementLayer, tandem.createGroupTandem( 'resistorNode' ),
      ( circuitElement, tandem ) => new ResistorNode( screenView, this, circuitElement, this.model.viewTypeProperty, tandem ) );
    initializeCircuitElementType( e => e instanceof Dog, this.fixedCircuitElementLayer, tandem.createGroupTandem( 'resistorNode' ),
      ( circuitElement, tandem ) => new DogNode( screenView, this, circuitElement, this.model.viewTypeProperty, tandem ) );
    initializeCircuitElementType( e => e instanceof Capacitor, this.fixedCircuitElementLayer, tandem.createGroupTandem( 'capacitorNode' ),
      ( circuitElement, tandem ) => new CapacitorCircuitElementNode( screenView, this, circuitElement, this.model.viewTypeProperty, tandem ) );
    initializeCircuitElementType( e => e instanceof SeriesAmmeter, this.fixedCircuitElementLayer, tandem.createGroupTandem( 'seriesAmmeterNode' ),
      ( circuitElement, tandem ) => new SeriesAmmeterNode( screenView, this, circuitElement, tandem ) );
    initializeCircuitElementType( e => e instanceof Switch, this.fixedCircuitElementLayer, tandem.createGroupTandem( 'switchNode' ),
      ( circuitElement, tandem ) => new SwitchNode( screenView, this, circuitElement, this.model.viewTypeProperty, tandem ) );
    initializeCircuitElementType( e => e instanceof ACVoltage, this.fixedCircuitElementLayer, tandem.createGroupTandem( 'acSourceNode' ),
      ( circuitElement, tandem ) => new ACVoltageNode( screenView, this, circuitElement, this.model.viewTypeProperty, tandem ) );
    initializeCircuitElementType( e => e instanceof Fuse, this.fixedCircuitElementLayer, tandem.createGroupTandem( 'fuseNode' ),
      ( circuitElement, tandem ) => new FuseNode( screenView, this, circuitElement, this.model.viewTypeProperty, tandem ) );
    initializeCircuitElementType( e => e instanceof Inductor, this.fixedCircuitElementLayer, tandem.createGroupTandem( 'inductorNode' ),
      ( circuitElement, tandem ) => new InductorNode( screenView, this, circuitElement, this.model.viewTypeProperty, tandem ) );

    // When a vertex is selected, a cut button is shown near to the vertex.  If the vertex is connected to >1 circuit
    // element, the button is enabled.  Pressing the button will cut the vertex from the neighbors.  Only one cutButton
    // is allocated for all vertices (per screen) to use because it is too performance demanding to create these
    // dynamically when circuit elements are dragged from the toolbox.  Also, only one vertex can be selected at once
    // so there is only a need for one cut button.
    const cutIcon = new FontAwesomeNode( 'cut', {
      rotation: -Math.PI / 2, // scissors point up
      scale: CCKCConstants.FONT_AWESOME_ICON_SCALE
    } );

    // @public (read-only)
    this.cutButton = new RoundPushButton( {
      baseColor: 'yellow',
      content: cutIcon,
      minXMargin: 10,
      minYMargin: 10,
      tandem: tandem.createTandem( 'cutButton' )
    } );
    this.cutButton.addListener( () => {
      assert && assert( circuit.getSelectedVertex(), 'Button should only be available if a vertex is selected' );
      circuit.cutVertex( circuit.getSelectedVertex() );

      // Make sure no vertices got nudged out of bounds during a cut, see https://github.com/phetsims/circuit-construction-kit-dc/issues/138
      moveVerticesInBounds( this.visibleBoundsInCircuitCoordinateFrameProperty.value );
    } );

    // When a Vertex is added to the model, create the corresponding views
    const addVertexNode = vertex => {
      const solderNode = new SolderNode( this, vertex );
      this.solderNodes[ vertex.index ] = solderNode;
      this.solderLayer.addChild( solderNode );

      const vertexNode = new VertexNode( this, vertex, Tandem.OPTIONAL );
      this.vertexNodes[ vertex.index ] = vertexNode;
      this.vertexLayer.addChild( vertexNode );
    };
    circuit.vertexGroup.elementCreatedEmitter.addListener( addVertexNode );

    // When a Vertex is removed from the model, remove and dispose the corresponding views
    circuit.vertexGroup.elementDisposedEmitter.addListener( vertex => {
      const vertexNode = this.getVertexNode( vertex );
      this.vertexLayer.removeChild( vertexNode );
      delete this.vertexNodes[ vertex.index ];
      vertexNode.dispose();
      assert && assert( !this.getVertexNode( vertex ), 'vertex node should have been removed' );

      const solderNode = this.getSolderNode( vertex );
      this.solderLayer.removeChild( solderNode );
      delete this.solderNodes[ vertex.index ];
      solderNode.dispose();
      assert && assert( !this.getSolderNode( vertex ), 'solder node should have been removed' );
    } );
    circuit.vertexGroup.forEach( addVertexNode );

    // When the screen is resized or zoomed, move all vertices into view.
    const moveVerticesInBounds = localBounds => {

      // Check all vertices
      for ( let i = 0; i < circuit.vertexGroup.length; i++ ) {
        const vertex = circuit.vertexGroup.array[ i ];
        const position = vertex.positionProperty.get();

        // If any Vertex is out of bounds, move it and all connected Vertices (to preserve geometry) in bounds.
        if ( !localBounds.containsPoint( position ) ) {
          const closestPoint = localBounds.getClosestPoint( position.x, position.y );
          const delta = closestPoint.minus( position );

          // Find all vertices connected by fixed length nodes.
          const vertices = circuit.findAllConnectedVertices( vertex );
          this.translateVertexGroup( vertex, vertices, delta, null, [] );
        }
      }
    };
    this.visibleBoundsInCircuitCoordinateFrameProperty.link( moveVerticesInBounds );

    // When a charge is added, add the corresponding ChargeNode (removed it its dispose call)
    circuit.charges.addItemAddedListener( charge => this.chargeLayer.addChild( new ChargeNode( charge, this ) ) );
  }

  /**
   * Returns the circuit element node that matches the given circuit element.
   * @param {CircuitElement} circuitElement
   * @returns {CircuitElementNode}
   * @private
   */
  getCircuitElementNode( circuitElement ) {
    return this.circuitElementNodeMap[ circuitElement.id ];
  }

  /**
   * Get the solder node associated with the specified Vertex
   * @param {Vertex} vertex
   * @returns {SolderNode}
   * @public
   */
  getSolderNode( vertex ) { return this.solderNodes[ vertex.index ]; }

  /**
   * Get the VertexNode associated with the specified Vertex
   * @param {Vertex} vertex
   * @returns {VertexNode}
   * @public
   */
  getVertexNode( vertex ) { return this.vertexNodes[ vertex.index ]; }

  /**
   * Find drop targets for all the given vertices
   * @param {Vertex[]} vertices
   * @returns {Object[]} candidates for connection, each Object has {src:Vertex,dst:Vertex} indicating what can snap
   * @public
   */
  getAllDropTargets( vertices ) {
    const allDropTargets = [];

    for ( let i = 0; i < vertices.length; i++ ) {
      const vertex = vertices[ i ];
      const targetVertex = this.circuit.getDropTarget(
        vertex,
        this.model.modeProperty.get(),
        this.model.blackBoxBounds
      );
      if ( targetVertex ) {
        allDropTargets.push( { src: vertex, dst: targetVertex } );
      }
    }
    return allDropTargets;
  }

  /**
   * Finds the closest drop target for any of the given vertices
   * @param {Vertex[]} vertices
   * @returns {Object|null} Object that indicates the two vertices best suited for connecting as { src: Vertex, dst: Vertex },
   *                        or null if no match is suitable.
   * @private
   */
  getBestDropTarget( vertices ) {
    const allDropTargets = this.getAllDropTargets( vertices );
    if ( allDropTargets ) {
      const sorted = _.sortBy( allDropTargets, dropTarget =>
        dropTarget.src.unsnappedPositionProperty.get().distance( dropTarget.dst.positionProperty.get() )
      );
      return sorted[ 0 ];
    }
    else {
      return null;
    }
  }

  /**
   * Updates the view
   * @public
   */
  step() {

    // paint dirty fixed length circuit element nodes.  This batches changes instead of applying multiple changes
    // per frame
    this.circuit.circuitElements.getArray().forEach( circuitElement => this.getCircuitElementNode( circuitElement ).step() );
  }

  /**
   * Returns whether the vertex can be dragged
   * @param {Vertex} vertex
   * @returns {boolean}
   */
  canDragVertex( vertex ) {
    const vertices = this.circuit.findAllFixedVertices( vertex );

    // If any of the vertices in the subgraph is already being dragged, then this vertex cannot be dragged.
    for ( let i = 0; i < vertices.length; i++ ) {
      if ( vertices[ i ].isDragged ) {
        return false;
      }
    }

    return true;
  }

  /**
   * Mark the vertex and its fixed connected vertices as being dragged, so they cannot be dragged by any other pointer.
   * @param {Vertex} vertex
   * @public
   */
  setVerticesDragging( vertex ) {
    const vertices = this.circuit.findAllFixedVertices( vertex );
    for ( let i = 0; i < vertices.length; i++ ) {
      vertices[ i ].isDragged = true;
    }
  }

  /**
   * Called when a Vertex drag begins, records the relative click point
   * @param {Vector2} point
   * @param {Vertex} vertex
   * @public
   */
  startDragVertex( point, vertex ) {

    // If it is the edge of a fixed length circuit element, the element rotates and moves toward the mouse
    const vertexNode = this.getVertexNode( vertex );
    vertexNode.startOffset = vertexNode.globalToParentPoint( point ).minus( vertex.unsnappedPositionProperty.get() );
  }

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
  rotateAboutFixedPivot( point, vertex, okToRotate, vertexNode, position, neighbors, vertices ) {

    // Don't traverse across the black box interface, or it would rotate objects on the other side
    vertices = this.circuit.findAllFixedVertices( vertex, currentVertex => !currentVertex.blackBoxInterfaceProperty.get() );
    const fixedNeighbors = neighbors.filter( neighbor => neighbor.getOppositeVertex( vertex ).blackBoxInterfaceProperty.get() );
    if ( fixedNeighbors.length === 1 ) {
      const fixedNeighbor = fixedNeighbors[ 0 ];
      const fixedVertex = fixedNeighbor.getOppositeVertex( vertex );
      const desiredAngle = position.minus( fixedVertex.positionProperty.get() ).angle;
      assert && assert( !isNaN( desiredAngle ), 'angle should be a number' );

      const length = fixedNeighbor.distanceBetweenVertices || fixedNeighbor.lengthProperty.get();
      const indexOfFixedVertex = vertices.indexOf( fixedVertex );
      vertices.splice( indexOfFixedVertex, 1 );

      const dest = Vector2.createPolar( length, desiredAngle ).plus( fixedVertex.positionProperty.get() );
      const src = vertex.positionProperty.get();
      const delta = dest.minus( src );
      const relative = Vector2.createPolar( length, desiredAngle + Math.PI );
      assert && assert( !isNaN( relative.x ), 'x should be a number' );
      assert && assert( !isNaN( relative.y ), 'y should be a number' );

      // Do not propose attachments, since connections cannot be made from a rotation.
      const attachable = [];
      this.translateVertexGroup( vertex, vertices, delta, () => vertex.unsnappedPositionProperty.set( fixedVertex.unsnappedPositionProperty.get().minus( relative ) ), attachable );
    }
  }

  /**
   * Drag a vertex.
   * @param {Vector2} point - the touch position
   * @param {Vertex} vertex - the vertex that is being dragged
   * @param {boolean} okToRotate - true if it is allowed to rotate adjacent CircuitElements
   * @public
   */
  dragVertex( point, vertex, okToRotate ) {
    const vertexNode = this.getVertexNode( vertex );

    // Guard against the case in which the battery is flipped while dragging, see https://github.com/phetsims/circuit-construction-kit-common/issues/416
    if ( vertexNode.startOffset ) {
      const position = vertexNode.globalToParentPoint( point ).subtract( vertexNode.startOffset );

      // If it is the edge of a fixed length circuit element, the element rotates and moves toward the mouse
      const neighbors = this.circuit.getNeighborCircuitElements( vertex );

      // Find all vertices connected by fixed length nodes.
      const vertices = this.circuit.findAllFixedVertices( vertex );

      // If any of the vertices connected by fixed length nodes is immobile, then the entire subgraph cannot be moved
      let rotated = false;
      for ( let i = 0; i < vertices.length; i++ ) {
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

        const oppositeVertex = neighbors[ 0 ].getOppositeVertex( vertex );

        // Find the new relative angle
        let angle;

        if ( vertex.unsnappedPositionProperty.get().x === vertex.positionProperty.get().x &&
             vertex.unsnappedPositionProperty.get().y === vertex.positionProperty.get().y ) {

          // Rotate the way the element is going.
          angle = position.minus( oppositeVertex.positionProperty.get() ).angle;
        }
        else {

          // Lock in the angle if a match is proposed, otherwise things rotate uncontrollably
          angle = vertex.positionProperty.get().minus( oppositeVertex.positionProperty.get() ).angle;
        }

        // Maintain fixed length
        const length = neighbors[ 0 ].distanceBetweenVertices;
        const relative = Vector2.createPolar( length, angle + Math.PI );
        const oppositePosition = position.plus( relative );

        const rotationDelta = oppositePosition.minus( oppositeVertex.unsnappedPositionProperty.get() );

        this.translateVertexGroup( vertex, vertices, rotationDelta, () => vertex.unsnappedPositionProperty.set( oppositeVertex.unsnappedPositionProperty.get().minus( relative ) ),

          // allow any vertex connected by fixed length elements to snap, see https://github.com/phetsims/circuit-construction-kit-common/issues/254
          vertices
        );
      }
      else {
        const translationDelta = position.minus( vertex.unsnappedPositionProperty.get() );
        this.translateVertexGroup( vertex, vertices, translationDelta, null, vertices );
      }
    }
  }

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
  translateVertexGroup( vertex, vertices, unsnappedDelta, updatePositions, attachable ) {

    const screenBounds = this.visibleBoundsProperty.get();
    const bounds = this.parentToLocalBounds( screenBounds );

    // Modify the delta to guarantee all vertices remain in bounds
    for ( let i = 0; i < vertices.length; i++ ) {
      const proposedPosition = vertices[ i ].unsnappedPositionProperty.get().plus( unsnappedDelta );
      if ( !bounds.containsPoint( proposedPosition ) ) {
        const closestPosition = bounds.getClosestPoint( proposedPosition.x, proposedPosition.y );
        const keepInBoundsDelta = closestPosition.minus( proposedPosition );
        unsnappedDelta = unsnappedDelta.plus( keepInBoundsDelta );
      }
    }

    // Update the unsnapped position of the entire subgraph, i.e. where it would be if no matches are proposed.
    // Must do this before calling getBestDropTarget, because the unsnapped positions are used for target matching
    for ( let i = 0; i < vertices.length; i++ ) {
      const unsnappedPosition = vertices[ i ].unsnappedPositionProperty.get().plus( unsnappedDelta );
      vertices[ i ].unsnappedPositionProperty.set( unsnappedPosition );
    }

    updatePositions && updatePositions();

    // Is there a nearby vertex any of these could snap to?  If so, move to its position temporarily.
    // Find drop targets for *any* of the dragged vertices
    const bestDropTarget = this.getBestDropTarget( attachable );
    let delta = Vector2.ZERO;
    if ( bestDropTarget ) {
      const srcUnsnappedPosition = bestDropTarget.src.unsnappedPositionProperty.get();
      delta = bestDropTarget.dst.unsnappedPositionProperty.get().minus( srcUnsnappedPosition );
      assert && assert( !isNaN( delta.x ), 'x should be a number' );
      assert && assert( !isNaN( delta.y ), 'y should be a number' );
    }

    // Translate all nodes as a batch before notifying observers so we don't end up with a bad transient state
    // in which two or more vertices from one FixedCircuitElement have the same position.
    // See https://github.com/phetsims/circuit-construction-kit-common/issues/412
    for ( let i = 0; i < vertices.length; i++ ) {
      const newPosition = vertices[ i ].unsnappedPositionProperty.get().plus( delta );
      const positionReference = vertices[ i ].positionProperty.get();
      positionReference.x = newPosition.x;
      positionReference.y = newPosition.y;
    }
    for ( let i = 0; i < vertices.length; i++ ) {
      vertices[ i ].positionProperty.notifyListenersStatic();
    }
  }

  /**
   * End a vertex drag.
   *
   * @param {Object} event - event from scenery
   * @param {Vertex} vertex
   * @param {boolean} dragged - true if the vertex actually moved with at least 1 drag call
   * @public
   */
  endDrag( event, vertex, dragged ) {
    assert && assert( typeof dragged === 'boolean', 'didDrag must be supplied' );

    const vertexNode = this.getVertexNode( vertex );

    // Find all vertices connected by fixed length nodes.
    const vertices = this.circuit.findAllFixedVertices( vertex );

    // If any of the vertices connected by fixed length nodes is immobile, then the entire subgraph cannot be moved
    for ( let i = 0; i < vertices.length; i++ ) {
      vertices[ i ].isDragged = false;
    }

    // If any of the vertices connected by fixed length nodes is immobile, then the entire subgraph cannot be moved
    for ( let i = 0; i < vertices.length; i++ ) {
      if ( !vertices[ i ].draggableProperty.get() ) {
        return;
      }
    }

    const bestDropTarget = this.getBestDropTarget( vertices );
    if ( bestDropTarget && dragged ) {
      this.circuit.connect( bestDropTarget.src, bestDropTarget.dst );

      // Set the new reference point for next drag
      for ( let i = 0; i < vertices.length; i++ ) {
        vertices[ i ].unsnappedPositionProperty.set( vertices[ i ].positionProperty.get() );
      }
    }
    vertexNode.startOffset = null;

    // Signify that something has been dropped in the play area, to show the edit panel, unless dropped in the toolbox
    this.circuit.vertexDroppedEmitter.emit( vertex );
  }

  /**
   * Adds a child to a layer behind the control panels.
   * @param {Node} child - the Node to add
   * @public
   */
  addChildToBackground( child ) {
    this.circuitLayerNodeBackLayer.addChild( child );
  }

  /**
   * Removes a child from the layer behind the control panels.
   * @param {Node} child - the Node to remove
   * @public
   */
  removeChildFromBackground( child ) {
    this.circuitLayerNodeBackLayer.removeChild( child );
  }

  /**
   * When the zoom level changes, recompute the visible bounds in the coordinate frame of the CircuitLayerNode so
   * that objects cannot be dragged outside the boundary.
   * @param {Bounds2} visibleBounds - view coordinates for the visible region
   * @public
   */
  updateTransform( visibleBounds ) {
    this.visibleBoundsInCircuitCoordinateFrameProperty.set( this.parentToLocalBounds( visibleBounds ) );
  }

  /**
   * Check for an intersection between a probeNode and a wire, return null if no hits.
   * @param {Vector2} position to hit test
   * @param {function} filter - CircuitElement=>boolean the rule to use for checking circuit elements
   * @param {Vector2|null} globalPoint
   * @returns {CircuitElementNode|null}
   * @public
   */
  hitCircuitElementNode( position, filter, globalPoint ) {

    assert && assert( globalPoint !== undefined );

    const circuitElementNodes = this.circuit.circuitElements.getArray()
      .filter( filter )
      .map( circuitElement => this.getCircuitElementNode( circuitElement ) );

    // Search from the front to the back, because frontmost objects look like they are hitting the sensor, see #143
    for ( let i = circuitElementNodes.length - 1; i >= 0; i-- ) {
      const circuitElementNode = circuitElementNodes[ i ];

      // If this code got called before the WireNode has been created, skip it (the Voltmeter hit tests nodes)
      if ( !circuitElementNode ) {
        continue;
      }

      // Don't connect to wires in the black box
      let revealing = true;
      const trueBlackBox = circuitElementNode.circuitElement.insideTrueBlackBoxProperty.get();
      if ( trueBlackBox ) {
        revealing = this.model.revealingProperty.get();
      }

      if ( revealing && circuitElementNode.containsSensorPoint( globalPoint ) ) {
        return circuitElementNode;
      }
    }
    return null;
  }

  /**
   * Find where the voltmeter probe node intersects the wire, for computing the voltage difference to display in the
   * voltmeter.
   * @param {Vector2} probePosition - in the local coordinate frame of the CircuitLayerNode
   * @returns {VoltageConnection|null} returns VoltageConnection if connected, otherwise null
   * @private
   */
  getVoltageConnection( probePosition ) {

    const globalPoint = this.localToGlobalPoint( probePosition );

    // Check for intersection with a vertex, using the solder radius.  This means it will be possible to check for
    // voltages when nearby the terminal of a battery, not necessarily touching the battery (even when solder is
    // not shown, this is desirable so that students have a higher chance of getting the desirable reading).
    // When solder is shown, it is used as the conductive element for the voltmeter (and hence why the solder radius
    // is used in the computation below.
    const solderNodes = _.values( this.solderNodes );
    const hitSolderNode = _.find( solderNodes, solderNode => {
      const position = solderNode.vertex.positionProperty.get();
      return probePosition.distance( position ) <= SolderNode.SOLDER_RADIUS;
    } );
    if ( hitSolderNode ) {
      return new VoltageConnection( hitSolderNode.vertex );
    }

    // Check for intersection with a metallic circuit element, which can provide voltmeter readings
    const metallicCircuitElement = this.hitCircuitElementNode( probePosition, circuitElement => circuitElement.isMetallic, globalPoint );
    if ( metallicCircuitElement ) {

      const startPoint = metallicCircuitElement.circuitElement.startPositionProperty.get();
      const endPoint = metallicCircuitElement.circuitElement.endPositionProperty.get();
      const segmentVector = endPoint.minus( startPoint );
      const probeVector = probePosition.minus( startPoint );
      let distanceAlongSegment = segmentVector.magnitude === 0 ? 0 : ( probeVector.dot( segmentVector ) /
                                                                       segmentVector.magnitudeSquared );
      distanceAlongSegment = Utils.clamp( distanceAlongSegment, 0, 1 );

      const voltageAlongWire = Utils.linear( 0, 1,
        metallicCircuitElement.circuitElement.startVertexProperty.get().voltageProperty.get(),
        metallicCircuitElement.circuitElement.endVertexProperty.get().voltageProperty.get(),
        distanceAlongSegment
      );

      return new VoltageConnection( metallicCircuitElement.circuitElement.startVertexProperty.get(), voltageAlongWire );
    }
    else {

      // check for intersection with switch node
      const switchNode = this.hitCircuitElementNode( probePosition, circuitElement => circuitElement instanceof Switch, globalPoint );
      if ( switchNode ) {

        // address closed switch.  Find out whether the probe was near the start or end vertex
        if ( switchNode.startSideContainsSensorPoint( probePosition ) ) {
          return new VoltageConnection( switchNode.circuitSwitch.startVertexProperty.get() );
        }
        else if ( switchNode.endSideContainsSensorPoint( probePosition ) ) {
          return new VoltageConnection( switchNode.circuitSwitch.endVertexProperty.get() );
        }
      }

      const capacitorNode = this.hitCircuitElementNode( probePosition, circuitElement => circuitElement instanceof Capacitor, globalPoint );
      if ( capacitorNode ) {

        // Check front first since it visually looks like it would be touching the probe
        if ( capacitorNode.frontSideContainsSensorPoint( globalPoint ) ) {
          return new VoltageConnection( capacitorNode.circuitElement.startVertexProperty.get() );
        }
        else if ( capacitorNode.backSideContainsSensorPoint( globalPoint ) ) {
          return new VoltageConnection( capacitorNode.circuitElement.endVertexProperty.get() );
        }
      }
      return null;
    }
  }

  /**
   * Find the current in the given layer (if any CircuitElement hits the sensor)
   * @param {Node} probeNode
   * @param {Node} layer
   * @returns {number|null}
   * @private
   */
  getCurrentInLayer( probeNode, layer ) {

    const globalPoint = probeNode.parentToGlobalPoint( probeNode.translation );

    // See if any CircuitElementNode contains the sensor point
    for ( let i = 0; i < layer.children.length; i++ ) {
      const circuitElementNode = layer.children[ i ];
      if ( circuitElementNode instanceof CircuitElementNode ) {

        // This is called between when the circuit element is disposed and when the corresponding view is disposed
        // so we must take care not to visit circuit elements that have been disposed but still have a view
        // see https://github.com/phetsims/circuit-construction-kit-common/issues/418
        if ( !circuitElementNode.circuitElement.circuitElementDisposed && circuitElementNode.containsSensorPoint( globalPoint ) ) {
          let rawCurrent = circuitElementNode.circuitElement.currentProperty.get();
          if ( circuitElementNode.circuitElement.isInitialCurrentNegative ) {
            rawCurrent = -rawCurrent;
          }
          return rawCurrent;
        }
      }
    }
    return null;
  }

  /**
   * Find the current under the given probe
   * @param {Node} probeNode
   * @returns {number|null}
   * @private
   */
  getCurrent( probeNode ) {
    const mainCurrent = this.getCurrentInLayer( probeNode, this.fixedCircuitElementLayer );
    if ( mainCurrent !== null ) {
      return mainCurrent;
    }
    else {
      return this.getCurrentInLayer( probeNode, this.wireLayer );
    }
  }
}

circuitConstructionKitCommon.register( 'CircuitLayerNode', CircuitLayerNode );
export default CircuitLayerNode;
