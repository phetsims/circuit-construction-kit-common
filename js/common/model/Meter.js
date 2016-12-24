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
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );
  var Emitter = require( 'AXON/Emitter' );

  // phet-io modules
  var TBoolean = require( 'ifphetio!PHET_IO/types/TBoolean' );
  var TVector2 = require( 'ifphetio!PHET_IO/types/dot/TVector2' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function Meter( tandem ) {

    this.visibleProperty = new Property( false, {
      tandem: tandem.createTandem( 'visibleProperty' ),
      phetioValueType: TBoolean
    } );

    this.bodyPositionProperty = new Property( new Vector2( 0, 0 ), {
      tandem: tandem.createTandem( 'bodyPositionProperty' ),
      phetioValueType: TVector2
    } );

    // @public When the meter is dragged from the toolbox, all pieces drag together as a single unit.
    this.draggingProbesWithBodyProperty = new Property( true, {
      tandem: tandem.createTandem( 'draggingProbesWithBodyProperty' ),
      phetioValueType: TBoolean
    } );

    this.droppedEmitter = new Emitter(); // Fire event when dropped

    Property.preventGetSet( this, 'visible' );
    Property.preventGetSet( this, 'bodyPosition' );
    Property.preventGetSet( this, 'draggingProbesWithBody' );
  }

  circuitConstructionKitCommon.register( 'Meter', Meter );

  return inherit( Object, Meter );
} );