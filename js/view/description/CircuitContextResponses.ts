// Copyright 2025, University of Colorado Boulder

/**
 * Responses to circuit context changes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitNode from '../CircuitNode.js';

export default class CircuitContextResponses {
  public constructor( circuitNode: CircuitNode ) {
    circuitNode.circuit.vertexConnectedEmitter.addListener( ( targetVertex, oldVertex ) => {
        const circuitElements = circuitNode.circuit.getNeighborCircuitElements( targetVertex );
        circuitNode.addAccessibleContextResponse( `Connected elements: ${circuitElements.map( e => e.type ).join( ', ' )}` );
      }
    );
    circuitNode.circuit.vertexDisconnectedEmitter.addListener( circuitElements => {
        if ( circuitElements.length > 0 ) {
          circuitNode.addAccessibleContextResponse( `Disconnected circuit elements: ${circuitElements.map( e => e.type ).join( ', ' )}` );
        }
      }
    );
  }
}

circuitConstructionKitCommon.register( 'CircuitContextResponses', CircuitContextResponses );
