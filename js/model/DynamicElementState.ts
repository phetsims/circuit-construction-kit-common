class DynamicElementState {
  voltage: number;
  current: number;

  /**
   * @param {number} voltage - the voltage drop v1-v0
   * @param {number} current - the conventional current as it moves from node 0 to node 1
   */
  constructor( voltage: number, current: number ) {
    // @public
    this.voltage = voltage;
    this.current = current;
  }
}

export default DynamicElementState;