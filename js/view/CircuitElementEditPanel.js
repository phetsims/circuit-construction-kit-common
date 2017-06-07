// Copyright 2016-2017, University of Colorado Boulder

/**
 * Shows controls for a single CircuitElement at the bottom of the screen and contained in a
 * CircuitElementEditContainerPanel.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var NumberControl = require( 'SCENERY_PHET/NumberControl' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Range = require( 'DOT/Range' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var CCKTrashButton = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CCKTrashButton' );

  // strings
  var valueUnitsPatternString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/valueUnitsPattern' );

  // constants
  var FONT = new PhetFont( 14 );

  /**
   * @param {string} title - text to show as a title
   * @param {string} units - units for the value to change
   * @param {Property.<number>} valueProperty - property this control changes
   * @param {Circuit} circuit - parent circuit
   * @param {FixedLengthCircuitElement} circuitElement - the CircuitElement controlled by this UI
   * @param {Tandem} tandem
   * @constructor
   */
  function CircuitElementEditPanel( title, units, valueProperty, circuit, circuitElement, tandem ) {

    // When the user changes any parameter of any circuit element, signify it.
    var valuePropertyListener = function() {
      circuit.componentEditedEmitter.emit();
    };
    valueProperty.lazyLink( valuePropertyListener );

    // Create the controls
    var numberControl = new NumberControl( title, valueProperty, circuitElement.editableRange, _.extend( {
      tandem: tandem.createTandem( 'numberControl' ),
      valuePattern: StringUtils.fillIn( valueUnitsPatternString, { units: units } )
    }, {
      titleFont: FONT,
      valueFont: FONT,
      decimalPlaces: 1,
      delta: 0.5
    } ) );

    // The button that deletes the circuit component
    var trashButton = new CCKTrashButton( circuit, circuitElement, tandem.createTandem( 'trashButton' ) );
    var children = [ numberControl ];
    circuitElement.canBeDroppedInToolbox && children.push( trashButton );

    // @private - for disposal
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
     */
    dispose: function() {
      HBox.prototype.dispose.call( this );
      this.disposeCircuitElementEditPanel();
    }
  } );
} );