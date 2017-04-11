// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 * This class represents a sparse solution containing only the solved variables in Modified Nodal Analysis.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );


  // constants

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

  /**
   * @param {Object} nodeVoltages - {nodeIndex:{number}:voltage:{number}}
   * @param {CircuitElement[]} elements, with currentSolution
   * @constructor
   */
  function ModifiedNodalAnalysisSolution( nodeVoltages, elements ) {
    for ( var i = 0; i < elements.length; i++ ) {
      var element = elements[ i ];
      assert && assert( typeof element.node0 === 'number' && typeof element.node1 === 'number' );
    }
    this.nodeVoltages = nodeVoltages;
    this.elements = elements;
  }

  circuitConstructionKitCommon.register( 'ModifiedNodalAnalysisSolution', ModifiedNodalAnalysisSolution );

  return inherit( Object, ModifiedNodalAnalysisSolution, {

    /**
     * Compare two solutions, and provide detailed qunit equal test if equal is provided
     * @param modifiedNodalAnalysisSolution
     * @param {function} equal from qunit
     * @returns {boolean}
     */
    approxEquals: function( modifiedNodalAnalysisSolution, equal ) {
      var myKeys = _.keys( this.nodeVoltages );
      var otherKeys = _.keys( modifiedNodalAnalysisSolution.nodeVoltages );
      var difference = _.difference( myKeys, otherKeys );
      assert && assert( difference.length === 0, 'wrong structure for compared solution' );
      for ( var i = 0; i < myKeys.length; i++ ) {
        var key = myKeys[ i ];
        var closeEnough = NUMBER_APPROXIMATELY_EQUALS( this.getNodeVoltage( key ), modifiedNodalAnalysisSolution.getNodeVoltage( key ) );
        equal && equal( closeEnough, true, 'node voltages[' + i + '] should match. ' + this.getNodeVoltage( key ) + '!==' + modifiedNodalAnalysisSolution.getNodeVoltage( key ) );

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

    hasMatchingElement: function( element ) {
      for ( var i = 0; i < this.elements.length; i++ ) {
        var e = this.elements[ i ];
        if ( e.node0 === element.node0 && e.node1 === element.node1 && NUMBER_APPROXIMATELY_EQUALS( e.currentSolution, element.currentSolution ) ) {
          return true;
        }
      }
      return false;
    },

    /**
     * Used by the CCK test harness.
     * @param {Object} e
     * @returns {number}
     */
    getCurrent: function( e ) {

      if ( typeof e.resistance !== 'number' || e.resistance === 0 ) {

        // If it was a battery or resistor (of R=0), look up the answer from an equivalent component
        for ( var i = 0; i < this.elements.length; i++ ) {
          var element = this.elements[ i ];
          if ( element.node0 === e.node0 && element.node1 === e.node1 ) {

            var isEquivalentResistor = typeof element.resistance === 'number' && element.resistance === e.resistance;
            var isEquivalentBattery = typeof element.voltage === 'number' && element.voltage === e.voltage;
            if ( isEquivalentResistor || isEquivalentBattery ) {
              return element.currentSolution;
            }
          }
        }

        assert && assert( false, 'should have found an equivalent component by now' );
      }

      // Else compute based on V=IR
      return -this.getVoltage( e ) / e.resistance;
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
     * @param {Object} e - a circuit element with {node1:{number},node2:{number}}
     * @returns {number} - the voltage
     * @private
     */
    getVoltage: function( e ) {
      return this.nodeVoltages[ e.node1 ] - this.nodeVoltages[ e.node0 ];
    }
  } );
} );