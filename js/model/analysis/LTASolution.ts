// Copyright 2021, University of Colorado Boulder
import LTACircuit from './LTACircuit.js';
import MNASolution from './mna/MNASolution.js';
import CoreModel from './CoreModel.js';
import MNAResistor from './mna/MNAResistor.js';

class LTASolution {

  private readonly circuit: LTACircuit;
  private readonly mnaSolution: MNASolution;
  private readonly currentCompanions: any;

  /**
   * @param {LTACircuit} circuit
   * @param {MNASolution} mnaSolution
   * @param {{element:MNACircuitElement,getValueForSolution(MNASolution):number}[]} currentCompanions
   * @constructor
   */
  constructor( circuit: LTACircuit, mnaSolution: MNASolution, currentCompanions: any ) {
    // @public
    this.circuit = circuit;
    this.mnaSolution = mnaSolution;
    this.currentCompanions = currentCompanions;
  }

  /**
   * @param {string} nodeIndex
   * @returns {number}
   * @public
   */
  getNodeVoltage( nodeIndex: string ) {
    return this.mnaSolution.getNodeVoltage( nodeIndex );
  }

  /**
   * @param {MNACircuitElement} element
   * @returns {number}
   * @public
   */
  getCurrent( element: MNAResistor ) {

    // For resistors with r>0, Ohm's Law gives the current.  For components with no resistance (like closed switch or
    // 0-resistance battery), the current is given by the matrix solution.
    if ( element.currentSolution !== null ) {
      return element.currentSolution;
    }
    else {
      return this.mnaSolution.getCurrentForResistor( element );
    }
  }

  // @public
  getCurrentForCompanion( dynamicInductor: CoreModel ) {
    const companion = _.find( this.currentCompanions, c => c.element.id === dynamicInductor.id );
    return companion.getValueForSolution( this.mnaSolution );
  }

  // @public
  getVoltage( node0: string, node1: string ) {
    return this.getNodeVoltage( node1 ) - this.getNodeVoltage( node0 );
  }
}

export default LTASolution;