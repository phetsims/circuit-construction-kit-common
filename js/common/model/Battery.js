// Copyright 2015-2017, University of Colorado Boulder

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
  var NumberProperty = require( 'AXON/NumberProperty' );

  // constants
  var BATTERY_LENGTH = CircuitConstructionKitConstants.BATTERY_LENGTH;

  /**
   * @param {Vertex} startVertex - one of the battery vertices
   * @param {Vertex} endVertex - the other battery vertex
   * @param {Property.<number>} resistanceProperty - the resistance of the battery
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function Battery( startVertex, endVertex, resistanceProperty, tandem, options ) {
    options = _.extend( {
      initialOrientation: 'right',
      voltage: 9.0
    }, options );
    FixedLengthCircuitElement.call( this, startVertex, endVertex, BATTERY_LENGTH, BATTERY_LENGTH, tandem );

    // @public (read-only) the voltage of the battery
    this.voltageProperty = new NumberProperty( options.voltage );

    // @public (read-only) the internal resistance of the battery
    this.internalResistanceProperty = resistanceProperty;

    // @public (read-only) - track the initial state so the user can only create a certain number of "left" or "right"
    // batteries from the toolbox.
    this.initialOrientation = options.initialOrientation;
  }

  circuitConstructionKitCommon.register( 'Battery', Battery );

  return inherit( FixedLengthCircuitElement, Battery, {

    /**
     * Get the properties so that the circuit can be solved when changed.
     * @override
     * @returns {Property[]}
     * @public
     */
    getCircuitProperties: function() {
      return [ this.voltageProperty ];
    },

    /**
     * @returns {Object} the attributes of the battery in a state object
     * @public
     */
    attributesToStateObject: function() {
      return {
        voltage: this.voltageProperty.get(),
        internalResistance: this.internalResistanceProperty.get()
      };
    }
  } );
} );