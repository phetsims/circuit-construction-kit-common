// Copyright 2015-2016, University of Colorado Boulder

/**
 * The Battery is a circuit element that provides a fixed voltage difference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/FixedLengthCircuitElement' );
  var Property = require( 'AXON/Property' );

  // constants
  var BATTERY_LENGTH = CircuitConstructionKitConstants.BATTERY_LENGTH;

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {number} voltage
   * @param {Object} [options]
   * @constructor
   */
  function Battery( startVertex, endVertex, voltage, options ) {
    assert && assert( typeof voltage === 'number', 'voltage should be a number' );
    options = _.extend( {
      initialOrientation: 'right'
    }, options );
    FixedLengthCircuitElement.call( this, BATTERY_LENGTH, startVertex, endVertex, BATTERY_LENGTH );

    // @public {Property.<number>} the voltage of the battery
    this.voltageProperty = new Property( voltage );
    Property.preventGetSet( this, 'voltage' );

    // @public (read-only) - track the initial state so the user can only create a certain number of "left" or "right"
    // batteries from the toolbox.
    this.initialOrientation = options.initialOrientation;
  }

  circuitConstructionKitCommon.register( 'Battery', Battery );

  return inherit( FixedLengthCircuitElement, Battery, {

    /**
     * @returns {Object} the attributes of the battery in a state object
     * @public
     */
    attributesToStateObject: function() {
      return {
        voltage: this.voltageProperty.get()
      };
    }
  } );
} );