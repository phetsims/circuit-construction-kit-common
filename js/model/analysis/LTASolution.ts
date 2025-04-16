// Copyright 2021-2025, University of Colorado Boulder

/**
 * LTASolution is a class that represents the solution of a linear time-invariant (LTI) circuit. It provides methods for
 * getting node voltages, component currents, and voltages between nodes, as well as looking up companion model values.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import type CoreModel from './CoreModel.js';
import type LTACircuit from './LTACircuit.js';
import type MNAResistor from './mna/MNAResistor.js';
import type MNASolution from './mna/MNASolution.js';
export default class LTASolution {

  private readonly circuit: LTACircuit;
  private readonly mnaSolution: MNASolution;
  private readonly currentCompanions: { element: CoreModel; getValueForSolution: ( solution: MNASolution ) => number }[];

  public constructor( circuit: LTACircuit, mnaSolution: MNASolution, currentCompanions: { element: CoreModel; getValueForSolution: ( solution: MNASolution ) => number }[] ) {
    this.circuit = circuit;
    this.mnaSolution = mnaSolution;
    this.currentCompanions = currentCompanions;
  }

  public getNodeVoltage( nodeIndex: string ): number {
    return this.mnaSolution.getNodeVoltage( nodeIndex );
  }

  public getCurrent( element: MNAResistor ): number {

    // For resistors with r>0, Ohm's Law gives the current.  For components with no resistance (like closed switch or
    // 0-resistance battery), the current is given by the matrix solution.
    if ( element.resistance > 0 ) {
      return this.mnaSolution.getCurrentForResistor( element );
    }
    else {
      return this.mnaSolution.getSolvedCurrent( element );
    }
  }

  public getCurrentForCompanion( coreModel: CoreModel ): number {
    const companion = _.find( this.currentCompanions, c => c.element.id === coreModel.id );
    return companion!.getValueForSolution( this.mnaSolution );
  }

  public getVoltage( node0: string, node1: string ): number {
    return this.getNodeVoltage( node1 ) - this.getNodeVoltage( node0 );
  }
}

circuitConstructionKitCommon.register( 'LTASolution', LTASolution );