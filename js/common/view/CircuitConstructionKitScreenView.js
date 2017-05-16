// Copyright 2015-2017, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Node that represents a single scene or screen, with a circuit, toolbox, sensors, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var DisplayOptionsPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/DisplayOptionsPanel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var CircuitNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CircuitNode' );
  var CircuitElementToolbox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CircuitElementToolbox' );
  var CircuitElementEditContainerPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/CircuitElementEditContainerPanel' );
  var ChargeSpeedThrottlingReadoutNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/ChargeSpeedThrottlingReadoutNode' );
  var SensorToolbox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/SensorToolbox' );
  var VoltmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/VoltmeterNode' );
  var AmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/AmmeterNode' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var Util = require( 'DOT/Util' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var CircuitConstructionKitQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitQueryParameters' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var Plane = require( 'SCENERY/nodes/Plane' );
  var ViewRadioButtonGroup = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/ViewRadioButtonGroup' );
  var ZoomControlPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/ZoomControlPanel' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var WireResistivityControl = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/WireResistivityControl' );
  var BatteryResistanceControl = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/BatteryResistanceControl' );

  // constants
  var LAYOUT_INSET = CircuitConstructionKitConstants.LAYOUT_INSET;
  var BACKGROUND_COLOR = CircuitConstructionKitConstants.BACKGROUND_COLOR;
  var VOLTMETER_PROBE_TIP_LENGTH = 20; // The probe tip is about 20 view coordinates tall
  var VOLTMETER_NUMBER_SAMPLE_POINTS = 10; // Number of points along the edge of the voltmeter tip to detect voltages

  /**
   * @param {CircuitConstructionKitModel} circuitConstructionKitModel
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function CircuitConstructionKitScreenView( circuitConstructionKitModel, tandem, options ) {
    var self = this;
    this.circuitConstructionKitModel = circuitConstructionKitModel;

    options = _.extend( {

      // When used as a scene, the reset all button is suppressed here, added in the screen so that it may reset all
      // scenes (including but not limited to this one).
      showResetAllButton: false,
      toolboxOrientation: 'vertical',
      numberOfRightBatteriesInToolbox: CircuitElementToolbox.NUMBER_OF_RIGHT_BATTERIES,
      numberOfLeftBatteriesInToolbox: CircuitElementToolbox.NUMBER_OF_LEFT_BATTERIES,
      numberOfWiresInToolbox: CircuitElementToolbox.NUMBER_OF_WIRES,
      numberOfLightBulbsInToolbox: CircuitElementToolbox.NUMBER_OF_LIGHT_BULBS,
      numberOfResistorsInToolbox: CircuitElementToolbox.NUMBER_OF_RESISTORS,
      numberOfSwitchesInToolbox: CircuitElementToolbox.NUMBER_OF_SWITCHES,
      getToolboxPosition: function( visibleBounds ) {
        return {
          left: visibleBounds.left + LAYOUT_INSET,
          top: visibleBounds.top + LAYOUT_INSET
        };
      },
      getCircuitEditPanelLayoutPosition: CircuitElementEditContainerPanel.GET_LAYOUT_POSITION,
      showResistivityControl: true,
      showBatteryResistanceControl: true
    }, options );

    // @public - the main model
    this.circuitConstructionKitModel = circuitConstructionKitModel;

    ScreenView.call( this );

    // On touch, make it so tapping the background deselects items.  For mouse, we add listeners to the pointer that
    // work a bit more accurately.
    // @protected (read-only), so subclasses can change the fill
    this.backgroundPlane = new Plane( { fill: BACKGROUND_COLOR } );
    this.backgroundPlane.addInputListener( {
      touchdown: function() {
        circuitConstructionKitModel.circuit.selectedCircuitElementProperty.set( null );
        circuitConstructionKitModel.circuit.vertices.forEach( function( v ) {
          v.selected = false;
        } );
      }
    } );
    this.addChild( this.backgroundPlane );
    var backgroundListener = function( exploreScreenRunning ) {
      self.backgroundPlane.fill = exploreScreenRunning ? BACKGROUND_COLOR : 'gray';
    };
    circuitConstructionKitModel.exploreScreenRunningProperty.link( backgroundListener );

    // @public (read-only) - For overriding in BlackBoxSceneView, which needs a custom color
    this.unlinkBackgroundListener = function() {
      circuitConstructionKitModel.exploreScreenRunningProperty.unlink( backgroundListener );
    };

    // Reset All button
    if ( options.showResetAllButton ) {
      var resetAllButton = new ResetAllButton( {
        tandem: tandem.createTandem( 'resetAllButton' ),
        listener: function() {
          circuitConstructionKitModel.reset();
          self.reset();
        }
      } );
      this.addChild( resetAllButton );
    }

    // @public (read-only) - the circuit node
    this.circuitNode = new CircuitNode( circuitConstructionKitModel.circuit, this, tandem.createTandem( 'circuitNode' ) );

    // @public (read-only)
    this.visibleBoundsInCircuitCoordinateFrameProperty = new DerivedProperty( [ circuitConstructionKitModel.currentZoomProperty, this.visibleBoundsProperty ], function( zoom, visibleBounds ) {
      return self.circuitNode.parentToLocalBounds( visibleBounds );
    } );

    // @public (read-only) TODO: what is happening here???? Why can't we pass this as a parameter?
    this.circuitNode.visibleBoundsInCircuitCoordinateFrameProperty = this.visibleBoundsInCircuitCoordinateFrameProperty;

    var voltmeterNode = new VoltmeterNode( circuitConstructionKitModel.voltmeter, tandem.createTandem( 'voltmeterNode' ), {
      runningProperty: circuitConstructionKitModel.exploreScreenRunningProperty,
      visibleBoundsProperty: this.visibleBoundsInCircuitCoordinateFrameProperty
    } );
    circuitConstructionKitModel.voltmeter.droppedEmitter.addListener( function( bodyNodeGlobalBounds ) {
      if ( bodyNodeGlobalBounds.intersectsBounds( self.sensorToolbox.globalBounds ) ) {
        circuitConstructionKitModel.voltmeter.visibleProperty.set( false );
      }
    } );
    circuitConstructionKitModel.voltmeter.visibleProperty.link( function( visible ) {
      voltmeterNode.visible = visible;
    } );

    var ammeterNode = new AmmeterNode( circuitConstructionKitModel.ammeter, tandem.createTandem( 'ammeterNode' ), {
      visibleBoundsProperty: this.visibleBoundsInCircuitCoordinateFrameProperty,
      runningProperty: circuitConstructionKitModel.exploreScreenRunningProperty
    } );
    circuitConstructionKitModel.ammeter.droppedEmitter.addListener( function( bodyNodeGlobalBounds ) {
      if ( bodyNodeGlobalBounds.intersectsBounds( self.sensorToolbox.globalBounds ) ) {
        circuitConstructionKitModel.ammeter.visibleProperty.set( false );
      }
    } );
    circuitConstructionKitModel.ammeter.visibleProperty.linkAttribute( ammeterNode, 'visible' );

    // @public (read-only) Pass the view into circuit node so that circuit elements can be dropped back into the toolbox
    this.circuitElementToolbox = new CircuitElementToolbox(
      circuitConstructionKitModel.circuit,
      circuitConstructionKitModel.showLabelsProperty,
      circuitConstructionKitModel.viewProperty,
      this.circuitNode,
      tandem.createTandem( 'circuitElementToolbox' ), {
        orientation: options.toolboxOrientation,
        numberOfRightBatteries: options.numberOfRightBatteriesInToolbox,
        numberOfLeftBatteries: options.numberOfLeftBatteriesInToolbox,
        numberOfWires: options.numberOfWiresInToolbox,
        numberOfSwitches: options.numberOfSwitchesInToolbox,
        numberOfLightBulbs: options.numberOfLightBulbsInToolbox,
        numberOfResistors: options.numberOfResistorsInToolbox
      } );

    var chargeSpeedThrottlingReadoutNode = new ChargeSpeedThrottlingReadoutNode(
      circuitConstructionKitModel.circuit.chargeAnimator.timeScaleProperty,
      circuitConstructionKitModel.circuit.showCurrentProperty,
      circuitConstructionKitModel.exploreScreenRunningProperty
    );
    this.addChild( chargeSpeedThrottlingReadoutNode );

    // @protected - so that subclasses can add a layout circuit element near it
    this.sensorToolbox = new SensorToolbox( this.circuitNode, voltmeterNode, ammeterNode, circuitConstructionKitModel.exploreScreenRunningProperty, tandem.createTandem( 'sensorToolbox' ) );

    // @private
    this.viewRadioButtonGroup = new ViewRadioButtonGroup( circuitConstructionKitModel.viewProperty, tandem.createTandem( 'viewRadioButtonGroup' ) );
    // this.viewRadioButtonGroup.setScaleMagnitude( this.sensorToolbox.width / this.viewRadioButtonGroup.width );

    // @protected
    this.displayOptionsPanel = new DisplayOptionsPanel(
      circuitConstructionKitModel.circuit.showCurrentProperty,
      circuitConstructionKitModel.circuit.currentTypeProperty,
      circuitConstructionKitModel.showValuesProperty,
      circuitConstructionKitModel.showLabelsProperty,
      tandem.createTandem( 'displayOptionsPanel' ) );

    CircuitConstructionKitQueryParameters.showDisplayOptionsPanel && this.addChild( this.displayOptionsPanel );

    this.wireResistivityControl = new WireResistivityControl( circuitConstructionKitModel.circuit.wireResistivityProperty, tandem.createTandem( 'wireResistivityControl' ) );
    this.batteryResistanceControl = new BatteryResistanceControl( circuitConstructionKitModel.circuit.batteryResistanceProperty, tandem.createTandem( 'batteryResistanceControl' ) );

    this.displayOptionsPanel.moveToBack(); // Move behind elements added in the super, such as the sensors and circuit
    this.moveBackgroundToBack();

    this.addChild( this.circuitElementToolbox );

    this.addChild( this.sensorToolbox );
    this.addChild( this.viewRadioButtonGroup );
    this.addChild( this.circuitNode );
    options.showResistivityControl && this.addChild( this.wireResistivityControl );
    options.showBatteryResistanceControl && this.addChild( this.batteryResistanceControl );

    var circuitElementEditContainerPanel = new CircuitElementEditContainerPanel(
      circuitConstructionKitModel.circuit,
      this.visibleBoundsProperty,
      circuitConstructionKitModel.modeProperty,
      tandem.createTandem( 'circuitElementEditContainerPanel' )
    );

    // @protected - so the subclass can set the layout
    this.circuitElementEditContainerPanel = circuitElementEditContainerPanel;

    this.addChild( circuitElementEditContainerPanel );

    // The voltmeter and ammeter are considered part of the circuit node so they will scale up and down with the circuit
    this.circuitNode.addChild( voltmeterNode );
    this.circuitNode.addChild( ammeterNode );

    /**
     * Starting at the tip, iterate down over several samples and return the first hit, if any.
     * @param {Node} probeNode
     * @param {Vector2} probePosition
     * @returns the voltage connection or null if no connection
     */
    var findVoltageConnection = function( probeNode, probePosition ) {
      for ( var i = 0; i < VOLTMETER_NUMBER_SAMPLE_POINTS; i++ ) {
        var voltageConnection = self.getVoltageConnection( probeNode, probePosition.plusXY( 0, i * VOLTMETER_PROBE_TIP_LENGTH / VOLTMETER_NUMBER_SAMPLE_POINTS ) );
        if ( voltageConnection ) {
          return voltageConnection;
        }
      }
      return null;
    };

    // Detection for voltmeter probe + circuit collision is done in the view since view bounds are used
    var updateVoltmeter = function() {
      if ( circuitConstructionKitModel.voltmeter.visibleProperty.get() ) {
        var redConnection = findVoltageConnection( voltmeterNode.redProbeNode, voltmeterNode.voltmeter.redProbePositionProperty.get() );
        var blackConnection = findVoltageConnection( voltmeterNode.blackProbeNode, voltmeterNode.voltmeter.blackProbePositionProperty.get() );
        if ( redConnection === null || blackConnection === null ) {
          circuitConstructionKitModel.voltmeter.voltageProperty.set( null );
        }
        else if ( !circuitConstructionKitModel.circuit.areVerticesConnected( redConnection.vertex, blackConnection.vertex ) ) {

          // Voltmeter probes each hit things but they were not connected to each other through the circuit.
          circuitConstructionKitModel.voltmeter.voltageProperty.set( null );
        }
        else if ( redConnection !== null && redConnection.vertex.insideTrueBlackBoxProperty.get() && !circuitConstructionKitModel.revealingProperty.get() ) {

          // Cannot read values inside the black box, unless "reveal" is being pressed
          circuitConstructionKitModel.voltmeter.voltageProperty.set( null );
        }
        else if ( blackConnection !== null && blackConnection.vertex.insideTrueBlackBoxProperty.get() && !circuitConstructionKitModel.revealingProperty.get() ) {

          // Cannot read values inside the black box, unless "reveal" is being pressed
          circuitConstructionKitModel.voltmeter.voltageProperty.set( null );
        }
        else {
          circuitConstructionKitModel.voltmeter.voltageProperty.set( redConnection.voltage - blackConnection.voltage );
        }
      }
    };
    circuitConstructionKitModel.circuit.circuitChangedEmitter.addListener( updateVoltmeter );
    circuitConstructionKitModel.voltmeter.redProbePositionProperty.link( updateVoltmeter );
    circuitConstructionKitModel.voltmeter.blackProbePositionProperty.link( updateVoltmeter );

    // Detection for ammeter probe + circuit collision is done in the view since view bounds are used
    var updateAmmeter = function() {

      // Skip work when ammeter is not out, to improve performance.
      if ( circuitConstructionKitModel.ammeter.visibleProperty.get() ) {
        var current = self.getCurrent( ammeterNode.probeNode );
        circuitConstructionKitModel.ammeter.currentProperty.set( current );
      }
    };
    circuitConstructionKitModel.circuit.circuitChangedEmitter.addListener( updateAmmeter );
    circuitConstructionKitModel.ammeter.probePositionProperty.link( updateAmmeter );

    // TODO: Move to a separate file
    if ( CircuitConstructionKitQueryParameters.showPlayPauseButton ) {
      var playPauseButton = new PlayPauseButton( circuitConstructionKitModel.exploreScreenRunningProperty, {
        tandem: tandem.createTandem( 'playPauseButton' ),
        baseColor: '#33ff44' // the default blue fades into the background too much
      } );
      this.addChild( playPauseButton );
      this.visibleBoundsProperty.link( function( visibleBounds ) {

        // Float the playPauseButton to the bottom left
        playPauseButton.mutate( {
          left: visibleBounds.left + LAYOUT_INSET,
          bottom: visibleBounds.bottom - LAYOUT_INSET
        } );
      } );
    }

    // Create the zoom control panel
    var zoomControlPanel = new ZoomControlPanel( circuitConstructionKitModel.selectedZoomProperty, {
      tandem: tandem.createTandem( 'zoomControlPanel' )
    } );

    // Make it as wide as the circuit element toolbox
    zoomControlPanel.setScaleMagnitude( this.circuitElementToolbox.width / zoomControlPanel.width );

    // Add it in front of everything (should never be obscured by a CircuitElement)
    this.addChild( zoomControlPanel );

    this.visibleBoundsProperty.link( function( visibleBounds ) {

      // Float the resetAllButton to the bottom right
      if ( options.showResetAllButton ) {
        resetAllButton.mutate( {
          right: visibleBounds.right - LAYOUT_INSET,
          bottom: visibleBounds.bottom - LAYOUT_INSET
        } );
      }

      chargeSpeedThrottlingReadoutNode.mutate( {
        centerX: visibleBounds.centerX,
        bottom: visibleBounds.bottom - 100 // so it doesn't overlap the component controls
      } );

      self.circuitElementToolbox.mutate( options.getToolboxPosition( visibleBounds ) );

      self.displayOptionsPanel.mutate( {
        right: visibleBounds.right - LAYOUT_INSET,
        top: visibleBounds.top + LAYOUT_INSET
      } );
      self.sensorToolbox.mutate( {
        right: visibleBounds.right - LAYOUT_INSET,
        top: self.displayOptionsPanel.bottom + LAYOUT_INSET
      } );
      self.viewRadioButtonGroup.top = self.sensorToolbox.bottom + 10;
      self.viewRadioButtonGroup.left = self.sensorToolbox.left;

      zoomControlPanel.bottom = visibleBounds.bottom - LAYOUT_INSET;
      zoomControlPanel.left = self.circuitElementToolbox.left;

      self.wireResistivityControl.top = self.viewRadioButtonGroup.bottom + 10;
      self.wireResistivityControl.right = visibleBounds.right - LAYOUT_INSET;

      // I think it doesn't collapse in Build an Atom and that works well

      // Link that adjusts batteryResistanceControl in response to the wireResistivityControl's expanded property.
      var expandedDistance = self.wireResistivityControl.bottom + 10;
      var retractedDistance = self.wireResistivityControl.top + 35;
      self.wireResistivityControl.expandedProperty.link( function( expanded ) {
        self.batteryResistanceControl.top = expanded === true ? expandedDistance : retractedDistance;
      } );
      self.batteryResistanceControl.right = visibleBounds.right - LAYOUT_INSET;
    } );

    // Center the circuit node so that zooms will remain centered.
    self.circuitNode.setTranslation( self.layoutBounds.centerX, self.layoutBounds.centerY );

    // Continuously zoom in and out as the current zoom interpolates
    circuitConstructionKitModel.currentZoomProperty.link( function( zoomLevel ) {
      self.circuitNode.setScaleMagnitude( zoomLevel );
    } );
  }

  circuitConstructionKitCommon.register( 'CircuitConstructionKitScreenView', CircuitConstructionKitScreenView );

  return inherit( ScreenView, CircuitConstructionKitScreenView, {

    /**
     * When other UI components are moved to the back, we must make sure the background stays behind them.
     * @public
     */
    moveBackgroundToBack: function() {
      this.backgroundPlane.moveToBack();
    },

    /**
     * Move forward in time by the specified dt
     * @param {number} dt - seconds
     */
    step: function( dt ) {
      this.circuitNode.step( dt );
    },

    /**
     * Overrideable stub
     * @public
     */
    reset: function() {
    },

    /**
     * Return true if and only if the CircuitElementNode can be dropped in the toolbox.
     * @param {CircuitElementNode} circuitElementNode
     * @returns {boolean}
     * @public
     */
    canNodeDropInToolbox: function( circuitElementNode ) {

      // Only single (unconnected) elements can be dropped into the toolbox
      var isSingle = this.circuitConstructionKitModel.circuit.isSingle( circuitElementNode.circuitElement );

      // Detect whether the midpoint between the vertices overlaps the toolbox
      var overToolbox = this.circuitElementToolbox.globalBounds.containsPoint( circuitElementNode.localToGlobalPoint( circuitElementNode.circuitElement.getMidpoint() ) );

      return isSingle && overToolbox && circuitElementNode.circuitElement.canBeDroppedInToolbox;
    },

    /**
     * Drop the CircuitElementNode in the toolbox.
     * @param {CircuitElementNode} circuitElementNode
     * @public
     */
    dropCircuitElementNodeInToolbox: function( circuitElementNode ) {

      // Only drop in the box if it was a single component, if connected to other things, do not
      this.circuitConstructionKitModel.circuit.remove( circuitElementNode.circuitElement );
    },

    /**
     * Find where the voltmeter probe node intersects the wire, for computing the voltage difference
     * @param {Node} probeNode
     * @private
     */
    getCurrent: function( probeNode ) {

      var hitWireNode = this.hitWireNode( probeNode.translation );
      if ( hitWireNode ) {
        return hitWireNode.wire.currentProperty.get();
      }
      else {
        return null;
      }
    },

    /**
     * Check for an intersection between a probeNode and a wire, return null if no hits.
     * @param {Vector2} position to hit test
     * @returns {WireNode|null}
     * @public
     */
    hitWireNode: function( position ) {

      // Search from the front to the back, because frontmost objects look like they are hitting the sensor, see #143
      for ( var i = this.circuitNode.wireNodes.length - 1; i >= 0; i-- ) {
        var wireNode = this.circuitNode.wireNodes[ i ];

        // Don't connect to wires in the black box
        var revealing = true;
        var trueBlackBox = wireNode.wire.insideTrueBlackBoxProperty.get();
        if ( trueBlackBox ) {
          revealing = this.circuitConstructionKitModel.revealingProperty.get();
        }
        if ( revealing && wireNode.getStrokedShape().containsPoint( position ) ) {
          return wireNode;
        }
      }
      return null;
    },

    /**
     * Find where the voltmeter probe node intersects the wire, for computing the voltage difference
     * @param {Image} probeNode - the probe node from the VoltmeterNode
     * @param {Vector2} probePosition
     * @returns {Object} with vertex (for checking connectivity) and voltage (if connected)
     * @private
     */
    getVoltageConnection: function( probeNode, probePosition ) {

      // Check for intersection with a vertex
      for ( var i = 0; i < this.circuitNode.vertexNodes.length; i++ ) {
        var vertexNode = this.circuitNode.vertexNodes[ i ];
        var position = vertexNode.vertex.positionProperty.get();
        var radius = vertexNode.dottedLineNodeRadius;

        var distance = probePosition.distance( position );
        if ( distance <= radius ) {
          return {
            vertex: vertexNode.vertex,
            voltage: vertexNode.vertex.voltageProperty.get()
          };
        }
      }

      // Check for intersection with a wire
      var wireNode = this.hitWireNode( probePosition );
      if ( wireNode ) {

        var startPoint = wireNode.wire.startVertexProperty.get().positionProperty.get();
        var endPoint = wireNode.wire.endVertexProperty.get().positionProperty.get();
        var segmentVector = endPoint.minus( startPoint );
        var probeVector = probeNode.centerTop.minus( startPoint );

        var distanceAlongSegment = probeVector.dot( segmentVector ) / segmentVector.magnitude() / segmentVector.magnitude();
        distanceAlongSegment = Util.clamp( distanceAlongSegment, 0, 1 );

        assert && assert( distanceAlongSegment >= 0 && distanceAlongSegment <= 1, 'beyond the end of the wire' );
        var voltageAlongWire = Util.linear( 0, 1, wireNode.wire.startVertexProperty.get().voltageProperty.get(), wireNode.wire.endVertexProperty.get().voltageProperty.get(), distanceAlongSegment );

        return {
          vertex: wireNode.wire.startVertexProperty.get(),
          voltage: voltageAlongWire
        };
      }
      else {
        return null;
      }
    }
  } );
} );