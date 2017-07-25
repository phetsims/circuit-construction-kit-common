// Copyright 2015-2017, University of Colorado Boulder

/**
 * Node that represents a single scene or screen, with a circuit, toolbox, sensors, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var DisplayOptionsPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/DisplayOptionsPanel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Vector2 = require( 'DOT/Vector2' );
  var CircuitLayerNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitLayerNode' );
  var CircuitElementToolbox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementToolbox' );
  var CircuitElementEditContainerPanel =
    require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementEditContainerPanel' );
  var ChargeSpeedThrottlingReadoutNode =
    require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ChargeSpeedThrottlingReadoutNode' );
  var SensorToolbox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SensorToolbox' );
  var VoltmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/VoltmeterNode' );
  var AmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/AmmeterNode' );
  var CircuitConstructionKitCommonConstants =
    require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var SeriesAmmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/SeriesAmmeter' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  var Util = require( 'DOT/Util' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );
  var Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var CircuitConstructionKitCommonQueryParameters =
    require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonQueryParameters' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var Plane = require( 'SCENERY/nodes/Plane' );
  var ViewRadioButtonGroup = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ViewRadioButtonGroup' );
  var ZoomControlPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ZoomControlPanel' );
  var WireResistivityControl = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/WireResistivityControl' );
  var BatteryResistanceControl = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/BatteryResistanceControl' );
  var CircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementNode' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Node = require( 'SCENERY/nodes/Node' );
  var AlignBox = require( 'SCENERY/nodes/AlignBox' );
  var AlignGroup = require( 'SCENERY/nodes/AlignGroup' );
  var SolderNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SolderNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // constants
  var VERTICAL_MARGIN = CircuitConstructionKitCommonConstants.VERTICAL_MARGIN;
  var BACKGROUND_COLOR = CircuitConstructionKitCommonConstants.BACKGROUND_COLOR;
  var VOLTMETER_PROBE_TIP_LENGTH = 20; // The probe tip is about 20 view coordinates tall
  var VOLTMETER_NUMBER_SAMPLE_POINTS = 10; // Number of points along the edge of the voltmeter tip to detect voltages

  // Match margins with the carousel page control and spacing
  var HORIZONTAL_MARGIN = 17;

  // Group for aligning the content in the panels and accordion boxes.  This is a class variable instead of an
  // instance variable so the control panels will have the same width across all screens,
  // see https://github.com/phetsims/circuit-construction-kit-dc/issues/9
  var CONTROL_PANEL_ALIGN_GROUP = new AlignGroup( {

    // Elements should have the same widths but not constrained to have the same heights
    matchVertical: false
  } );

  /**
   * @param {CircuitConstructionKitModel} circuitConstructionKitModel
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function CircuitConstructionKitScreenView( circuitConstructionKitModel, tandem, options ) {
    var self = this;

    // @public (read-only) {CircuitConstructionKitModel}
    this.circuitConstructionKitModel = circuitConstructionKitModel;

    options = _.extend( {

      // When used as a scene, the reset all button is suppressed here, added in the screen so that it may reset all
      // scenes (including but not limited to this one).
      showResetAllButton: false,
      toolboxOrientation: 'vertical',

      /* SEE ALSO OPTIONS IN CircuitElementToolbox*/

      showSeriesAmmeters: false,
      showNoncontactAmmeters: true,
      getCircuitEditPanelLayoutPosition: CircuitElementEditContainerPanel.GET_LAYOUT_POSITION,
      showResistivityControl: true,
      showBatteryResistanceControl: true
    }, options );

    ScreenView.call( this );

    // @protected (read-only) {Plane}, so subclasses can change the fill. On touch, make it so tapping the background
    // deselects items.  For mouse, we add listeners to the pointer that work over all components, but this isn't
    // possible with touch since it is a new pointer instance for each touch.
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

    var backgroundListener = function( isValueDepictionEnabled ) {
      self.backgroundPlane.fill = isValueDepictionEnabled ? BACKGROUND_COLOR : 'gray';
    };
    circuitConstructionKitModel.isValueDepictionEnabledProperty.link( backgroundListener );

    // @public (read-only) {function} - For overriding in BlackBoxSceneView, which needs a custom color
    this.unlinkBackgroundListener = function() {
      circuitConstructionKitModel.isValueDepictionEnabledProperty.unlink( backgroundListener );
    };

    // @private - contains parts of the circuit that should be shown behind the controls
    this.circuitLayerNodeBackLayer = new Node();

    // @public (read-only) {CircuitLayerNode} - the circuit node
    this.circuitLayerNode = new CircuitLayerNode(
      circuitConstructionKitModel.circuit, this, tandem.createTandem( 'circuitLayerNode' )
    );

    var voltmeterNode = new VoltmeterNode(
      circuitConstructionKitModel.voltmeter, tandem.createTandem( 'voltmeterNode' ), {
        showResultsProperty: circuitConstructionKitModel.isValueDepictionEnabledProperty,
        visibleBoundsProperty: this.circuitLayerNode.visibleBoundsInCircuitCoordinateFrameProperty
      } );
    circuitConstructionKitModel.voltmeter.droppedEmitter.addListener( function( bodyNodeGlobalBounds ) {
      if ( bodyNodeGlobalBounds.intersectsBounds( self.sensorToolbox.globalBounds ) ) {
        circuitConstructionKitModel.voltmeter.visibleProperty.set( false );
      }
    } );
    circuitConstructionKitModel.voltmeter.visibleProperty.linkAttribute( voltmeterNode, 'visible' );

    var ammeterNode = new AmmeterNode( circuitConstructionKitModel.ammeter, tandem.createTandem( 'ammeterNode' ), {
      showResultsProperty: circuitConstructionKitModel.isValueDepictionEnabledProperty,
      visibleBoundsProperty: this.circuitLayerNode.visibleBoundsInCircuitCoordinateFrameProperty
    } );
    circuitConstructionKitModel.ammeter.droppedEmitter.addListener( function( bodyNodeGlobalBounds ) {
      if ( bodyNodeGlobalBounds.intersectsBounds( self.sensorToolbox.globalBounds ) ) {
        circuitConstructionKitModel.ammeter.visibleProperty.set( false );
      }
    } );
    circuitConstructionKitModel.ammeter.visibleProperty.linkAttribute( ammeterNode, 'visible' );

    // @public (read-only) {CircuitElementToolbox} - Toolbox from which CircuitElements can be dragged
    this.circuitElementToolbox = new CircuitElementToolbox(
      circuitConstructionKitModel.circuit,
      circuitConstructionKitModel.showLabelsProperty,
      circuitConstructionKitModel.viewProperty,
      this.circuitLayerNode,
      tandem.createTandem( 'circuitElementToolbox' ),
      options
    );

    var chargeSpeedThrottlingReadoutNode = new ChargeSpeedThrottlingReadoutNode(
      circuitConstructionKitModel.circuit.chargeAnimator.timeScaleProperty,
      circuitConstructionKitModel.circuit.showCurrentProperty,
      circuitConstructionKitModel.isValueDepictionEnabledProperty
    );
    this.addChild( chargeSpeedThrottlingReadoutNode );

    // @protected {SensorToolbox} - so that subclasses can add a layout circuit element near it
    this.sensorToolbox = new SensorToolbox(
      CONTROL_PANEL_ALIGN_GROUP,
      this.circuitLayerNode,
      voltmeterNode,
      ammeterNode,
      circuitConstructionKitModel.isValueDepictionEnabledProperty,
      circuitConstructionKitModel.showLabelsProperty,
      options.showSeriesAmmeters,
      options.showNoncontactAmmeters,
      tandem.createTandem( 'sensorToolbox' ) );

    // @private {ViewRadioButtonGroup}
    this.viewRadioButtonGroup = new ViewRadioButtonGroup(
      circuitConstructionKitModel.viewProperty, tandem.createTandem( 'viewRadioButtonGroup' )
    );

    // @protected {DisplayOptionsPanel}
    this.displayOptionsPanel = new DisplayOptionsPanel(
      CONTROL_PANEL_ALIGN_GROUP,
      circuitConstructionKitModel.circuit.showCurrentProperty,
      circuitConstructionKitModel.circuit.currentTypeProperty,
      circuitConstructionKitModel.showValuesProperty,
      circuitConstructionKitModel.showLabelsProperty,
      tandem.createTandem( 'displayOptionsPanel' )
    );

    // @private {WireResistivityControl}
    this.wireResistivityControl = new WireResistivityControl(
      circuitConstructionKitModel.circuit.wireResistivityProperty,
      CONTROL_PANEL_ALIGN_GROUP,
      tandem.createTandem( 'wireResistivityControl' )
    );

    // @private {BatteryResistanceControl}
    this.batteryResistanceControl = new BatteryResistanceControl(
      circuitConstructionKitModel.circuit.batteryResistanceProperty,
      CONTROL_PANEL_ALIGN_GROUP,
      tandem.createTandem( 'batteryResistanceControl' ) );

    this.moveBackgroundToBack();

    this.addChild( this.circuitLayerNodeBackLayer );

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

    this.addChild( this.circuitElementToolbox );

    var controlPanelVBox = new VBox( {
      spacing: VERTICAL_MARGIN,
      children: !options.showResistivityControl ?
        [ this.displayOptionsPanel, this.sensorToolbox, this.viewRadioButtonGroup ] :
        [ this.displayOptionsPanel, this.sensorToolbox, this.wireResistivityControl, this.batteryResistanceControl,
          this.viewRadioButtonGroup ]
    } );

    var box = new AlignBox( controlPanelVBox, {
      xAlign: 'right',
      yAlign: 'top',
      xMargin: HORIZONTAL_MARGIN,
      yMargin: VERTICAL_MARGIN
    } );
    this.visibleBoundsProperty.linkAttribute( box, 'alignBounds' );

    this.addChild( box );
    this.addChild( this.circuitLayerNode );

    var circuitElementEditContainerPanel = new CircuitElementEditContainerPanel(
      circuitConstructionKitModel.circuit,
      this.visibleBoundsProperty,
      circuitConstructionKitModel.modeProperty,
      tandem.createTandem( 'circuitElementEditContainerPanel' )
    );

    // @protected {CircuitElementEditContainerPanel} - so the subclass can set the layout
    this.circuitElementEditContainerPanel = circuitElementEditContainerPanel;

    this.addChild( circuitElementEditContainerPanel );

    // The voltmeter and ammeter are rendered with the circuit node so they will scale up and down with the circuit
    this.circuitLayerNode.addChild( voltmeterNode );
    this.circuitLayerNode.addChild( ammeterNode );

    /**
     * Starting at the tip, iterate down over several samples and return the first hit, if any.
     * @param {Node} probeNode
     * @param {Vector2} probeTip
     * @param {number} sign - the direction the probe is rotated
     * @returns the voltage connection or null if no connection
     */
    var findVoltageConnection = function( probeNode, probeTip, sign ) {
      var probeTipVector = Vector2.createPolar(
        VOLTMETER_PROBE_TIP_LENGTH,
        sign * VoltmeterNode.PROBE_ANGLE + Math.PI / 2
      );
      var probeTipTail = probeTip.plus( probeTipVector );
      for ( var i = 0; i < VOLTMETER_NUMBER_SAMPLE_POINTS; i++ ) {
        var samplePoint = probeTip.blend( probeTipTail, i / VOLTMETER_NUMBER_SAMPLE_POINTS );
        var voltageConnection = self.getVoltageConnection( probeNode, samplePoint );

        // For debugging, depict the points where the sampling happens
        if ( CircuitConstructionKitCommonQueryParameters.showVoltmeterSamplePoints ) {
          self.circuitLayerNode.addChild( new Rectangle( -1, -1, 2, 2, { fill: 'black', translation: samplePoint } ) );
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
      if ( circuitConstructionKitModel.voltmeter.visibleProperty.get() ) {
        var redConnection = findVoltageConnection(
          voltmeterNode.redProbeNode, voltmeterNode.voltmeter.redProbePositionProperty.get(), +1
        );
        var blackConnection = findVoltageConnection(
          voltmeterNode.blackProbeNode, voltmeterNode.voltmeter.blackProbePositionProperty.get(), -1
        );

        if ( redConnection === null || blackConnection === null ) {
          circuitConstructionKitModel.voltmeter.voltageProperty.set( null );
        }
        else if ( !circuitConstructionKitModel.circuit.areVerticesElectricallyConnected(
            redConnection.vertex, blackConnection.vertex
          ) ) {

          // Voltmeter probes each hit things but they were not connected to each other through the circuit.
          circuitConstructionKitModel.voltmeter.voltageProperty.set( null );
        }
        else if ( redConnection !== null && redConnection.vertex.insideTrueBlackBoxProperty.get() &&
                  !circuitConstructionKitModel.revealingProperty.get() ) {

          // Cannot read values inside the black box, unless "reveal" is being pressed
          circuitConstructionKitModel.voltmeter.voltageProperty.set( null );
        }
        else if ( blackConnection !== null && blackConnection.vertex.insideTrueBlackBoxProperty.get() &&
                  !circuitConstructionKitModel.revealingProperty.get() ) {

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

    /**
     * Detection for ammeter probe + circuit intersection is done in the view since view bounds are used
     */
    var updateAmmeter = function() {

      // Skip work when ammeter is not out, to improve performance.
      if ( circuitConstructionKitModel.ammeter.visibleProperty.get() ) {
        var current = self.getCurrent( ammeterNode.probeNode );
        circuitConstructionKitModel.ammeter.currentProperty.set( current );
      }
    };
    circuitConstructionKitModel.circuit.circuitChangedEmitter.addListener( updateAmmeter );
    circuitConstructionKitModel.ammeter.probePositionProperty.link( updateAmmeter );

    // Add the optional Play/Pause button
    if ( CircuitConstructionKitCommonQueryParameters.showPlayPauseButton ) {
      var playPauseButton = new PlayPauseButton( circuitConstructionKitModel.isValueDepictionEnabledProperty, {
        tandem: tandem.createTandem( 'playPauseButton' ),
        baseColor: '#33ff44' // the default blue fades into the background too much
      } );
      this.addChild( playPauseButton );
      this.visibleBoundsProperty.link( function( visibleBounds ) {

        // Float the playPauseButton to the bottom left
        playPauseButton.mutate( {
          left: visibleBounds.left + VERTICAL_MARGIN,
          bottom: visibleBounds.bottom - VERTICAL_MARGIN
        } );
      } );
    }

    // Create the zoom control panel
    var zoomControlPanel = new ZoomControlPanel( circuitConstructionKitModel.selectedZoomProperty, {
      tandem: tandem.createTandem( 'zoomControlPanel' )
    } );

    // Make it as wide as the circuit element toolbox
    zoomControlPanel.setScaleMagnitude( 0.8 );

    // Add it in front of everything (should never be obscured by a CircuitElement)
    this.addChild( zoomControlPanel );


    this.visibleBoundsProperty.link( function( visibleBounds ) {

      self.circuitElementToolbox.left = visibleBounds.left + VERTICAL_MARGIN +
                                        (self.circuitElementToolbox.carousel ? 0 : 12);
      self.circuitElementToolbox.top = visibleBounds.top + VERTICAL_MARGIN;

      // Float the resetAllButton to the bottom right
      options.showResetAllButton && resetAllButton.mutate( {
        right: visibleBounds.right - HORIZONTAL_MARGIN,
        bottom: visibleBounds.bottom - VERTICAL_MARGIN
      } );

      chargeSpeedThrottlingReadoutNode.mutate( {
        centerX: visibleBounds.centerX,
        bottom: visibleBounds.bottom - 100 // so it doesn't overlap the component controls
      } );

      zoomControlPanel.left = visibleBounds.left + HORIZONTAL_MARGIN;
      zoomControlPanel.bottom = visibleBounds.bottom - VERTICAL_MARGIN;
    } );

    // Center the circuit node so that zooms will remain centered.
    self.circuitLayerNode.setTranslation( self.layoutBounds.centerX, self.layoutBounds.centerY );
    self.circuitLayerNodeBackLayer.setTranslation( self.layoutBounds.centerX, self.layoutBounds.centerY );

    // Continuously zoom in and out as the current zoom interpolates
    circuitConstructionKitModel.currentZoomProperty.link( function( zoomLevel ) {
      self.circuitLayerNode.setScaleMagnitude( zoomLevel );
      self.circuitLayerNodeBackLayer.setScaleMagnitude( zoomLevel );
      self.circuitLayerNode.updateTransform( self.visibleBoundsProperty.get() );
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
     * @public
     */
    step: function( dt ) {
      this.circuitLayerNode.step( dt );
    },

    /**
     * Overrideable stub for resetting
     * @public
     */
    reset: function() {
      this.circuitElementToolbox.reset();
      this.batteryResistanceControl.expandedProperty.reset();
      this.wireResistivityControl.expandedProperty.reset();
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

      // SeriesAmmeters should be dropped in the sensor toolbox
      var toolbox = circuitElementNode.circuitElement instanceof SeriesAmmeter ?
                    this.sensorToolbox :
                    this.circuitElementToolbox;

      // Detect whether the midpoint between the vertices overlaps the toolbox
      var globalMidpoint = circuitElementNode.localToGlobalPoint( circuitElementNode.circuitElement.getMidpoint() );
      var overToolbox = toolbox.globalBounds.containsPoint( globalMidpoint );

      return isSingle && overToolbox && circuitElementNode.circuitElement.canBeDroppedInToolbox;
    },

    /**
     * Drop the CircuitElementNode in the toolbox.
     * @param {CircuitElementNode} circuitElementNode
     * @public
     */
    dropCircuitElementNodeInToolbox: function( circuitElementNode ) {

      // Only drop in the box if it was a single component, if connected to other things, do not
      this.circuitConstructionKitModel.circuit.circuitElements.remove( circuitElementNode.circuitElement );
    },

    /**
     * Find the current under the given probe
     * @param {Node} probeNode
     * @private
     */
    getCurrent: function( probeNode ) {

      // See if any CircuitElementNode contains the sensor point
      for ( var i = 0; i < this.circuitLayerNode.mainLayer.children.length; i++ ) {
        var circuitElementNode = this.circuitLayerNode.mainLayer.children[ i ];
        if ( circuitElementNode instanceof CircuitElementNode ) {
          if ( circuitElementNode.containsSensorPoint( probeNode.translation ) ) {
            return circuitElementNode.circuitElement.currentProperty.get();
          }
        }
      }
      return null;
    },

    /**
     * Check for an intersection between a probeNode and a wire, return null if no hits.
     * @param {Vector2} position to hit test
     * @param {function} filter - CircuitElement=>boolean the rule to use for checking circuit elements
     * @returns {WireNode|null}
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
          revealing = this.circuitConstructionKitModel.revealingProperty.get();
        }

        if ( revealing && circuitElementNode.containsSensorPoint( position ) ) {
          return circuitElementNode;
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

      // Check for intersection with a vertex, using the solder radius.  This means it will be possible to check for
      // voltages when nearby the terminal of a battery, not necessarily touching the battery (even when solder is
      // not shown, this is desirable so that students have a higher chance of getting the desirable reading).
      // When solder is shown, it is used as the conductive element for the voltmeter (and hence why the solder radius
      // is used in the computation below.
      var solderNodes = _.values( this.circuitLayerNode.solderNodes );
      for ( var i = 0; i < solderNodes.length; i++ ) {
        var solderNode = solderNodes[ i ];
        var position = solderNode.vertex.positionProperty.get();

        var distance = probePosition.distance( position );
        if ( distance <= SolderNode.SOLDER_RADIUS ) {
          return {
            vertex: solderNode.vertex,
            voltage: solderNode.vertex.voltageProperty.get()
          };
        }
      }

      // Check for intersection with a metallic circuit element, which can provide voltmeter readings
      var metallicCircuitElement = this.hitCircuitElementNode( probePosition, function( circuitElement ) {
        return (circuitElement instanceof Wire) || (circuitElement instanceof Resistor && circuitElement.isMetallic);
      } );
      if ( metallicCircuitElement ) {

        var startPoint = metallicCircuitElement.circuitElement.startVertexProperty.get().positionProperty.get();
        var endPoint = metallicCircuitElement.circuitElement.endVertexProperty.get().positionProperty.get();
        var segmentVector = endPoint.minus( startPoint );
        var probeVector = probeNode.centerTop.minus( startPoint );

        var distanceAlongSegment = probeVector.dot( segmentVector ) /
                                   segmentVector.magnitude() /
                                   segmentVector.magnitude();
        distanceAlongSegment = Util.clamp( distanceAlongSegment, 0, 1 );

        assert && assert( distanceAlongSegment >= 0 && distanceAlongSegment <= 1, 'beyond the end of the wire' );
        var voltageAlongWire = Util.linear(
          0,
          1,
          metallicCircuitElement.circuitElement.startVertexProperty.get().voltageProperty.get(),
          metallicCircuitElement.circuitElement.endVertexProperty.get().voltageProperty.get(),
          distanceAlongSegment
        );

        return {
          vertex: metallicCircuitElement.circuitElement.startVertexProperty.get(),
          voltage: voltageAlongWire
        };
      }
      else {

        // check for intersection with switch node
        var switchNode = this.hitCircuitElementNode( probePosition, function( circuitElement ) {
          return circuitElement instanceof Switch;
        } );
        if ( switchNode ) {

          // address closed switch.  Find out whether the probe was near the start or end vertex
          if ( switchNode.startSideContainsSensorPoint( probePosition ) ) {

            return {
              vertex: switchNode.circuitSwitch.startVertexProperty.get(),
              voltage: switchNode.circuitSwitch.startVertexProperty.get().voltageProperty.get()
            };
          }
          else if ( switchNode.endSideContainsSensorPoint( probePosition ) ) {
            return {
              vertex: switchNode.circuitSwitch.endVertexProperty.get(),
              voltage: switchNode.circuitSwitch.endVertexProperty.get().voltageProperty.get()
            };
          }
        }
        return null;
      }
    }
  } );
} );
