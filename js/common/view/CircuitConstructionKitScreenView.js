// Copyright 2015-2016, University of Colorado Boulder

/**
 * Node that represents a single scene or screen, with a circuit, toolbox, sensors, etc.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var CircuitNode = require( 'CIRCUIT_CONSTRUCTION_KIT/common/view/CircuitNode' );
  var CircuitElementToolbox = require( 'CIRCUIT_CONSTRUCTION_KIT/common/view/CircuitElementToolbox' );
  var CircuitElementEditContainerPanel = require( 'CIRCUIT_CONSTRUCTION_KIT/common/view/CircuitElementEditContainerPanel' );
  var SensorToolbox = require( 'CIRCUIT_CONSTRUCTION_KIT/common/view/SensorToolbox' );
  var VoltmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT/common/view/VoltmeterNode' );
  var AmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT/common/view/AmmeterNode' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT/CircuitConstructionKitConstants' );
  var Util = require( 'DOT/Util' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );

  // constants
  var inset = CircuitConstructionKitConstants.layoutInset;

  /**
   * @param {CircuitConstructionKitModel} circuitConstructionKitModel
   * @param {Object} [options]
   * @constructor
   */
  function CircuitConstructionKitScreenView( circuitConstructionKitModel, options ) {
    var circuitConstructionKitScreenView = this;

    options = _.extend( {

      // When used as a scene, the reset all button is suppressed here, added in the screen
      // so that it may reset all scenes (including but not limited to this one).
      showResetAllButton: false,
      toolboxOrientation: 'vertical',
      numberOfRightBatteriesInToolbox: CircuitElementToolbox.NUMBER_OF_RIGHT_BATTERIES,
      numberOfLeftBatteriesInToolbox: CircuitElementToolbox.NUMBER_OF_LEFT_BATTERIES,
      numberOfWiresInToolbox: CircuitElementToolbox.NUMBER_OF_WIRES,
      numberOfLightBulbsInToolbox: CircuitElementToolbox.NUMBER_OF_LIGHT_BULBS,
      numberOfResistorsInToolbox: CircuitElementToolbox.NUMBER_OF_RESISTORS,
      getToolboxPosition: function( visibleBounds ) {
        return {
          left: visibleBounds.left + inset,
          top: visibleBounds.top + inset
        };
      },
      getCircuitEditPanelLayoutPosition: CircuitElementEditContainerPanel.GET_LAYOUT_POSITION
    }, options );
    this.circuitConstructionKitModel = circuitConstructionKitModel;
    ScreenView.call( this );

    var voltmeterNode = new VoltmeterNode( circuitConstructionKitModel.voltmeter, { visibleBoundsProperty: this.visibleBoundsProperty } );
    circuitConstructionKitModel.voltmeter.droppedEmitter.addListener( function( bodyNodeGlobalBounds ) {
      if ( bodyNodeGlobalBounds.intersectsBounds( circuitConstructionKitScreenView.sensorToolbox.globalBounds ) ) {
        circuitConstructionKitModel.voltmeter.visible = false;
      }
    } );
    circuitConstructionKitModel.voltmeter.visibleProperty.link( function( visible ) {
      voltmeterNode.visible = visible;
    } );

    var ammeterNode = new AmmeterNode( circuitConstructionKitModel.ammeter, { visibleBoundsProperty: this.visibleBoundsProperty } );
    circuitConstructionKitModel.ammeter.droppedEmitter.addListener( function( bodyNodeGlobalBounds ) {
      if ( bodyNodeGlobalBounds.intersectsBounds( circuitConstructionKitScreenView.sensorToolbox.globalBounds ) ) {
        circuitConstructionKitModel.ammeter.visible = false;
      }
    } );
    circuitConstructionKitModel.ammeter.visibleProperty.link( function( visible ) {
      ammeterNode.visible = visible;
    } );

    // Pass the view into circuit node so that circuit elements can be dropped back into the toolbox
    this.circuitNode = new CircuitNode( circuitConstructionKitModel.circuit, this );
    this.circuitElementToolbox = new CircuitElementToolbox( circuitConstructionKitModel.circuit, this.circuitNode, {
      orientation: options.toolboxOrientation,
      numberOfRightBatteries: options.numberOfRightBatteriesInToolbox,
      numberOfLeftBatteries: options.numberOfLeftBatteriesInToolbox,
      numberOfWires: options.numberOfWiresInToolbox,
      numberOfLightBulbs: options.numberOfLightBulbsInToolbox,
      numberOfResistors: options.numberOfResistorsInToolbox
    } );

    // @protected - so that subclasses can add a layout circuit element near it
    this.sensorToolbox = new SensorToolbox( voltmeterNode, ammeterNode );

    this.addChild( this.circuitNode );
    this.addChild( this.sensorToolbox );

    // Reset All button
    if ( options.showResetAllButton ) {
      var resetAllButton = new ResetAllButton( {
        listener: function() {
          circuitConstructionKitModel.reset();
          circuitConstructionKitScreenView.reset();
        }
      } );
      this.addChild( resetAllButton );
    }

    // Has to be interleaved in the circuit layering to support the black box, so that the toolbox can be behind
    // circuit elements but in front of the transparency overlay
    this.circuitNode.mainLayer.addChild( this.circuitElementToolbox );
    var circuitElementEditContainerPanel = new CircuitElementEditContainerPanel( circuitConstructionKitModel.circuit, this.visibleBoundsProperty, {
      getLayoutPosition: options.getCircuitEditPanelLayoutPosition
    } );

    // @protected - so the subclass can set the layout
    this.circuitElementEditContainerPanel = circuitElementEditContainerPanel;
    this.visibleBoundsProperty.link( function( visibleBounds ) {

      // Float the resetAllButton to the bottom right
      if ( options.showResetAllButton ) {
        resetAllButton.mutate( {
          right: visibleBounds.right - inset,
          bottom: visibleBounds.bottom - inset
        } );
      }

      circuitConstructionKitScreenView.circuitElementToolbox.mutate( options.getToolboxPosition( visibleBounds ) );

      circuitConstructionKitScreenView.sensorToolbox.mutate( {
        right: visibleBounds.right - inset,
        top: visibleBounds.top + inset
      } );
    } );

    this.addChild( circuitElementEditContainerPanel );

    this.addChild( voltmeterNode );
    this.addChild( ammeterNode );

    // Detection for voltmeter probe + circuit collision is done in the view since view bounds are used
    var updateVoltmeter = function() {
      if ( circuitConstructionKitModel.voltmeter.visible ) {
        var redConnection = circuitConstructionKitScreenView.getVoltageConnection( voltmeterNode.redProbeNode, voltmeterNode.voltmeter.redProbePosition );
        var blackConnection = circuitConstructionKitScreenView.getVoltageConnection( voltmeterNode.blackProbeNode, voltmeterNode.voltmeter.blackProbePosition );
        if ( redConnection === null || blackConnection === null ) {
          circuitConstructionKitModel.voltmeter.voltage = null;
        }
        else if ( !circuitConstructionKitModel.circuit.areVerticesConnected( redConnection.vertex, blackConnection.vertex ) ) {

          // Voltmeter probes each hit things but they were not connected to each other through the circuit.
          circuitConstructionKitModel.voltmeter.voltage = null;
        }
        else if ( redConnection !== null && redConnection.vertex.insideTrueBlackBox ) {

          // Cannot read values inside the black box
          circuitConstructionKitModel.voltmeter.voltage = null;
        }
        else if ( blackConnection !== null && blackConnection.vertex.insideTrueBlackBox ) {

          // Cannot read values inside the black box
          circuitConstructionKitModel.voltmeter.voltage = null;
        }
        else {
          circuitConstructionKitModel.voltmeter.voltage = redConnection.voltage - blackConnection.voltage;
        }
      }
    };
    circuitConstructionKitModel.circuit.circuitChangedEmitter.addListener( updateVoltmeter );
    circuitConstructionKitModel.voltmeter.redProbePositionProperty.link( updateVoltmeter );
    circuitConstructionKitModel.voltmeter.blackProbePositionProperty.link( updateVoltmeter );

    // Detection for ammeter probe + circuit collision is done in the view since view bounds are used
    var updateAmmeter = function() {
      var current = circuitConstructionKitScreenView.getCurrent( ammeterNode.probeNode );
      circuitConstructionKitModel.ammeter.current = current;
    };
    circuitConstructionKitModel.circuit.circuitChangedEmitter.addListener( updateAmmeter );
    circuitConstructionKitModel.ammeter.probePositionProperty.link( updateAmmeter );
  }

  circuitConstructionKit.register( 'CircuitConstructionKitScreenView', CircuitConstructionKitScreenView );

  return inherit( ScreenView, CircuitConstructionKitScreenView, {

    //overrideable stub
    reset: function() {

    },
    canNodeDropInToolbox: function( circuitElementNode ) {
      var isSingle = this.circuitConstructionKitModel.circuit.isSingle( circuitElementNode.circuitElement );
      var inBounds = this.circuitElementToolbox.globalBounds.containsPoint( circuitElementNode.globalBounds.center );
      var okToDrop = circuitElementNode.circuitElement.canBeDroppedInToolbox;
      return isSingle && inBounds && okToDrop;
    },

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

      var hitWireNode = this.hitWireNode( probeNode, 'translation' );
      if ( hitWireNode ) {
        return hitWireNode.wire.current;
      }
      else {
        return null;
      }
    },

    /**
     * Check for an intersection between a probeNode and a wire, return null if no hits.
     * @param probeNode
     * @param {string} locationProperty - 'translation' for ammeter or 'centerTop' for voltmeter probes
     * @returns {*}
     */
    hitWireNode: function( probeNode, locationProperty ) {
      for ( var i = 0; i < this.circuitNode.wireNodes.length; i++ ) {
        var wireNode = this.circuitNode.wireNodes[ i ];

        // Don't connect to wires in the black box
        if ( !wireNode.wire.insideTrueBlackBox && wireNode.getStrokedShape().containsPoint( probeNode[ locationProperty ] ) ) {
          return wireNode;
        }
      }
      return null;
    },

    /**
     * Find where the voltmeter probe node intersects the wire, for computing the voltage difference
     * @param {Image} probeNode - the probe node from the VoltmeterNode
     * @param {Vector2} probePosition
     * @private
     * @return {Object} with vertex (for checking connectivity) and voltage (if connected)
     */
    getVoltageConnection: function( probeNode, probePosition ) {

      // Check for intersection with a vertex
      for ( var i = 0; i < this.circuitNode.vertexNodes.length; i++ ) {
        var vertexNode = this.circuitNode.vertexNodes[ i ];
        var position = vertexNode.vertex.position;
        var radius = vertexNode.dottedLineNodeRadius;

        var distance = probePosition.distance( position );
        if ( distance <= radius ) {
          return {
            vertex: vertexNode.vertex,
            voltage: vertexNode.vertex.voltage
          };
        }
      }

      // Check for intersection with a wire
      var wireNode = this.hitWireNode( probeNode, 'centerTop' );
      if ( wireNode ) {

        var startPoint = wireNode.wire.startVertex.position;
        var endPoint = wireNode.wire.endVertex.position;
        var segmentVector = endPoint.minus( startPoint );
        var probeVector = probeNode.centerTop.minus( startPoint );

        var distanceAlongSegment = probeVector.dot( segmentVector ) / segmentVector.magnitude() / segmentVector.magnitude();
        distanceAlongSegment = Util.clamp( distanceAlongSegment, 0, 1 );

        assert && assert( distanceAlongSegment >= 0 && distanceAlongSegment <= 1, 'beyond the end of the wire' );
        var voltageAlongWire = Util.linear( 0, 1, wireNode.wire.startVertex.voltage, wireNode.wire.endVertex.voltage, distanceAlongSegment );

        return {
          vertex: wireNode.wire.startVertex,
          voltage: voltageAlongWire
        };
      }
      else {
        return null;
      }
    }
  } );
} );