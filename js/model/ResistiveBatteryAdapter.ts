import DynamicCircuitResistiveBattery from './DynamicCircuitResistiveBattery.js';
import Circuit from './Circuit.js';
import Battery from './Battery.js';
import CircuitResult from './CircuitResult.js';
import VoltageSource from './VoltageSource.js';

class ResistiveBatteryAdapter extends DynamicCircuitResistiveBattery {
   readonly battery: VoltageSource;

  /**
   * @param {Circuit} circuit - the primary Circuit model instance, so we can look up Vertex indices
   * @param {Battery} battery
   */
  constructor( circuit: Circuit, battery: VoltageSource ) {
    super(
      battery.startVertexProperty.value.index,
      battery.endVertexProperty.value.index,
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