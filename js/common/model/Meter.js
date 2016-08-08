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

  function Meter( additionalProperties, tandem, tandemSet, additionalPhetioValueTypeSet ) {
    PropertySet.call( this, _.extend( {
      visible: false,
      bodyPosition: new Vector2( 0, 0 ),
      draggingTogether: true // When the meter is dragged from the toolbox, all pieces drag together as a single unit.
    }, additionalProperties ), {
      tandemSet: _.extend( {
        visible: tandem.createTandem( 'visibleProperty' ),
        bodyPosition: tandem.createTandem( 'bodyPositionProperty' ),
        draggingTogether: tandem.createTandem( 'draggingTogetherProperty' )
      }, tandemSet ),
      phetioValueTypeSet: _.extend( {
        visible: TBoolean,
        bodyPosition: TVector2,
        draggingTogether: TBoolean
      }, additionalPhetioValueTypeSet )
    } );
    this.droppedEmitter = new Emitter(); // Fire event when dropped
  }

  circuitConstructionKitCommon.register( 'Meter', Meter );

  return inherit( PropertySet, Meter );
} );