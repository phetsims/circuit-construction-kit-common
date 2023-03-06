// Copyright 2017-2023, University of Colorado Boulder

/**
 * When enabled, shows the readout above circuit elements, such as "9.0 V" for a 9 volt battery.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { Color, Node, RichText, RichTextOptions, Text, TextOptions, VBox } from '../../../scenery/js/imports.js';
import Panel from '../../../sun/js/Panel.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Capacitor from '../model/Capacitor.js';
import Fuse from '../model/Fuse.js';
import Inductor from '../model/Inductor.js';
import LightBulb from '../model/LightBulb.js';
import Resistor from '../model/Resistor.js';
import Switch from '../model/Switch.js';
import VoltageSource from '../model/VoltageSource.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CircuitElement from '../model/CircuitElement.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import Multilink from '../../../axon/js/Multilink.js';
import { combineOptions } from '../../../phet-core/js/optionize.js';
import CCKCColors from './CCKCColors.js';

const capacitanceFaradsSymbolStringProperty = CircuitConstructionKitCommonStrings.capacitanceFaradsSymbolStringProperty;
const fuseValueStringProperty = CircuitConstructionKitCommonStrings.fuseValueStringProperty;
const inductanceHenriesSymbolStringProperty = CircuitConstructionKitCommonStrings.inductanceHenriesSymbolStringProperty;
const resistanceOhmsSymbolStringProperty = CircuitConstructionKitCommonStrings.resistanceOhmsSymbolStringProperty;
const voltageUnitsStringProperty = CircuitConstructionKitCommonStrings.voltageUnitsStringProperty;

// constants
const VERTICAL_OFFSET = 24;

// Big enough to see when zoomed out
const FONT = new PhetFont( { size: 22 } );

/**
 * For convenience, creates a Text node with empty content and the specified tandem.
 * @param tandem
 * @param [providedOptions]
 */
const createText = ( tandem: Tandem, providedOptions?: TextOptions ) => new Text( '', combineOptions<TextOptions>( {
  tandem: tandem,
  font: FONT,
  fill: CCKCColors.textFillProperty
}, providedOptions ) );

/**
 * For convenience, creates a RichText node with empty content and the specified tandem.
 * @param tandem
 * @param [providedOptions]
 */
const createRichText = ( tandem: Tandem, providedOptions?: RichTextOptions ) => new RichText( '', combineOptions<TextOptions>( {
  tandem: tandem,
  font: FONT
}, providedOptions ) );

const infinitySpan = '<span style="font-size: 26px; font-family: serif;"><b>∞</b></span>';

export default class ValueNode extends Panel {
  private readonly disposeValueNode: () => void;

