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
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  var Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );
  var ProbeTextNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ProbeTextNode' );
  var ProbeWireNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ProbeWireNode' );
  var SolderNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SolderNode' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Color = require( 'SCENERY/util/Color' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );

  // images
  var blackProbe = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/probe-black.png' );
  var redProbe = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/probe-red.png' );
  var voltmeterBodyImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltmeter-body.png' );

  // strings
  var questionMarkString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/questionMark' );
  var voltageString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltage' );

  // constants
  var VOLTMETER_PROBE_TIP_LENGTH = 20; // The probe tip is about 20 view coordinates tall
  var VOLTMETER_NUMBER_SAMPLE_POINTS = 10; // Number of points along the edge of the voltmeter tip to detect voltages

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
   * @param {CircuitConstructionKitModel} model
   * @param {CircuitLayerNode} circuitLayerNode TODO: reduce parameters?
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function VoltmeterNode( voltmeter, model, circuitLayerNode, tandem, options ) {
    var self = this;
    this.circuitLayerNode = circuitLayerNode;
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
      fill: CircuitConstructionKitCommonQueryParameters.showVoltmeterSamplePoints ? Color.RED : null,
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
      fill: CircuitConstructionKitCommonQueryParameters.showVoltmeterSamplePoints ? Color.BLACK : null,
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
      Color.RED, new Vector2( -BODY_WIRE_LEAD_X, BODY_LEAD_Y ), new Vector2( PROBE_LEAD_X - PROBE_CONTROL_POINT_X, PROBE_LEAD_Y )
    );
    var blackWireNode = new ProbeWireNode(
      Color.BLACK, new Vector2( BODY_WIRE_LEAD_X, BODY_LEAD_Y ), new Vector2( PROBE_LEAD_X + PROBE_CONTROL_POINT_X, PROBE_LEAD_Y )
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

    // For the real version (not the icon), add drag listeners and update visibility
    if ( !options.icon ) {

      // Show the voltmeter when icon dragged out of the toolbox
      voltmeter.visibleProperty.linkAttribute( this, 'visible' );

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
          blackProbeDragHandler.constrainToBounds();
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

      /**
       * Starting at the tip, iterate down over several samples and return the first hit, if any.
       * @param {Node} probeNode
       * @param {Vector2} probeTip
       * @param {number} sign - the direction the probe is rotated
       * @returns {VoltageConnection|null} if connected returns VoltageConnection otherwise null
       */
      var findVoltageConnection = function( probeNode, probeTip, sign ) {
        var probeTipVector = Vector2.createPolar( VOLTMETER_PROBE_TIP_LENGTH, sign * VoltmeterNode.PROBE_ANGLE + Math.PI / 2 );
        var probeTipTail = probeTip.plus( probeTipVector );
        for ( var i = 0; i < VOLTMETER_NUMBER_SAMPLE_POINTS; i++ ) {
          var samplePoint = probeTip.blend( probeTipTail, i / VOLTMETER_NUMBER_SAMPLE_POINTS );
          var voltageConnection = self.getVoltageConnection( probeNode, samplePoint );

          // For debugging, depict the points where the sampling happens
          if ( CircuitConstructionKitCommonQueryParameters.showVoltmeterSamplePoints ) {

            // Note, these get erased when changing between lifelike/schematic
            self.circuitLayerNode.addChild( new Rectangle( -1, -1, 2, 2, {
              fill: Color.BLACK,
              translation: samplePoint
            } ) );
          }
          if ( voltageConnection ) {
            return voltageConnection;
          }
        }
        return null;
      };

      /**
       * Detection for voltmeter probe + circuit intersection is done in the view since view bounds are used
       */
      var updateVoltmeter = function() {
        if ( voltmeter.visibleProperty.get() ) {
          var redConnection = findVoltageConnection(
            self.redProbeNode, self.voltmeter.redProbePositionProperty.get(), +1
          );
          var blackConnection = findVoltageConnection(
            self.blackProbeNode, self.voltmeter.blackProbePositionProperty.get(), -1
          );

          if ( redConnection === null || blackConnection === null ) {
            voltmeter.voltageProperty.set( null );
          }
          else if ( !model.circuit.areVerticesElectricallyConnected(
              redConnection.vertex, blackConnection.vertex
            ) ) {

            // Voltmeter probes each hit things but they were not connected to each other through the circuit.
            voltmeter.voltageProperty.set( null );
          }
          else if ( redConnection !== null && redConnection.vertex.insideTrueBlackBoxProperty.get() && !model.revealingProperty.get() ) {

            // Cannot read values inside the black box, unless "reveal" is being pressed
            voltmeter.voltageProperty.set( null );
          }
          else if ( blackConnection !== null && blackConnection.vertex.insideTrueBlackBoxProperty.get() && !model.revealingProperty.get() ) {

            // Cannot read values inside the black box, unless "reveal" is being pressed
            voltmeter.voltageProperty.set( null );
          }
          else {
            voltmeter.voltageProperty.set( redConnection.voltage - blackConnection.voltage );
          }
        }
      };
      model.circuit.circuitChangedEmitter.addListener( updateVoltmeter );
      voltmeter.redProbePositionProperty.link( updateVoltmeter );
      voltmeter.blackProbePositionProperty.link( updateVoltmeter );
    }
  }

  circuitConstructionKitCommon.register( 'VoltmeterNode', VoltmeterNode );

  return inherit( Node, VoltmeterNode, {

    /**
     * Check for an intersection between a probeNode and a wire, return null if no hits.
     * @param {Vector2} position to hit test
     * @param {function} filter - CircuitElement=>boolean the rule to use for checking circuit elements
     * @returns {CircuitElementNode|null}
     * @public
     */
    hitCircuitElementNode: function( position, filter ) {
      var self = this;

      var circuitElementNodes = this.circuitLayerNode.circuit.circuitElements.getArray()
        .filter( filter )
        .map( function( circuitElement ) {
          return self.circuitLayerNode.getCircuitElementNode( circuitElement );
        } );

      // Search from the front to the back, because frontmost objects look like they are hitting the sensor, see #143
      for ( var i = circuitElementNodes.length - 1; i >= 0; i-- ) {
        var circuitElementNode = circuitElementNodes[ i ];

        // If this code got called before the WireNode has been created, skip it (the Voltmeter hit tests nodes)
        if ( !circuitElementNode ) {
          continue;
        }

        // Don't connect to wires in the black box
        var revealing = true;
        var trueBlackBox = circuitElementNode.circuitElement.insideTrueBlackBoxProperty.get();
        if ( trueBlackBox ) {
          revealing = this.model.revealingProperty.get();
        }

        if ( revealing && circuitElementNode.containsSensorPoint( position ) ) {
          return circuitElementNode;
        }
      }
      return null;
    },

    /**
     * Find where the voltmeter probe node intersects the wire, for computing the voltage difference
     * @param {Node} probeNode - the probe node from the VoltmeterNode, to get its position
     * @param {Vector2} probePosition
     * @returns {VoltageConnection|null} if connected returns VoltageConnection otherwise null
     * @private
     */
    getVoltageConnection: function( probeNode, probePosition ) {

      // Check for intersection with a vertex, using the solder radius.  This means it will be possible to check for
      // voltages when nearby the terminal of a battery, not necessarily touching the battery (even when solder is
      // not shown, this is desirable so that students have a higher chance of getting the desirable reading).
      // When solder is shown, it is used as the conductive element for the voltmeter (and hence why the solder radius
      // is used in the computation below.
      var solderNodes = _.values( this.circuitLayerNode.solderNodes );
      var hitSolderNode = _.find( solderNodes, function( solderNode ) {
        var position = solderNode.vertex.positionProperty.get();
        return probePosition.distance( position ) <= SolderNode.SOLDER_RADIUS;
      } );
      if ( hitSolderNode ) {
        return new VoltageConnection( hitSolderNode.vertex, hitSolderNode.vertex.voltageProperty.get() );
      }

      // Check for intersection with a metallic circuit element, which can provide voltmeter readings
      var metallicCircuitElement = this.hitCircuitElementNode( probePosition, function( circuitElement ) {
        return circuitElement.isMetallic;
      } );
      if ( metallicCircuitElement ) {

        var startPoint = metallicCircuitElement.circuitElement.startPositionProperty.get();
        var endPoint = metallicCircuitElement.circuitElement.endPositionProperty.get();
        var segmentVector = endPoint.minus( startPoint );
        var probeVector = probeNode.centerTop.minus( startPoint );

        //REVIEW*: Divide by segmentVector.magnitudeSquared() instead?
        var distanceAlongSegment = segmentVector.magnitude() === 0 ? 0 : ( probeVector.dot( segmentVector ) /
                                                                           segmentVector.magnitude() /
                                                                           segmentVector.magnitude() );
        distanceAlongSegment = Util.clamp( distanceAlongSegment, 0, 1 );

        //REVIEW*: This was just clamped, not sure an assertion is needed (don't feel strongly)
        assert && assert( distanceAlongSegment >= 0 && distanceAlongSegment <= 1, 'beyond the end of the wire' );
        var voltageAlongWire = Util.linear(
          0,
          1,
          metallicCircuitElement.circuitElement.startVertexProperty.get().voltageProperty.get(),
          metallicCircuitElement.circuitElement.endVertexProperty.get().voltageProperty.get(),
          distanceAlongSegment
        );

        return new VoltageConnection( metallicCircuitElement.circuitElement.startVertexProperty.get(), voltageAlongWire );
      }
      else {

        // check for intersection with switch node
        var switchNode = this.hitCircuitElementNode( probePosition, function( circuitElement ) {
          return circuitElement instanceof Switch;
        } );
        if ( switchNode ) {

          // address closed switch.  Find out whether the probe was near the start or end vertex
          if ( switchNode.startSideContainsSensorPoint( probePosition ) ) {

            return new VoltageConnection(
              switchNode.circuitSwitch.startVertexProperty.get(),
              switchNode.circuitSwitch.startVertexProperty.get().voltageProperty.get()
            );
          }
          else if ( switchNode.endSideContainsSensorPoint( probePosition ) ) {
            return new VoltageConnection(
              switchNode.circuitSwitch.endVertexProperty.get(),
              switchNode.circuitSwitch.endVertexProperty.get().voltageProperty.get()
            );
          }
        }
        return null;
      }
    }
  }, {
    PROBE_ANGLE: PROBE_ANGLE
  } );

  /**
   * Indicates a vertex and a voltage measurement at the given vertex.
   * @param {Vertex} vertex
   * @param {number} voltage
   * @constructor
   */
  function VoltageConnection( vertex, voltage ) {
    this.vertex = vertex;
    this.voltage = voltage;
  }
} );
