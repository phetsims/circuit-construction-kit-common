// Copyright 2015-2017, University of Colorado Boulder

/**
 * The Battery is a circuit element that provides a fixed voltage difference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BatteryType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/BatteryType' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  var FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );

  // constants
  var BATTERY_LENGTH = CCKCConstants.BATTERY_LENGTH;

  /**
   * @param {Vertex} startVertex - one of the battery vertices
   * @param {Vertex} endVertex - the other battery vertex
   * @param {Property.<number>} resistanceProperty - the resistance of the battery
   * @param {BatteryType} batteryType - NORMAL | HIGH_VOLTAGE
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function Battery( startVertex, endVertex, resistanceProperty, batteryType, tandem, options ) {
    assert && assert( BatteryType.VALUES.indexOf( batteryType ) >= 0, 'invalid battery type: ' + batteryType );
    options = _.extend( {
      initialOrientation: 'right',
      voltage: 9.0,
      isFlammable: true
    }, options );
    FixedCircuitElement.call( this, startVertex, endVertex, BATTERY_LENGTH, tandem, options );

    // @public {NumberProperty} - the voltage of the battery in volts
    this.voltageProperty = new NumberProperty( options.voltage );

    // @public {Property.<number>} the internal resistance of the battery
    this.internalResistanceProperty = resistanceProperty;

    // @public (read-only) {string} - track which way the battery "button" (plus side) was facing the initial state so
    // the user can only create a certain number of "left" or "right" batteries from the toolbox.
    this.initialOrientation = options.initialOrientation;

    // @public (read-only) {BatteryType} - the type of the battery - NORMAL | HIGH_VOLTAGE
    this.batteryType = batteryType;

    // @public (read-only) {number} - the number of decimal places to show in readouts and controls
    this.numberOfDecimalPlaces = this.batteryType === BatteryType.NORMAL ? 1 : 0;
  }

  circuitConstructionKitCommon.register( 'Battery', Battery );

  return inherit( FixedCircuitElement, Battery, {

    /**
     * Get the properties so that the circuit can be solved when changed.
     * @returns {Property.<*>[]}
     * @override
     * @public
     */
    getCircuitProperties: function() {
      return [ this.voltageProperty ];
    },

    /**
     * Get all intrinsic properties of this object, which can be used to load it at a later time.
     * @returns {Object}
     * @public
     */
    toIntrinsicStateObject: function() {
      var parent = FixedCircuitElement.prototype.toIntrinsicStateObject.call( this );
      return _.extend( parent, {
        batteryType: this.batteryType,
        voltage: this.voltageProperty.value
      } );
    }
  } );
} );