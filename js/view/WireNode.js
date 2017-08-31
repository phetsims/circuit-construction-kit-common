// Copyright 2015-2017, University of Colorado Boulder

/**
 * The node for a wire, which can be stretched out by dragging its vertices.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var CircuitConstructionKitCommonUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonUtil' );
  var CircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementNode' );
  var CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElementViewType' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Vector2 = require( 'DOT/Vector2' );
  var Shape = require( 'KITE/Shape' );
  var LineStyles = require( 'KITE/util/LineStyles' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Color = require( 'SCENERY/util/Color' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );

  // constants
  var LIFELIKE_LINE_WIDTH = 16; // line width in screen coordinates
  var SCHEMATIC_LINE_WIDTH = CircuitConstructionKitCommonConstants.SCHEMATIC_LINE_WIDTH; // line width in screen coordinates

  // constants
  var TRANSFORM = new Matrix3(); // The Matrix entries are mutable
  var WIRE_RASTER_LENGTH = 100;

  // Node used to render the black line for schematic, cached as toDataURLImageSynchronous so it can render with WebGL
  var BLACK_LINE_NODE = new Line( 0, 0, WIRE_RASTER_LENGTH, 0, {
    lineWidth: SCHEMATIC_LINE_WIDTH,
    stroke: Color.BLACK
  } ).toDataURLImageSynchronous( 0, LIFELIKE_LINE_WIDTH / 2, WIRE_RASTER_LENGTH, LIFELIKE_LINE_WIDTH );

  /**
   * Create a LinearGradient for the wire, depending on the orientation relative to the shading (light comes from
   * top left)
   * @param {Object[]} colorStops - entries have point: Number, color: Color
   * @param {function} colorStopPointMap - (Vector2) => number, the operation to apply to create color stops
   * @returns {LinearGradient}
   */
  var createGradient = function( colorStops, colorStopPointMap ) {
    var gradient = new LinearGradient( 0, -LIFELIKE_LINE_WIDTH / 2, 0, LIFELIKE_LINE_WIDTH / 2 );
    colorStops.forEach( function( colorStop ) {
      gradient.addColorStop( colorStopPointMap( colorStop.point ), colorStop.color );
    } );
    return gradient;
  };

  var colorStops = [
    { point: 0.0, color: new Color( '#993f35' ) },
    { point: 0.2, color: new Color( '#cd7767' ) },
    { point: 0.3, color: new Color( '#f6bda0' ) },
    { point: 1.0, color: new Color( '#3c0c08' ) }
  ];

  var normalGradient = createGradient( colorStops, function( e ) {return e;} );
  var reverseGradient = createGradient( colorStops.reverse(), function( e ) {return 1.0 - e;} );

  var PADDING = 2;

  var lifelikeNodeNormal = new Line( 0, 0, WIRE_RASTER_LENGTH, 0, {
    lineWidth: LIFELIKE_LINE_WIDTH,
    stroke: normalGradient
  } ).toDataURLImageSynchronous( 0, LIFELIKE_LINE_WIDTH / 2 + PADDING, WIRE_RASTER_LENGTH, LIFELIKE_LINE_WIDTH + 2 * PADDING );

  var lifelikeNodeReversed = new Line( 0, 0, WIRE_RASTER_LENGTH, 0, {
    lineWidth: LIFELIKE_LINE_WIDTH,
    stroke: reverseGradient
  } ).toDataURLImageSynchronous( 0, LIFELIKE_LINE_WIDTH / 2 + PADDING, WIRE_RASTER_LENGTH, LIFELIKE_LINE_WIDTH + 2 * PADDING );

  // Make sure the heights are the same as the wires so they will line up properly, see
  // https://github.com/phetsims/circuit-construction-kit-common/issues/390
  var lifelikeRoundedCapNormal = new Circle( LIFELIKE_LINE_WIDTH / 2, {
    fill: normalGradient
  } ).toDataURLImageSynchronous( LIFELIKE_LINE_WIDTH / 2 + PADDING, LIFELIKE_LINE_WIDTH / 2 + PADDING, LIFELIKE_LINE_WIDTH + 2 * PADDING, LIFELIKE_LINE_WIDTH + 2 * PADDING );

  var lifelikeRoundedCapReversed = new Circle( LIFELIKE_LINE_WIDTH / 2, {
    fill: reverseGradient
  } ).toDataURLImageSynchronous( LIFELIKE_LINE_WIDTH / 2 + PADDING, LIFELIKE_LINE_WIDTH / 2 + PADDING, LIFELIKE_LINE_WIDTH + 2 * PADDING, LIFELIKE_LINE_WIDTH + 2 * PADDING );

  var HIGHLIGHT_STROKE_LINE_STYLES = new LineStyles( {
    lineWidth: 26,
    lineCap: 'round',
    lineJoin: 'round'
  } );

  var TOUCH_AREA_LINE_STYLES = new LineStyles( {
    lineWidth: 23
  } );

  /**
   * Convenience function that gets the stroked shape for the wire line node with the given style
   * @param {Wire} wire
   * @returns {Shape}
   */
  var getHighlightStrokedShape = function( wire ) {
    var startPoint = wire.startPositionProperty.get();
    var endPoint = wire.endPositionProperty.get();
    return Shape.lineSegment( startPoint.x, startPoint.y, endPoint.x, endPoint.y )
      .getStrokedShape( HIGHLIGHT_STROKE_LINE_STYLES );
  };

  /**
   * Convenience function that gets the stroked shape for the wire line node with the given style
   * @param {Wire} wire
   * @returns {Shape}
   */
  var getTouchArea = function( wire ) {
    var startPoint = wire.startPositionProperty.get();
    var endPoint = wire.endPositionProperty.get();
    var distance = endPoint.distance( startPoint );
    var vertexInset = 18;
    var touchAreaStart = null;
    var touchAreaEnd = null;

    // Extend the touch area from vertex to vertex
    if ( distance > vertexInset * 2 ) {
      touchAreaStart = startPoint.blend( endPoint, vertexInset / distance );
      touchAreaEnd = endPoint.blend( startPoint, vertexInset / distance );
    }
    else {

      // Not enough room for any touch area for this wire
      touchAreaStart = startPoint.blend( endPoint, 0.5 );
      touchAreaEnd = touchAreaStart;
    }

    return Shape.lineSegment( touchAreaStart.x, touchAreaStart.y, touchAreaEnd.x, touchAreaEnd.y )
      .getStrokedShape( TOUCH_AREA_LINE_STYLES );
  };

  /**
   * @param {CircuitConstructionKitScreenView|null} circuitConstructionKitScreenView - null means it's an icon
   * @param {CircuitLayerNode} circuitLayerNode
   * @param {Wire} wire
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Tandem} tandem
   * @constructor
   */
  function WireNode( circuitConstructionKitScreenView, circuitLayerNode, wire, viewTypeProperty, tandem ) {
    var self = this;

    // @private {Property.<CircuitElementViewType>}
    this.viewTypeProperty = viewTypeProperty;

    // @private {CircuitLayerNode}
    this.circuitLayerNode = circuitLayerNode;

    // @public (read-only) {Wire}
    this.wire = wire;

    // @private {Node} - the node that shows the yellow highlight for the node when selected
    this.highlightNode = new Path( null, {
      stroke: CircuitConstructionKitCommonConstants.HIGHLIGHT_COLOR,
      lineWidth: CircuitConstructionKitCommonConstants.HIGHLIGHT_LINE_WIDTH,
      pickable: false,
      visible: false
    } );

    // @private - the node that displays the main line (for both schematic and lifelike).  This does not include
    // the rounded caps for the lifelike view
    this.lineNode = new Node();

    // @private
    this.lineNodeParent = new Node( {
      children: [ self.lineNode ],
      cursor: 'pointer'
    } );
    var highlightNodeParent = new Node( {
      children: [ this.highlightNode ]
    } );

    // @private
    this.startCapParent = new Node( {
      children: [ lifelikeRoundedCapNormal ]
    } );

    // @private
    this.endCapParent = new Node( {
      children: [ lifelikeRoundedCapNormal ]
    } );

    circuitLayerNode && circuitLayerNode.highlightLayer.addChild( highlightNodeParent );

    var circuit = circuitLayerNode && circuitLayerNode.circuit;
    CircuitElementNode.call( this, wire, circuit, {
      children: [
        this.startCapParent,
        this.endCapParent,
        this.lineNodeParent
      ]
    } );

    /**
     * When the view type changes (lifelike vs schematic), update the node
     */
    var markAsDirty = function() {
      if ( self.disposed ) {
        return;
      }
      self.markAsDirty();

      // For the icon, we must update right away since no step() is called
      if ( !circuitLayerNode ) {
        self.updateRender();
      }
    };

    viewTypeProperty.link( markAsDirty );

    /**
     * Update whether the WireNode is pickable
     * @param {boolean} interactive
     */
    var updatePickable = function( interactive ) {
      self.pickable = interactive;
    };
    wire.interactiveProperty.link( updatePickable );

    // When the start vertex changes to a different instance (say when vertices are soldered together), unlink the
    // old one and link to the new one.
    var doUpdateTransform = function( newVertex, oldVertex ) {
      oldVertex && oldVertex.positionProperty.unlink( markAsDirty );
      newVertex.positionProperty.link( markAsDirty );
    };
    wire.startVertexProperty.link( doUpdateTransform );
    wire.endVertexProperty.link( doUpdateTransform );

    // Keep track of the start point to see if it was dragged or tapped to be selected
    var startPoint = null;

    // Keep track of whether it was dragged
    var dragged = false;

    if ( circuitConstructionKitScreenView ) {

      // Input listener for dragging the body of the wire, to translate it.
      this.dragHandler = new SimpleDragHandler( {
          allowTouchSnag: true,
          tandem: tandem.createTandem( 'dragHandler' ),
          start: function( event ) {
            if ( wire.interactiveProperty.get() ) {

              // Start drag by starting a drag on start and end vertices
              circuitLayerNode.startDragVertex( event.pointer.point, wire.startVertexProperty.get(), false );
              circuitLayerNode.startDragVertex( event.pointer.point, wire.endVertexProperty.get(), false );
              dragged = false;
              startPoint = event.pointer.point;
            }
          },
          drag: function( event ) {
            if ( wire.interactiveProperty.get() ) {

              // Drag by translating both of the vertices
              circuitLayerNode.dragVertex( event.pointer.point, wire.startVertexProperty.get(), false );
              circuitLayerNode.dragVertex( event.pointer.point, wire.endVertexProperty.get(), false );
              dragged = true;
            }
          },
          end: function( event ) {
            CircuitElementNode.prototype.endDrag.call( self, event, self, [
                wire.startVertexProperty.get(),
                wire.endVertexProperty.get()
              ],
              circuitConstructionKitScreenView, circuitLayerNode, startPoint, dragged );
          }
        }
      );
      self.addInputListener( this.dragHandler );

      circuitLayerNode.circuit.selectedCircuitElementProperty.link( markAsDirty );
    }

    /**
     * Move the wire element to the back of the view when connected to another circuit element
     * @private
     */
    var moveToBack = function() {

      // Components outside the black box do not move in back of the overlay
      if ( wire.interactiveProperty.get() ) {

        // Connected wires should always be behind the solder and circuit elements
        self.moveToBack();
      }
    };
    wire.connectedEmitter.addListener( moveToBack );

    /**
     * @private - dispose the wire node
     */
    this.disposeWireNode = function() {
      self.dragHandler.dragging && self.dragHandler.endDrag();

      wire.startVertexProperty.unlink( doUpdateTransform );
      wire.endVertexProperty.unlink( doUpdateTransform );

      circuitLayerNode && circuitLayerNode.circuit.selectedCircuitElementProperty.unlink( markAsDirty );
      wire.interactiveProperty.unlink( updatePickable );

      wire.startPositionProperty.unlink( markAsDirty );
      wire.endPositionProperty.unlink( markAsDirty );

      wire.connectedEmitter.removeListener( moveToBack );

      circuitLayerNode && circuitLayerNode.highlightLayer.removeChild( highlightNodeParent );

      viewTypeProperty.unlink( markAsDirty );
      tandem.removeInstance( self );

      self.lineNode.dispose();
      self.highlightNode.dispose();
      self.lineNodeParent.dispose();
      highlightNodeParent.dispose();
      self.startCapParent.dispose();
      self.endCapParent.dispose();
    };

    // For icons, update the end caps
    !circuitLayerNode && this.updateRender();
  }

  circuitConstructionKitCommon.register( 'WireNode', WireNode );

  return inherit( CircuitElementNode, WireNode, {

    /**
     * Mark dirty to batch changes, so that update can be done once in view step, if necessary
     * @public
     */
    markAsDirty: function() {
      this.dirty = true;
    },

    /**
     * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
     * @protected - CircuitConstructionKitLightBulbNode calls updateRender for its child socket node
     */
    updateRender: function() {
      var view = this.viewTypeProperty.value;
      if ( view === CircuitElementViewType.LIFELIKE ) {

        // determine whether to use the forward or reverse gradient based on the angle
        var startPoint = this.wire.startPositionProperty.get();
        var endPoint = this.wire.endPositionProperty.get();
        var lightingDirection = new Vector2( 0.916, 0.4 ); // sampled manually
        var wireVector = endPoint.minus( startPoint );
        var dot = lightingDirection.dot( wireVector );

        // only change children if necessary
        var lineNodeChild = dot < 0 ? lifelikeNodeReversed : lifelikeNodeNormal;
        var capChild = dot < 0 ? lifelikeRoundedCapReversed : lifelikeRoundedCapNormal;
        this.lineNode.getChildAt( 0 ) !== lineNodeChild && this.lineNode.setChildren( [ lineNodeChild ] );
        this.endCapParent.getChildAt( 0 ) !== capChild && this.endCapParent.setChildren( [ capChild ] );
        this.startCapParent.getChildAt( 0 ) !== capChild && this.startCapParent.setChildren( [ capChild ] );
        this.startCapParent.visible = true;
        this.endCapParent.visible = true;
      }
      else {
        (this.lineNode.getChildAt( 0 ) !== BLACK_LINE_NODE) && this.lineNode.setChildren( [ BLACK_LINE_NODE ] );
        this.startCapParent.visible = false;
        this.endCapParent.visible = false;
      }

      var startPosition = this.circuitElement.startPositionProperty.get();
      var endPosition = this.circuitElement.endPositionProperty.get();
      var delta = endPosition.minus( startPosition );
      var magnitude = delta.magnitude();
      var angle = delta.angle();

      // Update the node transform
      CircuitConstructionKitCommonUtil.setToTranslationRotation( TRANSFORM, endPosition, angle );
      this.endCapParent.setMatrix( TRANSFORM );

      // This transform is done second so the matrix is already in good shape for the scaling step
      CircuitConstructionKitCommonUtil.setToTranslationRotation( TRANSFORM, startPosition, angle );
      this.startCapParent.setMatrix( TRANSFORM );

      // Prevent the case where a vertex lies on another vertex, particularly for fuzz testing
      if ( magnitude < 1E-8 ) { magnitude = 1E-8; }

      TRANSFORM.multiplyMatrix( Matrix3.scaling( magnitude / WIRE_RASTER_LENGTH, 1 ) );
      this.lineNodeParent.setMatrix( TRANSFORM );

      if ( this.circuitLayerNode ) {
        var selectedCircuitElement = this.circuitLayerNode.circuit.selectedCircuitElementProperty.get();
        var showHighlight = selectedCircuitElement === this.wire;
        this.highlightNode.visible = showHighlight;
        if ( showHighlight ) {
          this.highlightNode.shape = getHighlightStrokedShape( this.wire );
        }

        this.touchArea = getTouchArea( this.wire );
      }
    },

    /**
     * @public - called during the view step
     * @override
     */
    step: function() {
      CircuitElementNode.prototype.step.call( this );
      if ( this.dirty ) {
        this.updateRender();
        this.dirty = false;
      }
    },

    /**
     * Dispose the WireNode when it will no longer be used.
     * @public
     * @override
     */
    dispose: function() {
      this.disposeWireNode();
      CircuitElementNode.prototype.dispose.call( this );
    }
  }, {

    /**
     * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
     * @public {Array.<Image>}
     */
    webglSpriteNodes: [
      BLACK_LINE_NODE,
      lifelikeNodeNormal,
      lifelikeNodeReversed,
      lifelikeRoundedCapNormal
    ]
  } );
} );