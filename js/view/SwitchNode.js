// Copyright 2015-2017, University of Colorado Boulder

/**
 * Renders the lifelike/schematic view for a Switch.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const ButtonListener = require( 'SCENERY/input/ButtonListener' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElementViewType' );
  const Color = require( 'SCENERY/util/Color' );
  const FixedCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedCircuitElementNode' );
  const inherit = require( 'PHET_CORE/inherit' );
  const LinearGradient = require( 'SCENERY/util/LinearGradient' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );

  // constants
  // dimensions for schematic battery
  const LIFELIKE_DIAMETER = 16;
  const SWITCH_START = CCKCConstants.SWITCH_START;
  const SWITCH_END = CCKCConstants.SWITCH_END;
  const SWITCH_LENGTH = CCKCConstants.SWITCH_LENGTH;

  const lifelikeNodeThickness = 8;
  const lifelikeGradient = new LinearGradient( 0, -lifelikeNodeThickness / 2, 0, lifelikeNodeThickness / 2 )
    .addColorStop( 0, '#d48270' )
    .addColorStop( 0.3, '#e39b8c' )
    .addColorStop( 1, '#b56351' );

  /**
   * @param {CircuitElementViewType} viewType
   * @param {Color|string|LinearGradient} fill
   * @param {number} thickness
   * @param {number} curveDiameter - the diameter of the circles in the slots
   * @param {boolean} closed - whether the switch is closed
   * @returns {Node} with leftSegmentNode, rotatingSegmentNode and rightSegmentNode properties (also {Node})
   */
  const createNode = function( viewType, fill, thickness, curveDiameter, closed ) {
    const edgeRadius = thickness / 2;

    const leftSegmentNode = new Rectangle( 0,
      -thickness / 2,
      SWITCH_LENGTH * SWITCH_START,
      thickness, {
        cornerRadius: edgeRadius,
        fill: fill,
        stroke: Color.BLACK,
        pickable: true
      } );

    // See the picture at https://github.com/phetsims/circuit-construction-kit-common/issues/313
    // This part has a curved notch that fits into the other segment
    const shape = new Shape()
      .moveTo( 0, thickness / 2 )
      .lineTo( SWITCH_LENGTH * SWITCH_START - curveDiameter, thickness / 2 )

      // similar to the notch below
      .arc( SWITCH_LENGTH * SWITCH_START - curveDiameter / 2, 0, curveDiameter / 2, Math.PI, 0, false )
      .arc( SWITCH_LENGTH * SWITCH_START + curveDiameter / 2, 0, curveDiameter / 2, Math.PI, 0, true )
      .lineTo( SWITCH_LENGTH * SWITCH_START + curveDiameter, -thickness / 2 )

      .lineTo( 0, -thickness / 2 )
      .lineTo( 0, thickness / 2 );
    const rotatingSegmentNode = new Path( shape, {
      x: SWITCH_LENGTH * SWITCH_START,
      fill: fill,
      stroke: Color.BLACK,
      lineWidth: viewType === CircuitElementViewType.SCHEMATIC ? 0 : 1,
      pickable: true
    } );

    rotatingSegmentNode.rotation = closed ? 0 : -Math.PI / 4;

    const rightSegmentShape = new Shape()
      .moveTo( SWITCH_LENGTH * SWITCH_END - curveDiameter, thickness / 2 )

      // similar to the notch above
      .lineTo( SWITCH_LENGTH * SWITCH_END - curveDiameter, 0 )
      .arc( SWITCH_LENGTH * SWITCH_END - curveDiameter / 2, 0, curveDiameter / 2, Math.PI, 0, false )
      .arc( SWITCH_LENGTH * SWITCH_END + curveDiameter / 2, 0, curveDiameter / 2, Math.PI, 0, true )
      .lineTo( SWITCH_LENGTH * SWITCH_END + curveDiameter, -thickness / 2 )

      .lineTo( SWITCH_LENGTH - edgeRadius, -thickness / 2 )
      .arc( SWITCH_LENGTH - edgeRadius, 0, edgeRadius, -Math.PI / 2, Math.PI / 2 )
      .lineTo( SWITCH_LENGTH * SWITCH_END - curveDiameter, thickness / 2 );
    const rightSegmentNode = new Path( rightSegmentShape, {
      fill: fill,
      stroke: Color.BLACK,
      pickable: true
    } );

    const lifelikeHinge = new Circle( thickness * 0.6, {
      fill: '#a7a8ab',
      stroke: Color.BLACK,
      lineWidth: 4,
      x: SWITCH_LENGTH * SWITCH_START
    } );

    const node = new Node( {
      children: [ leftSegmentNode, rotatingSegmentNode, rightSegmentNode, lifelikeHinge ]
    } );

    if ( viewType === CircuitElementViewType.SCHEMATIC ) {
      node.addChild( new Circle( thickness * 0.6, {
        fill: Color.BLACK,
        stroke: Color.BLACK,
        lineWidth: 4,
        x: SWITCH_LENGTH * SWITCH_END
      } ) );
    }

    node.leftSegmentNode = leftSegmentNode;
    node.rotatingSegmentNode = rotatingSegmentNode;
    node.rightSegmentNode = rightSegmentNode;

    return node;
  };

  // Create all of the images
  const lifelikeOpenNode = createNode(
    CircuitElementViewType.LIFELIKE, lifelikeGradient, LIFELIKE_DIAMETER, 6, false
  );
  const lifelikeOpenImage = lifelikeOpenNode.toDataURLImageSynchronous();

  const lifelikeClosedNode = createNode(
    CircuitElementViewType.LIFELIKE, lifelikeGradient, LIFELIKE_DIAMETER, 6, true
  );
  const lifelikeClosedImage = lifelikeClosedNode.toDataURLImageSynchronous();

  const schematicOpenImage = createNode(
    CircuitElementViewType.SCHEMATIC, Color.BLACK, CCKCConstants.SCHEMATIC_LINE_WIDTH, 0, false
  ).toDataURLImageSynchronous();

  const schematicClosedImage = createNode(
    CircuitElementViewType.SCHEMATIC, Color.BLACK, CCKCConstants.SCHEMATIC_LINE_WIDTH, 0, true
  ).toDataURLImageSynchronous();

  /**
   * @param {CCKCScreenView|null} screenView - main screen view, null for icon
   * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
   * @param {Switch} circuitSwitch
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function SwitchNode( screenView, circuitLayerNode, circuitSwitch, viewTypeProperty, tandem, options ) {

    const self = this;

    // @public (read-only) {Switch} - the Switch rendered by this Node
    this.circuitSwitch = circuitSwitch;

    const lifelikeNode = new Node();
    const schematicNode = new Node();
    const closeListener = function( closed ) {
      lifelikeNode.children = [ closed ? lifelikeClosedImage : lifelikeOpenImage ];
      schematicNode.children = [ closed ? schematicClosedImage : schematicOpenImage ];
    };
    circuitSwitch.closedProperty.link( closeListener );

    FixedCircuitElementNode.call( this,
      screenView,
      circuitLayerNode,
      circuitSwitch,
      viewTypeProperty,
      lifelikeNode,
      schematicNode,
      tandem,
      options
    );

    let downPoint = null;

    // When the user taps the switch, toggle whether it is open or closed.
    const buttonListener = new ButtonListener( {
      down: function( event ) {
        downPoint = circuitLayerNode.globalToLocalPoint( event.pointer.point );
      },
      fire: function( event ) {

        // Measure how far the switch was dragged in CircuitLayerNode coordinates (if any)
        const distance = circuitLayerNode.globalToLocalPoint( event.pointer.point ).distance( downPoint );

        // Toggle the state of the switch, but only if the event is classified as a tap and not a drag
        if ( distance < CCKCConstants.TAP_THRESHOLD ) {
          circuitSwitch.closedProperty.value = !circuitSwitch.closedProperty.value;
        }
      }
    } );

    // Only add the input listener if it is not for a toolbar icon
    screenView && this.contentNode.addInputListener( buttonListener );

    // @private {Node} - For hit testing
    this.lifelikeOpenNode = createNode(
      CircuitElementViewType.LIFELIKE, lifelikeGradient, LIFELIKE_DIAMETER, 6, false
    );

    // @private {function} - clean up resources when no longer used.
    this.disposeSwitchNode = function() {
      circuitSwitch.closedProperty.unlink( closeListener );
      screenView && self.contentNode.removeInputListener( buttonListener );

      // Make sure the lifelikeNode and schematicNode are not listed as parents for their children because the children
      // (images) persist.
      lifelikeNode.dispose();
      schematicNode.dispose();
    };
  }

  circuitConstructionKitCommon.register( 'SwitchNode', SwitchNode );

  return inherit( FixedCircuitElementNode, SwitchNode, {

    /**
     * Determine whether the start side (with the pivot) contains the sensor point.
     * @param {Vector2} point - in view coordinates
     * @returns {boolean}
     */
    startSideContainsSensorPoint: function( point ) {
      const localPoint = this.contentNode.parentToLocalPoint( point );

      const leftSegmentContainsPoint = lifelikeOpenNode.leftSegmentNode.containsPoint( localPoint );
      const node = this.circuitSwitch.closedProperty.get() ? lifelikeClosedNode : lifelikeOpenNode;
      const rotatingSegmentContainsPoint = node.rotatingSegmentNode.containsPoint( localPoint );
      return leftSegmentContainsPoint || rotatingSegmentContainsPoint;
    },

    /**
     * Determine whether the start side (without the pivot) contains the sensor point.
     * @param {Vector2} point - in view coordinates
     * @returns {boolean}
     */
    endSideContainsSensorPoint: function( point ) {
      const localPoint = this.contentNode.parentToLocalPoint( point );
      return lifelikeOpenNode.rightSegmentNode.containsPoint( localPoint );
    },

    /**
     * Returns true if the node hits the sensor at the given point.
     * @param {Vector2} point
     * @returns {boolean}
     * @overrides
     * @public
     */
    containsSensorPoint: function( point ) {

      // make sure bounds are correct if cut or joined in this animation frame
      this.step();

      return this.startSideContainsSensorPoint( point ) || this.endSideContainsSensorPoint( point );
    },

    /**
     * Clean up resources when no longer used.
     * @public
     * @override
     */
    dispose: function() {
      this.disposeSwitchNode();
      FixedCircuitElementNode.prototype.dispose.call( this );
    }
  } );
} );