// Copyright 2016-2017, University of Colorado Boulder

/**
 * The user interface component with a single probe which reads current values from Wires (not from Vertex or
 * FixedCircuitElement instances). Exists for the life of the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  var CCKCUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCUtil' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementNode' );
  var Color = require( 'SCENERY/util/Color' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ProbeNode = require( 'SCENERY_PHET/ProbeNode' );
  var ProbeTextNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ProbeTextNode' );
  var ProbeWireNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ProbeWireNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Vector2 = require( 'DOT/Vector2' );

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
   * @param {CircuitLayerNode|null} circuitLayerNode - for getting the currents, or null if rendering an icon
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function AmmeterNode( ammeter, circuitLayerNode, tandem, options ) {
    var self = this;
    this.circuitLayerNode = circuitLayerNode;
    options = _.extend( {

      // true if it will be used as a toolbox icon
      isIcon: false,

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
      var maxString = options.blackBoxStudy ? '> 10^3' : '> 10^10';

      // Ammeters in this sim only show positive values, not direction (which is arbitrary anyways)
      return current === null ? questionMarkString :
             Math.abs( current ) > max ? maxString :
             CCKCUtil.createCurrentReadout( current );
    } );

    var probeTextNode = new ProbeTextNode(
      currentReadoutProperty, options.showResultsProperty, currentString, tandem.createTandem( 'probeTextNode' ), {
        centerX: ammeterBodyImage.width / 2,
        centerY: ammeterBodyImage.height / 2+7 // adjust for the top notch design
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

    if ( !options.isIcon ) {

      // Show the ammeter in the play area when dragged from toolbox
      ammeter.visibleProperty.linkAttribute( this, 'visible' );

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
        var erodedDragBounds = visibleBounds.eroded( CCKCConstants.DRAG_BOUNDS_EROSION );
        self.dragHandler.dragBounds = erodedDragBounds;
        probeDragHandler.dragBounds = erodedDragBounds;
      } );
      this.probeNode.addInputListener( probeDragHandler );

      /**
       * Detection for ammeter probe + circuit intersection is done in the view since view bounds are used
       */
      var updateAmmeter = function() {

        // Skip work when ammeter is not out, to improve performance.
        if ( ammeter.visibleProperty.get() ) {
          var current = self.getCurrent( self.probeNode );
          ammeter.currentProperty.set( current );
        }
      };
      circuitLayerNode.circuit.circuitChangedEmitter.addListener( updateAmmeter );
      ammeter.probePositionProperty.link( updateAmmeter );
    }

    // When rendered as an icon, the touch area should span the bounds (no gaps between probes and body)
    if ( options.isIcon ) {
      this.touchArea = this.bounds.copy();
      this.mouseArea = this.bounds.copy();
      this.cursor = 'pointer';
    }
  }

  circuitConstructionKitCommon.register( 'AmmeterNode', AmmeterNode );

  return inherit( Node, AmmeterNode, {

    /**
     * Find the current in the given layer (if any CircuitElement hits the sensor)
     * @param {Node} probeNode
     * @param {Node} layer
     * @returns {number|null}
     * @private
     */
    getCurrentInLayer: function( probeNode, layer ) {

      // See if any CircuitElementNode contains the sensor point
      for ( var i = 0; i < layer.children.length; i++ ) {
        var circuitElementNode = layer.children[ i ];
        if ( circuitElementNode instanceof CircuitElementNode ) {

          // This is called between when the circuit element is disposed and when the corresponding view is disposed
          // so we must take care not to visit circuit elements that have been disposed but still have a view
          // see https://github.com/phetsims/circuit-construction-kit-common/issues/418
          if ( !circuitElementNode.circuitElement.circuitElementDisposed && circuitElementNode.containsSensorPoint( probeNode.translation ) ) {
            return circuitElementNode.circuitElement.currentProperty.get();
          }
        }
      }
      return null;
    },

    /**
     * Find the current under the given probe
     * @param {Node} probeNode
     * @returns {number|null}
     * @private
     */
    getCurrent: function( probeNode ) {
      var mainCurrent = this.getCurrentInLayer( probeNode, this.circuitLayerNode.fixedCircuitElementLayer );
      if ( mainCurrent !== null ) {
        return mainCurrent;
      }
      else {
        return this.getCurrentInLayer( probeNode, this.circuitLayerNode.wireLayer );
      }
    }
  } );
} );