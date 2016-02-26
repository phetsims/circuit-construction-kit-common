// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var CircuitConstructionKitBasicsPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitConstructionKitBasicsPanel' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Battery' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/LightBulb' );

  /**
   * @param {CircuitConstructionKitBasicsModel} circuitConstructionKitBasicsModel
   * @param {CircuitConstructionKitBasicsScreenView} circuitConstructionKitBasicsScreenView - I considered passing a function here, but recalled arguments by
   *                                                      - @jonathanolson and others about easier navigability of passing the object
   *                                                      - and invoking a method on it (despite this breaking encapsulation)
   * @constructor
   */
  function CircuitComponentToolbox( circuitConstructionKitBasicsModel, circuitConstructionKitBasicsScreenView ) {

    var circuitComponentToolbox = this;
    // From: https://github.com/phetsims/scenery-phet/issues/195#issuecomment-186300071
    // @jonathanolson and I looked into the way Charges and Fields just calls startDrag(event) on the play area drag listener (which adds a listener to the pointer, in the usual SimpleDragHandler way), and it seems like a good pattern. I will try this pattern for Circuit Construction Kit, when I am working on the toolbox listeners.
    var batteryIcon = new Text( 'battery', { fontSize: 28 } );

    var createToolIconInputListener = function( createComponent, modelList, viewList, getCircuitComponentFromNode ) {
      return {
        down: function( event ) {

          // Ignore non-left-mouse-button
          // TODO: why? see https://github.com/phetsims/charges-and-fields/issues/76
          if ( event.pointer.isMouse && event.domEvent.button !== 0 ) {
            return;
          }

          // initial position of the pointer in the screenView coordinates
          var viewPosition = circuitComponentToolbox.globalToParentPoint( event.pointer.point );
          var component = createComponent( viewPosition );
          modelList.add( component );
          var matchedBatteryNodes = viewList.filter( function( componentNode ) {
            return getCircuitComponentFromNode( componentNode ) === component;
          } );
          assert && assert( matchedBatteryNodes.length === 1, 'should have found the one and only node for this battery' );
          var batteryNode = matchedBatteryNodes[ 0 ];
          batteryNode.movableDragHandler.startDrag( event );
        }
      };
    };
    batteryIcon.addInputListener( createToolIconInputListener(
      function() {
        return new Battery();
      },
      circuitConstructionKitBasicsModel.circuit.batteries,
      circuitConstructionKitBasicsScreenView.circuitNode.batteryNodes,
      function( batteryNode ) {
        return batteryNode.battery;
      }
    ) );

    var lightBulbIcon = new Text( 'lightbulb', { fontSize: 28 } );
    lightBulbIcon.addInputListener( createToolIconInputListener(
      function() {
        return new LightBulb();
      },
      circuitConstructionKitBasicsModel.circuit.lightBulbs,
      circuitConstructionKitBasicsScreenView.circuitNode.lightBulbNodes,
      function( lightBulbNode ) {
        return lightBulbNode.lightBulb;
      }
    ) );
    CircuitConstructionKitBasicsPanel.call( this, new VBox( {
      children: [
        new Text( 'wire', { fontSize: 28 } ),
        batteryIcon,
        lightBulbIcon,
        new Text( 'resistor', { fontSize: 28 } )
      ]
    } ) );
  }

  circuitConstructionKitBasics.register( 'CircuitComponentToolbox', CircuitComponentToolbox );
  return inherit( CircuitConstructionKitBasicsPanel, CircuitComponentToolbox, {} );
} );