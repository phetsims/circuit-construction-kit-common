// Copyright 2017-2022, University of Colorado Boulder

/**
 * When enabled, shows the readout above circuit elements, such as "9.0 V" for a 9 volt battery.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Emitter from '../../../axon/js/Emitter.js';
import Property from '../../../axon/js/Property.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import merge from '../../../phet-core/js/merge.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import PhetFont from '../../../scenery-phet/js/PhetFont.js';
import { RichText } from '../../../scenery/js/imports.js';
import { Text } from '../../../scenery/js/imports.js';
import { VBox } from '../../../scenery/js/imports.js';
import { Color } from '../../../scenery/js/imports.js';
import Panel from '../../../sun/js/Panel.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
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

const capacitanceFaradsSymbolString = circuitConstructionKitCommonStrings.capacitanceFaradsSymbol;
const fuseValueString = circuitConstructionKitCommonStrings.fuseValue;
const inductanceHenriesSymbolString = circuitConstructionKitCommonStrings.inductanceHenriesSymbol;
const resistanceOhmsSymbolString = circuitConstructionKitCommonStrings.resistanceOhmsSymbol;
const voltageUnitsString = circuitConstructionKitCommonStrings.voltageUnits;

// constants
const VERTICAL_OFFSET = 24;

// Big enough to see when zoomed out
const FONT = new PhetFont( { size: 22 } );

/**
 * For convenience, creates a Text node with empty content and the specified tandem.
 * @param {Tandem} tandem
 * @param {Object} [providedOptions]
 */
const createText = ( tandem: Tandem, providedOptions?: any ) => new Text( '', merge( {
  tandem: tandem,
  font: FONT
}, providedOptions ) );

/**
 * For convenience, creates a RichText node with empty content and the specified tandem.
 * @param {Tandem} tandem
 * @param {Object} [providedOptions]
 */
const createRichText = ( tandem: Tandem, providedOptions?: any ) => new RichText( '', merge( {
  tandem: tandem,
  font: FONT
}, providedOptions ) );

const infinitySpan = '<span style="font-size: 26px; font-family: serif;"><b>∞</b></span>';

export default class ValueNode extends Panel {
  private readonly disposeValueNode: () => void;

