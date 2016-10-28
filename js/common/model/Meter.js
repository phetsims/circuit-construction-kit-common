// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * Base class for Ammeter and Voltmeter
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );
  var Emitter = require( 'AXON/Emitter' );

  // phet-io modules
  var TBoolean = require( 'ifphetio!PHET_IO/types/TBoolean' );
  var TVector2 = require( 'ifphetio!PHET_IO/types/dot/TVector2' );

  function Meter( tandem, additionalProperties ) {

    var properties = _.extend( {

      visible: {
        value: false,
        tandem: tandem.createTandem( 'visibleProperty' ),
        phetioValueType: TBoolean
      },

      bodyPosition: {
        value: new Vector2( 0, 0 ),
        tandem: tandem.createTandem( 'bodyPositionProperty' ),
        phetioValueType: TVector2
      },

      // When the meter is dragged from the toolbox, all pieces drag together as a single unit.
      draggingTogether: {
        value: true,
        tandem: tandem.createTandem( 'draggingTogetherProperty' ),
        phetioValueType: TBoolean
      }
    }, additionalProperties );

    PropertySet.call( this, null, null, properties );

    this.droppedEmitter = new Emitter(); // Fire event when dropped
  }

  circuitConstructionKitCommon.register( 'Meter', Meter );

  return inherit( PropertySet, Meter );
} );