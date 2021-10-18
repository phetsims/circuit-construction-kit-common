// Copyright 2016-2021, University of Colorado Boulder

/**
 * Shows controls for a single CircuitElement at the bottom of the screen and contained in a CircuitElementEditContainerNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import merge from '../../../phet-core/js/merge.js';
import NumberControl from '../../../scenery-phet/js/NumberControl.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Circuit from '../model/Circuit.js';
import FixedCircuitElement from '../model/FixedCircuitElement.js';

// constants
const NUMBER_CONTROL_ELEMENT_MAX_WIDTH = 115;
const READOUT_MAX_WIDTH = 80;

class CircuitElementNumberControl extends NumberControl {
  private readonly disposeCircuitElementNumberControl: () => void;
  static NUMBER_CONTROL_ELEMENT_MAX_WIDTH: number;

  /**
   * @param {string} title - text to show as a title
   * @param {string} valuePattern - pattern for NumberControl to display the value as text
   * @param {Property.<number>} valueProperty - property this control changes
   * @param {Circuit} circuit - parent circuit
   * @param {FixedCircuitElement} circuitElement - the CircuitElement controlled by this UI
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( title: string, valuePattern: string, valueProperty: NumberProperty, circuit: Circuit, circuitElement: FixedCircuitElement, tandem: Tandem, options?: object ) {

    assert && assert( !!valueProperty.range, 'Range must be provided' );

    // When the user changes any parameter of any circuit element, signify it.
    const valuePropertyListener = () => circuit.componentEditedEmitter.emit();

    valueProperty.lazyLink( valuePropertyListener );

    // Create the controls
    super( title, valueProperty, valueProperty.range!, merge( {

      // subcomponent options
      titleNodeOptions: {
        maxWidth: NUMBER_CONTROL_ELEMENT_MAX_WIDTH,
        font: CCKCConstants.DEFAULT_FONT
      },
      numberDisplayOptions: {
        maxWidth: READOUT_MAX_WIDTH,
        valuePattern: valuePattern,
        decimalPlaces: circuitElement.numberOfDecimalPlaces,
        textOptions: {
          font: CCKCConstants.DEFAULT_FONT
        }
      },
      layoutFunction: NumberControl.createLayoutFunction1( {
        arrowButtonsXSpacing: 9
      } ),

      // Prevent overlap with the navigation bar
      sliderOptions: {
        thumbTouchAreaYDilation: 5,
        thumbSize: new Dimension2( 10, 20 ),
        trackSize: new Dimension2( 120, 4 )
      },

      // Trick the NumberControl into thinking it and its children do not need to be instrumented
      // This prevents it from ending up in the state.  Luckily somehow, it still works properly
      // in the state wrapper, probably from this code being called anyways from when the circuit element
      // is selected.
      tandem: Tandem.OPTIONAL
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

// @public {number}
CircuitElementNumberControl.NUMBER_CONTROL_ELEMENT_MAX_WIDTH = NUMBER_CONTROL_ELEMENT_MAX_WIDTH;

circuitConstructionKitCommon.register( 'CircuitElementNumberControl', CircuitElementNumberControl );
export default CircuitElementNumberControl;