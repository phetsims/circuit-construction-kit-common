// Copyright 2021, University of Colorado Boulder
import DynamicCircuit from './DynamicCircuit.js';
import ModifiedNodalAnalysisSolution from './mna/ModifiedNodalAnalysisSolution.js';
import ModifiedNodalAnalysisCircuitElement from './mna/ModifiedNodalAnalysisCircuitElement.js';
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
   * @param {string} nodeIndex
   * @returns {number}
   * @public
   */
  getNodeVoltage( nodeIndex: string ) {
    return this.mnaSolution.getNodeVoltage( nodeIndex );
  }

  /**
   * @param {ModifiedNodalAnalysisCircuitElement|DynamicCapacitor|DynamicInductor} element
   * @returns {number}
   * @public
   */
  getCurrent( element: ModifiedNodalAnalysisCircuitElement ) {

    // Scaffolding tests for TypeScript migration
    if ( element instanceof ModifiedNodalAnalysisCircuitElement ) {
      assert && assert( element.hasOwnProperty( 'currentSolution' ) );
    }
    if ( element instanceof DynamicCapacitor || element instanceof DynamicInductor ) {
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

      assert && assert( element instanceof ModifiedNodalAnalysisCircuitElement );
      return this.mnaSolution.getCurrentForResistor( element as ModifiedNodalAnalysisCircuitElement );
    }
  }

  // @public
  getCurrentForInductor( dynamicInductor: DynamicInductor ) {
    const companion = _.find( this.currentCompanions, c => {

      // TODO: use IDs for equality, see https://github.com/phetsims/circuit-construction-kit-common/issues/764
      return c.element instanceof DynamicInductor && c.element.node0 === dynamicInductor.node0 && c.element.node1 === dynamicInductor.node1;
    } );
    assert && assert( companion, 'dynamic inductor must have companion' );

    return companion.getValueForSolution( this.mnaSolution );
  }

  // @public
  getCurrentForCapacitor( dynamicCapacitor: DynamicCapacitor ): number {
    const companion = _.find( this.currentCompanions, c => {

      // TODO: use IDs for equality, see https://github.com/phetsims/circuit-construction-kit-common/issues/764
      return c.element instanceof DynamicCapacitor && c.element.node0 === dynamicCapacitor.node0 && c.element.node1 === dynamicCapacitor.node1;
    } );
    assert && assert( companion, 'dynamic capacitor must have companion' );

    return companion.getValueForSolution( this.mnaSolution );
  }

  // @public
  getVoltageForInductor( dynamicCircuitInductor: DynamicInductor ) {
    return this.getNodeVoltage( dynamicCircuitInductor.node1 ) - this.getNodeVoltage( dynamicCircuitInductor.node0 );
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