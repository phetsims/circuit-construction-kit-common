// Copyright 2015-2021, University of Colorado Boulder

/**
 * The Battery is a circuit element that provides a fixed voltage difference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import Enumeration from '../../../phet-core/js/Enumeration.js';
import merge from '../../../phet-core/js/merge.js';
import CCKCConstants from '../CCKCConstants.js';
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
    assert && assert( Battery.BatteryType.VALUES.indexOf( batteryType ) >= 0, `invalid battery type: ${batteryType}` );
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

    // @public (read-only) {string} - track which way the battery "button" (plus side) was facing the initial state so
    // the user can only create a certain number of "left" or "right" batteries from the toolbox.
    this.initialOrientation = options.initialOrientation;

    // @public (read-only) {Battery.BatteryType} - the type of the battery - NORMAL | HIGH_VOLTAGE
    this.batteryType = batteryType;
  }
}

// @public {Enumeration} - Enumeration for the different types of Battery, NORMAL or HIGH_VOLTAGE
Battery.BatteryType = Enumeration.byKeys( [ 'NORMAL', 'HIGH_VOLTAGE' ] );

circuitConstructionKitCommon.register( 'Battery', Battery );
export default Battery;