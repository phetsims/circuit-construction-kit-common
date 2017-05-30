// Copyright 2015-2017, University of Colorado Boulder

/**
 * Renders the lifelike/schematic view for a Switch.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var FixedLengthCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedLengthCircuitElementNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );

  // constants
  // dimensions for schematic battery
  var LIFELIKE_DIAMETER = 16;
  var SWITCH_START = CircuitConstructionKitConstants.SWITCH_START;
  var SWITCH_END = CircuitConstructionKitConstants.SWITCH_END;

  /**
   * @param {CCKScreenView} circuitConstructionKitScreenView
   * @param {CircuitNode} circuitNode
   * @param {Switch} circuitSwitch
   * @param {Property.<boolean>} runningProperty - supplied for consistency with other CircuitElementNode constructors
   * @param {Property.<string>} viewProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function SwitchNode( circuitConstructionKitScreenView, circuitNode, circuitSwitch, runningProperty, viewProperty, tandem, options ) {

    // @public (read-only) - the Switch rendered by this Node
    this.circuitSwitch = circuitSwitch;

    /**
     * @param {string} type - 'lifelike'|'schematic'
     * @param {Color|string|LinearGradient} fill
     * @param {number} thickness
     * @param {number} curveDiameter - the diameter of the circles in the slots
     * @returns {Node}
     */
    var createNode = function( type, fill, thickness, curveDiameter ) {
      var leftSegmentNode = new Rectangle( 0, -thickness / 2, CircuitConstructionKitConstants.SWITCH_LENGTH * SWITCH_START, thickness, {
        fill: fill,
        stroke: 'black',
        lineWidth: type === 'schematic' ? 0 : 1
      } );

      // See the picture at https://github.com/phetsims/circuit-construction-kit-common/issues/313
      // This part has a curved notch that fits into the other segment
      var shape = new Shape()
        .moveTo( 0, thickness / 2 )
        .lineTo( CircuitConstructionKitConstants.SWITCH_LENGTH * SWITCH_START - curveDiameter, thickness / 2 )

        // similar to the notch below
        .lineTo( CircuitConstructionKitConstants.SWITCH_LENGTH * SWITCH_START - curveDiameter, 0 )
        .arc( CircuitConstructionKitConstants.SWITCH_LENGTH * SWITCH_START - curveDiameter / 2, 0, curveDiameter / 2, Math.PI, 0, false )
        .arc( CircuitConstructionKitConstants.SWITCH_LENGTH * SWITCH_START + curveDiameter / 2, 0, curveDiameter / 2, Math.PI, 0, true )
        .lineTo( CircuitConstructionKitConstants.SWITCH_LENGTH * SWITCH_START + curveDiameter, -thickness / 2 )

        .lineTo( 0, -thickness / 2 )
        .lineTo( 0, thickness / 2 );
      var rotatingSegmentNode = new Path( shape, {
        x: CircuitConstructionKitConstants.SWITCH_LENGTH * SWITCH_START,
        fill: fill,
        stroke: 'black',
        lineWidth: type === 'schematic' ? 0 : 1
      } );

      circuitSwitch.closedProperty.link( function( closed ) {
        rotatingSegmentNode.setRotation( closed ? 0 : -Math.PI / 4 );
      } );

      var rightSegmentShape = new Shape()
        .moveTo( CircuitConstructionKitConstants.SWITCH_LENGTH * SWITCH_END - curveDiameter, thickness / 2 )

        // similar to the notch above
        .lineTo( CircuitConstructionKitConstants.SWITCH_LENGTH * SWITCH_END - curveDiameter, 0 )
        .arc( CircuitConstructionKitConstants.SWITCH_LENGTH * SWITCH_END - curveDiameter / 2, 0, curveDiameter / 2, Math.PI, 0, false )
        .arc( CircuitConstructionKitConstants.SWITCH_LENGTH * SWITCH_END + curveDiameter / 2, 0, curveDiameter / 2, Math.PI, 0, true )
        .lineTo( CircuitConstructionKitConstants.SWITCH_LENGTH * SWITCH_END + curveDiameter, -thickness / 2 )

        .lineTo( CircuitConstructionKitConstants.SWITCH_LENGTH, -thickness / 2 )
        .lineTo( CircuitConstructionKitConstants.SWITCH_LENGTH, +thickness / 2 )
        .lineTo( CircuitConstructionKitConstants.SWITCH_LENGTH * SWITCH_END - curveDiameter, thickness / 2 );
      var rightSegmentNode = new Path( rightSegmentShape, { fill: fill, stroke: 'black', lineWidth: 1 } );

      var lifelikeHinge = new Circle( thickness * 0.6, {
        fill: '#a7a8ab',
        stroke: 'black',
        lineWidth: 4,
        x: CircuitConstructionKitConstants.SWITCH_LENGTH * SWITCH_START
      } );

      var node = new Node( {
        children: [ leftSegmentNode, rotatingSegmentNode, rightSegmentNode, lifelikeHinge ]
      } );

      if ( type === 'schematic' ) {
        node.addChild( new Circle( thickness * 0.6, {
          fill: 'black',
          stroke: 'black',
          lineWidth: 4,
          x: CircuitConstructionKitConstants.SWITCH_LENGTH * SWITCH_END
        } ) );
      }

      // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
      // And make it so clicking in the gap still toggles the switch
      node.mouseArea = node.bounds.copy();
      node.touchArea = node.bounds.copy();

      return node;
    };

    var lifelikeNodeThickness = 8;
    var lifelikeGradient = new LinearGradient( 0, -lifelikeNodeThickness / 2, 0, lifelikeNodeThickness / 2 )
      .addColorStop( 0, '#d48270' )
      .addColorStop( 0.3, '#e39b8c' )
      .addColorStop( 1, '#b56351' );
    var lifelikeNode = createNode( 'lifelike', lifelikeGradient, LIFELIKE_DIAMETER, 6 );
    var schematicNode = createNode( 'schematic', 'black', CircuitConstructionKitConstants.SCHEMATIC_LINE_WIDTH, 0 );// TODO: factor out thickness with WireNode

    FixedLengthCircuitElementNode.call( this,
      circuitConstructionKitScreenView,
      circuitNode,
      circuitSwitch,
      viewProperty,
      lifelikeNode,
      schematicNode,
      tandem,
      options
    );

    var downPoint = null;

    // When the user taps the switch, toggle whether it is open or closed.
    this.contentNode.addInputListener( new ButtonListener( {
      down: function( event ) {
        downPoint = event.pointer.point;
      },
      fire: function( event ) {
        var distance = event.pointer.point.distance( downPoint );

        // Toggle the state of the switch, but only if it wasn't dragged too far
        if ( distance < 15 ) { // TODO: there is another distance threshold somewhere in this codebase, should be factored out
          circuitSwitch.closedProperty.value = !circuitSwitch.closedProperty.value;
        }
      }
    } ) );
  }

  circuitConstructionKitCommon.register( 'SwitchNode', SwitchNode );

  return inherit( FixedLengthCircuitElementNode, SwitchNode );
} );