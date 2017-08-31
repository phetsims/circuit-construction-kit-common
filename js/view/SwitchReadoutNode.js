// Copyright 2017, University of Colorado Boulder

/**
 * Readout that appears in the CircuitElementEditContainerNode that displays whether the switch is open or closed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var TrashButton = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/TrashButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var theSwitchIsClosedString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/theSwitchIsClosed' );
  var theSwitchIsOpenString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/theSwitchIsOpen' );

  // constants
  var MAX_TEXT_WIDTH = 300;

  /**
   * @param {Circuit} circuit - the circuit from which the switch can be removed when the trash button is pressed
   * @param {Switch} circuitSwitch - the switch
   * @param {Tandem} tandem
   * @constructor
   */
  function SwitchReadoutNode( circuit, circuitSwitch, tandem ) {

    // Create both texts and display both so they remain aligned as the value changes
    var closedText = new Text( theSwitchIsClosedString, {
      fontSize: 24,
      maxWidth: MAX_TEXT_WIDTH
    } );
    var openText = new Text( theSwitchIsOpenString, {
      fontSize: 24,
      maxWidth: MAX_TEXT_WIDTH
    } );

    var maxWidth = Math.max( closedText.width, openText.width );

    var closedListener = function( closed ) {
      closedText.visible = closed;
      openText.visible = !closed;
    };
    circuitSwitch.closedProperty.link( closedListener );

    // Show a trash button to the right of the text
    var trashButton = new TrashButton( circuit, circuitSwitch, tandem.createTandem( 'trashButton' ) ).mutate( {
      left: maxWidth + 10,
      centerY: closedText.centerY
    } );

    Node.call( this, {
      children: [ closedText, openText, trashButton ]
    } );

    // @private
    this.disposeSwitchReadoutNode = function() {
      circuitSwitch.closedProperty.unlink( closedListener );
    };
  }

  circuitConstructionKitCommon.register( 'SwitchReadoutNode', SwitchReadoutNode );

  return inherit( Node, SwitchReadoutNode, {

    /**
     * @public - dispose when no longer used
     * @override
     */
    dispose: function() {
      this.disposeSwitchReadoutNode();
      Node.prototype.dispose.call( this );
    }
  } );
} );