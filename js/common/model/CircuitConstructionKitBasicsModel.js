// Copyright 2015, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Circuit = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Circuit' );
  var Voltmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Voltmeter' );
  var Ammeter = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Ammeter' );

  /**
   * @constructor
   */
  function CircuitConstructionKitBasicsModel( additionalProperties ) {
    PropertySet.call( this, _.extend( {}, additionalProperties ) ); // TODO: Add settings like "show electrons", etc.
    this.circuit = new Circuit();
    this.voltmeter = new Voltmeter();
    this.ammeter = new Ammeter();
  }

  return inherit( PropertySet, CircuitConstructionKitBasicsModel, {

    reset: function() {
      PropertySet.prototype.reset.call( this );
      this.circuit.reset();
      this.voltmeter.reset();
      this.ammeter.reset();
    },
    //TODO Called by the animation loop. Optional, so if your model has no animation, please delete this.
    step: function( dt ) {
      //TODO Handle model animation here.
    }
  } );
} );