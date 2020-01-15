// Copyright 2020, University of Colorado Boulder

/**
 * Advanced control panel that appears in "Lab" screens which allows the user to adjust the resistivity of wires
 * and the internal resistance of voltage sources.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCAccordionBox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CCKCAccordionBox' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const SourceResistanceControl = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SourceResistanceControl' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const WireResistivityControl = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/WireResistivityControl' );

  // strings
  const advancedString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/advanced' );

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
        titleXMargin: 0,
        strutWidth: 0
      } );

      this.mutate( options );
    }
  }

  return circuitConstructionKitCommon.register( 'AdvancedAccordionBox', AdvancedAccordionBox );
} );