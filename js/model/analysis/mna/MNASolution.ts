// Copyright 2015-2021, University of Colorado Boulder

/**
 * Sparse solution containing the solved variables from MNACircuit. * No listeners are attached and hence no dispose implementation is necessary.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../../../circuitConstructionKitCommon.js';
import MNACircuitElement from './MNACircuitElement.js';
import MNAResistor from './MNAResistor.js';

class MNASolution {

  private readonly nodeVoltages: Map<string, number>;
  private readonly elements: Map<MNACircuitElement, number>; // circuit elements in the solution

  /**
   * @param {Object} nodeVoltages - see below
   * @param {MNACircuitElement[]} elements
   */
  constructor( nodeVoltages: Map<string, number>, elements: Map<MNACircuitElement, number> ) {

    // @public (read-only) {Object} - the solved node voltages.
    // keys are {number} indicating the node id, values are {number} for the voltage at the node
    this.nodeVoltages = nodeVoltages;
    this.elements = elements;
  }

  // @public
  getSolvedCurrent( circuitElement: MNACircuitElement ): number {
    assert && assert( this.elements.has( circuitElement ) );
    const value = this.elements.get( circuitElement )!;
    assert && assert( typeof value === 'number' );
    return value;
  }

  /**
   * Compare two solutions, and provide detailed qunit equal test if equal is provided.  For the AC CCK, this method
   * will also be used to identify when enough dt-subdivisions have been made in the adaptive timestep integration.
   * @param {MNASolution} modifiedNodalAnalysisSolution
   * @param {Object} [qassert] from qunit
   * @returns {boolean}
   * @public
   */
  approxEquals( modifiedNodalAnalysisSolution: MNASolution, qassert: Assert ) {
    const keys = _.keys( this.nodeVoltages );
    const otherKeys = _.keys( modifiedNodalAnalysisSolution.nodeVoltages );
    const keyDifference = _.difference( keys, otherKeys );
    assert && assert( keyDifference.length === 0, 'wrong keys in compared solution' );
    for ( let i = 0; i < keys.length; i++ ) {
      const key = keys[ i ];
      const closeEnough = approximatelyEquals(
        this.getNodeVoltage( key ),
        modifiedNodalAnalysisSolution.getNodeVoltage( key )
      );
      qassert && qassert.equal( closeEnough, true, `node voltages[${i}] should match. ${
        this.getNodeVoltage( key )}!==${
        modifiedNodalAnalysisSolution.getNodeVoltage( key )}` );

      if ( !closeEnough ) {
        return false;
      }
    }

    if ( !this.hasAllCurrents( modifiedNodalAnalysisSolution ) ) {
      return false;
    }
    if ( !modifiedNodalAnalysisSolution.hasAllCurrents( this ) ) {
      return false;
    }
    return true;
  }

  /**
   * For equality testing, make sure all of the specified elements and currents match ours
   * @param {MNASolution} modifiedNodalAnalysisSolution
   * @private
   */
  hasAllCurrents( modifiedNodalAnalysisSolution: MNASolution ) {
    const keys = Array.from( modifiedNodalAnalysisSolution.elements.keys() );
    for ( let i = 0; i < keys.length; i++ ) {
      const element = keys[ i ];
      if ( !this.hasMatchingElement( element ) ) {
        return false;
      }
    }
    return true;
  }

  /**
   * Returns true if this solution has an element that matches the provided element.
   * @param {Object} element
   * @returns {boolean}
   * @private
   */
  hasMatchingElement( element: MNACircuitElement ) {
    const elements = Array.from( this.elements.keys() );
    for ( let i = 0; i < elements.length; i++ ) {
      const proposedElement = elements[ i ];
      if ( proposedElement.nodeId0 === element.nodeId0 &&
           proposedElement.nodeId1 === element.nodeId1 &&
           approximatelyEquals( this.elements.get( proposedElement )!, this.elements.get( element )! ) ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Use Ohm's law to compute the current for a resistor with resistance>0
   * @param {Object} resistor
   * @returns {number}
   * @public
   */
  getCurrentForResistor( resistor: MNAResistor ) {
    assert && assert( resistor.resistance > 0, 'resistor must have resistance to use Ohms Law' );

    // To help understand the minus sign here:
    // Imagine a resistor that goes from node r0 to r1, with a conventional current flowing from r0 to r1.  Then
    // the voltage drop is v1-v0.  Assuming for the sake of discussion that v1>v0 (and hence the voltage is positive),
    // the current sign should be negative since conventional current flows from high to low potential.
    // Conversely, if v0>v1, then voltage is negative, so for the conventional current to flow to the right we must
    // multiply it by a negative.
    // Same sign as Java, see https://github.com/phetsims/circuit-construction-kit-common/issues/758
    return -this.getVoltage( resistor ) / resistor.resistance;
  }

  /**
   * Returns the voltage of the specified node.
   * @param {string} nodeIndex - the index of the node
   * @returns {number} the voltage of the node
   * @public
   */
  getNodeVoltage( nodeIndex: string ) {
    return this.nodeVoltages.get( nodeIndex )!;
  }

  /**
   * Returns the voltage across a circuit element.
   * @param {Object} element - a circuit element with {nodeId1:{number},node2:{number}}
   * @returns {number} - the voltage
   * @private
   */
  getVoltage( element: MNACircuitElement ) {
    const voltage = this.nodeVoltages.get( element.nodeId1 )! - this.nodeVoltages.get( element.nodeId0 )!;
    assert && assert( !isNaN( voltage ) );
    return voltage;
  }
}

/**
 * Returns true if the numbers are approximately equal.
 *
 * @param {number} a - a number
 * @param {number} b - another number
 * @returns {boolean} true if the numbers are approximately equal
 */
const approximatelyEquals = ( a: number, b: number ) => Math.abs( a - b ) < 1E-6;

circuitConstructionKitCommon.register( 'MNASolution', MNASolution );
export default MNASolution;