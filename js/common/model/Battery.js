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
  var FixedLengthComponent = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/FixedLengthComponent' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Vertex' );

  /**
   *
   * @constructor
   */
  function Battery( startVertex, endVertex, voltage ) {
    assert && assert( typeof voltage === 'number', 'voltage should be a number' );
    FixedLengthComponent.call( this, 146, startVertex, endVertex, {
      voltage: voltage
    } );
  }

  return inherit( FixedLengthComponent, Battery, {
    toStateObjectWithVertexIndices: function( getVertexIndex ) {
      return _.extend( {
          voltage: this.voltage
        },
        FixedLengthComponent.prototype.toStateObjectWithVertexIndices.call( this, getVertexIndex )
      );
    }
  } );
} );