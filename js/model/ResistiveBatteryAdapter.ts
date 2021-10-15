import DynamicCircuitResistiveBattery from './DynamicCircuitResistiveBattery.js';
import Circuit from './Circuit.js';
import Battery from './Battery.js';
import CircuitResult from './CircuitResult.js';

class ResistiveBatteryAdapter extends DynamicCircuitResistiveBattery {
  battery: Battery;

  /**
   * @param {Circuit} circuit - the primary Circuit model instance, so we can look up Vertex indices
   * @param {Battery} battery
   */
  constructor( circuit: Circuit, battery: Battery ) {
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