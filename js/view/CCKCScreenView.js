// Copyright 2015-2019, University of Colorado Boulder

/**
 * Node that represents a single scene or screen, with a circuit, toolbox, sensors, etc. Exists for the life of the sim
 * and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const AlignBox = require( 'SCENERY/nodes/AlignBox' );
  const AlignGroup = require( 'SCENERY/nodes/AlignGroup' );
  const AmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/AmmeterNode' );
  const BatteryResistanceControl = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/BatteryResistanceControl' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const CCKCQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCQueryParameters' );
  const ChargeSpeedThrottlingReadoutNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ChargeSpeedThrottlingReadoutNode' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const CircuitElementEditContainerNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementEditContainerNode' );
  const CircuitElementToolbox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementToolbox' );
  const CircuitLayerNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitLayerNode' );
  const DisplayOptionsPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/DisplayOptionsPanel' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  const Property = require( 'AXON/Property' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const SensorToolbox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SensorToolbox' );
  const SeriesAmmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/SeriesAmmeter' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const ViewRadioButtonGroup = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ViewRadioButtonGroup' );
  const VoltageChartNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/VoltageChartNode' );
  const VoltmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/VoltmeterNode' );
  const WireResistivityControl = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/WireResistivityControl' );
  const ZoomControlPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ZoomControlPanel' );

  // constants
  const VERTICAL_MARGIN = CCKCConstants.VERTICAL_MARGIN;

  // Match margins with the carousel page control and spacing
  const HORIZONTAL_MARGIN = 17;

  // Group for aligning the content in the panels and accordion boxes.  This is a class variable instead of an
  // instance variable so the control panels will have the same width across all screens,
  // see https://github.com/phetsims/circuit-construction-kit-dc/issues/9
  const CONTROL_PANEL_ALIGN_GROUP = new AlignGroup( {

    // Elements should have the same widths but not constrained to have the same heights
    matchVertical: false
  } );

  class CCKCScreenView extends ScreenView {

    /**
     * @param {CircuitConstructionKitModel} model
     * @param {CircuitElementToolNode[]} circuitElementToolNodes - to be shown in the carousel
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( model, circuitElementToolNodes, tandem, options ) {

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

      super();

      // @public (read-only) {CircuitConstructionKitModel}
      this.model = model;

      // TODO(black-box-study): change background color to gray when isValueDepictionEnabledProperty goes false

      // @private - contains parts of the circuit that should be shown behind the controls
      this.circuitLayerNodeBackLayer = new Node();

      // @public (read-only) {CircuitLayerNode} - the circuit node
      this.circuitLayerNode = new CircuitLayerNode(
        model.circuit, this, tandem.createTandem( 'circuitLayerNode' )
      );

      const voltmeterNode = new VoltmeterNode( model.voltmeter, model, this.circuitLayerNode, tandem.createTandem( 'voltmeterNode' ), {
        showResultsProperty: model.isValueDepictionEnabledProperty,
        visibleBoundsProperty: this.circuitLayerNode.visibleBoundsInCircuitCoordinateFrameProperty
      } );
      model.voltmeter.droppedEmitter.addListener( bodyNodeGlobalBounds => {
        if ( bodyNodeGlobalBounds.intersectsBounds( this.sensorToolbox.globalBounds ) ) {
          model.voltmeter.visibleProperty.set( false );
        }
      } );

      const ammeterNode = new AmmeterNode( model.ammeter, this.circuitLayerNode, tandem.createTandem( 'ammeterNode' ), {
        showResultsProperty: model.isValueDepictionEnabledProperty,
        visibleBoundsProperty: this.circuitLayerNode.visibleBoundsInCircuitCoordinateFrameProperty,
        blackBoxStudy: options.blackBoxStudy
      } );
      model.ammeter.droppedEmitter.addListener( bodyNodeGlobalBounds => {
        if ( bodyNodeGlobalBounds.intersectsBounds( this.sensorToolbox.globalBounds ) ) {
          model.ammeter.visibleProperty.set( false );
        }
      } );

      this.voltageChartNode = new VoltageChartNode( model.circuit.timeProperty );
      this.addChild( this.voltageChartNode );

      // @public (read-only) {CircuitElementToolbox} - Toolbox from which CircuitElements can be dragged
      this.circuitElementToolbox = new CircuitElementToolbox(
        model.viewTypeProperty, circuitElementToolNodes, tandem.createTandem( 'circuitElementToolbox' ), options
      );

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
      let resetAllButton = null;
      if ( options.showResetAllButton ) {
        resetAllButton = new ResetAllButton( {
          tandem: tandem.createTandem( 'resetAllButton' ),
          listener: () => {
            model.reset();
            this.reset();
          }
        } );
        this.addChild( resetAllButton );
      }

      this.addChild( this.circuitElementToolbox );

      const controlPanelVBox = new VBox( {
        spacing: VERTICAL_MARGIN,
        children: !options.showResistivityControl ?
          [ this.displayOptionsPanel, this.sensorToolbox, this.viewRadioButtonGroup ] :
          [ this.displayOptionsPanel, this.sensorToolbox, this.wireResistivityControl, this.batteryResistanceControl,
            this.viewRadioButtonGroup ]
      } );

      const box = new AlignBox( controlPanelVBox, {
        xAlign: 'right',
        yAlign: 'top',
        xMargin: HORIZONTAL_MARGIN,
        yMargin: VERTICAL_MARGIN
      } );
      this.visibleBoundsProperty.linkAttribute( box, 'alignBounds' );

      this.addChild( box );
      this.addChild( this.circuitLayerNode );

      const chargeSpeedThrottlingReadoutNode = new ChargeSpeedThrottlingReadoutNode(
        model.circuit.chargeAnimator.timeScaleProperty,
        model.circuit.showCurrentProperty,
        model.isValueDepictionEnabledProperty
      );
      this.addChild( chargeSpeedThrottlingReadoutNode );

      const circuitElementEditContainerNode = new CircuitElementEditContainerNode(
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
      const zoomControlPanel = new ZoomControlPanel( model.selectedZoomProperty, {
        tandem: tandem.createTandem( 'zoomControlPanel' )
      } );

      // Add the optional Play/Pause button
      if ( CCKCQueryParameters.showDepictValuesToggleButton ) {
        const playPauseButton = new PlayPauseButton( model.isValueDepictionEnabledProperty, {
          tandem: tandem.createTandem( 'playPauseButton' ),
          baseColor: '#33ff44' // the default blue fades into the background too much
        } );
        this.addChild( playPauseButton );
        this.visibleBoundsProperty.link( visibleBounds => {

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


      this.visibleBoundsProperty.link( visibleBounds => {

        this.circuitElementToolbox.left = visibleBounds.left + VERTICAL_MARGIN +
                                          ( this.circuitElementToolbox.carousel ? 0 : 12 );
        this.circuitElementToolbox.top = visibleBounds.top + VERTICAL_MARGIN;

        // Float the resetAllButton to the bottom right
        options.showResetAllButton && resetAllButton.mutate( {
          right: visibleBounds.right - HORIZONTAL_MARGIN,
          bottom: visibleBounds.bottom - HORIZONTAL_MARGIN
        } );

        chargeSpeedThrottlingReadoutNode.mutate( {
          centerX: visibleBounds.centerX,
          bottom: visibleBounds.bottom - 100 // so it doesn't overlap the component controls
        } );

        zoomControlPanel.left = visibleBounds.left + HORIZONTAL_MARGIN;
        zoomControlPanel.bottom = visibleBounds.bottom - VERTICAL_MARGIN;
      } );

      // Center the circuit node so that zooms will remain centered.
      this.circuitLayerNode.setTranslation( this.layoutBounds.centerX, this.layoutBounds.centerY );
      this.circuitLayerNodeBackLayer.setTranslation( this.layoutBounds.centerX, this.layoutBounds.centerY );

      // Continuously zoom in and out as the current zoom interpolates, and update when the visible bounds change
      Property.multilink( [ model.currentZoomProperty, this.visibleBoundsProperty ], ( currentZoom, visibleBounds ) => {
        this.circuitLayerNode.setScaleMagnitude( currentZoom );
        this.circuitLayerNodeBackLayer.setScaleMagnitude( currentZoom );
        this.circuitLayerNode.updateTransform( visibleBounds );
      } );

      // When a Vertex is dropped and the CircuitElement is over the CircuitElementToolbox, the CircuitElement will go back
      // into the toolbox
      this.model.circuit.vertexDroppedEmitter.addListener( vertex => {

        const neighbors = this.model.circuit.getNeighborCircuitElements( vertex );
        if ( neighbors.length === 1 ) {
          const circuitElement = neighbors[ 0 ];
          const circuitElementNode = this.circuitLayerNode.getCircuitElementNode( circuitElement );

          if ( this.canNodeDropInToolbox( circuitElementNode ) ) {
            this.model.circuit.circuitElements.remove( circuitElement );
          }
        }
      } );
    }

    /**
     * Move forward in time by the specified dt
     * @param {number} dt - seconds
     * @public
     */
    step( dt ) {
      this.circuitLayerNode.step( dt );
      this.voltageChartNode.step( this.model.circuit.timeProperty.value, dt );
    }

    /**
     * Overrideable stub for resetting
     * @public
     */
    reset() {
      this.circuitElementToolbox.reset();
      this.batteryResistanceControl.expandedProperty.reset();
      this.wireResistivityControl.expandedProperty.reset();
      this.voltageChartNode.reset();
    }

    /**
     * Return true if and only if the CircuitElementNode can be dropped in the toolbox.
     * @param {CircuitElementNode} circuitElementNode
     * @returns {boolean}
     * @public
     */
    canNodeDropInToolbox( circuitElementNode ) {
      const circuitElement = circuitElementNode.circuitElement;

      // Only single (unconnected) elements can be dropped into the toolbox
      const isSingle = this.model.circuit.isSingle( circuitElement );

      // SeriesAmmeters should be dropped in the sensor toolbox
      const toolbox = circuitElement instanceof SeriesAmmeter ? this.sensorToolbox : this.circuitElementToolbox;

      // Detect whether the midpoint between the vertices overlaps the toolbox
      const globalMidpoint = circuitElementNode.localToGlobalPoint( circuitElement.getMidpoint() );
      const overToolbox = toolbox.globalBounds.containsPoint( globalMidpoint );

      return isSingle && overToolbox && circuitElement.canBeDroppedInToolbox;
    }
  }

  return circuitConstructionKitCommon.register( 'CCKCScreenView', CCKCScreenView );
} );
