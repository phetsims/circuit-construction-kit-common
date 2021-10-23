// Copyright 2021, University of Colorado Boulder

import DynamicCircuitResistiveBattery from './DynamicCircuitResistiveBattery.js';
import CircuitResult from './CircuitResult.js';
import VoltageSource from '../VoltageSource.js';

class ResistiveBatteryAdapter extends DynamicCircuitResistiveBattery {
  readonly battery: VoltageSource;

  /**
   * @param {Battery} battery
   */
  constructor( battery: VoltageSource ) {
    super(
      battery.startVertexProperty.value.index + '',
      battery.endVertexProperty.value.index + '',
      battery.voltageProperty.value,
      battery.internalResistanceProperty.value
    );

    // @public (read-only)
    this.battery = battery;
  }

  /**
   * @param {CircuitResult} circuitResult
   * @public
   */
  applySolution( circuitResult: CircuitResult ) {
    this.battery.currentProperty.value = circuitResult.getTimeAverageCurrent( this );
  }
}

export default ResistiveBatteryAdapter;