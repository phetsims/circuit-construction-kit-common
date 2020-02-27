// Copyright 2015-2020, University of Colorado Boulder

/**
 * Sparse solution containing the solved variables from ModifiedNodalAnalysisCircuit. * No listeners are attached and hence no dispose implementation is necessary.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

class ModifiedNodalAnalysisSolution {

  /**
   * @param {Object} nodeVoltages - see below
   * @param {ModifiedNodalAnalysisCircuitElement[]} elements
   */
  constructor( nodeVoltages, elements ) {

    // @public (read-only) {Object} - the solved node voltages.
    // keys are {number} indicating the node id, values are {number} for the voltage at the node
    this.nodeVoltages = nodeVoltages;

    // @public (read-only) {ModifiedNodalAnalysisCircuitElement[]} - circuit elements in the solution
    this.elements = elements;
  }

  /**
   * Compare two solutions, and provide detailed qunit equal test if equal is provided.  For the AC CCK, this method
   * will also be used to identify when enough dt-subdivisions have been made in the adaptive timestep integration.
   * @param {ModifiedNodalAnalysisSolution} modifiedNodalAnalysisSolution
   * @param {Object} [qassert] from qunit
   * @returns {boolean}
   * @public
   */
  approxEquals( modifiedNodalAnalysisSolution, qassert ) {
    const keys = _.keys( this.nodeVoltages );
    const otherKeys = _.keys( modifiedNodalAnalysisSolution.nodeVoltages );
    const keyDifference = _.difference( keys, otherKeys );
    assert && assert( keyDifference.length === 0, 'wrong keys in compared solution' );
    for ( let i = 0; i < keys.length; i++ ) {
      const key = keys[ i ];
      const closeEnough = NUMBER_APPROXIMATELY_EQUALS(
        this.getNodeVoltage( key ),
        modifiedNodalAnalysisSolution.getNodeVoltage( key )
      );
      qassert && qassert.equal( closeEnough, true, 'node voltages[' + i + '] should match. ' +
                                                   this.getNodeVoltage( key ) + '!==' +
                                                   modifiedNodalAnalysisSolution.getNodeVoltage( key ) );

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
   * @param modifiedNodalAnalysisSolution
   * @private
   */
  hasAllCurrents( modifiedNodalAnalysisSolution ) {
    for ( let i = 0; i < modifiedNodalAnalysisSolution.elements.length; i++ ) {
      const element = modifiedNodalAnalysisSolution.elements[ i ];
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
  hasMatchingElement( element ) {
    for ( let i = 0; i < this.elements.length; i++ ) {
      const proposedElement = this.elements[ i ];
      if ( proposedElement.nodeId0 === element.nodeId0 &&
           proposedElement.nodeId1 === element.nodeId1 &&
           NUMBER_APPROXIMATELY_EQUALS( proposedElement.currentSolution, element.currentSolution ) ) {
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
  getCurrentForResistor( resistor ) {
    assert && assert( resistor.value > 0, 'resistor must have resistance to use Ohms Law' );

    // To help understand the minus sign here:
    // Imagine a resistor that goes from node r0 to r1, with a conventional current flowing from r0 to r1.  Then
    // the voltage drop is v1-v0.  Assuming for the sake of discussion that v1>v0 (and hence the voltage is positive),
    // the current sign should be negative since conventional current flows from high to low potential.
    // Conversely, if v0>v1, then voltage is negative, so for the conventional current to flow to the right we must
    // multiply it by a negative.
    return -this.getVoltage( resistor ) / resistor.value;
  }

  /**
   * Returns the voltage of the specified node.
   * @param {number} nodeIndex - the index of the node
   * @returns {number} the voltage of the node
   * @public
   */
  getNodeVoltage( nodeIndex ) {
    return this.nodeVoltages[ nodeIndex ];
  }

  /**
   * Returns the voltage across a circuit element.
   * @param {Object} element - a circuit element with {nodeId1:{number},node2:{number}}
   * @returns {number} - the voltage
   * @private
   */
  getVoltage( element ) {
    return this.nodeVoltages[ element.nodeId1 ] - this.nodeVoltages[ element.nodeId0 ];
  }
}

/**
 * Returns true if the numbers are approximately equal.
 *
 * @param {number} a - a number
 * @param {number} b - another number
 * @returns {boolean} true if the numbers are approximately equal
 */
const NUMBER_APPROXIMATELY_EQUALS = ( a, b ) => Math.abs( a - b ) < 1E-6;

circuitConstructionKitCommon.register( 'ModifiedNodalAnalysisSolution', ModifiedNodalAnalysisSolution );
export default ModifiedNodalAnalysisSolution;