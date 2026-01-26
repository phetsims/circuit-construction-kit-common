// Copyright 2020-2026, University of Colorado Boulder

/**
 * Advanced control panel that appears in "Lab" screens which allows the user to adjust the resistivity of wires
 * and the internal resistance of voltage sources.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import optionize, { combineOptions } from '../../../phet-core/js/optionize.js';
import type AlignGroup from '../../../scenery/js/layout/constraints/AlignGroup.js';
import VBox from '../../../scenery/js/layout/nodes/VBox.js';
import type Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import { type CheckboxOptions } from '../../../sun/js/Checkbox.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import type Circuit from '../model/Circuit.js';
import CCKCAccordionBox, { type CCKCAccordionBoxOptions } from './CCKCAccordionBox.js';
import CCKCCheckbox from './CCKCCheckbox.js';
import CCKCColors from './CCKCColors.js';
import SourceResistanceControl from './SourceResistanceControl.js';
import WireResistivityControl from './WireResistivityControl.js';

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
        new CCKCCheckbox( circuit.addRealBulbsProperty, new Text( CircuitConstructionKitCommonFluent.addRealBulbsStringProperty, combineOptions<CheckboxOptions>( {
          tandem: addRealBulbsCheckboxTandem.createTandem( 'labelText' )
        }, TEXT_OPTIONS ) ), {
          tandem: addRealBulbsCheckboxTandem,
          accessibleHelpText: CircuitConstructionKitCommonFluent.a11y.advancedAccordionBox.addRealBulbsCheckbox.accessibleHelpTextStringProperty,
          accessibleContextResponseChecked: CircuitConstructionKitCommonFluent.a11y.advancedAccordionBox.addRealBulbsCheckbox.accessibleContextResponseCheckedStringProperty,
          accessibleContextResponseUnchecked: CircuitConstructionKitCommonFluent.a11y.advancedAccordionBox.addRealBulbsCheckbox.accessibleContextResponseUncheckedStringProperty
        } )
      );
    }
    super( alignGroup.createBox( new VBox( {
      align: 'left',
      spacing: 15,
      children: children
    } ) ), CircuitConstructionKitCommonFluent.advancedStringProperty, tandem, {

      // Left align the title, with no padding
      titleAlignX: 'left',
      titleXSpacing: 10,

      accessibleName: CircuitConstructionKitCommonFluent.a11y.advancedAccordionBox.accessibleNameStringProperty,
      accessibleHelpTextCollapsed: CircuitConstructionKitCommonFluent.a11y.advancedAccordionBox.accessibleHelpTextCollapsedStringProperty
    } );

    this.mutate( options );
  }
}

circuitConstructionKitCommon.register( 'AdvancedAccordionBox', AdvancedAccordionBox );
