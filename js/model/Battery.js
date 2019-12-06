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
  const merge = require( 'PHET_CORE/merge' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Range = require( 'DOT/Range' );

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
      options = merge( {
        initialOrientation: 'right',
        voltage: 9.0,
        isFlammable: true,
        numberOfDecimalPlaces: batteryType === Battery.BatteryType.NORMAL ? 1 : 0
      }, options );
      super( startVertex, endVertex, BATTERY_LENGTH, tandem, options );

      // @public {NumberProperty} - the voltage of the battery in volts
      this.voltageProperty = new NumberProperty( options.voltage, {
        tandem: tandem.createTandem( 'voltageProperty' ),
        range: batteryType === Battery.BatteryType.NORMAL ? new Range( 0, 120 ) : new Range( 100, 100000 )
      } );

      // @public - keeps track of which solve iteration pass is in process, see https://github.com/phetsims/circuit-construction-kit-common/issues/245
      this.passProperty = new NumberProperty( 1 );

      // @public {Property.<number>} the internal resistance of the battery
      this.internalResistanceProperty = new DerivedProperty( [ this.voltageProperty, internalResistanceProperty, this.currentProperty, this.passProperty ],
        ( voltage, internalResistance, current, pass ) => {
          if ( pass === 2 ) {

            return CCKCQueryParameters.batteryInternalResistanceWhenCurrentThresholdExceededOffset +
                   CCKCQueryParameters.batteryInternalResistanceWhenCurrentThresholdExceededVoltageScaleFactor * voltage;
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
     * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
     * @public
     */
    dispose() {
      this.voltageProperty.dispose();
      super.dispose();
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
  }

  // Enumeration for the different types of Battery, NORMAL or HIGH_VOLTAGE
  Battery.BatteryType = Enumeration.byKeys( [ 'NORMAL', 'HIGH_VOLTAGE' ] );

  return circuitConstructionKitCommon.register( 'Battery', Battery );
} );