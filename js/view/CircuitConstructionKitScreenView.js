// Copyright 2015-2017, University of Colorado Boulder

/**
 * Node that represents a single scene or screen, with a circuit, toolbox, sensors, etc. Exists for the life of the sim
 * and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var AlignBox = require( 'SCENERY/nodes/AlignBox' );
  var AlignGroup = require( 'SCENERY/nodes/AlignGroup' );
  var AmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/AmmeterNode' );
  var BatteryResistanceControl = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/BatteryResistanceControl' );
  var ChargeSpeedThrottlingReadoutNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ChargeSpeedThrottlingReadoutNode' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var CircuitConstructionKitCommonQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonQueryParameters' );
  var CircuitElementEditContainerNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementEditContainerNode' );
  var CircuitElementToolbox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementToolbox' );
  var CircuitLayerNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitLayerNode' );
  var DisplayOptionsPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/DisplayOptionsPanel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var Property = require( 'AXON/Property' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SensorToolbox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SensorToolbox' );
  var SeriesAmmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/SeriesAmmeter' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var ViewRadioButtonGroup = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ViewRadioButtonGroup' );
  var VoltmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/VoltmeterNode' );
  var WireResistivityControl = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/WireResistivityControl' );
  var ZoomControlPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ZoomControlPanel' );

  // constants
  var VERTICAL_MARGIN = CircuitConstructionKitCommonConstants.VERTICAL_MARGIN;

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
   * @param {CircuitConstructionKitModel} model
   * @param {CircuitElementToolNode[]} circuitElementToolNodes - to be shown in the carousel
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function CircuitConstructionKitScreenView( model, circuitElementToolNodes, tandem, options ) {
    var self = this;

    // @public (read-only) {CircuitConstructionKitModel}
    this.model = model;

    options = _.extend( {

      // When used as a scene, the reset all button is suppressed here, added in the screen so that it may reset all
      // scenes (including but not limited to this one).
      showResetAllButton: false,
      toolboxOrientation: 'vertical',

      /* SEE ALSO OPTIONS IN CircuitElementToolbox*/

      showSeriesAmmeters: false,
      showNoncontactAmmeters: true,
      getCircuitEditPanelLayoutPosition: CircuitElementEditContainerNode.GET_LAYOUT_POSITION,
      showResistivityControl: true,
      showBatteryResistanceControl: true,

      blackBoxStudy: false
    }, options );

    ScreenView.call( this );

    // TODO(black-box-study): change background color to gray when isValueDepictionEnabledProperty goes false

    // @private - contains parts of the circuit that should be shown behind the controls
    this.circuitLayerNodeBackLayer = new Node();

    // @public (read-only) {CircuitLayerNode} - the circuit node
    this.circuitLayerNode = new CircuitLayerNode(
      model.circuit, this, tandem.createTandem( 'circuitLayerNode' )
    );

    var voltmeterNode = new VoltmeterNode( model.voltmeter, model, this.circuitLayerNode, tandem.createTandem( 'voltmeterNode' ), {
      showResultsProperty: model.isValueDepictionEnabledProperty,
      visibleBoundsProperty: this.circuitLayerNode.visibleBoundsInCircuitCoordinateFrameProperty
    } );
    model.voltmeter.droppedEmitter.addListener( function( bodyNodeGlobalBounds ) {
      if ( bodyNodeGlobalBounds.intersectsBounds( self.sensorToolbox.globalBounds ) ) {
        model.voltmeter.visibleProperty.set( false );
      }
    } );

    var ammeterNode = new AmmeterNode( model.ammeter, this.circuitLayerNode, tandem.createTandem( 'ammeterNode' ), {
      showResultsProperty: model.isValueDepictionEnabledProperty,
      visibleBoundsProperty: this.circuitLayerNode.visibleBoundsInCircuitCoordinateFrameProperty,
      blackBoxStudy: options.blackBoxStudy
    } );
    model.ammeter.droppedEmitter.addListener( function( bodyNodeGlobalBounds ) {
      if ( bodyNodeGlobalBounds.intersectsBounds( self.sensorToolbox.globalBounds ) ) {
        model.ammeter.visibleProperty.set( false );
      }
    } );

    // @public (read-only) {CircuitElementToolbox} - Toolbox from which CircuitElements can be dragged
    this.circuitElementToolbox = new CircuitElementToolbox(
      model.viewTypeProperty, circuitElementToolNodes, tandem.createTandem( 'circuitElementToolbox' ), options
    );

    var chargeSpeedThrottlingReadoutNode = new ChargeSpeedThrottlingReadoutNode(
      model.circuit.chargeAnimator.timeScaleProperty,
      model.circuit.showCurrentProperty,
      model.isValueDepictionEnabledProperty
    );
    this.addChild( chargeSpeedThrottlingReadoutNode );

    // @protected {SensorToolbox} - so that subclasses can add a layout circuit element near it
    this.sensorToolbox = new SensorToolbox(
      CONTROL_PANEL_ALIGN_GROUP,
      this.circuitLayerNode,
      voltmeterNode,
      ammeterNode,
      tandem.createTandem( 'sensorToolbox' ), {
        showSeriesAmmeters: options.showSeriesAmmeters,
        showNoncontactAmmeters: options.showNoncontactAmmeters
      } );

    // @private {ViewRadioButtonGroup}
    this.viewRadioButtonGroup = new ViewRadioButtonGroup(
      model.viewTypeProperty, tandem.createTandem( 'viewRadioButtonGroup' )
    );

    // @protected {DisplayOptionsPanel}
    this.displayOptionsPanel = new DisplayOptionsPanel(
      CONTROL_PANEL_ALIGN_GROUP,
      model.circuit.showCurrentProperty,
      model.circuit.currentTypeProperty,
      model.showValuesProperty,
      model.showLabelsProperty,
      tandem.createTandem( 'displayOptionsPanel' )
    );

    // @private {WireResistivityControl}
    this.wireResistivityControl = new WireResistivityControl(
      model.circuit.wireResistivityProperty,
      CONTROL_PANEL_ALIGN_GROUP,
      tandem.createTandem( 'wireResistivityControl' )
    );

    // @private {BatteryResistanceControl}
    this.batteryResistanceControl = new BatteryResistanceControl(
      model.circuit.batteryResistanceProperty,
      CONTROL_PANEL_ALIGN_GROUP,
      tandem.createTandem( 'batteryResistanceControl' ) );

    this.addChild( this.circuitLayerNodeBackLayer );

    // Reset All button
    if ( options.showResetAllButton ) {
      var resetAllButton = new ResetAllButton( {

        // extend touch area up to the edge of the screen view
        touchAreaDilation: VERTICAL_MARGIN,
        tandem: tandem.createTandem( 'resetAllButton' ),
        listener: function() {
          model.reset();
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

    var circuitElementEditContainerNode = new CircuitElementEditContainerNode(
      model.circuit,
      this.visibleBoundsProperty,
      model.modeProperty,
      tandem.createTandem( 'circuitElementEditContainerNode' )
    );

    // @protected {CircuitElementEditContainerNode} - so the subclass can set the layout
    this.circuitElementEditContainerNode = circuitElementEditContainerNode;

    this.addChild( circuitElementEditContainerNode );

    // The voltmeter and ammeter are rendered with the circuit node so they will scale up and down with the circuit
    this.circuitLayerNode.sensorLayer.addChild( voltmeterNode );
    this.circuitLayerNode.sensorLayer.addChild( ammeterNode );

    // Create the zoom control panel
    var zoomControlPanel = new ZoomControlPanel( model.selectedZoomProperty, {
      tandem: tandem.createTandem( 'zoomControlPanel' )
    } );

    // Add the optional Play/Pause button
    if ( CircuitConstructionKitCommonQueryParameters.showDepictValuesToggleButton ) {
      var playPauseButton = new PlayPauseButton( model.isValueDepictionEnabledProperty, {
        tandem: tandem.createTandem( 'playPauseButton' ),
        baseColor: '#33ff44' // the default blue fades into the background too much
      } );
      this.addChild( playPauseButton );
      this.visibleBoundsProperty.link( function( visibleBounds ) {

        // Float the playPauseButton to the bottom left
        playPauseButton.mutate( {
          left: visibleBounds.left + VERTICAL_MARGIN,
          bottom: visibleBounds.bottom - VERTICAL_MARGIN - zoomControlPanel.height - VERTICAL_MARGIN
        } );
      } );
    }

    // Make it as wide as the circuit element toolbox
    zoomControlPanel.setScaleMagnitude( 0.8 );

    // Add it in front of everything (should never be obscured by a CircuitElement)
    this.addChild( zoomControlPanel );


    this.visibleBoundsProperty.link( function( visibleBounds ) {

      self.circuitElementToolbox.left = visibleBounds.left + VERTICAL_MARGIN +
                                        ( self.circuitElementToolbox.carousel ? 0 : 12 );
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
    this.circuitLayerNode.setTranslation( self.layoutBounds.centerX, self.layoutBounds.centerY );
    this.circuitLayerNodeBackLayer.setTranslation( self.layoutBounds.centerX, self.layoutBounds.centerY );

    // Continuously zoom in and out as the current zoom interpolates, and update when the visible bounds change
    Property.multilink( [ model.currentZoomProperty, this.visibleBoundsProperty ], function( currentZoom, visibleBounds ) {
      self.circuitLayerNode.setScaleMagnitude( currentZoom );
      self.circuitLayerNodeBackLayer.setScaleMagnitude( currentZoom );
      self.circuitLayerNode.updateTransform( visibleBounds );
    } );

    // When a Vertex is dropped and the CircuitElement is over the CircuitElementToolbox, the CircuitElement will go back
    // into the toolbox
    this.model.circuit.vertexDroppedEmitter.addListener( function( vertex ) {

      var neighbors = self.model.circuit.getNeighborCircuitElements( vertex );
      if ( neighbors.length === 1 ) {
        var circuitElement = neighbors[ 0 ];
        var circuitElementNode = self.circuitLayerNode.getCircuitElementNode( circuitElement );

        if ( self.canNodeDropInToolbox( circuitElementNode ) ) {
          self.model.circuit.circuitElements.remove( circuitElement );
        }
      }
    } );
  }

  circuitConstructionKitCommon.register( 'CircuitConstructionKitScreenView', CircuitConstructionKitScreenView );

  return inherit( ScreenView, CircuitConstructionKitScreenView, {

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
      var circuitElement = circuitElementNode.circuitElement;

      // Only single (unconnected) elements can be dropped into the toolbox
      var isSingle = this.model.circuit.isSingle( circuitElement );

      // SeriesAmmeters should be dropped in the sensor toolbox
      var toolbox = circuitElement instanceof SeriesAmmeter ? this.sensorToolbox : this.circuitElementToolbox;

      // Detect whether the midpoint between the vertices overlaps the toolbox
      var globalMidpoint = circuitElementNode.localToGlobalPoint( circuitElement.getMidpoint() );
      var overToolbox = toolbox.globalBounds.containsPoint( globalMidpoint );

      return isSingle && overToolbox && circuitElement.canBeDroppedInToolbox;
    }
  } );
} );
