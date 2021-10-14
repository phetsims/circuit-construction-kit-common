// Copyright 2015-2021, University of Colorado Boulder

/**
 * The Battery is a circuit element that provides a fixed voltage difference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Range from '../../../dot/js/Range.js';
import Enumeration from '../../../phet-core/js/Enumeration.js';
import merge from '../../../phet-core/js/merge.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import BatteryType from './BatteryType.js';
import Vertex from './Vertex.js';
import VoltageSource from './VoltageSource.js';
import {VoltageSourceOptions} from './VoltageSource.js';

// constants
const BATTERY_LENGTH = CCKCConstants.BATTERY_LENGTH;

type BatteryOptions = {} & VoltageSourceOptions;

class Battery extends VoltageSource {
  private readonly batteryType: BatteryType;

  /**
   * @param {Vertex} startVertex - one of the battery vertices
   * @param {Vertex} endVertex - the other battery vertex
   * @param {Property.<number>} internalResistanceProperty - the resistance of the battery
   * @param {BatteryType} batteryType
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( startVertex: Vertex, endVertex: Vertex, internalResistanceProperty: Property<number>, batteryType: BatteryType, tandem: Tandem, options?: Partial<BatteryOptions> ) {
    assert && assert( internalResistanceProperty, 'internalResistanceProperty should be defined' );
    const filledOptions = merge( {
      initialOrientation: 'right',
      voltage: 9.0,
      isFlammable: true,
      numberOfDecimalPlaces: batteryType === 'normal' ? 1 : 0,
      voltagePropertyOptions: {
        range: batteryType === 'normal' ? new Range( 0, 120 ) : new Range( 100, 100000 )
      }
    }, options ) as BatteryOptions;
    super( startVertex, endVertex, internalResistanceProperty, BATTERY_LENGTH, tandem, filledOptions );

    // @public (read-only) {string} - track which way the battery "button" (plus side) was facing the initial state so
    // the user can only create a certain number of "left" or "right" batteries from the toolbox.
    this.initialOrientation = filledOptions.initialOrientation;

    // @public (read-only) {BatteryType} - the type of the battery - NORMAL | HIGH_VOLTAGE
    this.batteryType = batteryType;
  }
}

circuitConstructionKitCommon.register( 'Battery', Battery );
export default Battery;