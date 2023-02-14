// Copyright 2016-2023, University of Colorado Boulder

/**
 * Shows controls for a single CircuitElement at the bottom of the screen and contained in a CircuitElementEditContainerNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import Property from '../../../axon/js/Property.js';
import ReadOnlyProperty from '../../../axon/js/ReadOnlyProperty.js';
import Dimension2 from '../../../dot/js/Dimension2.js';
import NumberControl, { LayoutFunction } from '../../../scenery-phet/js/NumberControl.js';
import { HBox, HBoxOptions, TextOptions } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Circuit from '../model/Circuit.js';
import CircuitElement from '../model/CircuitElement.js';
import ACVoltage from '../model/ACVoltage.js';
import Multilink, { UnknownMultilink } from '../../../axon/js/Multilink.js';
import optionize from '../../../phet-core/js/optionize.js';
import { NumberDisplayOptions } from '../../../scenery-phet/js/NumberDisplay.js';
import { SliderOptions } from '../../../sun/js/Slider.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import Vertex from '../model/Vertex.js';
import CCKCColors from './CCKCColors.js';

type SelfOptions = {
  titleNodeOptions?: TextOptions;
  numberDisplayOptions?: NumberDisplayOptions;
  layoutFunction?: LayoutFunction;
  sliderOptions?: SliderOptions;
  getAdditionalVisibilityProperties?: ( circuitElement: CircuitElement ) => ReadOnlyProperty<boolean>[];
  delta?: number;
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
      getAdditionalVisibilityProperties: ( c: CircuitElement ) => {return [];}
    }, providedOptions );
    const numberControl = new NumberControl( title, valueProperty, range, options );

    super( { children: [ numberControl ] } );

    // Use the "nested node" pattern to support multiple gates for making the control visible.  The numberControl itself
    // can be made invisible by phet-io customization (to hide all instances), and individual circuit elements
    // change the visibility of the parent.

    // Combine all proprty gates via AND
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

  public override dispose(): void {
    assert && assert( false, 'Should not be disposed' );
  }
}

circuitConstructionKitCommon.register( 'CircuitElementNumberControl', CircuitElementNumberControl );