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

  /**
   * @constructor
   */
  function CircuitConstructionKitBasicsModel() {

    PropertySet.call( this, {} ); // TODO: Add settings like "show electrons", etc.
    this.circuit = new Circuit();
  }

  return inherit( PropertySet, CircuitConstructionKitBasicsModel, {

    reset: function() {
      PropertySet.prototype.reset.call( this );
      this.circuit.reset();
    },
    //TODO Called by the animation loop. Optional, so if your model has no animation, please delete this.
    step: function( dt ) {
      //TODO Handle model animation here.
    }
  } );
} );