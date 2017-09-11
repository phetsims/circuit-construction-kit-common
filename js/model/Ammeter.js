// Copyright 2016-2017, University of Colorado Boulder

/**
 * Model for the Ammeter, which adds the probe position and current readout.  There is only one ammeter per screen and
 * it is shown/hidden.  Hence it does not need a dispose() implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Property = require( 'AXON/Property' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Meter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Meter' );
  var TVector2 = require( 'DOT/TVector2' );
  var Vector2 = require( 'DOT/Vector2' );
  var inherit = require( 'PHET_CORE/inherit' );

  // phet-io modules
  var TNumber = require( 'ifphetio!PHET_IO/types/TNumber' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function Ammeter( tandem ) {

    Meter.call( this, tandem );

    // @public {Property.<number|null>} the full-precision reading on the ammeter. It will be formatted for
    // display in the view.  Null means the ammeter is not on a wire.
    this.currentProperty = new Property( null, {
      tandem: tandem.createTandem( 'currentProperty' ),
      units: 'amperes',
      phetioValueType: TNumber
    } );

    // @public {Property.<Vector2>} - the position of the tip of the probe
    this.probePositionProperty = new Property( Vector2.ZERO, {
      tandem: tandem.createTandem( 'probePositionProperty' ),
      phetioValueType: TVector2
    } );
  }

  circuitConstructionKitCommon.register( 'Ammeter', Ammeter );

  return inherit( Meter, Ammeter, {

    /**
     * Restore the ammeter to its initial conditions
     * @public
     * @override
     */
    reset: function() {
      Meter.prototype.reset.call( this );
      this.currentProperty.reset();
      this.probePositionProperty.reset();
    }
  } );
} );