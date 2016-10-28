// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitModel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/CircuitConstructionKitModel' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @constructor
   */
  function EnergyScreenModel( tandem ) {
    CircuitConstructionKitModel.call( this, tandem );
  }

  circuitConstructionKitCommon.register( 'EnergyScreenModel', EnergyScreenModel );

  return inherit( CircuitConstructionKitModel, EnergyScreenModel );
} );