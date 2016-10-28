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

  /**
   * @constructor
   */
  function ExploreScreenModel( tandem ) {

    // additional Properties that will be added to supertype
    var additionalProperties = {

      // {boolean} @public changes whether the light bulb brightness and ammeter/voltmeter readouts can be seen
      running: {
        value: !CircuitConstructionKitQueryParameters.showPlayPauseButton,
        tandem: tandem.createTandem( 'runningProperty' )
        //TODO missing phetioValueType
      }
    };

    CircuitConstructionKitModel.call( this, tandem, additionalProperties );
  }

  circuitConstructionKitCommon.register( 'ExploreScreenModel', ExploreScreenModel );

  return inherit( CircuitConstructionKitModel, ExploreScreenModel );
} );