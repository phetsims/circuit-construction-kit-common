// Copyright 2021, University of Colorado Boulder
import DynamicCircuit from './DynamicCircuit.js';
import ModifiedNodalAnalysisSolution from './mna/ModifiedNodalAnalysisSolution.js';
import ModifiedNodalAnalysisCircuitElement from './mna/ModifiedNodalAnalysisCircuitElement.js';
import CoreModel from './CoreModel.js';

class DynamicCircuitSolution {

  private readonly circuit: DynamicCircuit;
  private readonly mnaSolution: ModifiedNodalAnalysisSolution;
  private readonly currentCompanions: any;

  /**
   * @param {DynamicCircuit} circuit
   * @param {ModifiedNodalAnalysisSolution} mnaSolution
   * @param {{element:ModifiedNodalAnalysisCircuitElement,getValueForSolution(ModifiedNodalAnalysisSolution):number}[]} currentCompanions
   * @constructor
   */
  constructor( circuit: DynamicCircuit, mnaSolution: ModifiedNodalAnalysisSolution, currentCompanions: any ) {
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
   * @param {ModifiedNodalAnalysisCircuitElement} element
   * @returns {number}
   * @public
   */
  getCurrent( element: ModifiedNodalAnalysisCircuitElement ) {

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

export default DynamicCircuitSolution;