// Copyright 2015-2017, University of Colorado Boulder

/**
 * Sparse solution containing the solved variables from ModifiedNodalAnalysisCircuit. * No listeners are attached and hence no dispose implementation is necessary.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Object} nodeVoltages - see below
   * @param {ModifiedNodalAnalysisCircuitElement[]} elements
   * @constructor
   */
  function ModifiedNodalAnalysisSolution( nodeVoltages, elements ) {

    // @public (read-only) {Object} - the solved node voltages.
    // keys are {number} indicating the node id, values are {number} for the voltage at the node
    this.nodeVoltages = nodeVoltages;

    // @public (read-only) {ModifiedNodalAnalysisCircuitElement[]} - circuit elements in the solution
    this.elements = elements;
  }

  circuitConstructionKitCommon.register( 'ModifiedNodalAnalysisSolution', ModifiedNodalAnalysisSolution );

  /**
   * Returns true if the numbers are approximately equal.
   *
   * @param {number} a - a number
   * @param {number} b - another number
   * @returns {boolean} true if the numbers are approximately equal
   */
  var NUMBER_APPROXIMATELY_EQUALS = function( a, b ) {
    return Math.abs( a - b ) < 1E-6;
  };

  return inherit( Object, ModifiedNodalAnalysisSolution, {

    /**
     * Compare two solutions, and provide detailed qunit equal test if equal is provided.  For the AC CCK, this method
     * will also be used to identify when enough dt-subdivisions have been made in the adaptive timestep integration.
     * @param {ModifiedNodalAnalysisSolution} modifiedNodalAnalysisSolution
     * @param {Object} [qassert] from qunit
     * @returns {boolean}
     * @public
     */
    approxEquals: function( modifiedNodalAnalysisSolution, qassert ) {
      var keys = _.keys( this.nodeVoltages );
      var otherKeys = _.keys( modifiedNodalAnalysisSolution.nodeVoltages );
      var keyDifference = _.difference( keys, otherKeys );
      assert && assert( keyDifference.length === 0, 'wrong keys in compared solution' );
      for ( var i = 0; i < keys.length; i++ ) {
        var key = keys[ i ];
        var closeEnough = NUMBER_APPROXIMATELY_EQUALS(
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
    },

    /**
     * For equality testing, make sure all of the specified elements and currents match ours
     * @param modifiedNodalAnalysisSolution
     * @private
     */
    hasAllCurrents: function( modifiedNodalAnalysisSolution ) {
      for ( var i = 0; i < modifiedNodalAnalysisSolution.elements.length; i++ ) {
        var element = modifiedNodalAnalysisSolution.elements[ i ];
        if ( !this.hasMatchingElement( element ) ) {
          return false;
        }
      }
      return true;
    },

    /**
     * Returns true if this solution has an element that matches the provided element.
     * @param {Object} element
     * @returns {boolean}
     * @private
     */
    hasMatchingElement: function( element ) {
      for ( var i = 0; i < this.elements.length; i++ ) {
        var proposedElement = this.elements[ i ];
        if ( proposedElement.nodeId0 === element.nodeId0 &&
             proposedElement.nodeId1 === element.nodeId1 &&
             NUMBER_APPROXIMATELY_EQUALS( proposedElement.currentSolution, element.currentSolution ) ) {
          return true;
        }
      }
      return false;
    },

    /**
     * Use Ohm's law to compute the current for a resistor with resistance>0
     * @param {Object} resistor
     * @returns {number}
     * @public
     */
    getCurrentForResistor: function( resistor ) {
      assert && assert( resistor.value > 0, 'resistor must have resistance to use Ohms Law' );
      return -this.getVoltage( resistor ) / resistor.value;
    },

    /**
     * Returns the voltage of the specified node.
     * @param {number} nodeIndex - the index of the node
     * @returns {number} the voltage of the node
     * @private
     */
    getNodeVoltage: function( nodeIndex ) {
      return this.nodeVoltages[ nodeIndex ];
    },

    /**
     * Returns the voltage across a circuit element.
     * @param {Object} element - a circuit element with {nodeId1:{number},node2:{number}}
     * @returns {number} - the voltage
     * @private
     */
    getVoltage: function( element ) {
      return this.nodeVoltages[ element.nodeId1 ] - this.nodeVoltages[ element.nodeId0 ];
    }
  } );
} );