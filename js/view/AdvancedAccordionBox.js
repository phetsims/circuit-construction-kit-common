// Copyright 2020, University of Colorado Boulder

/**
 * Advanced control panel that appears in "Lab" screens which allows the user to adjust the resistivity of wires
 * and the internal resistance of voltage sources.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import VBox from '../../../scenery/js/nodes/VBox.js';
import circuitConstructionKitCommonStrings from '../circuit-construction-kit-common-strings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CCKCAccordionBox from './CCKCAccordionBox.js';
import SourceResistanceControl from './SourceResistanceControl.js';
import WireResistivityControl from './WireResistivityControl.js';

const advancedString = circuitConstructionKitCommonStrings.advanced;

class AdvancedAccordionBox extends CCKCAccordionBox {

  /**
   * @param {Circuit} circuit
   * @param {AlignGroup} alignGroup - to match the width of other panels
   * @param {string} batteryResistanceControlString
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( circuit, alignGroup, batteryResistanceControlString, tandem, options ) {

    const titleConfig = { fontSize: 12, maxWidth: 200 }; // Factor out for both titles
    super( alignGroup.createBox( new VBox( {
      spacing: 10,
      children: [
        new WireResistivityControl( circuit.wireResistivityProperty, alignGroup, titleConfig, tandem.createTandem( 'wireResistivityControl' ) ),
        new SourceResistanceControl( circuit.sourceResistanceProperty, alignGroup, batteryResistanceControlString, titleConfig, tandem.createTandem( 'sourceResistanceControl' ) )
      ]
    } ) ), advancedString, tandem, {

      // Left align the title, with no padding
      titleAlignX: 'left',
      titleXSpacing: 0
    } );

    this.mutate( options );
  }
}

circuitConstructionKitCommon.register( 'AdvancedAccordionBox', AdvancedAccordionBox );
export default AdvancedAccordionBox;