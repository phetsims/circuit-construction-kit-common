// Copyright 2016-2017, University of Colorado Boulder

/**
 * The user interface component with a single probe which reads current values from Wires (not from Vertex or
 * FixedLengthCircuitElement instances).
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
  var CircuitConstructionKitCommonUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonUtil' );
  var ProbeTextNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ProbeTextNode' );
  var ProbeWireNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ProbeWireNode' );
  var Vector2 = require( 'DOT/Vector2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Color = require( 'SCENERY/util/Color' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var ProbeNode = require( 'SCENERY_PHET/ProbeNode' );

  // images
  var ammeterBodyImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/ammeter-body.png' );

  // strings
  var currentString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/current' );
  var questionMarkString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/questionMark' );

  // constants
  // measurements for the cubic curve for the wire nodes
  var BODY_LEAD_Y = -30; // in model=view coordinates
  var PROBE_LEAD_Y = 15; // in model=view coordinates
  var HANDLE_WIDTH = 50;

  // overall scale factor for the body and probe
  var SCALE_FACTOR = 0.5;

  // unsigned measurements for the circles on the voltmeter body image, for where the probe wires connect
  var PROBE_CONNECTION_POINT_DY = 8;

  /**
   * @param {Ammeter} ammeter
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function AmmeterNode( ammeter, tandem, options ) {
    var self = this;
    options = _.extend( {

      // true if it will be used as a toolbox icon
      icon: false,

      // allowable drag bounds in view coordinates
      visibleBoundsProperty: null,

      // For some CCK Black Box modes, when the user makes a change, the results are hidden
      showResultsProperty: new BooleanProperty( true ),

      // For the black box study, there is a different current threshold in the readout
      blackBoxStudy: false
    }, options );

    // @public (read-only) {Ammeter} - the model associated with this view
    this.ammeter = ammeter;

    var wireNode = new ProbeWireNode( Color.BLACK, new Vector2( 0, BODY_LEAD_Y ), new Vector2( 0, PROBE_LEAD_Y ) );

    var currentReadoutProperty = new DerivedProperty( [ ammeter.currentProperty ], function( current ) {
      var max = options.blackBoxStudy ? 1E3 : 1E10;
      var maxString = options.blackBoxStudy ? '> 10^3' : '> 10^10'; //REVIEW*: Why is there a max (that is technically incorrect)?

      // Ammeters in this sim only show positive values, not direction (which is arbitrary anyways)
      return current === null ? questionMarkString :
             Math.abs( current ) > max ? maxString :
             CircuitConstructionKitCommonUtil.createCurrentReadout( current );
    } );

    var probeTextNode = new ProbeTextNode(
      currentReadoutProperty, options.showResultsProperty, currentString, tandem.createTandem( 'probeTextNode' ), {
        centerX: ammeterBodyImage.width / 2,
        centerY: ammeterBodyImage.height / 2
      } );

    var bodyNode = new Image( ammeterBodyImage, {
      scale: SCALE_FACTOR,
      cursor: 'pointer',
      children: [ probeTextNode ]
    } );

    // @public (read-only) {ProbeNode}
    this.probeNode = new ProbeNode( {
      cursor: 'pointer',
      sensorTypeFunction: ProbeNode.crosshairs(),
      scale: SCALE_FACTOR,
      handleWidth: HANDLE_WIDTH,
      color: '#2c2c2b', // The dark gray border
      innerRadius: 43,

      // Add a decoration on the handle to match the color scheme
      children: [
        new Rectangle( 0, 52, HANDLE_WIDTH * 0.72, 19, {
          cornerRadius: 6,
          centerX: 0,
          fill: '#e79547' // Match the orange of the ammeter image
        } )
      ]
    } );

    Node.call( this, {
      children: [ bodyNode, wireNode, this.probeNode ]
    } );

    // When the body position changes, update the body node and the wire
    ammeter.bodyPositionProperty.link( function( bodyPosition ) {
      bodyNode.centerTop = bodyPosition;
      wireNode.setBodyPosition( bodyNode.centerTop.plusXY( 0, PROBE_CONNECTION_POINT_DY ) );
      if ( ammeter.draggingProbesWithBodyProperty.get() ) {
        ammeter.probePositionProperty.set( bodyPosition.plusXY( 40, -80 ) );
      }
    } );

    // When the probe position changes, update the probe node and the wire
    ammeter.probePositionProperty.link( function( probePosition ) {
      self.probeNode.centerTop = probePosition;
      wireNode.setProbePosition( self.probeNode.centerBottom );
    } );

    if ( !options.icon ) {

      var probeDragHandler = new MovableDragHandler( ammeter.probePositionProperty, {
        tandem: tandem.createTandem( 'probeDragHandler' )
      } );

      // @public (read-only) {MovableDragHandler} - so events can be forwarded from the toolbox
      this.dragHandler = new MovableDragHandler( ammeter.bodyPositionProperty, {
        tandem: tandem.createTandem( 'dragHandler' ),
        endDrag: function() {
          ammeter.droppedEmitter.emit1( bodyNode.globalBounds );

          // After dropping in the play area the probes move independently of the body
          ammeter.draggingProbesWithBodyProperty.set( false );

          probeDragHandler.constrainToBounds();
        },

        // adds support for zoomed coordinate frame, see
        // https://github.com/phetsims/circuit-construction-kit-common/issues/301
        targetNode: self
      } );
      bodyNode.addInputListener( this.dragHandler );
      options.visibleBoundsProperty.link( function( visibleBounds ) {
        var erodedDragBounds = visibleBounds.eroded( CircuitConstructionKitCommonConstants.DRAG_BOUNDS_EROSION );
        self.dragHandler.dragBounds = erodedDragBounds;
        probeDragHandler.dragBounds = erodedDragBounds;
      } );
      this.probeNode.addInputListener( probeDragHandler );
    }
  }

  circuitConstructionKitCommon.register( 'AmmeterNode', AmmeterNode );

  return inherit( Node, AmmeterNode );
} );