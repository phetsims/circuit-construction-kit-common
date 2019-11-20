// Copyright 2016-2019, University of Colorado Boulder

/**
 * Shows controls for a single CircuitElement at the bottom of the screen and contained in a CircuitElementEditContainerNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const merge = require( 'PHET_CORE/merge' );
  const NumberControl = require( 'SCENERY_PHET/NumberControl' );
  const Tandem = require( 'TANDEM/Tandem' );

  // constants
  const NUMBER_CONTROL_ELEMENT_MAX_WIDTH = 140;

  class CircuitElementNumberControl extends NumberControl {

    /**
     * @param {string} title - text to show as a title
     * @param {string} valuePattern - pattern for NumberControl to display the value as text
     * @param {Property.<number>} valueProperty - property this control changes
     * @param {Circuit} circuit - parent circuit
     * @param {FixedCircuitElement} circuitElement - the CircuitElement controlled by this UI
     * @param {Tandem} tandem
     * @param {Object} options
     */
    constructor( title, valuePattern, valueProperty, circuit, circuitElement, tandem, options ) {

      assert && assert( !!valueProperty.range, 'Range must be provided' );

      // When the user changes any parameter of any circuit element, signify it.
      const valuePropertyListener = () => circuit.componentEditedEmitter.emit();

      valueProperty.lazyLink( valuePropertyListener );

      // Create the controls
      super( title, valueProperty, valueProperty.range, merge( {

        // subcomponent options
        titleNodeOptions: {
          maxWidth: NUMBER_CONTROL_ELEMENT_MAX_WIDTH,
          font: CCKCConstants.DEFAULT_FONT
        },
        numberDisplayOptions: {
          maxWidth: NUMBER_CONTROL_ELEMENT_MAX_WIDTH,
          valuePattern: valuePattern,
          font: CCKCConstants.DEFAULT_FONT,
          decimalPlaces: circuitElement.numberOfDecimalPlaces
        },

        // Prevent overlap with the navigation bar
        sliderOptions: {
          thumbTouchAreaYDilation: 5
        },

        // Trick the NumberControl into thinking it and its children do not need to be instrumented
        // This prevents it from ending up in the state.  Luckily somehow, it still works properly
        // in the state wrapper, probably from this code being called anyways from when the circuit element
        // is selected.
        tandem: Tandem.optional
      }, options ) );

      // @private {function} - for disposal
      this.disposeCircuitElementNumberControl = () => valueProperty.unlink( valuePropertyListener );
    }

    /**
     * Dispose resources when no longer used.
     * @public
     * @override
     */
    dispose() {
      super.dispose();
      this.disposeCircuitElementNumberControl();
    }
  }

  return circuitConstructionKitCommon.register( 'CircuitElementNumberControl', CircuitElementNumberControl );
} );