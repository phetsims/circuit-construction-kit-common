// Copyright 2016-2017, University of Colorado Boulder

/**
 * Shows controls for a single CircuitElement at the bottom of the screen and contained in a CircuitElementEditContainerNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const inherit = require( 'PHET_CORE/inherit' );
  const NumberControl = require( 'SCENERY_PHET/NumberControl' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const RotateBatteryButton = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/RotateBatteryButton' );
  const TrashButton = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/TrashButton' );

  // constants
  const FONT = new PhetFont( CCKCConstants.FONT_SIZE );
  const NUMBER_CONTROL_ELEMENT_MAX_WIDTH = 140;

  /**
   * @param {string} title - text to show as a title
   * @param {string} valuePattern - pattern for NumberControl to display the value as text
   * @param {Property.<number>} valueProperty - property this control changes
   * @param {Circuit} circuit - parent circuit
   * @param {FixedCircuitElement} circuitElement - the CircuitElement controlled by this UI
   * @param {Tandem} tandem
   * @constructor
   */
  function CircuitElementEditNode( title, valuePattern, valueProperty, circuit, circuitElement, tandem ) {

    // When the user changes any parameter of any circuit element, signify it.
    const valuePropertyListener = function() {
      circuit.componentEditedEmitter.emit();
    };

    valueProperty.lazyLink( valuePropertyListener );

    // Create the controls
    const numberControl = new NumberControl( title, valueProperty, circuitElement.editableRange, {

      delta: circuitElement.editorDelta,

      // subcomponent options
      titleNodeOptions: {
        maxWidth: NUMBER_CONTROL_ELEMENT_MAX_WIDTH,
        font: FONT
      },
      numberDisplayOptions: {
        maxWidth: NUMBER_CONTROL_ELEMENT_MAX_WIDTH,
        valuePattern: valuePattern,
        font: FONT,
        decimalPlaces: circuitElement.numberOfDecimalPlaces
      },

      // Prevent overlap with the navigation bar
      sliderOptions: {
        thumbTouchAreaYDilation: 5
      },

      tandem: tandem.createTandem( 'numberControl' )
    } );

    const children = [];

    // Batteries can be reversed
    if ( circuitElement instanceof Battery ) {
      children.push( new RotateBatteryButton( circuit, circuitElement, tandem.createTandem( 'reverseBatteryButton' ) ) );
    }
    children.push( numberControl );

    // The button that deletes the circuit component
    if ( circuitElement.canBeDroppedInToolbox ) {
      children.push( new TrashButton( circuit, circuitElement, tandem.createTandem( 'trashButton' ) ) );
    }

    // @private {function} - for disposal
    this.disposeCircuitElementEditNode = function() {
      numberControl.dispose();
      valueProperty.unlink( valuePropertyListener );
    };

    HBox.call( this, {
      spacing: 40,
      children: children,
      align: 'bottom'
    } );
  }

  circuitConstructionKitCommon.register( 'CircuitElementEditNode', CircuitElementEditNode );

  return inherit( HBox, CircuitElementEditNode, {

    /**
     * Dispose resources when no longer used.
     * @public
     * @override
     */
    dispose: function() {
      HBox.prototype.dispose.call( this );
      this.disposeCircuitElementEditNode();
    }
  } );
} );