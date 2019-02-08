// Copyright 2016-2017, University of Colorado Boulder

/**
 * Displays the Voltmeter, which has 2 probes and detects potential differences. Exists for the life of the sim and
 * hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const CCKCQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCQueryParameters' );
  const CCKCUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCUtil' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Color = require( 'SCENERY/util/Color' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const Image = require( 'SCENERY/nodes/Image' );
  const inherit = require( 'PHET_CORE/inherit' );
  const MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  const Node = require( 'SCENERY/nodes/Node' );
  const ProbeTextNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ProbeTextNode' );
  const ProbeWireNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ProbeWireNode' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const SolderNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SolderNode' );
  const Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );

  // images
  const blackProbe = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/probe-black.png' );
  const redProbe = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/probe-red.png' );
  const voltmeterBodyImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltmeter-body.png' );

  // strings
  const questionMarkString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/questionMark' );
  const voltageString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltage' );

  // constants
  const VOLTMETER_PROBE_TIP_LENGTH = 20; // The probe tip is about 20 view coordinates tall
  const VOLTMETER_NUMBER_SAMPLE_POINTS = 10; // Number of points along the edge of the voltmeter tip to detect voltages

  // measurements for the cubic curve for the wire nodes
  const BODY_WIRE_LEAD_X = 45;
  const BODY_LEAD_Y = 15;
  const PROBE_LEAD_X = 0;
  const PROBE_LEAD_Y = 60;
  const PROBE_CONTROL_POINT_X = 20;

  // unsigned measurements for the circles on the voltmeter body image, for where the probe wires connect
  const PROBE_CONNECTION_POINT_DY = -18;
  const PROBE_CONNECTION_POINT_DX = 8;

  const SCALE = 0.5; // overall scale factor for the nodes
  const PROBE_SCALE = 0.67 * SCALE; // multiplied by the SCALE above
  const PROBE_ANGLE = 22 * Math.PI * 2 / 360;

  /**
   * @param {Voltmeter} voltmeter - the model Voltmeter to be shown by this node
   * @param {CircuitConstructionKitModel} model
   * @param {CircuitLayerNode} circuitLayerNode
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function VoltmeterNode( voltmeter, model, circuitLayerNode, tandem, options ) {
    this.circuitLayerNode = circuitLayerNode;
    options = _.extend( {

      // Whether this will be used as an icon or not.
      isIcon: false,

      // Draggable bounds
      visibleBoundsProperty: null,

      // Whether values can be displayed (hidden after user makes a change in some Black Box modes).
      showResultsProperty: new BooleanProperty( true )
    }, options );

    // @public (read-only) {Voltmeter} - the model
    this.voltmeter = voltmeter;

    // @public (read-only) {Rectangle} - the red probe node
    this.redProbeNode = new Rectangle( -2, -2, 4, 4, { // the hit area
      fill: CCKCQueryParameters.showVoltmeterSamplePoints ? Color.RED : null,
      cursor: 'pointer',
      children: [ new Image( redProbe, {
        scale: PROBE_SCALE,
        rotation: PROBE_ANGLE,

        // Determined empirically by showing the probe hot spot and zooming in by a factor of 2 in
        // CircuitConstructionKitModel.  Will need to change if PROBE_ANGLE changes
        x: -9.5,
        y: -5
      } ) ]
    } );

    // @public (read-only) {Rectangle} - the black probe node
    this.blackProbeNode = new Rectangle( -2, -2, 4, 4, { // the hit area
      fill: CCKCQueryParameters.showVoltmeterSamplePoints ? Color.BLACK : null,
      cursor: 'pointer',
      children: [ new Image( blackProbe, {
        scale: PROBE_SCALE,
        rotation: -PROBE_ANGLE,

        // Determined empirically by showing the probe hot spot and zooming in by a factor of 2 in
        // CircuitConstructionKitModel.  Will need to change if PROBE_ANGLE changes
        x: -11,
        y: +4
      } ) ]
    } );

    // Displays the voltage reading
    const voltageReadoutProperty = new DerivedProperty( [ voltmeter.voltageProperty ], voltage =>
      voltage === null ? questionMarkString : CCKCUtil.createVoltageReadout( voltage )
    );

    const probeTextNode = new ProbeTextNode(
      voltageReadoutProperty, options.showResultsProperty, voltageString, tandem.createTandem( 'probeTextNode' ), {
        centerX: voltmeterBodyImage[ 0 ].width / 2,
        centerY: voltmeterBodyImage[ 0 ].height / 2
      } );

    const bodyNode = new Image( voltmeterBodyImage, {
      scale: SCALE,
      cursor: 'pointer',
      children: [ probeTextNode ]
    } );

    const redWireNode = new ProbeWireNode(
      Color.RED, new Vector2( -BODY_WIRE_LEAD_X, BODY_LEAD_Y ), new Vector2( PROBE_LEAD_X - PROBE_CONTROL_POINT_X, PROBE_LEAD_Y )
    );
    const blackWireNode = new ProbeWireNode(
      Color.BLACK, new Vector2( BODY_WIRE_LEAD_X, BODY_LEAD_Y ), new Vector2( PROBE_LEAD_X + PROBE_CONTROL_POINT_X, PROBE_LEAD_Y )
    );

    // When the voltmeter body moves, update the node and wires
    voltmeter.bodyPositionProperty.link( bodyPosition => {

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
        const probeY = -30 - bodyNode.height / 2;
        const probeOffsetX = 78;
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
    const probeMovedCallback = ( probeNode, wireNode, sign ) => {
      return probePosition => {
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
    if ( !options.isIcon ) {

      // Show the voltmeter when icon dragged out of the toolbox
      voltmeter.visibleProperty.linkAttribute( this, 'visible' );

      /**
       * Gets a drag handler for one of the probes.
       * @param {Property.<Vector2>} positionProperty
       * @param {Tandem} tandem
       * @returns {MovableDragHandler}
       */
      const getProbeDragHandler = ( positionProperty, tandem ) => {
        const probeDragHandler = new MovableDragHandler( positionProperty, {
          tandem: tandem.createTandem( 'redProbeDragHandler' )
        } );
        options.visibleBoundsProperty.link( visibleBounds => {
          probeDragHandler.dragBounds = visibleBounds.eroded( CCKCConstants.DRAG_BOUNDS_EROSION );
        } );
        return probeDragHandler;
      };

      const redProbeDragHandler = getProbeDragHandler( voltmeter.redProbePositionProperty, tandem.createTandem( 'redProbeDragHandler' ) );
      const blackProbeDragHandler = getProbeDragHandler( voltmeter.blackProbePositionProperty, tandem.createTandem( 'blackProbeDragHandler' ) );

      this.redProbeNode.addInputListener( redProbeDragHandler );
      this.blackProbeNode.addInputListener( blackProbeDragHandler );

      // @public (read-only) {MovableDragHandler} - so events can be forwarded from the toolbox
      this.dragHandler = new MovableDragHandler( voltmeter.bodyPositionProperty, {
        tandem: tandem.createTandem( 'dragHandler' ),
        endDrag: () => {
          voltmeter.droppedEmitter.emit1( bodyNode.globalBounds );

          // After dropping in the play area the probes move independently of the body
          voltmeter.draggingProbesWithBodyProperty.set( false );

          redProbeDragHandler.constrainToBounds();
          blackProbeDragHandler.constrainToBounds();
        },

        // use this to do something every time drag is called, such as notify that a user has modified the position
        onDrag: event => {},

        // adds support for zoomed coordinate frame, see
        // https://github.com/phetsims/circuit-construction-kit-common/issues/301
        targetNode: this
      } );
      options.visibleBoundsProperty.link( visibleBounds => {
        this.dragHandler.dragBounds = visibleBounds.eroded( CCKCConstants.DRAG_BOUNDS_EROSION );
      } );
      bodyNode.addInputListener( this.dragHandler );

      /**
       * Starting at the tip, iterate down over several samples and return the first hit, if any.
       * @param {Node} probeNode
       * @param {Vector2} probeTip
       * @param {number} sign - the direction the probe is rotated
       * @returns {VoltageConnection|null} if connected returns VoltageConnection otherwise null
       */
      const findVoltageConnection = ( probeNode, probeTip, sign ) => {
        const probeTipVector = Vector2.createPolar( VOLTMETER_PROBE_TIP_LENGTH, sign * VoltmeterNode.PROBE_ANGLE + Math.PI / 2 );
        const probeTipTail = probeTip.plus( probeTipVector );
        for ( let i = 0; i < VOLTMETER_NUMBER_SAMPLE_POINTS; i++ ) {
          const samplePoint = probeTip.blend( probeTipTail, i / VOLTMETER_NUMBER_SAMPLE_POINTS );
          const voltageConnection = this.getVoltageConnection( probeNode, samplePoint );

          // For debugging, depict the points where the sampling happens
          if ( CCKCQueryParameters.showVoltmeterSamplePoints ) {

            // Note, these get erased when changing between lifelike/schematic
            this.circuitLayerNode.addChild( new Rectangle( -1, -1, 2, 2, {
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
      const updateVoltmeter = () => {
        if ( voltmeter.visibleProperty.get() ) {
          const redConnection = findVoltageConnection(
            this.redProbeNode, this.voltmeter.redProbePositionProperty.get(), +1
          );
          const blackConnection = findVoltageConnection(
            this.blackProbeNode, this.voltmeter.blackProbePositionProperty.get(), -1
          );

          if ( redConnection === null || blackConnection === null ) {
            voltmeter.voltageProperty.set( null );
          }
          else if ( !model.circuit.areVerticesElectricallyConnected( redConnection.vertex, blackConnection.vertex ) ) {

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

    // When rendered as an icon, the touch area should span the bounds (no gaps between probes and body)
    if ( options.isIcon ) {
      this.touchArea = this.bounds.copy();
      this.mouseArea = this.bounds.copy();
      this.cursor = 'pointer';
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

      const circuitElementNodes = this.circuitLayerNode.circuit.circuitElements.getArray()
        .filter( filter )
        .map( circuitElement => this.circuitLayerNode.getCircuitElementNode( circuitElement ) );

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
      const solderNodes = _.values( this.circuitLayerNode.solderNodes );
      const hitSolderNode = _.find( solderNodes, solderNode => {
        const position = solderNode.vertex.positionProperty.get();
        return probePosition.distance( position ) <= SolderNode.SOLDER_RADIUS;
      } );
      if ( hitSolderNode ) {
        return new VoltageConnection( hitSolderNode.vertex, hitSolderNode.vertex.voltageProperty.get() );
      }

      // Check for intersection with a metallic circuit element, which can provide voltmeter readings
      const metallicCircuitElement = this.hitCircuitElementNode( probePosition, circuitElement => circuitElement.isMetallic );
      if ( metallicCircuitElement ) {

        const startPoint = metallicCircuitElement.circuitElement.startPositionProperty.get();
        const endPoint = metallicCircuitElement.circuitElement.endPositionProperty.get();
        const segmentVector = endPoint.minus( startPoint );
        const probeVector = probeNode.centerTop.minus( startPoint );
        let distanceAlongSegment = segmentVector.magnitude() === 0 ? 0 : ( probeVector.dot( segmentVector ) /
                                                                           segmentVector.magnitudeSquared() );
        distanceAlongSegment = Util.clamp( distanceAlongSegment, 0, 1 );

        const voltageAlongWire = Util.linear( 0, 1,
          metallicCircuitElement.circuitElement.startVertexProperty.get().voltageProperty.get(),
          metallicCircuitElement.circuitElement.endVertexProperty.get().voltageProperty.get(),
          distanceAlongSegment
        );

        return new VoltageConnection( metallicCircuitElement.circuitElement.startVertexProperty.get(), voltageAlongWire );
      }
      else {

        // check for intersection with switch node
        const switchNode = this.hitCircuitElementNode( probePosition, circuitElement => circuitElement instanceof Switch );
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
