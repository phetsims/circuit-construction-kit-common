// Copyright 2016-2026, University of Colorado Boulder

/**
 * Shows controls for a single CircuitElement at the bottom of the screen and contained in a CircuitElementEditContainerNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Multilink, { type UnknownMultilink } from '../../../axon/js/Multilink.js';
import type Property from '../../../axon/js/Property.js';
import type ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import type { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import type Range from '../../../dot/js/Range.js';
import { roundSymmetric } from '../../../dot/js/util/roundSymmetric.js';
import { roundToInterval } from '../../../dot/js/util/roundToInterval.js';
import affirm from '../../../perennial-alias/js/browser-and-node/affirm.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import NumberControl, { type LayoutFunction, NumberControlOptions } from '../../../scenery-phet/js/NumberControl.js';
import { type NumberDisplayOptions } from '../../../scenery-phet/js/NumberDisplay.js';
import HBox, { type HBoxOptions } from '../../../scenery/js/layout/nodes/HBox.js';
import { type TextOptions } from '../../../scenery/js/nodes/Text.js';
import { type SliderOptions } from '../../../sun/js/Slider.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import ACVoltage from '../model/ACVoltage.js';
import type Circuit from '../model/Circuit.js';
import CircuitElement from '../model/CircuitElement.js';
import type Vertex from '../model/Vertex.js';
import CCKCColors from './CCKCColors.js';

type SelfOptions = {
  titleNodeOptions?: TextOptions;
  numberDisplayOptions?: NumberDisplayOptions;
  layoutFunction?: LayoutFunction;
  sliderOptions?: SliderOptions;
  getAdditionalVisibilityProperties?: ( circuitElement: CircuitElement ) => ReadOnlyProperty<boolean>[];
  delta?: number;
  pointerRoundingInterval: number;
};
type CircuitElementNumberControlOptions = SelfOptions & HBoxOptions;

// Extend HBox so an invisible parent will auto-layout (not leave a blank hole)
export default class CircuitElementNumberControl extends HBox {
  public static readonly NUMBER_CONTROL_ELEMENT_MAX_WIDTH = 115;

  public constructor( title: TReadOnlyProperty<string>, valuePattern: TReadOnlyProperty<string>, valueProperty: Property<number>, range: Range, circuit: Circuit,
                      numberOfDecimalPlaces: number, providedOptions?: CircuitElementNumberControlOptions ) {

    // When the user changes any parameter of any circuit element, signify it.
    const valuePropertyListener = () => circuit.componentEditedEmitter.emit();

    valueProperty.lazyLink( valuePropertyListener );

    const options = optionize<CircuitElementNumberControlOptions, SelfOptions, HBoxOptions>()( {
      delta: 0.01,
      titleNodeOptions: {
        maxWidth: CircuitElementNumberControl.NUMBER_CONTROL_ELEMENT_MAX_WIDTH,
        font: CCKCConstants.DEFAULT_FONT,
        fill: CCKCColors.textFillProperty
      },
      numberDisplayOptions: {
        maxWidth: 94,
        valuePattern: valuePattern,
        decimalPlaces: numberOfDecimalPlaces,
        textOptions: {
          font: CCKCConstants.DEFAULT_FONT,
          fill: CCKCColors.textFillProperty
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
      tandem: Tandem.OPT_OUT,
      isDisposable: false,
      getAdditionalVisibilityProperties: ( c: CircuitElement ) => {return [];}
    }, providedOptions );

    affirm( options.sliderOptions.drag === undefined, 'expected undefined options.sliderOptions.drag' );

    options.sliderOptions.drag = event => {

      // when from mouse, round. HACK ALERT, see https://github.com/phetsims/circuit-construction-kit-common/issues/1103#issuecomment-3661150577
      if ( !event.isFromPDOM() ) {

        valueProperty.value = range.constrainValue( roundToInterval( valueProperty.value, options.pointerRoundingInterval ) );
      }
    };

    // Calculate numberOfMiddleThresholds based on range and keyboardStep for continuous slider sounds.
    const keyboardStep = options.sliderOptions.keyboardStep;
    const numberOfMiddleThresholds = keyboardStep ? roundSymmetric( range.getLength() / keyboardStep ) : 5;

    const numberControl = new NumberControl( title, valueProperty, range, combineOptions<NumberControlOptions>( {
      valueChangeSoundGeneratorOptions: {
        numberOfMiddleThresholds: numberOfMiddleThresholds
      }
    }, options ) );

    super( { children: [ numberControl ] } );

    // Use the "nested node" pattern to support multiple gates for making the control visible.  The numberControl itself
    // can be made invisible by phet-io customization (to hide all instances), and individual circuit elements
    // change the visibility of the parent.

    // Combine all property gates via AND
    const listener = ( ...isEditable: boolean[] ) => this.setVisible( !isEditable.includes( false ) );

    let multilink: UnknownMultilink | null = null;

    // This is reused across all instances. The control itself can be hidden by PhET-iO customization, but the parent
    // node is another gate for the visibility.
    circuit.selectionProperty.link( ( newCircuitElement: CircuitElement | Vertex | null, oldCircuitElement: CircuitElement | Vertex | null ) => {
      oldCircuitElement instanceof ACVoltage && multilink && Multilink.unmultilink( multilink );
      if ( newCircuitElement instanceof CircuitElement ) {

        const otherGates = options.getAdditionalVisibilityProperties( newCircuitElement );
        multilink = Multilink.multilinkAny( [ newCircuitElement.isEditableProperty, ...otherGates ], listener );
      }
    } );
  }
}

circuitConstructionKitCommon.register( 'CircuitElementNumberControl', CircuitElementNumberControl );