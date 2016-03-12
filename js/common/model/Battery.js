// Copyright 2015, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/FixedLengthCircuitElement' );

  /**
   *
   * @constructor
   */
  function Battery( startVertex, endVertex, voltage ) {
    assert && assert( typeof voltage === 'number', 'voltage should be a number' );
    FixedLengthCircuitElement.call( this, 146, startVertex, endVertex, {
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
  } );
} );