// Copyright 2023, University of Colorado Boulder

/**
 * Indicates a circuitElement and a current measurement at the given circuitElement.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElement from './CircuitElement.js';

export default class AmmeterConnection {
  public readonly circuitElement: CircuitElement;
  public readonly current: number;

  public constructor( circuitElement: CircuitElement, current: number = circuitElement.currentProperty.value ) {
    this.circuitElement = circuitElement;
    this.current = current;
  }
}

circuitConstructionKitCommon.register( 'AmmeterConnection', AmmeterConnection );