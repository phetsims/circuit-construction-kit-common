// Copyright 2020, University of Colorado Boulder

/**
 * TODO: Documentation
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const SourceResistanceControl = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SourceResistanceControl' );
  const CCKCAccordionBox = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CCKCAccordionBox' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
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
      super( alignGroup.createBox( new VBox( {
        spacing: 10,
        children: [
          new WireResistivityControl( circuit.wireResistivityProperty, alignGroup, tandem.createTandem( 'wireResistivityControl' ) ),
          new SourceResistanceControl( circuit.sourceResistanceProperty, alignGroup, batteryResistanceControlString, tandem.createTandem( 'batteryResistanceControl' ) )
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