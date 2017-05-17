// Copyright 2017, University of Colorado Boulder

/**
 * Readout that appears in the CircuitElementEditContainerPanel that displays whether the switch is open or closed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var theSwitchIsOpenString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/theSwitchIsOpen' );
  var theSwitchIsClosedString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/theSwitchIsClosed' );

  /**
   * @param {Switch} circuitSwitch - the selected Switch
   * @constructor
   */
  function SwitchReadoutNode( circuitSwitch ) {

    // Create both texts and display both so they remain aligned as the value changes
    var closedText = new Text( theSwitchIsClosedString, {
      fontSize: 24,
      maxWidth: 300
    } );
    var openText = new Text( theSwitchIsOpenString, {
      fontSize: 24,
      maxWidth: 300
    } );

    Node.call( this, {
      children: [ closedText, openText ]
    } );

    var closedListener = function( closed ) {
      closedText.visible = closed;
      openText.visible = !closed;
    };
    circuitSwitch.closedProperty.link( closedListener );

    // @private
    this.disposeSwitchReadoutNode = function() {
      circuitSwitch.closedProperty.unlink( closedListener );
    };
  }

  circuitConstructionKitCommon.register( 'SwitchReadoutNode', SwitchReadoutNode );

  return inherit( Node, SwitchReadoutNode, {

    /**
     * @public - dispose when no longer used
     */
    dispose: function() {
      this.disposeSwitchReadoutNode();
      Node.prototype.dispose.call( this );
    }
  } );
} );