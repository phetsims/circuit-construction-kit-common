// Copyright 2015-2016, University of Colorado Boulder

/**
 * Sparse solution containing the solved variables from ModifiedNodalAnalysisCircuit
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Object} nodeVoltages - keys are {number} indicating the node index, values are {number} for the voltage at the node
   * @param {Object[]} elements, with node0, node1, currentSolution (all {number})
   * @constructor
   */
  function ModifiedNodalAnalysisSolution( nodeVoltages, elements ) {
    for ( var i = 0; i < elements.length; i++ ) {
      assert && assert( typeof elements[ i ].node0 === 'number' && typeof elements[ i ].node1 === 'number' );
    }

    // @public (read-only) - the solved node voltages
    this.nodeVoltages = nodeVoltages;

    // @public (read-only) - circuit elements in the solution
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
     * Compare two solutions, and provide detailed qunit equal test if equal is provided
     * @param modifiedNodalAnalysisSolution
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
        var closeEnough = NUMBER_APPROXIMATELY_EQUALS( this.getNodeVoltage( key ), modifiedNodalAnalysisSolution.getNodeVoltage( key ) );
        qassert && qassert.equal( closeEnough, true, 'node voltages[' + i + '] should match. ' + this.getNodeVoltage( key ) + '!==' + modifiedNodalAnalysisSolution.getNodeVoltage( key ) );

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
        if ( proposedElement.node0 === element.node0 &&
             proposedElement.node1 === element.node1 &&
             NUMBER_APPROXIMATELY_EQUALS( proposedElement.currentSolution, element.currentSolution ) ) {
          return true;
        }
      }
      return false;
    },

    /**
     * Used by the CCK test harness.
     * @param {Object} element
     * @returns {number}
     * @public
     */
    getCurrent: function( element ) {

      // If the current is in the solution, look it up.
      if ( typeof element.resistance !== 'number' || element.resistance === 0 ) {

        // If it was a battery or resistor (of R=0), look up the answer from an equivalent component
        for ( var i = 0; i < this.elements.length; i++ ) {
          var proposedElement = this.elements[ i ];
          if ( proposedElement.node0 === element.node0 && proposedElement.node1 === element.node1 ) {

            var isEquivalentResistor = typeof proposedElement.resistance === 'number' && proposedElement.resistance === element.resistance;
            var isEquivalentBattery = typeof proposedElement.voltage === 'number' && proposedElement.voltage === element.voltage;
            if ( isEquivalentResistor || isEquivalentBattery ) {
              return proposedElement.currentSolution;
            }
          }
        }

        assert && assert( false, 'should have found an equivalent component by now' );
      }

      // If the current was not in the solution, use Ohm's law (V=IR) to compute the current
      return -this.getVoltage( element ) / element.resistance;
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
     * @param {Object} element - a circuit element with {node1:{number},node2:{number}}
     * @returns {number} - the voltage
     * @private
     */
    getVoltage: function( element ) {
      return this.nodeVoltages[ element.node1 ] - this.nodeVoltages[ element.node0 ];
    }
  } );
} );