  /**
   * @param {Property.<number>} sourceResistanceProperty - user-specified value for internal resistance for batteries
   * @param {CircuitElement} circuitElement
   * @param {Property.<boolean>} showValuesProperty
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Tandem} tandem
   */
  constructor( sourceResistanceProperty: Property<number>, circuitElement: CircuitElement, showValuesProperty: Property<boolean>, viewTypeProperty: Property<CircuitElementViewType>, tandem: Tandem ) {
    const disposeEmitterValueNode = new Emitter();

    let readoutValueNode: any;
    let update: any = null;
    if ( circuitElement instanceof VoltageSource ) {

      const voltageText = createText( tandem.createTandem( 'voltageText' ) );
      const voltageListener = ( voltage: number ) => {

        voltageText.text = StringUtils.fillIn( voltageUnitsString, {
          voltage: Utils.toFixed( voltage, circuitElement.numberOfDecimalPlaces )
        } );
        update && update();
      };
      circuitElement.voltageProperty.link( voltageListener );

      // Battery readouts shows voltage and internal resistance if it is nonzero
      readoutValueNode = new VBox( {
        align: 'right',
        children: [ voltageText ]
      } );

      const resistanceNode = createText( tandem.createTandem( 'resistanceText' ) );
      const sourceResistanceListener = ( internalResistance: number, lastInternalResistance: number | null | undefined ) => {
        resistanceNode.text = StringUtils.fillIn( resistanceOhmsSymbolString, {
          resistance: Utils.toFixed( internalResistance, 1 )
        } );

        // If the children should change, update them here
        if ( lastInternalResistance === null || ( internalResistance <= CCKCQueryParameters.batteryMinimumResistance || lastInternalResistance! <= CCKCQueryParameters.batteryMinimumResistance ) ) {
          const desiredChildren = internalResistance > CCKCQueryParameters.batteryMinimumResistance ? [ voltageText, resistanceNode ] : [ voltageText ];

          // Only set children if changed
          if ( readoutValueNode.getChildrenCount() !== desiredChildren.length ) {
            readoutValueNode.children = desiredChildren;
          }
        }
        update && update();
      };
      sourceResistanceProperty.link( sourceResistanceListener );

      disposeEmitterValueNode.addListener( () => {
        circuitElement.voltageProperty.unlink( voltageListener );
        sourceResistanceProperty.unlink( sourceResistanceListener );
      } );
    }

    else if ( circuitElement instanceof Resistor ||
              circuitElement instanceof LightBulb ) {
      readoutValueNode = createText( tandem.createTandem( 'resistanceText' ) );

      // Items like the hand and dog and high resistance resistor shouldn't show ".0"
      const linkResistance = ( resistance: number ) => {
        readoutValueNode.text = StringUtils.fillIn( resistanceOhmsSymbolString, {
          resistance: Utils.toFixed( resistance, circuitElement.numberOfDecimalPlaces )
        } );
        update && update();
      };
      circuitElement.resistanceProperty.link( linkResistance );
      disposeEmitterValueNode.addListener( () => circuitElement.resistanceProperty.unlink( linkResistance ) );
    }
    else if ( circuitElement instanceof Capacitor ) {
      readoutValueNode = createText( tandem.createTandem( 'capacitorText' ) );

      // Items like the hand and dog and high resistance resistor shouldn't show ".0"
      const linkCapacitance = ( capacitance: number ) => {

        readoutValueNode.text = StringUtils.fillIn( capacitanceFaradsSymbolString, {
          resistance: Utils.toFixed( capacitance, circuitElement.numberOfDecimalPlaces )
        } );
        update && update();
      };
      circuitElement.capacitanceProperty.link( linkCapacitance );
      disposeEmitterValueNode.addListener( () => circuitElement.capacitanceProperty.unlink( linkCapacitance ) );
    }
    else if ( circuitElement instanceof Inductor ) {
      readoutValueNode = createText( tandem.createTandem( 'inductorText' ) );

      const linkInductance = ( inductance: number ) => {
        readoutValueNode.text = StringUtils.fillIn( inductanceHenriesSymbolString, {
          resistance: Utils.toFixed( inductance, circuitElement.numberOfDecimalPlaces )
        } );
        update && update();
      };
      circuitElement.inductanceProperty.link( linkInductance );
      disposeEmitterValueNode.addListener( () => circuitElement.inductanceProperty.unlink( linkInductance ) );
    }
    else if ( circuitElement instanceof Switch ) {

      // Make it easier to read the infinity symbol, see https://github.com/phetsims/circuit-construction-kit-dc/issues/135
      readoutValueNode = createRichText( tandem.createTandem( 'switchText' ) );

      const updateResistance = ( resistance: number ) => {
        readoutValueNode.text = StringUtils.fillIn( resistanceOhmsSymbolString, {

          // Using a serif font makes the infinity symbol look less lopsided
          resistance: resistance > 100000 ? infinitySpan : '0'
        } );

        // Account for the switch open and close geometry for positioning the label.  When the switch is open
        // the label must be higher
        update && update();
      };
      circuitElement.resistanceProperty.link( updateResistance );
      disposeEmitterValueNode.addListener( () => circuitElement.resistanceProperty.unlink( updateResistance ) );
    }
    else if ( circuitElement instanceof Fuse ) {
      readoutValueNode = createRichText( tandem.createTandem( 'fuseText' ), {
        align: 'right'
      } );
      const multilink = Multilink.multilink( [ circuitElement.resistanceProperty, circuitElement.currentRatingProperty ],
        ( resistance, currentRating ) => {
          const milliOhmString = resistance === CCKCConstants.MAX_RESISTANCE ? infinitySpan :
                                 Utils.toFixed( resistance * 1000, circuitElement.numberOfDecimalPlaces );
          readoutValueNode.text = StringUtils.fillIn( fuseValueString, {

            // Convert to milli
            resistance: milliOhmString,
            currentRating: Utils.toFixed( currentRating, circuitElement.numberOfDecimalPlaces )
          } );
          update && update();
        }
      );
      disposeEmitterValueNode.addListener( () => multilink.dispose() );
    }
    else {
      throw new Error( `ValueNode cannot be shown for ${circuitElement.constructor.name}` );
    }

    assert && assert( readoutValueNode, 'Content node should be defined' );

    if ( CCKCQueryParameters.showCurrents ) {
      const text = new Text( '' );
      Multilink.multilink( [ circuitElement.currentProperty, circuitElement.currentSenseProperty ], ( current, sense ) => {
        text.text = sense.toString() + ', ' + current.toFixed( 4 );// eslint-disable-line
      } );

      readoutValueNode = new VBox( { children: [ readoutValueNode, text ] } );
    }

    const customLabelNode = new Text( '', { font: FONT } );
    const contentNode = new VBox( {
      children: [
        customLabelNode,
        readoutValueNode
      ],
      maxWidth: 130
    } );

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

      readoutValueNode.visible = showValuesProperty.value && circuitElement.isValueDisplayableProperty.value;

      const customLabelText = circuitElement.labelTextProperty.value;
      customLabelNode.text = customLabelText;
      customLabelNode.visible = customLabelText.length > 0;

      // For a light bulb, choose the part of the filament in the top center for the label, see
      // https://github.com/phetsims/circuit-construction-kit-common/issues/325
      const distance = circuitElement instanceof LightBulb ? 0.56 : 0.5;

      // The label partially overlaps the component to make it clear which label goes with which component
      circuitElement.updateMatrixForPoint( circuitElement.chargePathLength * distance, matrix );
      const delta = Vector2.createPolar( VERTICAL_OFFSET, matrix.rotation + 3 * Math.PI / 2 );
      this.centerBottom = matrix.translation.plus( delta.timesScalar( 0.8 ) );
    };

    circuitElement.vertexMovedEmitter.addListener( update );
    circuitElement.isValueDisplayableProperty.link( update );

    update();
    showValuesProperty.link( update );
    viewTypeProperty.link( update );
    circuitElement.labelTextProperty.link( update );

    // @private {function}
    this.disposeValueNode = () => {
      circuitElement.vertexMovedEmitter.removeListener( update );
      showValuesProperty.unlink( update );
      viewTypeProperty.unlink( update );
      circuitElement.labelTextProperty.unlink( update );
      disposeEmitterValueNode.emit();
    };
  }

  override dispose(): void {
    super.dispose();
    this.disposeValueNode();
  }
}

circuitConstructionKitCommon.register( 'ValueNode', ValueNode );