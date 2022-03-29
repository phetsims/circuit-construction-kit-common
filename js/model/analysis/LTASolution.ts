// Copyright 2021-2022, University of Colorado Boulder
import LTACircuit from './LTACircuit.js';
import MNASolution from './mna/MNASolution.js';
import CoreModel from './CoreModel.js';
import MNAResistor from './mna/MNAResistor.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';

// TODO: Docs
export default class LTASolution {

  private readonly circuit: LTACircuit;
  private readonly mnaSolution: MNASolution;
  private readonly currentCompanions: any;

  constructor( circuit: LTACircuit, mnaSolution: MNASolution, currentCompanions: any ) {
    this.circuit = circuit;
    this.mnaSolution = mnaSolution;
    this.currentCompanions = currentCompanions;
  }

  getNodeVoltage( nodeIndex: string ): number {
    return this.mnaSolution.getNodeVoltage( nodeIndex );
  }

  getCurrent( element: MNAResistor ): number {

    // For resistors with r>0, Ohm's Law gives the current.  For components with no resistance (like closed switch or
    // 0-resistance battery), the current is given by the matrix solution.
    if ( element.resistance > 0 ) {
      return this.mnaSolution.getCurrentForResistor( element );
    }
    else {
      return this.mnaSolution.getSolvedCurrent( element );
    }
  }

  getCurrentForCompanion( coreModel: CoreModel ): number {
    const companion = _.find( this.currentCompanions, c => c.element.id === coreModel.id );
    return companion.getValueForSolution( this.mnaSolution );
  }

  getVoltage( node0: string, node1: string ): number {
    return this.getNodeVoltage( node1 ) - this.getNodeVoltage( node0 );
  }
}

circuitConstructionKitCommon.register( 'LTASolution', LTASolution );