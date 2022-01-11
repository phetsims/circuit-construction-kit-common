// Copyright 2016-2022, University of Colorado Boulder

/**
 * Shows controls for a single CircuitElement at the bottom of the screen and contained in a CircuitElementEditContainerNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import Property from '../../../axon/js/Property.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import merge from '../../../phet-core/js/merge.js';
import NumberControl from '../../../scenery-phet/js/NumberControl.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Circuit from '../model/Circuit.js';

// constants
const NUMBER_CONTROL_ELEMENT_MAX_WIDTH = 115;
const READOUT_MAX_WIDTH = 80;

class CircuitElementNumberControl extends NumberControl {
  private readonly disposeCircuitElementNumberControl: () => void;
  static NUMBER_CONTROL_ELEMENT_MAX_WIDTH: number;

  /**
   * @param title - text to show as a title
   * @param valuePattern - pattern for NumberControl to display the value as text
   * @param valueProperty - property this control changes
   * @param range
   * @param circuit - parent circuit
   * @param numberOfDecimalPlaces - number of decimal places
   * @param [providedOptions]
   */
  constructor( title: string, valuePattern: string, valueProperty: Property<number>, range: Range, circuit: Circuit,
               numberOfDecimalPlaces: number, providedOptions?: any ) {

    assert && assert( !!range, 'Range must be provided' );

    // When the user changes any parameter of any circuit element, signify it.
    const valuePropertyListener = () => circuit.componentEditedEmitter.emit();

    valueProperty.lazyLink( valuePropertyListener );

    const options = merge( {

      // subcomponent options
      titleNodeOptions: {
        maxWidth: NUMBER_CONTROL_ELEMENT_MAX_WIDTH,
        font: CCKCConstants.DEFAULT_FONT
      },
      numberDisplayOptions: {
        maxWidth: READOUT_MAX_WIDTH,
        valuePattern: valuePattern,
        decimalPlaces: numberOfDecimalPlaces,
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
      tandem: Tandem.OPT_OUT
    }, providedOptions );
    super( title, valueProperty, range, options );

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