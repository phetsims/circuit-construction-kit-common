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
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ButtonListener = require( 'SCENERY/input/ButtonListener' );

  // constants
  // dimensions for schematic battery
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

    // @public (read-only) - the Switch rendered by this Node
    this.circuitSwitch = circuitSwitch;

    /**
     * @param {string} type - 'lifelike'|'schematic'
     * @param {Color|string} fill
     * @param {number} thickness
     * @returns {Node}
     */
    var createNode = function( type, fill, thickness ) {
      var leftSegment = new Rectangle( 0, -thickness / 2, CircuitConstructionKitConstants.SWITCH_LENGTH / 3, thickness, {
        fill: fill,
        stroke: 'black',
        lineWidth: 1
      } );
      var midSegment = new Rectangle( 0, -thickness / 2, CircuitConstructionKitConstants.SWITCH_LENGTH / 3, thickness, {
        x: CircuitConstructionKitConstants.SWITCH_LENGTH / 3,
        fill: fill,
        stroke: 'black',
        lineWidth: 1
      } );

      circuitSwitch.closedProperty.link( function( closed ) {
        midSegment.setRotation( closed ? 0 : -Math.PI / 4 );
      } );
      var rightSegment = new Rectangle( CircuitConstructionKitConstants.SWITCH_LENGTH * 2 / 3, -thickness / 2, CircuitConstructionKitConstants.SWITCH_LENGTH / 3, thickness, {
        fill: fill,
        stroke: 'black',
        lineWidth: 1
      } );

      var lifelikeHinge = new Circle( thickness * 0.6, {
        fill: '#a7a8ab',
        stroke: 'black',
        lineWidth: 4,
        x: CircuitConstructionKitConstants.SWITCH_LENGTH / 3
      } );

      var node = new Node( {
        children: [ leftSegment, midSegment, rightSegment, lifelikeHinge ]
      } );

      if ( type === 'schematic' ) {
        node.addChild( new Circle( thickness * 0.6, {
          fill: 'black',
          stroke: 'black',
          lineWidth: 4,
          x: CircuitConstructionKitConstants.SWITCH_LENGTH * 2 / 3
        } ) );
      }

      // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
      // And make it so clicking in the gap still toggles the switch
      node.mouseArea = node.bounds.copy();
      node.touchArea = node.bounds.copy();

      return node;
    };

    var lifelikeNode = createNode( 'lifelike', '#d48270', LIFELIKE_DIAMETER );
    var schematicNode = createNode( 'schematic', 'black', 6 );// TODO: factor out thickness with WireNode

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
        if ( distance < 15 ) {
          circuitSwitch.closedProperty.value = !circuitSwitch.closedProperty.value;
        }
      }
    } ) );
  }

  circuitConstructionKitCommon.register( 'SwitchNode', SwitchNode );

  return inherit( FixedLengthCircuitElementNode, SwitchNode );
} );