// Copyright 2015-2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var CircuitConstructionKitBasicsModel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/CircuitConstructionKitBasicsModel' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @constructor
   */
  function EnergyScreenModel() {
    CircuitConstructionKitBasicsModel.call( this, {} );
  }

  return inherit( CircuitConstructionKitBasicsModel, EnergyScreenModel );
} );