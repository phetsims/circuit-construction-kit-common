// Copyright 2015-2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Circuit = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/Circuit' );
  var CircuitStruct = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/CircuitStruct' );
  var Voltmeter = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/Voltmeter' );
  var Ammeter = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/Ammeter' );

  /**
   * @constructor
   */
  function CircuitConstructionKitModel( additionalProperties, options ) {
    options = _.extend( { circuit: null }, options );
    PropertySet.call( this, _.extend( {
      showElectrons: false,
      running: true // {boolean} @public changes whether the light bulb brightness and ammeter/voltmeter readouts can be seen
    }, additionalProperties ) );

    // @public (read-only) These assignments provide improved highlighting and navigation in IntelliJ IDEA
    this.runningProperty = this.runningProperty || null;

    this.circuit = options.circuit || new Circuit();
    this.initialCircuitState = this.circuit.toStateObject();
    this.voltmeter = new Voltmeter();
    this.ammeter = new Ammeter();
  }

  circuitConstructionKit.register( 'CircuitConstructionKitModel', CircuitConstructionKitModel );

  return inherit( PropertySet, CircuitConstructionKitModel, {
    step: function( dt ) {
      this.circuit.step( dt );
    },
    reset: function() {
      PropertySet.prototype.reset.call( this );
      this.circuit.clear();
      this.voltmeter.reset();
      this.ammeter.reset();

      var struct = CircuitStruct.fromStateObject( this.initialCircuitState );
      this.circuit.loadFromCircuitStruct( struct );
    }
  } );
} );