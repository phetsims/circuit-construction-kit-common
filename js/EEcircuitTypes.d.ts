// Copyright 2025, University of Colorado Boulder

/**
 * TypeScript declaration for the EEcircuit global, which is loaded as a preload script.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

type ResultType = {
  header: string;
  numVariables: number;
  variableNames: string[];
  numPoints: number;
  dataType: 'real' | 'complex';
  data: Array<{
    name: string;
    type: 'voltage' | 'current' | 'time' | 'frequency' | 'notype';
    values: number[] | Array<{ real: number; img: number }>;
  }>;
};

type EEcircuitSimulation = {
  start: () => Promise<void>;
  setNetList: ( input: string ) => void;
  runSim: () => Promise<ResultType>;
  getInfo: () => string;
  getInitInfo: () => string;
  getError: () => string[];
  isInitialized: () => boolean;
};

type EEcircuitSimulationConstructor = {
  new(): EEcircuitSimulation;
};

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    EEcircuit: {
      Simulation: EEcircuitSimulationConstructor;
    };
  }
}

export {};
