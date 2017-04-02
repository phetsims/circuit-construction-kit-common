// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

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
  var Vector2 = require( 'DOT/Vector2' );
  var CircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CircuitElementNode' );
  var TNode = require( 'SCENERY/nodes/TNode' );

  // constants
  var LIFELIKE_LINE_WIDTH = 12; // line width in screen coordinates
  var SCHEMATIC_LINE_WIDTH = 6; // line width in screen coordinates

  /**
   * @param {CircuitConstructionKitScreenView|null} circuitConstructionKitScreenView - if null, this WireNode is just an icon
   * @param {CircuitNode} circuitNode
   * @param {Wire} wire
   * @param {Property.<boolean>} runningProperty - unused but provided to match the constructors of other circuit element nodes
   * @param {Property.<string>} viewProperty - lifelike or schematic
   * @param {Tandem} tandem
   * @constructor
   */
  function WireNode( circuitConstructionKitScreenView, circuitNode, wire, runningProperty, viewProperty, tandem ) {
    var self = this;
    this.wire = wire;

    var highlightNode = new Path( null, {
      stroke: CircuitConstructionKitConstants.HIGHLIGHT_COLOR,
      lineWidth: CircuitConstructionKitConstants.HIGHLIGHT_LINE_WIDTH,
      pickable: false,
      visible: false
    } );

    // In order to show a gradient on the line, while still allowing the line to stretch (without stretching rounded
    // ends), use a parent node to position and rotate the line, and keep the line the same width.
    // This increases the complexity of the code, but allows us to use Line renderer with a constant gradient.

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

    var lineNode = new Line( 0, 0, 100, 0, {
      cursor: 'pointer',
      strokePickable: true,
      lineCap: 'round'
    } );

    /**
     * When the view type changes (lifelike vs schematic), update the node
     */
    var updateStroke = function() {

      var view = viewProperty.value;
      if ( view === 'lifelike' ) {
        lineNode.lineWidth = LIFELIKE_LINE_WIDTH;

        // determine whether to use the forward or reverse gradient based on the angle
        var startPoint = wire.startVertexProperty.get().positionProperty.get();
        var endPoint = wire.endVertexProperty.value.positionProperty.get();
        var lightingDirection = new Vector2( 0.916, 0.4 ); // sampled manually
        var wireVector = endPoint.minus( startPoint );
        var dot = lightingDirection.dot( wireVector );
        lineNode.stroke = dot < 0 ? reverseGradient : normalGradient;
      }
      else {
        lineNode.lineWidth = SCHEMATIC_LINE_WIDTH;
        lineNode.stroke = 'black';
      }
    };

    viewProperty.link( updateStroke );

    var lineNodeParent = new Node( {
      children: [ lineNode ]
    } );
    var highlightNodeParent = new Node( {
      children: [ highlightNode ]
    } );

    circuitNode && circuitNode.highlightLayer.addChild( highlightNodeParent );

    // @private
    this.lineNodeParent = lineNodeParent;

    // @private
    this.lineNode = lineNode;
    var circuit = circuitNode && circuitNode.circuit;
    CircuitElementNode.call( this, wire, circuit, {
      children: [
        lineNodeParent
      ]
    } );

    /**
     * Update whether the WireNode is pickable
     * @param {boolean} interactive
     */
    var updatePickable = function( interactive ) {
      self.pickable = interactive;
    };
    wire.interactiveProperty.link( updatePickable );

    var highlightStrokeStyles = new LineStyles( {
      lineWidth: 26,
      lineCap: 'round',
      lineJoin: 'round'
    } );

    /**
     * Convenience function that gets the stroked shape for the wire line node with the given style
     * @param {LineStyles} lineStyles
     * @return {Shape}
     */
    var getHighlightStrokedShape = function( lineStyles ) {
      return self.lineNode.shape.getStrokedShape( lineStyles );
    };

    /**
     * Listener for the position of the start vertex.
     * @param {Vector2} startPoint
     */
    var updateStartPosition = function( startPoint ) {
      lineNodeParent.setTranslation( startPoint.x, startPoint.y );
      highlightNodeParent.setTranslation( startPoint.x, startPoint.y );

      // After changing the coordinate frames in the preceding calls, update the rest of the transform.
      updateEndPosition && updateEndPosition( wire.endVertexProperty.get().positionProperty.get() );
      if ( highlightNode.visible ) {
        highlightNode.shape = getHighlightStrokedShape( highlightStrokeStyles );
      }
    };

    /**
     * When the start vertex changes to a different instance (say when vertices are soldered together), unlink the
     * old one and link to the new one.
     * @param {Vertex} newStartVertex
     * @param {Vertex} oldStartVertex
     */
    var updateStartVertex = function( newStartVertex, oldStartVertex ) {
      oldStartVertex && oldStartVertex.positionProperty.unlink( updateStartPosition );
      newStartVertex.positionProperty.link( updateStartPosition );
    };
    wire.startVertexProperty.link( updateStartVertex );

    /**
     * Listener for the position of the end vertex.
     * @param {Vector2} endPoint
     */
    var updateEndPosition = function( endPoint ) {
      lineNode.setPoint2( endPoint.distance( wire.startVertexProperty.get().positionProperty.get() ), 0 );
      var deltaVector = endPoint.minus( wire.startVertexProperty.get().positionProperty.get() );
      lineNodeParent.setRotation( deltaVector.angle() );
      highlightNodeParent.setRotation( deltaVector.angle() );
      if ( highlightNode.visible ) {
        highlightNode.shape = getHighlightStrokedShape( highlightStrokeStyles );
      }

      updateStroke();
    };

    /**
     * When the end vertex changes to a different instance, unlink the old properties and link to the new properties.
     * @param {Vertex} newEndVertex
     * @param {Vertex} oldEndVertex
     */
    var updateEndVertex = function( newEndVertex, oldEndVertex ) {
      oldEndVertex && oldEndVertex.positionProperty.unlink( updateEndPosition );
      newEndVertex.positionProperty.link( updateEndPosition );
    };
    wire.endVertexProperty.link( updateEndVertex );

    var startPoint = null;
    var dragged = false;

    if ( circuitConstructionKitScreenView ) {
      this.inputListener = new TandemSimpleDragHandler( {
        allowTouchSnag: true,
        tandem: tandem.createTandem( 'inputListener' ),
        start: function( event ) {
          if ( wire.interactiveProperty.get() ) {
            startPoint = event.pointer.point;
            circuitNode.startDrag( event.pointer.point, wire.startVertexProperty.get(), false );
            circuitNode.startDrag( event.pointer.point, wire.endVertexProperty.get(), false );
            wire.isOverToolboxProperty.set( circuitConstructionKitScreenView.canNodeDropInToolbox( self ) );
            dragged = false;
          }
        },
        drag: function( event ) {
          if ( wire.interactiveProperty.get() ) {
            circuitNode.drag( event.pointer.point, wire.startVertexProperty.get(), false );
            circuitNode.drag( event.pointer.point, wire.endVertexProperty.get(), false );
            wire.isOverToolboxProperty.set( circuitConstructionKitScreenView.canNodeDropInToolbox( self ) );
            dragged = true;
          }
        },
        end: function( event ) {

          // TODO: duplicated with FixedLengthCircuitElementNode
          if ( wire.interactiveProperty.get() ) {

            // If over the toolbox, then drop into it, and don't process further
            if ( wire.isOverToolboxProperty.get() ) {

              var creationTime = self.circuitElement.creationTime;
              var lifetime = phet.joist.elapsedTime - creationTime;
              var delayMS = Math.max( 500 - lifetime, 0 );

              // Disallow further interaction
              self.removeInputListener( self.inputListener );

              // If over the toolbox, then drop into it, and don't process further
              setTimeout( function() {
                circuitConstructionKitScreenView.dropCircuitElementNodeInToolbox( self );
              }, delayMS );
            }
            else {
              circuitNode.endDrag( event, wire.startVertexProperty.get(), dragged );
              circuitNode.endDrag( event, wire.endVertexProperty.get(), dragged );

              // Only show the editor when tapped, not on every drag.
              self.maybeSelect( event, circuitNode, startPoint );

              dragged = false;
            }
          }
        }
      } );
      self.addInputListener( this.inputListener );

      var updateHighlight = function( lastCircuitElement ) {
        var showHighlight = lastCircuitElement === wire;
        highlightNode.visible = showHighlight;
        if ( highlightNode.visible ) {
          highlightNode.shape = getHighlightStrokedShape( highlightStrokeStyles );
        }
      };
      circuitNode.circuit.selectedCircuitElementProperty.link( updateHighlight );
    }

    /**
     * @private - dispose the wire node
     */
    this.disposeWireNode = function() {
      self.inputListener.dragging && self.inputListener.endDrag();

      wire.startVertexProperty.unlink( updateStartVertex );
      wire.endVertexProperty.unlink( updateEndVertex );

      updateHighlight && circuitNode.circuit.selectedCircuitElementProperty.unlink( updateHighlight );
      wire.interactiveProperty.unlink( updatePickable );

      wire.startVertexProperty.get().positionProperty.unlink( updateStartPosition );
      wire.endVertexProperty.get().positionProperty.unlink( updateEndPosition );

      circuitNode && circuitNode.highlightLayer.removeChild( highlightNodeParent );

      viewProperty.unlink( updateStroke );
      tandem.removeInstance( self );
    };

    tandem.addInstance( this, TNode );
  }

  circuitConstructionKitCommon.register( 'WireNode', WireNode );

  return inherit( CircuitElementNode, WireNode, {

    /**
     * Dispose the WireNode when it will no longer be used.
     * @public
     */
    dispose: function() {
      this.disposeWireNode();
      CircuitElementNode.prototype.dispose.call( this );
    },

    /**
     * Gets the shape of the line node in the parent's coordinate frame for hit testing.
     * @return {Shape}
     * @public
     */
    getStrokedShape: function() {
      return this.lineNode.getStrokedShape().transformed( this.lineNodeParent.matrix );
    }
  } );
} );