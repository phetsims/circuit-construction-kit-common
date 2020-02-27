// Copyright 2015-2020, University of Colorado Boulder

/**
 * The Battery is a circuit element that provides a fixed voltage difference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import DerivedProperty from '../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import Enumeration from '../../../phet-core/js/Enumeration.js';
import merge from '../../../phet-core/js/merge.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import VoltageSource from './VoltageSource.js';

// constants
const BATTERY_LENGTH = CCKCConstants.BATTERY_LENGTH;

class Battery extends VoltageSource {

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
      numberOfDecimalPlaces: batteryType === Battery.BatteryType.NORMAL ? 1 : 0,
      voltagePropertyOptions: {
        range: batteryType === Battery.BatteryType.NORMAL ? new Range( 0, 120 ) : new Range( 100, 100000 )
      }
    }, options );
    super( startVertex, endVertex, internalResistanceProperty, BATTERY_LENGTH, tandem, options );

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
}

// Enumeration for the different types of Battery, NORMAL or HIGH_VOLTAGE
Battery.BatteryType = Enumeration.byKeys( [ 'NORMAL', 'HIGH_VOLTAGE' ] );

circuitConstructionKitCommon.register( 'Battery', Battery );
export default Battery;