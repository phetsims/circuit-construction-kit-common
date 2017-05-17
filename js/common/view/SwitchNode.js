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
  var FixedLengthCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/FixedLengthCircuitElementNode' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );

  // constants
  // dimensions for schematic battery
  var SMALL_TERMINAL_WIDTH = 50;
  var LARGE_TERMINAL_WIDTH = 104;
  var WIDTH = 188;
  var GAP = 33;
  var LEFT_JUNCTION = WIDTH / 2 - GAP / 2;
  var RIGHT_JUNCTION = WIDTH / 2 + GAP / 2;
  var LIFELIKE_DIAMETER = 16;

  /**
   * @param {CircuitConstructionKitScreenView} circuitConstructionKitScreenView
   * @param {CircuitNode} circuitNode
   * @param {Switch} circuitSwitch
   * @param {Property.<boolean>} runningProperty - supplied for consistency with other CircuitElementNode constructors
   * @param {Property.<string>} viewProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function SwitchNode( circuitConstructionKitScreenView, circuitNode, circuitSwitch, runningProperty, viewProperty, tandem, options ) {

    options = options || {};
    options.centerChildren = false;

    // @public (read-only) - the Switch rendered by this Node
    this.circuitSwitch = circuitSwitch;

    var leftSegment = new Rectangle( 0, -LIFELIKE_DIAMETER / 2, CircuitConstructionKitConstants.SWITCH_LENGTH / 3, LIFELIKE_DIAMETER, {
      fill: '#d48270',
      stroke: 'black',
      lineWidth: 1
    } );
    var midSegment = new Rectangle( 0, -LIFELIKE_DIAMETER / 2, CircuitConstructionKitConstants.SWITCH_LENGTH / 3, LIFELIKE_DIAMETER, {
      x: CircuitConstructionKitConstants.SWITCH_LENGTH / 3,
      fill: '#d48270',
      stroke: 'black',
      lineWidth: 1
    } );

    circuitSwitch.closedProperty.link( function( closed ) {
      midSegment.setRotation( closed ? 0 : -Math.PI / 4 );
    } );
    var rightSegment = new Rectangle( CircuitConstructionKitConstants.SWITCH_LENGTH * 2 / 3, -LIFELIKE_DIAMETER / 2, CircuitConstructionKitConstants.SWITCH_LENGTH / 3, LIFELIKE_DIAMETER, {
      fill: '#d48270',
      stroke: 'black',
      lineWidth: 1
    } );

    var lifelikeHinge = new Circle( LIFELIKE_DIAMETER / 2, {
      fill: '#a7a8ab',
      stroke: 'black',
      lineWidth: 4,
      x: CircuitConstructionKitConstants.SWITCH_LENGTH / 3
    } );
    var lifelikeNode = new Node( {
      children: [ leftSegment, midSegment, rightSegment, lifelikeHinge ]
    } );

    // Points sampled using Photoshop from a raster of the IEEE icon seen at
    // https://upload.wikimedia.org/wikipedia/commons/c/cb/Circuit_elements.svg
    var schematicShape = new Shape()
      .moveTo( 0, 0 ) // left wire
      .lineTo( LEFT_JUNCTION, 0 )
      .moveTo( LEFT_JUNCTION, SMALL_TERMINAL_WIDTH / 2 ) // left plate
      .lineTo( LEFT_JUNCTION, -SMALL_TERMINAL_WIDTH / 2 )
      .moveTo( RIGHT_JUNCTION, 0 ) // right wire
      .lineTo( WIDTH, 0 )
      .moveTo( RIGHT_JUNCTION, LARGE_TERMINAL_WIDTH / 2 ) // right plate
      .lineTo( RIGHT_JUNCTION, -LARGE_TERMINAL_WIDTH / 2 );
    var schematicWidth = schematicShape.bounds.width;
    var desiredWidth = lifelikeNode.width;
    var schematicScale = desiredWidth / schematicWidth;

    // Align vertically
    schematicShape = schematicShape.transformed( Matrix3.translation( 0, lifelikeNode.height / 2 + 7 ) );

    // Scale to fit the correct width
    schematicShape = schematicShape.transformed( Matrix3.scale( schematicScale, schematicScale ) );
    var schematicNode = new Path( schematicShape, {
      stroke: 'black',
      lineWidth: 4
    } );

    // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
    schematicNode.mouseArea = schematicNode.bounds.copy();
    schematicNode.touchArea = schematicNode.bounds.copy();

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

    // When the user taps the switch, toggle whether it is open or closed.
    this.contentNode.addInputListener( new ButtonListener( {
      fire: function() {
        circuitSwitch.closedProperty.value = !circuitSwitch.closedProperty.value;
      }
    } ) );
  }

  circuitConstructionKitCommon.register( 'SwitchNode', SwitchNode );

  return inherit( FixedLengthCircuitElementNode, SwitchNode );
} );