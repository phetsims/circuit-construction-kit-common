// Copyright 2021-2022, University of Colorado Boulder

/**
 * For debugging current values and directions.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import ArrowNode from '../../../scenery-phet/js/ArrowNode.js';
import { Node, Text } from '../../../scenery/js/imports.js';
import Panel from '../../../sun/js/Panel.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitLayerNode from './CircuitLayerNode.js';
import CurrentSense from '../model/CurrentSense.js';

export default class CircuitDebugLayer extends Node {
  private readonly circuitLayerNode: CircuitLayerNode;

  public constructor( circuitLayerNode: CircuitLayerNode ) {
    super();
    this.circuitLayerNode = circuitLayerNode;
    this.rebuild();
  }

  public step(): void {
    this.rebuild();
  }

  private rebuild(): void {
    this.removeAllChildren();
    this.circuitLayerNode.circuit.circuitElements.forEach( circuitElement => {
      const start = circuitElement.startVertexProperty.value.positionProperty.value;
      const end = circuitElement.endVertexProperty.value.positionProperty.value;

      let arrowNode = null;
      let sign = 0;
      if ( circuitElement.currentProperty.value > 0 ) {
        sign = +1;
      }
      if ( circuitElement.currentProperty.value < 0 ) {
        sign = -1;
      }
      if ( sign === +1 ) {
        arrowNode = new ArrowNode( start.x, start.y, end.x, end.y, {
          fill: 'red',
          stroke: 'black',
          lineWidth: 1
        } );
      }
      else if ( sign === -1 ) {
        arrowNode = new ArrowNode( end.x, end.y, start.x, start.y, {
          fill: 'red',
          stroke: 'black',
          lineWidth: 1
        } );
      }
      else {
        arrowNode = new ArrowNode( start.x, start.y, end.x, end.y, {
          fill: 'white',
          stroke: 'black',
          lineWidth: 1
        } );
      }

      this.addChild( arrowNode );

      const offset = end.minus( start ).perpendicular.normalized().timesScalar( 10 );
      const senseNode = new ArrowNode( start.x + offset.x, start.y + offset.y, end.x + offset.x, end.y + offset.y, {
        fill: 'green'
      } );
      this.addChild( senseNode );

      const textNode = new Text( circuitElement.currentProperty.value.toFixed( 4 ) ); //eslint-disable-line
      const panel = new Panel( textNode, {
        center: arrowNode.center,
        fill: circuitElement.currentSenseProperty.value === CurrentSense.FORWARD ? 'green' :
              circuitElement.currentSenseProperty.value === CurrentSense.BACKWARD ? 'rgba(137, 196, 244, 1)' :
              'white'
      } );
      this.addChild( panel );
    } );
  }
}

circuitConstructionKitCommon.register( 'CircuitDebugLayer', CircuitDebugLayer );