// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Model for the Explore Screen.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitModel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/CircuitConstructionKitModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitConstructionKitQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitQueryParameters' );
  var Property = require( 'AXON/Property' );

  // phet-io modules
  var TBoolean = require( 'ifphetio!PHET_IO/types/TBoolean' );

  /**
   * @constructor
   */
  function ExploreScreenModel( tandem ) {

    CircuitConstructionKitModel.call( this, tandem );

  }

  circuitConstructionKitCommon.register( 'ExploreScreenModel', ExploreScreenModel );

  return inherit( CircuitConstructionKitModel, ExploreScreenModel );
} );