  /**
   * @param sourceResistanceProperty - user-specified value for internal resistance for batteries
   * @param circuitElement
   * @param showValuesProperty
   * @param viewTypeProperty
   * @param tandem
   */
  public constructor( sourceResistanceProperty: Property<number>, circuitElement: CircuitElement, showValuesProperty: Property<boolean>, viewTypeProperty: Property<CircuitElementViewType>, tandem: Tandem ) {

    const contentNode = new VBox( {
      maxWidth: 130
    } );

    let readoutValueNode: Node | null;
    let update: null | ( () => void ) = null;
    if ( circuitElement instanceof VoltageSource ) {

      const voltageText = createText( tandem.createTandem( 'voltageText' ) );

      const voltageMultilink = Multilink.multilink( [ circuitElement.voltageProperty, voltageUnitsStringProperty ], ( voltage, voltageString ) => {
        voltageText.string = StringUtils.fillIn( voltageString, {
          voltage: Utils.toFixed( voltage, circuitElement.numberOfDecimalPlaces )
        } );
        update && update();
      } );

      // Battery readouts shows voltage and internal resistance if it is nonzero
      readoutValueNode = new VBox( {
        align: 'right',
        children: [ voltageText ]
      } );

      const resistanceNode = createText( tandem.createTandem( 'resistanceText' ) );

      const sourceResistanceMultilink = Multilink.multilink( [ sourceResistanceProperty, resistanceOhmsSymbolStringProperty ], ( sourceResistance, sourceResistanceString ) => {
        resistanceNode.string = StringUtils.fillIn( sourceResistanceString, {
          resistance: Utils.toFixed( sourceResistance, 1 )
        } );

        // If the children should change, update them here
        const desiredChildren = sourceResistance > CCKCQueryParameters.batteryMinimumResistance ? [ voltageText, resistanceNode ] : [ voltageText ];

        // Only set children if changed
        if ( readoutValueNode!.getChildrenCount() !== desiredChildren.length ) {
          readoutValueNode!.children = desiredChildren;
        }
        update && update();
      } );

      contentNode.disposeEmitter.addListener( () => {
        voltageMultilink.dispose();
        sourceResistanceMultilink.dispose();
      } );
    }

    else if ( circuitElement instanceof Resistor ||
              circuitElement instanceof LightBulb ) {
      readoutValueNode = createText( tandem.createTandem( 'resistanceText' ) );

      // Items like the hand and dog and high resistance resistor shouldn't show ".0"

      const resistanceMultilink = Multilink.multilink( [ circuitElement.resistanceProperty, resistanceOhmsSymbolStringProperty ], ( resistance, resistanceString ) => {
        ( readoutValueNode as Text ).string = StringUtils.fillIn( resistanceString, {
          resistance: Utils.toFixed( resistance, circuitElement.numberOfDecimalPlaces )
        } );
        update && update();
      } );

      contentNode.disposeEmitter.addListener( () => resistanceMultilink.dispose() );
    }
    else if ( circuitElement instanceof Capacitor ) {
      readoutValueNode = createText( tandem.createTandem( 'capacitorText' ) );

      // Items like the hand and dog and high resistance resistor shouldn't show ".0"

      const capacitanceMultilink = Multilink.multilink( [ circuitElement.capacitanceProperty, capacitanceFaradsSymbolStringProperty ], ( capacitance, capacitanceString ) => {
        ( readoutValueNode as Text ).string = StringUtils.fillIn( capacitanceString, {
          resistance: Utils.toFixed( capacitance, circuitElement.numberOfDecimalPlaces )
        } );
        update && update();
      } );

      contentNode.disposeEmitter.addListener( () => capacitanceMultilink.dispose() );
    }
    else if ( circuitElement instanceof Inductor ) {
      readoutValueNode = createText( tandem.createTandem( 'inductorText' ) );

      const inductanceMultilink = Multilink.multilink( [ circuitElement.inductanceProperty, inductanceHenriesSymbolStringProperty ], ( inductance, inductanceString ) => {
        ( readoutValueNode as Text ).string = StringUtils.fillIn( inductanceString, {
          resistance: Utils.toFixed( inductance, circuitElement.numberOfDecimalPlaces )
        } );
        update && update();
      } );

      contentNode.disposeEmitter.addListener( () => inductanceMultilink.dispose() );
    }
    else if ( circuitElement instanceof Switch ) {

      // Make it easier to read the infinity symbol, see https://github.com/phetsims/circuit-construction-kit-dc/issues/135
      readoutValueNode = createRichText( tandem.createTandem( 'switchText' ) );

      const switchMultilink = Multilink.multilink( [ circuitElement.resistanceProperty, resistanceOhmsSymbolStringProperty ], ( resistance, resistanceString ) => {
        ( readoutValueNode as RichText ).string = StringUtils.fillIn( resistanceString, {

          // Using a serif font makes the infinity symbol look less lopsided
          resistance: resistance > 100000 ? infinitySpan : '0'
        } );

        // Account for the switch open and close geometry for positioning the label.  When the switch is open
        // the label must be higher
        update && update();
      } );

      contentNode.disposeEmitter.addListener( () => switchMultilink.dispose() );
    }
    else if ( circuitElement instanceof Fuse ) {
      readoutValueNode = createRichText( tandem.createTandem( 'fuseText' ), {
        align: 'right',
        fill: CCKCColors.textFillProperty
      } );
      const multilink = Multilink.multilink( [ circuitElement.resistanceProperty, circuitElement.currentRatingProperty, fuseValueStringProperty ],
        ( resistance, currentRating, fuseValueString ) => {
          const milliOhmString = resistance === CCKCConstants.MAX_RESISTANCE ? infinitySpan :
                                 Utils.toFixed( resistance * 1000, circuitElement.numberOfDecimalPlaces );
          ( readoutValueNode as RichText ).string = StringUtils.fillIn( fuseValueString, {

            // Convert to milli
            resistance: milliOhmString,
            currentRating: Utils.toFixed( currentRating, circuitElement.numberOfDecimalPlaces )
          } );
          update && update();
        }
      );
      contentNode.disposeEmitter.addListener( () => multilink.dispose() );
    }
    else {
      throw new Error( `ValueNode cannot be shown for ${circuitElement.constructor.name}` );
    }

    assert && assert( readoutValueNode, 'Content node should be defined' );

    if ( CCKCQueryParameters.showCurrents ) {
      const text = new Text( '', { fill: CCKCColors.textFillProperty } );
      Multilink.multilink( [ circuitElement.currentProperty, circuitElement.currentSenseProperty ], ( current, sense ) => {
        text.string = sense.toString() + ', ' + current.toFixed( 4 );// eslint-disable-line bad-sim-text
      } );

      readoutValueNode = new VBox( { children: [ readoutValueNode, text ] } );
    }

    const customLabelNode = new Text( '', { font: FONT, fill: CCKCColors.textFillProperty } );
    contentNode.children = [
      customLabelNode,
      readoutValueNode
    ];

    super( contentNode, {
      stroke: null,
      fill: new Color( 255, 255, 255, 0.6 ), // put transparency in the color so that the children aren't transparent
      tandem: tandem,
      cornerRadius: 3,
      xMargin: 3,
      yMargin: 1,
      visiblePropertyOptions: {
        phetioReadOnly: true // controlled by the CircuitElement.isValueDisplayableProperty
      },
      pickable: false
    } );

    const matrix = Matrix3.identity();

    update = () => {

      readoutValueNode!.visible = showValuesProperty.value && circuitElement.isValueDisplayableProperty.value;

      const customLabelText = circuitElement.labelStringProperty.value;
      customLabelNode.string = customLabelText;
      customLabelNode.visible = customLabelText.length > 0;

      // For a light bulb, choose the part of the filament in the top center for the label, see
      // https://github.com/phetsims/circuit-construction-kit-common/issues/325
      const distance = circuitElement instanceof LightBulb ? 0.56 : 0.5;

      // The label partially overlaps the component to make it clear which label goes with which component
      circuitElement.updateMatrixForPoint( circuitElement.chargePathLength * distance, matrix );
      const delta = Vector2.createPolar( VERTICAL_OFFSET, matrix.rotation + 3 * Math.PI / 2 );

      // Put the label above the circuit element, see https://github.com/phetsims/circuit-construction-kit-common/issues/845
      if ( delta.y > 0 ) {
        delta.y = -delta.y;
      }
      this.centerBottom = matrix.translation.plus( delta.timesScalar( 0.8 ) );
    };

    circuitElement.vertexMovedEmitter.addListener( update );
    circuitElement.isValueDisplayableProperty.link( update );

    update();
    showValuesProperty.link( update );
    viewTypeProperty.link( update );
    circuitElement.labelStringProperty.link( update );

    this.disposeValueNode = () => {
      contentNode.dispose();
      circuitElement.vertexMovedEmitter.removeListener( update! );
      showValuesProperty.unlink( update! );
      viewTypeProperty.unlink( update! );
      circuitElement.labelStringProperty.unlink( update! );
    };
  }

  public override dispose(): void {
    super.dispose();
    this.disposeValueNode();
  }
}

circuitConstructionKitCommon.register( 'ValueNode', ValueNode );