// Copyright 2016-2017, University of Colorado Boulder

/**
 * Displays the Voltmeter, which has 2 probes and detects potential differences.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var CircuitConstructionKitCommonQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonQueryParameters' );
  var CircuitConstructionKitCommonUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonUtil' );
  var ProbeTextNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ProbeTextNode' );
  var ProbeWireNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ProbeWireNode' );
  var Vector2 = require( 'DOT/Vector2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );

  // images
  var blackProbe = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/probe-black.png' );
  var redProbe = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/probe-red.png' );
  var voltmeterBodyImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltmeter-body.png' );

  // strings
  var questionMarkString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/questionMark' );
  var voltageString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltage' );

  // constants

  // measurements for the cubic curve for the wire nodes
  var BODY_WIRE_LEAD_X = 45;
  var BODY_LEAD_Y = 15;
  var PROBE_LEAD_X = 0;
  var PROBE_LEAD_Y = 60;
  var PROBE_CONTROL_POINT_X = 20;

  // unsigned measurements for the circles on the voltmeter body image, for where the probe wires connect
  var PROBE_CONNECTION_POINT_DY = -18;
  var PROBE_CONNECTION_POINT_DX = 8;

  var SCALE = 0.5; // overall scale factor for the nodes
  var PROBE_SCALE = 0.67 * SCALE; // multiplied by the SCALE above
  var PROBE_ANGLE = 22 * Math.PI * 2 / 360;

  /**
   * @param {Voltmeter} voltmeter - the model Voltmeter to be shown by this node
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function VoltmeterNode( voltmeter, tandem, options ) {
    var self = this;
    options = _.extend( {

      // Whether this will be used as an icon or not.
      icon: false,

      // Draggable bounds
      visibleBoundsProperty: null,

      // Whether values can be displayed (hidden after user makes a change in some Black Box modes).
      showResultsProperty: new BooleanProperty( true )
    }, options );

    // @public (read-only) {Voltmeter} - the model
    this.voltmeter = voltmeter;

    // @public (read-only) {Image} - the red probe node
    this.redProbeNode = new Rectangle( -2, -2, 4, 4, {
      fill: CircuitConstructionKitCommonQueryParameters.showVoltmeterSamplePoints ? 'red' : null,
      cursor: 'pointer'
    } );
    this.redProbeNode.addChild( new Image( redProbe, {
      scale: PROBE_SCALE,
      rotation: PROBE_ANGLE,

      // Determined empirically by showing the probe hot spot and zooming in by a factor of 2 in
      // CircuitConstructionKitModel.  Will need to change if PROBE_ANGLE changes
      x: -9.5,
      y: -5
    } ) );

    // @public (read-only) {Image} - the black probe node
    this.blackProbeNode = new Rectangle( -2, -2, 4, 4, {
      fill: CircuitConstructionKitCommonQueryParameters.showVoltmeterSamplePoints ? 'black' : null,
      cursor: 'pointer'
    } );
    this.blackProbeNode.addChild( new Image( blackProbe, {
      scale: PROBE_SCALE,
      rotation: -PROBE_ANGLE,

      // Determined empirically by showing the probe hot spot and zooming in by a factor of 2 in
      // CircuitConstructionKitModel.  Will need to change if PROBE_ANGLE changes
      x: -11,
      y: +4
    } ) );

    // Displays the voltage reading
    var voltageReadoutProperty = new DerivedProperty( [ voltmeter.voltageProperty ], function( voltage ) {
      return voltage === null ? questionMarkString : CircuitConstructionKitCommonUtil.createVoltageReadout( voltage );
    } );

    var probeTextNode = new ProbeTextNode(
      voltageReadoutProperty, options.showResultsProperty, voltageString, tandem.createTandem( 'probeTextNode' ), {
        centerX: voltmeterBodyImage[ 0 ].width / 2,
        centerY: voltmeterBodyImage[ 0 ].height / 2
      } );

    var bodyNode = new Image( voltmeterBodyImage, {
      scale: SCALE,
      cursor: 'pointer',
      children: [ probeTextNode ]
    } );

    var redWireNode = new ProbeWireNode(
      'red', new Vector2( -BODY_WIRE_LEAD_X, BODY_LEAD_Y ), new Vector2( PROBE_LEAD_X - PROBE_CONTROL_POINT_X, PROBE_LEAD_Y )
    );
    var blackWireNode = new ProbeWireNode(
      'black', new Vector2( BODY_WIRE_LEAD_X, BODY_LEAD_Y ), new Vector2( PROBE_LEAD_X + PROBE_CONTROL_POINT_X, PROBE_LEAD_Y )
    );

    // When the voltmeter body moves, update the node and wires
    voltmeter.bodyPositionProperty.link( function( bodyPosition ) {

      // Drag the body by the center
      bodyNode.center = bodyPosition;

      redWireNode.setBodyPosition(
        bodyNode.centerBottom.plusXY( -PROBE_CONNECTION_POINT_DX, PROBE_CONNECTION_POINT_DY )
      );
      blackWireNode.setBodyPosition(
        bodyNode.centerBottom.plusXY( PROBE_CONNECTION_POINT_DX, PROBE_CONNECTION_POINT_DY )
      );

      // When dragging out of the toolbox, the probes move with the body
      if ( voltmeter.draggingProbesWithBodyProperty.get() ) {
        var probeY = -30 - bodyNode.height / 2;
        var probeOffsetX = 78;
        voltmeter.redProbePositionProperty.set( bodyPosition.plusXY( -probeOffsetX, probeY ) );
        voltmeter.blackProbePositionProperty.set( bodyPosition.plusXY( +probeOffsetX, probeY ) );
      }
    } );

    /**
     * Creates listeners for the link function to update the probe node and wire when probe position changes.
     * @param {Node} probeNode
     * @param {ProbeWireNode} wireNode
     * @param {number} sign
     * @returns {function}
     */
    var probeMovedCallback = function( probeNode, wireNode, sign ) {
      return function( probePosition ) {
        probeNode.translation = probePosition;

        // Sampled manually, will need to change if probe angle changes
        wireNode.setProbePosition( probeNode.centerBottom.plusXY( -32 * sign, -4 ) );
      };
    };

    // When the probe moves, update the node and wire
    voltmeter.redProbePositionProperty.link( probeMovedCallback( this.redProbeNode, redWireNode, +1 ) );
    voltmeter.blackProbePositionProperty.link( probeMovedCallback( this.blackProbeNode, blackWireNode, -1 ) );

    Node.call( this, {
      pickable: true,
      children: [
        bodyNode,

        redWireNode,
        this.redProbeNode,

        blackWireNode,
        this.blackProbeNode
      ]
    } );

    // For the real version (not the icon), add drag listeners.
    if ( !options.icon ) {

      /**
       * Gets a drag handler for one of the probes.
       * @param {Property.<Vector2>} positionProperty
       * @param {Tandem} tandem
       * @returns {MovableDragHandler}
       */
      var getProbeDragHandler = function( positionProperty, tandem ) {
        var probeDragHandler = new MovableDragHandler( positionProperty, {
          tandem: tandem.createTandem( 'redProbeDragHandler' )
        } );
        options.visibleBoundsProperty.link( function( visibleBounds ) {
          probeDragHandler.dragBounds = visibleBounds.eroded( CircuitConstructionKitCommonConstants.DRAG_BOUNDS_EROSION );
        } );
        return probeDragHandler;
      };

      var redProbeDragHandler = getProbeDragHandler( voltmeter.redProbePositionProperty, tandem.createTandem( 'redProbeDragHandler' ) );
      var blackProbeDragHandler = getProbeDragHandler( voltmeter.blackProbePositionProperty, tandem.createTandem( 'blackProbeDragHandler' ) );

      this.redProbeNode.addInputListener( redProbeDragHandler );
      this.blackProbeNode.addInputListener( blackProbeDragHandler );

      // @public (read-only) {MovableDragHandler} - so events can be forwarded from the toolbox
      this.dragHandler = new MovableDragHandler( voltmeter.bodyPositionProperty, {
        tandem: tandem.createTandem( 'dragHandler' ),
        endDrag: function() {
          voltmeter.droppedEmitter.emit1( bodyNode.globalBounds );

          // After dropping in the play area the probes move independently of the body
          voltmeter.draggingProbesWithBodyProperty.set( false );

          redProbeDragHandler.constrainToBounds();
          blackProbeDragHandler.constrainToBounds()
        },

        // use this to do something every time drag is called, such as notify that a user has modified the position
        onDrag: function( event ) {},

        // adds support for zoomed coordinate frame, see
        // https://github.com/phetsims/circuit-construction-kit-common/issues/301
        targetNode: self
      } );
      options.visibleBoundsProperty.link( function( visibleBounds ) {
        self.dragHandler.dragBounds = visibleBounds.eroded( CircuitConstructionKitCommonConstants.DRAG_BOUNDS_EROSION );
      } );
      bodyNode.addInputListener( this.dragHandler );
    }
  }

  circuitConstructionKitCommon.register( 'VoltmeterNode', VoltmeterNode );

  return inherit( Node, VoltmeterNode, {}, {
    PROBE_ANGLE: PROBE_ANGLE
  } );
} );
