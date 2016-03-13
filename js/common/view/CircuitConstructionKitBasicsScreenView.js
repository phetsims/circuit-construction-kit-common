// Copyright 2015, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var CircuitNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitNode' );
  var CircuitElementToolbox = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitElementToolbox' );
  var CircuitElementEditPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitElementEditPanel' );
  var SensorToolbox = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/SensorToolbox' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'DOT/Rectangle' );
  var VoltmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/VoltmeterNode' );
  var AmmeterNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/AmmeterNode' );
  var Emitter = require( 'AXON/Emitter' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );

  /**
   * @param {CircuitConstructionKitBasicsModel} circuitConstructionKitBasicsModel
   * @constructor
   */
  function CircuitConstructionKitBasicsScreenView( circuitConstructionKitBasicsModel ) {
    var circuitConstructionKitBasicsScreenView = this;
    this.circuitConstructionKitBasicsModel = circuitConstructionKitBasicsModel;
    this.circuitConstructionKitBasicsScreenViewLayoutCompletedEmitter = new Emitter();
    ScreenView.call( this );

    // Reset All button
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        circuitConstructionKitBasicsModel.reset();
      }
    } );
    this.addChild( resetAllButton );

    var voltmeterNode = new VoltmeterNode( circuitConstructionKitBasicsModel.voltmeter );
    circuitConstructionKitBasicsModel.voltmeter.droppedEmitter.addListener( function( bodyNodeGlobalBounds ) {
      if ( bodyNodeGlobalBounds.intersectsBounds( circuitConstructionKitBasicsScreenView.sensorToolbox.globalBounds ) ) {
        circuitConstructionKitBasicsModel.voltmeter.visible = false;
      }
    } );
    circuitConstructionKitBasicsModel.voltmeter.visibleProperty.link( function( visible ) {
      voltmeterNode.visible = visible;
    } );

    var ammeterNode = new AmmeterNode( circuitConstructionKitBasicsModel.ammeter );
    circuitConstructionKitBasicsModel.ammeter.droppedEmitter.addListener( function( bodyNodeGlobalBounds ) {
      if ( bodyNodeGlobalBounds.intersectsBounds( circuitConstructionKitBasicsScreenView.sensorToolbox.globalBounds ) ) {
        circuitConstructionKitBasicsModel.ammeter.visible = false;
      }
    } );
    circuitConstructionKitBasicsModel.ammeter.visibleProperty.link( function( visible ) {
      ammeterNode.visible = visible;
    } );

    // Pass the view into circuit node so that circuit elements can be dropped back into the toolbox
    this.circuitNode = new CircuitNode( circuitConstructionKitBasicsModel.circuit, this );
    this.circuitElementToolbox = new CircuitElementToolbox( circuitConstructionKitBasicsModel, this );

    // @protected - so that subclasses can add a layout circuit element near it
    this.sensorToolbox = new SensorToolbox( voltmeterNode, ammeterNode );

    this.addChild( this.sensorToolbox );
    this.addChild( this.circuitElementToolbox );
    this.addChild( this.circuitNode );

    var visibleBoundsProperty = new Property( new Rectangle( 0, 0, this.layoutBounds.width, this.layoutBounds.height ) );
    this.events.on( 'layoutFinished', function( dx, dy, width, height ) {

      // Float the resetAllButton to the bottom right
      var inset = CircuitConstructionKitBasicsConstants.layoutInset;
      resetAllButton.mutate( {
        right: -dx + width - inset,
        bottom: -dy + height - inset
      } );

      circuitConstructionKitBasicsScreenView.circuitElementToolbox.mutate( {
        left: -dx + inset,
        top: -dy + inset
      } );

      circuitConstructionKitBasicsScreenView.sensorToolbox.mutate( {
        right: -dx + width - inset,
        top: -dy + inset
      } );

      circuitElementEditPanel.mutate( {
        centerX: -dx + width / 2,
        bottom: -dy + height - inset
      } );
      visibleBoundsProperty.set( new Rectangle( -dx, -dy, width, height ) );

      circuitConstructionKitBasicsScreenView.circuitConstructionKitBasicsScreenViewLayoutCompletedEmitter.emit1( {
        dx: dx,
        dy: dy,
        width: width,
        height: height
      } );
    } );

    var circuitElementEditPanel = new CircuitElementEditPanel( circuitConstructionKitBasicsModel.circuit, visibleBoundsProperty );
    this.addChild( circuitElementEditPanel );

    this.addChild( voltmeterNode );
    this.addChild( ammeterNode );

    // Detection for voltmeter probe + circuit collision is done in the view since view bounds are used
    var updateVoltmeter = function() {
      var redConnection = circuitConstructionKitBasicsScreenView.getVoltage( voltmeterNode.redProbeNode );
      var blackConnection = circuitConstructionKitBasicsScreenView.getVoltage( voltmeterNode.blackProbeNode );
      if ( redConnection === null || blackConnection === null ) {
        circuitConstructionKitBasicsModel.voltmeter.voltage = null;
      }
      else {
        circuitConstructionKitBasicsModel.voltmeter.voltage = redConnection - blackConnection;
      }
    };
    circuitConstructionKitBasicsModel.circuit.circuitChangedEmitter.addListener( updateVoltmeter );
    circuitConstructionKitBasicsModel.voltmeter.redProbePositionProperty.link( updateVoltmeter );
    circuitConstructionKitBasicsModel.voltmeter.blackProbePositionProperty.link( updateVoltmeter );

    // Detection for ammeter probe + circuit collision is done in the view since view bounds are used
    var updateAmmeter = function() {
      var current = circuitConstructionKitBasicsScreenView.getCurrent( ammeterNode.probeNode );
      circuitConstructionKitBasicsModel.ammeter.current = current;
    };
    circuitConstructionKitBasicsModel.circuit.circuitChangedEmitter.addListener( updateAmmeter );
    circuitConstructionKitBasicsModel.ammeter.probePositionProperty.link( updateAmmeter );
  }

  return inherit( ScreenView, CircuitConstructionKitBasicsScreenView, {

    // TODO: Highlight the toolbox when something can drop over it.
    canNodeDropInToolbox: function( circuitElementNode ) {
      var isSingle = this.circuitConstructionKitBasicsModel.circuit.isSingle( circuitElementNode.circuitElement );
      var inBounds = this.circuitElementToolbox.globalBounds.containsPoint( circuitElementNode.globalBounds.center );
      return isSingle && inBounds;
    },

    dropCircuitElementNodeInToolbox: function( circuitElementNode ) {

      // Only drop in the box if it was a single component, if connected to other things, do not
      this.circuitConstructionKitBasicsModel.circuit.remove( circuitElementNode.circuitElement );
    },

    /**
     * Find where the voltmeter probe node intersects the wire, for computing the voltage difference
     * @param {Node} probeNode
     * @private
     */
    getCurrent: function( probeNode ) {

      // TODO: Collide with vertices
      for ( var i = 0; i < this.circuitNode.wireNodes.length; i++ ) {
        var wireNode = this.circuitNode.wireNodes[ i ];

        // TODO: is this too expensive on iPad?
        if ( wireNode.getStrokedShape().containsPoint( probeNode.translation ) ) {
          return wireNode.wire.current;
        }
      }
      return null;
    },

    /**
     * Find where the voltmeter probe node intersects the wire, for computing the voltage difference
     * @param {Node} probeNode
     * @private
     */
    getVoltage: function( probeNode ) {

      // TODO: refine rules for collisions, could use model coordinates with view shapes
      // TODO: Collide with wires
      var globalPoint = probeNode.globalBounds.centerTop;
      for ( var i = 0; i < this.circuitNode.vertexNodes.length; i++ ) {
        var vertexNode = this.circuitNode.vertexNodes[ i ];
        if ( vertexNode.globalBounds.containsPoint( globalPoint ) ) {
          return vertexNode.vertex.voltage;
        }
      }
      return null;
    },

    //TODO Called by the animation loop. Optional, so if your view has no animation, please delete this.
    step: function( dt ) {
      //TODO Handle view animation here.
    }
  } );
} );