// Copyright 2015-2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitConstructionKitBasicsScreenView = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitConstructionKitBasicsScreenView' );

  /**
   * @param {CircuitConstructionKitBasicsModel} circuitConstructionKitBasicsScreenModel
   * @constructor
   */
  function LabScreenView( circuitConstructionKitBasicsScreenModel ) {
    CircuitConstructionKitBasicsScreenView.call( this, circuitConstructionKitBasicsScreenModel, { toolboxOrientation: 'horizontal' } );
  }

  circuitConstructionKitBasics.register( 'LabScreenView', LabScreenView );
  
  return inherit( CircuitConstructionKitBasicsScreenView, LabScreenView );
} );