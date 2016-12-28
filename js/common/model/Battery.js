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
  var inherit = require( 'PHET_CORE/inherit' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/FixedLengthCircuitElement' );
  var Property = require( 'AXON/Property' );

  // constants
  var BATTERY_LENGTH = 102;  // in view coordinates, which are scaled by joist

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
    FixedLengthCircuitElement.call( this, BATTERY_LENGTH, startVertex, endVertex );

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
     * @param {function} getVertexIndex - a function that transforms vertices into indices.  TODO: better way to do this?
     * @returns {Object} a state object that represents the battery
     * @public
     */
    attributesToStateObject: function() {
      return {
        voltage: this.voltageProperty.get()
      };
    }
  }, {
    BATTERY_LENGTH: BATTERY_LENGTH
  } );
} );