// Copyright 2020-2023, University of Colorado Boulder

/**
 * Advanced control panel that appears in "Lab" screens which allows the user to adjust the resistivity of wires
 * and the internal resistance of voltage sources.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { AlignGroup, Node, Text, VBox } from '../../../scenery/js/imports.js';
import CCKCConstants from '../CCKCConstants.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CCKCAccordionBox, { CCKCAccordionBoxOptions } from './CCKCAccordionBox.js';
import CCKCCheckbox from './CCKCCheckbox.js';
import SourceResistanceControl from './SourceResistanceControl.js';
import WireResistivityControl from './WireResistivityControl.js';
import Circuit from '../model/Circuit.js';
import Tandem from '../../../tandem/js/Tandem.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import { CheckboxOptions } from '../../../sun/js/Checkbox.js';
import CCKCColors from './CCKCColors.js';

type SelfOptions = {
  showRealBulbsCheckbox?: boolean;
};
type AdvancedAccordionBoxOptions = SelfOptions & CCKCAccordionBoxOptions;

export default class AdvancedAccordionBox extends CCKCAccordionBox {

  /**
   * @param circuit
   * @param alignGroup - to match the width of other panels
   * @param batteryResistanceControlString
   * @param tandem
   * @param [providedOptions]
   */
  public constructor( circuit: Circuit, alignGroup: AlignGroup, batteryResistanceControlString: TReadOnlyProperty<string>, tandem: Tandem, providedOptions?: AdvancedAccordionBoxOptions ) {

    const options = optionize<AdvancedAccordionBoxOptions, SelfOptions, CCKCAccordionBoxOptions>()( {
      showRealBulbsCheckbox: true
    }, providedOptions );

    const TEXT_OPTIONS = {
      fontSize: CCKCConstants.FONT_SIZE,
      maxWidth: 120,
      fill: CCKCColors.textFillProperty
    }; // Factor out titles

    const children: Node[] = [
      new WireResistivityControl( circuit.wireResistivityProperty, alignGroup, TEXT_OPTIONS, tandem.createTandem( 'wireResistivityControl' ) ),
      new SourceResistanceControl( circuit.sourceResistanceProperty, alignGroup, batteryResistanceControlString, TEXT_OPTIONS, tandem.createTandem( 'sourceResistanceControl' ) )
    ];

    if ( options.showRealBulbsCheckbox ) {
      const addRealBulbsCheckboxTandem = tandem.createTandem( 'addRealBulbsCheckbox' );
      children.push(
        new CCKCCheckbox( circuit.addRealBulbsProperty, new Text( CircuitConstructionKitCommonStrings.addRealBulbsStringProperty, combineOptions<CheckboxOptions>( {
          tandem: addRealBulbsCheckboxTandem.createTandem( 'labelText' )
        }, TEXT_OPTIONS ) ), {
          tandem: addRealBulbsCheckboxTandem
        } )
      );
    }
    super( alignGroup.createBox( new VBox( {
      align: 'left',
      spacing: 15,
      children: children
    } ) ), CircuitConstructionKitCommonStrings.advancedStringProperty, tandem, {

      // Left align the title, with no padding
      titleAlignX: 'left',
      titleXSpacing: 0
    } );

    this.mutate( options );
  }
}

circuitConstructionKitCommon.register( 'AdvancedAccordionBox', AdvancedAccordionBox );