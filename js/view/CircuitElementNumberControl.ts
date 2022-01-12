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

class CircuitElementNumberControl extends NumberControl {
  private readonly disposeCircuitElementNumberControl: () => void;
  static NUMBER_CONTROL_ELEMENT_MAX_WIDTH = 115;

  constructor( title: string, valuePattern: string, valueProperty: Property<number>, range: Range, circuit: Circuit,
               numberOfDecimalPlaces: number, providedOptions?: any ) {

    // When the user changes any parameter of any circuit element, signify it.
    // TODO: Should this be done through Circuit?  Why is this wired here in the view?  See https://github.com/phetsims/circuit-construction-kit-common/issues/513
    const valuePropertyListener = () => circuit.componentEditedEmitter.emit();

    valueProperty.lazyLink( valuePropertyListener );

    const options = merge( {
      titleNodeOptions: {
        maxWidth: CircuitElementNumberControl.NUMBER_CONTROL_ELEMENT_MAX_WIDTH,
        font: CCKCConstants.DEFAULT_FONT
      },
      numberDisplayOptions: {
        maxWidth: 80,
        valuePattern: valuePattern,
        decimalPlaces: numberOfDecimalPlaces,
        textOptions: {
          font: CCKCConstants.DEFAULT_FONT
        }
      },
      layoutFunction: NumberControl.createLayoutFunction1( {
        arrowButtonsXSpacing: 9
      } ),
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

  dispose() {
    super.dispose();
    this.disposeCircuitElementNumberControl();
  }
}

circuitConstructionKitCommon.register( 'CircuitElementNumberControl', CircuitElementNumberControl );
export default CircuitElementNumberControl;