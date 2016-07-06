// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * The Battery is a circuit element that provides a fixed voltage difference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/FixedLengthCircuitElement' );

  // constants
  var BATTERY_LENGTH = 102;

  /**
   *
   * @constructor
   */
  function Battery( startVertex, endVertex, voltage, options ) {
    assert && assert( typeof voltage === 'number', 'voltage should be a number' );
    options = _.extend( { initialOrientation: 'right' }, options );
    FixedLengthCircuitElement.call( this, BATTERY_LENGTH, startVertex, endVertex, {
      voltage: voltage
    } );

    // @public (read-only) - track the initial state so the user can only create a certain number of "left" or "right" batteries
    // from the toolbox.
    this.initialOrientation = options.initialOrientation;
  }

  circuitConstructionKitCommon.register( 'Battery', Battery );

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