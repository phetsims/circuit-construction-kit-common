// Copyright 2020-2021, University of Colorado Boulder

/**
 * Advanced control panel that appears in "Lab" screens which allows the user to adjust the resistivity of wires
 * and the internal resistance of voltage sources.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import Text from '../../../scenery/js/nodes/Text.js';
import VStrut from '../../../scenery/js/nodes/VStrut.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CCKCAccordionBox, { CCKCAccordionBoxOptions } from './CCKCAccordionBox.js';
import CCKCCheckbox from './CCKCCheckbox.js';
import SourceResistanceControl from './SourceResistanceControl.js';
import WireResistivityControl from './WireResistivityControl.js';
import Circuit from '../model/Circuit.js';
import AlignGroup from '../../../scenery/js/nodes/AlignGroup.js';
import Tandem from '../../../tandem/js/Tandem.js';


type AdvancedAccordionBoxImplementationOptions = {
  showRealBulbsCheckbox: boolean
};
type AdvancedAccordionBoxOptions = AdvancedAccordionBoxImplementationOptions & CCKCAccordionBoxOptions;

class AdvancedAccordionBox extends CCKCAccordionBox {

  /**
   * @param {Circuit} circuit
   * @param {AlignGroup} alignGroup - to match the width of other panels
   * @param {string} batteryResistanceControlString
   * @param {Tandem} tandem
   * @param {Object} [providedOptions]
   */
  constructor( circuit: Circuit, alignGroup: AlignGroup, batteryResistanceControlString: string, tandem: Tandem, providedOptions?: Partial<AdvancedAccordionBoxOptions> ) {

    const options = merge( {
      showRealBulbsCheckbox: true
    }, providedOptions ) as Required<AdvancedAccordionBoxImplementationOptions>;

    const titleConfig = {
      fontSize: CCKCConstants.FONT_SIZE,
      maxWidth: 120
    }; // Factor out titles
    const children = [
      new WireResistivityControl( circuit.wireResistivityProperty, alignGroup, titleConfig, tandem.createTandem( 'wireResistivityControl' ) ),
      new VStrut( 10 ),
      new SourceResistanceControl( circuit.sourceResistanceProperty, alignGroup, batteryResistanceControlString, titleConfig, tandem.createTandem( 'sourceResistanceControl' ) )
    ];

    if ( options.showRealBulbsCheckbox ) {
      children.push(
        new VStrut( 20 ),
        new CCKCCheckbox( new Text( circuitConstructionKitCommonStrings.addRealBulbs, titleConfig ), circuit.addRealBulbsProperty, {
          tandem: tandem.createTandem( 'addRealBulbsCheckbox' )
        } )
      );
    }
    super( alignGroup.createBox( new VBox( {
      align: 'left',
      children: children
    } ) ), circuitConstructionKitCommonStrings.advanced, tandem, {

      // Left align the title, with no padding
      titleAlignX: 'left',
      titleXSpacing: 0
    } );

    this.mutate( options );
  }
}

circuitConstructionKitCommon.register( 'AdvancedAccordionBox', AdvancedAccordionBox );
export default AdvancedAccordionBox;