// Copyright 2015-2016, University of Colorado Boulder

/**
 * The Battery is a circuit element that provides a fixed voltage difference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/FixedLengthCircuitElement' );

  // constants
  var BATTERY_LENGTH = 102;

  /**
   *
   * @constructor
   */
  function Battery( startVertex, endVertex, voltage ) {
    assert && assert( typeof voltage === 'number', 'voltage should be a number' );
    FixedLengthCircuitElement.call( this, BATTERY_LENGTH, startVertex, endVertex, {
      voltage: voltage
    } );
  }

  return inherit( FixedLengthCircuitElement, Battery, {
    toStateObjectWithVertexIndices: function( getVertexIndex ) {
      return _.extend( {
          voltage: this.voltage
        },
        FixedLengthCircuitElement.prototype.toStateObjectWithVertexIndices.call( this, getVertexIndex )
      );
    }
  }, {
    BATTERY_LENGTH: BATTERY_LENGTH
  } );
} );