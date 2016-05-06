// Copyright 2015-2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var CircuitConstructionKitModel = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/CircuitConstructionKitModel' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @constructor
   */
  function LabScreenModel() {
    CircuitConstructionKitModel.call( this, {} );
  }

  circuitConstructionKit.register( 'LabScreenModel', LabScreenModel );

  return inherit( CircuitConstructionKitModel, LabScreenModel );
} );