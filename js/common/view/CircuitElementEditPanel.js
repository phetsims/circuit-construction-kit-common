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
  var RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var RangeWithValue = require( 'DOT/RangeWithValue' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

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
   * @param {Object} [options]
   * @constructor
   */
  function CircuitElementEditPanel( title, units, valueProperty, circuit, circuitElement, tandem, options ) {
    options = _.extend( { numberControlEnabled: true }, options );

    // Use a proxy property so we can track whether the changes were from the user interface or from the model (e.g. the
    // resistance of a wire changing when its length changes).
    // TODO: this is not a practical example since wire resistance cannot be edited through this UI.  Is the proxy still
    // necessary?
    var proxyProperty = new NumberProperty( valueProperty.value );
    var changing = false;

    // Listener that is called when the proxy property changes
    var proxyListener = function( value ) {
      valueProperty.value = value;
      if ( !changing ) {
        circuit.componentEditedEmitter.emit();
      }
    };
    proxyProperty.lazyLink( proxyListener );

    // Bind from the model property to the proxy property
    var valueListener = function( value ) {
      changing = true;
      proxyProperty.value = value;
      changing = false;
    };
    valueProperty.lazyLink( valueListener );

    // Create the controls using the proxy
    var numberControl = new NumberControl( title, proxyProperty, new RangeWithValue( 0, 100 ), _.extend( {
      tandem: tandem.createTandem( 'numberControl' ),
      valuePattern: StringUtils.fillIn( valueUnitsPatternString, { units: units } )
    }, {
      titleFont: FONT,
      valueFont: FONT,
      decimalPlaces: 1,
      delta: 0.5
    } ) );

    // The button that deletes the circuit component
    var trashButton = new RoundPushButton( {
      baseColor: PhetColorScheme.PHET_LOGO_YELLOW,
      content: new FontAwesomeNode( 'trash', {
        scale: CircuitConstructionKitConstants.FONT_AWESOME_ICON_SCALE
      } ),
      listener: function() {
        circuit.remove( circuitElement );
      },
      minXMargin: 10,
      minYMargin: 10,
      tandem: tandem.createTandem( 'trashButton' )
    } );
    var children = [];
    options.numberControlEnabled && children.push( numberControl );
    circuitElement.canBeDroppedInToolbox && children.push( trashButton );

    // @private - for disposal
    this.disposeCircuitElementEditPanel = function() {
      numberControl.dispose();
      valueProperty.unlink( valueListener );
      proxyProperty.unlink( proxyListener );
      proxyProperty.dispose();
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