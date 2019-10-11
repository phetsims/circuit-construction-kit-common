// Copyright 2015-2019, University of Colorado Boulder

/**
 * The Battery is a circuit element that provides a fixed voltage difference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const CCKCQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCQueryParameters' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const DerivedProperty = require( 'AXON/DerivedProperty' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );
  const NumberProperty = require( 'AXON/NumberProperty' );

  // constants
  const BATTERY_LENGTH = CCKCConstants.BATTERY_LENGTH;

  class Battery extends FixedCircuitElement {

    /**
     * @param {Vertex} startVertex - one of the battery vertices
     * @param {Vertex} endVertex - the other battery vertex
     * @param {Property.<number>} internalResistanceProperty - the resistance of the battery
     * @param {Battery.BatteryType} batteryType - NORMAL | HIGH_VOLTAGE
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( startVertex, endVertex, internalResistanceProperty, batteryType, tandem, options ) {
      assert && assert( Battery.BatteryType.VALUES.indexOf( batteryType ) >= 0, 'invalid battery type: ' + batteryType );
      assert && assert( internalResistanceProperty, 'internalResistanceProperty should be defined' );
      options = _.extend( {
        initialOrientation: 'right',
        voltage: 9.0,
        isFlammable: true,
        numberOfDecimalPlaces: batteryType === Battery.BatteryType.NORMAL ? 1 : 0
      }, options );
      super( startVertex, endVertex, BATTERY_LENGTH, tandem, options );

      // @public {NumberProperty} - the voltage of the battery in volts
      this.voltageProperty = new NumberProperty( options.voltage, {
        tandem: tandem.createTandem( 'voltageProperty' )
      } );

      // @public {Property.<number>} the internal resistance of the battery
      this.internalResistanceProperty = new DerivedProperty( [ internalResistanceProperty, this.currentProperty ],
        ( internalResistance, current ) => {
          if ( Math.abs( current ) >= CCKCQueryParameters.batteryCurrentThreshold ) {
            return CCKCQueryParameters.batteryInternalResistanceWhenCurrentThresholdExceeded;
          }
          else {
            return internalResistance;
          }
        } );

      // @public (read-only) {string} - track which way the battery "button" (plus side) was facing the initial state so
      // the user can only create a certain number of "left" or "right" batteries from the toolbox.
      this.initialOrientation = options.initialOrientation;

      // @public (read-only) {Battery.BatteryType} - the type of the battery - NORMAL | HIGH_VOLTAGE
      this.batteryType = batteryType;
    }

    /**
     * Get the properties so that the circuit can be solved when changed.
     * @returns {Property.<*>[]}
     * @override
     * @public
     */
    getCircuitProperties() {
      return [ this.voltageProperty ];
    }

    /**
     * Get all intrinsic properties of this object, which can be used to load it at a later time.
     * @returns {Object}
     * @public
     */
    toIntrinsicStateObject() {
      const parent = super.toIntrinsicStateObject();
      return _.extend( parent, {
        batteryType: this.batteryType,
        voltage: this.voltageProperty.value
      } );
    }
  }

  // Enumeration for the different types of Battery, NORMAL or HIGH_VOLTAGE
  Battery.BatteryType = new Enumeration( [ 'NORMAL', 'HIGH_VOLTAGE' ] );

  return circuitConstructionKitCommon.register( 'Battery', Battery );
} );