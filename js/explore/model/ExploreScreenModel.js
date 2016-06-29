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
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var CircuitConstructionKitModel = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/CircuitConstructionKitModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitConstructionKitQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT/CircuitConstructionKitQueryParameters' );

  /**
   * @constructor
   */
  function ExploreScreenModel( tandem ) {
    CircuitConstructionKitModel.call( this, tandem, {
      running: !CircuitConstructionKitQueryParameters.showPlayPauseButton // {boolean} @public changes whether the light bulb brightness and ammeter/voltmeter readouts can be seen
    }, {
      running: tandem.createTandem( 'runningProperty' )
    } );
  }

  circuitConstructionKit.register( 'ExploreScreenModel', ExploreScreenModel );

  return inherit( CircuitConstructionKitModel, ExploreScreenModel );
} );