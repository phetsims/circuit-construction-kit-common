// Copyright 2017, University of Colorado Boulder

/**
 * Readout that appears in the CircuitElementEditContainerNode that displays whether the switch is open or closed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const inherit = require( 'PHET_CORE/inherit' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Text = require( 'SCENERY/nodes/Text' );
  const TrashButton = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/TrashButton' );

  // strings
  const theSwitchIsClosedString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/theSwitchIsClosed' );
  const theSwitchIsOpenString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/theSwitchIsOpen' );

  // constants
  const MAX_TEXT_WIDTH = 300;

  /**
   * @param {Circuit} circuit - the circuit from which the switch can be removed when the trash button is pressed
   * @param {Switch} circuitSwitch - the switch
   * @param {Tandem} tandem
   * @constructor
   */
  function SwitchReadoutNode( circuit, circuitSwitch, tandem ) {

    // Create both texts and display both so they remain aligned as the value changes
    const closedText = new Text( theSwitchIsClosedString, {
      fontSize: 24,
      maxWidth: MAX_TEXT_WIDTH
    } );
    const openText = new Text( theSwitchIsOpenString, {
      fontSize: 24,
      maxWidth: MAX_TEXT_WIDTH
    } );

    const maxWidth = Math.max( closedText.width, openText.width );

    const closedListener = closed => {
      closedText.visible = closed;
      openText.visible = !closed;
    };
    circuitSwitch.closedProperty.link( closedListener );

    // Show a trash button to the right of the text
    const trashButton = new TrashButton( circuit, circuitSwitch, tandem.createTandem( 'trashButton' ) ).mutate( {
      left: maxWidth + 10,
      centerY: closedText.centerY
    } );

    Node.call( this, {
      children: [ closedText, openText, trashButton ]
    } );

    // @private {function}
    this.disposeSwitchReadoutNode = () => circuitSwitch.closedProperty.unlink( closedListener );
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