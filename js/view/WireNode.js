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
  var inherit = require( 'PHET_CORE/inherit' );
  var Line = require( 'SCENERY/nodes/Line' );
  var TandemSimpleDragHandler = require( 'TANDEM/scenery/input/TandemSimpleDragHandler' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var Path = require( 'SCENERY/nodes/Path' );
  var LineStyles = require( 'KITE/util/LineStyles' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Color = require( 'SCENERY/util/Color' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Vector2 = require( 'DOT/Vector2' );
  var CircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementNode' );
  var Shape = require( 'KITE/Shape' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var CircuitConstructionKitCommonUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonUtil' );

  // constants
  var LIFELIKE_LINE_WIDTH = 12; // line width in screen coordinates
  var SCHEMATIC_LINE_WIDTH = CircuitConstructionKitConstants.SCHEMATIC_LINE_WIDTH; // line width in screen coordinates

  // constants
  var TRANSFORM = new Matrix3(); // The Matrix entries are mutable
  var WIRE_RASTER_LENGTH = 100;

  // Node used to render the black line for schematic, cached as toDataURLImageSynchronous so it can render with WebGL
  var BLACK_LINE_NODE = new Line( 0, 0, WIRE_RASTER_LENGTH, 0, {
    lineWidth: SCHEMATIC_LINE_WIDTH,
    stroke: 'black'
  } ).toDataURLImageSynchronous();

  /**
   * Create a LinearGradient for the wire, depending on the orientation relative to the shading (light comes from
   * top left)
   * @param {Object[]} colorStops - entries have point: Number, color: Color
   * @param {function} colorStopPointMap - the operation to apply to create color stops
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

  var lifelikeNodeNormal = new Line( 0, 0, WIRE_RASTER_LENGTH, 0, {
    lineWidth: LIFELIKE_LINE_WIDTH,
    stroke: normalGradient
  } ).toDataURLImageSynchronous();

  var lifelikeNodeReversed = new Line( 0, 0, WIRE_RASTER_LENGTH, 0, {
    lineWidth: LIFELIKE_LINE_WIDTH,
    stroke: reverseGradient
  } ).toDataURLImageSynchronous();

  var lifelikeRoundedCapNormal = new Circle( LIFELIKE_LINE_WIDTH / 2, {
    fill: normalGradient
  } ).toDataURLImageSynchronous();

  var lifelikeRoundedCapReversed = new Circle( LIFELIKE_LINE_WIDTH / 2, {
    fill: reverseGradient
  } ).toDataURLImageSynchronous();

  var highlightStrokeStyles = new LineStyles( {
    lineWidth: 26,
    lineCap: 'round',
    lineJoin: 'round'
  } );

  /**
   * Convenience function that gets the stroked shape for the wire line node with the given style
   * @param {Wire} wire
   * @returns {Shape}
   */
  var getHighlightStrokedShape = function( wire ) {
    var startPoint = wire.startVertexProperty.get().positionProperty.get();
    var endPoint = wire.endVertexProperty.get().positionProperty.get();
    return Shape.lineSegment( startPoint.x, startPoint.y, endPoint.x, endPoint.y )
      .getStrokedShape( highlightStrokeStyles );
  };

  /**
   * @param {CircuitConstructionKitScreenView|null} circuitConstructionKitScreenView - null means it's an icon
   * @param {CircuitLayerNode} circuitLayerNode
   * @param {Wire} wire
   * @param {Property.<boolean>} showResultsProperty - unused but provided to match the constructors of other circuit
   *                                                 - element nodes
   * @param {Property.<string>} viewProperty - lifelike or schematic
   * @param {Tandem} tandem
   * @constructor
   */
  function WireNode( circuitConstructionKitScreenView, circuitLayerNode, wire, showResultsProperty, viewProperty,
                     tandem ) {
    var self = this;

    // @private {Property.<string>} 'lifelike'|'schematic'
    this.viewProperty = viewProperty;

    // @private {CircuitLayerNode}
    this.circuitLayerNode = circuitLayerNode;

    // @public (read-only) {Wire}
    this.wire = wire;

    // @private {Node} - the node that shows the yellow highlight for the node when selected
    this.highlightNode = new Path( null, {
      stroke: CircuitConstructionKitConstants.HIGHLIGHT_COLOR,
      lineWidth: CircuitConstructionKitConstants.HIGHLIGHT_LINE_WIDTH,
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
    this.endCapParent = new Node( {
      children: [ lifelikeRoundedCapNormal ]
    } );

    // @private
    this.startCapParent = new Node( {
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

    viewProperty.link( markAsDirty );

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
      this.dragHandler = new TandemSimpleDragHandler( {
          allowTouchSnag: true,
          tandem: tandem.createTandem( 'dragHandler' ),
          start: function( event ) {
            if ( wire.interactiveProperty.get() ) {

              // Start drag by starting a drag on start and end vertices
              circuitLayerNode.startDragVertex( event.pointer.point, wire.startVertexProperty.get(), false );
              circuitLayerNode.startDragVertex( event.pointer.point, wire.endVertexProperty.get(), false );
              wire.isOverToolboxProperty.set( circuitConstructionKitScreenView.canNodeDropInToolbox( self ) );
              dragged = false;
              startPoint = event.pointer.point;
            }
          },
          drag: function( event ) {
            if ( wire.interactiveProperty.get() ) {

              // Drag by translating both of the vertices
              circuitLayerNode.dragVertex( event.pointer.point, wire.startVertexProperty.get(), false );
              circuitLayerNode.dragVertex( event.pointer.point, wire.endVertexProperty.get(), false );
              wire.isOverToolboxProperty.set( circuitConstructionKitScreenView.canNodeDropInToolbox( self ) );
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

      wire.startVertexProperty.get().positionProperty.unlink( markAsDirty );
      wire.endVertexProperty.get().positionProperty.unlink( markAsDirty );

      wire.connectedEmitter.removeListener( moveToBack );

      circuitLayerNode && circuitLayerNode.highlightLayer.removeChild( highlightNodeParent );

      viewProperty.unlink( markAsDirty );
      tandem.removeInstance( self );
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
      var view = this.viewProperty.value;
      if ( view === CircuitConstructionKitConstants.LIFELIKE ) {

        // determine whether to use the forward or reverse gradient based on the angle
        var startPoint = this.wire.startVertexProperty.get().positionProperty.get();
        var endPoint = this.wire.endVertexProperty.get().positionProperty.get();
        var lightingDirection = new Vector2( 0.916, 0.4 ); // sampled manually
        var wireVector = endPoint.minus( startPoint );
        var dot = lightingDirection.dot( wireVector );

        // only change children if necessary
        var lineNodeChild = dot < 0 ? lifelikeNodeReversed : lifelikeNodeNormal;
        var capChild = dot < 0 ? lifelikeRoundedCapReversed : lifelikeRoundedCapNormal;
        this.lineNode.getChildAt( 0 ) !== lineNodeChild && this.lineNode.setChildren( [ lineNodeChild ] );
        this.endCapParent.getChildAt( 0 ) !== capChild && this.endCapParent.setChildren( [ capChild ] );
        this.startCapParent.getChildAt( 0 ) !== capChild && this.startCapParent.setChildren( [ capChild ] );
        lifelikeRoundedCapNormal.visible = true;
        lifelikeRoundedCapReversed.visible = true;
      }
      else {
        (this.lineNode.getChildAt( 0 ) !== BLACK_LINE_NODE) && this.lineNode.setChildren( [ BLACK_LINE_NODE ] );
        lifelikeRoundedCapNormal.visible = false;
        lifelikeRoundedCapReversed.visible = false;
      }

      var startPosition = this.circuitElement.startVertexProperty.get().positionProperty.get();
      var endPosition = this.circuitElement.endVertexProperty.get().positionProperty.get();
      var delta = endPosition.minus( startPosition );
      var angle = delta.angle();

      // Update the node transform
      CircuitConstructionKitCommonUtil.setToTranslationRotation( TRANSFORM, endPosition, angle );
      this.endCapParent.setMatrix( TRANSFORM );

      // This transform is done second so the matrix is already in good shape for the scaling step
      CircuitConstructionKitCommonUtil.setToTranslationRotation( TRANSFORM, startPosition, angle );
      this.startCapParent.setMatrix( TRANSFORM );

      TRANSFORM.multiplyMatrix( Matrix3.scaling( delta.magnitude() / WIRE_RASTER_LENGTH, 1 ) );
      this.lineNodeParent.setMatrix( TRANSFORM );

      if ( this.circuitLayerNode ) {
        var selectedCircuitElement = this.circuitLayerNode.circuit.selectedCircuitElementProperty.get();
        var showHighlight = selectedCircuitElement === this.wire;
        this.highlightNode.visible = showHighlight;
        if ( showHighlight ) {
          this.highlightNode.shape = getHighlightStrokedShape( this.wire );
        }
      }
    },

    /**
     * @public - called during the view step
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
     */
    dispose: function() {
      this.disposeWireNode();
      this.removeAllChildren();
      CircuitElementNode.prototype.dispose.call( this );
    }
  }, {

    /**
     * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
     * @public
     */
    webglSpriteNodes: [
      BLACK_LINE_NODE,
      lifelikeNodeNormal,
      lifelikeNodeReversed,
      lifelikeRoundedCapNormal
    ]
  } );
} );