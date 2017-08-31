// Copyright 2016-2017, University of Colorado Boulder

/**
 * Shows controls for a single CircuitElement at the bottom of the screen and contained in a
 * CircuitElementEditContainerPanel.
 * REVIEW*: Careful about naming things *Panel when they don't extend Panel. CircuitElementEditNode preferred.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var TrashButton = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/TrashButton' );
  var RotateBatteryButton = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/RotateBatteryButton' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var NumberControl = require( 'SCENERY_PHET/NumberControl' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );

  // constants
  var FONT = new PhetFont( CircuitConstructionKitCommonConstants.FONT_SIZE );

  /**
   * @param {string} title - text to show as a title
   * @param {string} valuePattern - pattern for NumberControl to display the value as text
   * @param {Property.<number>} valueProperty - property this control changes
   * @param {Circuit} circuit - parent circuit
   * @param {FixedCircuitElement} circuitElement - the CircuitElement controlled by this UI
   * @param {Tandem} tandem
   * @constructor
   */
  function CircuitElementEditPanel( title, valuePattern, valueProperty, circuit, circuitElement, tandem ) {

    // When the user changes any parameter of any circuit element, signify it.
    var valuePropertyListener = function() {
      circuit.componentEditedEmitter.emit();
    };
    valueProperty.lazyLink( valuePropertyListener );

    // Create the controls
    var numberControl = new NumberControl( title, valueProperty, circuitElement.editableRange, _.extend( {
      tandem: tandem.createTandem( 'numberControl' ),
      valuePattern: valuePattern
    }, {

      // Prevent overlap with the navigation bar
      thumbTouchAreaYDilation: 5,

      titleFont: FONT,
      valueFont: FONT,
      decimalPlaces: circuitElement.numberOfDecimalPlaces,
      delta: circuitElement.editorDelta
    } ) );

    var children = [];

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
    this.disposeCircuitElementEditPanel = function() {
      numberControl.dispose();
      valueProperty.unlink( valuePropertyListener );
    };

    HBox.call( this, {
      spacing: 40,
      children: children,
      align: 'bottom'
    } );
  }

  circuitConstructionKitCommon.register( 'CircuitElementEditPanel', CircuitElementEditPanel );

  return inherit( HBox, CircuitElementEditPanel, {

    /**
     * Dispose resources when no longer used.
     * @public
     * @override
     */
    dispose: function() {
      HBox.prototype.dispose.call( this );
      this.disposeCircuitElementEditPanel();
    }
  } );
} );