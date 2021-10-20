// Copyright 2021, University of Colorado Boulder
import DynamicCircuit from './DynamicCircuit.js';
import ModifiedNodalAnalysisSolution from './ModifiedNodalAnalysisSolution.js';
import ModifiedNodalAnalysisCircuitElement from './ModifiedNodalAnalysisCircuitElement.js';
import DynamicCapacitorAdapter from './DynamicCapacitorAdapter.js';
import DynamicInductorAdapter from './DynamicInductorAdapter.js';
import DynamicCapacitor from './DynamicCapacitor.js';
import DynamicInductor from './DynamicInductor.js';

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
   * @param {number} nodeIndex - index
   * @returns {number}
   * @public
   */
  getNodeVoltage( nodeIndex: number | string ) {
    return this.mnaSolution.getNodeVoltage( nodeIndex );
  }

  /**
   * @param {ModifiedNodalAnalysisCircuitElement|DynamicCapacitorAdapter|DynamicInductorAdapter} element
   * @returns {number}
   * @public
   */
  getCurrent( element: ModifiedNodalAnalysisCircuitElement | DynamicCapacitor | DynamicInductor ) {

    // Scaffolding tests for TypeScript migration
    if ( element instanceof ModifiedNodalAnalysisCircuitElement ) {
      assert && assert( element.hasOwnProperty( 'currentSolution' ) );
    }
    if ( element instanceof DynamicCapacitorAdapter || element instanceof DynamicInductorAdapter ) {
      assert && assert( !element.hasOwnProperty( 'currentSolution' ) );
    }

    // For resistors with r>0, Ohm's Law gives the current.  For components with no resistance (like closed switch or
    // 0-resistance battery), the current is given by the matrix solution.
    if ( element instanceof ModifiedNodalAnalysisCircuitElement && element.currentSolution !== null ) {
      return element.currentSolution;
    }

    // Support
    const companion = _.find( this.currentCompanions, c => c.element === element ||
                                                           c.element.dynamicCircuitCapacitor === element ||
                                                           c.element.dynamicCircuitInductor === element );

    if ( companion ) {
      return companion.getValueForSolution( this.mnaSolution );
    }
    else {
      return this.mnaSolution.getCurrentForResistor( element );
    }
  }

  /**
   * @param {ModifiedNodalAnalysisCircuitElement} element
   * @returns {number}
   * @public
   */
  getVoltage( element: ModifiedNodalAnalysisCircuitElement ) {
    return this.getNodeVoltage( element.nodeId1 ) - this.getNodeVoltage( element.nodeId0 );
  }
}

export default DynamicCircuitSolution;