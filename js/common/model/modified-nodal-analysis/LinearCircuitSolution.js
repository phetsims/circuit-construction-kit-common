// Copyright 2015, University of Colorado Boulder

/**
 * This class represents a sparse solution containing only the solved variables in MNA.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var Util = require( 'DOT/Util' );

  /**
   * @param {object.<number,number>} nodeVoltages
   * @param {element[]} elements, with currentSolution
   * @constructor
   */
  function LinearCircuitSolution( nodeVoltages, elements ) {
    for ( var i = 0; i < elements.length; i++ ) {
      var e = elements[ i ];
      assert && assert( typeof e.node0 === 'number' && typeof e.node1 === 'number' );
    }
    this.nodeVoltages = nodeVoltages;
    this.elements = elements;
  }

  circuitConstructionKitBasics.register( 'LinearCircuitSolution', LinearCircuitSolution );

  // but perhaps we should get it back up to 1E6 again
  var numberApproxEquals = function( a, b ) {
    return Math.abs( a - b ) < 1E-6;
  };

  var round = function( x ) {
    return Util.roundSymmetric( x * 1E6 ) / 1E6;
  };

  return inherit( Object, LinearCircuitSolution, {

    /**
     * Compare two solutions, and provide detailed qunit equal test if equal is provided
     * @param linearCircuitSolution
     * @param {function} equal from qunit
     * @returns {boolean}
     */
    approxEquals: function( linearCircuitSolution, equal ) {
      var myKeys = _.keys( this.nodeVoltages );
      var otherKeys = _.keys( linearCircuitSolution.nodeVoltages );
      var difference = _.difference( myKeys, otherKeys );
      assert && assert( difference.length === 0, 'wrong structure for compared solution' );
      for ( var i = 0; i < myKeys.length; i++ ) {
        var key = myKeys[ i ];
        var closeEnough = numberApproxEquals( this.getNodeVoltage( key ), linearCircuitSolution.getNodeVoltage( key ) );
        equal && equal( closeEnough, true, 'node voltages[' + i + '] should match. ' + this.getNodeVoltage( key ) + '!==' + linearCircuitSolution.getNodeVoltage( key ) );

        if ( !closeEnough ) {
          return false;
        }
      }

      if ( !this.hasAllCurrents( linearCircuitSolution ) ) {
        return false;
      }
      if ( !linearCircuitSolution.hasAllCurrents( this ) ) {
        return false;
      }
      return true;
    },

    /**
     * For equality testing, make sure all of the specified elements and currents match ours
     * @param linearCircuitSolution
     */
    hasAllCurrents: function( linearCircuitSolution ) {
      for ( var i = 0; i < linearCircuitSolution.elements.length; i++ ) {
        var element = linearCircuitSolution.elements[ i ];
        if ( !this.hasMatchingElement( element ) ) {
          return false;
        }
      }
      return true;
    },

    hasMatchingElement: function( element ) {
      for ( var i = 0; i < this.elements.length; i++ ) {
        var e = this.elements[ i ];
        if ( e.node0 === element.node0 && e.node1 === element.node1 && numberApproxEquals( e.currentSolution, element.currentSolution ) ) {
          return true;
        }
      }
      return false;
    },

    /**
     * @param {CircuitElement} e
     * @returns {number}
     */
    getCurrent: function( e ) {

      //if it was a battery or resistor (of R=0), look up the answer
      for ( var i = 0; i < this.elements.length; i++ ) {
        var element = this.elements[ i ];
        if ( element.node0 === e.node0 && element.node1 === e.node1 ) {

          // TODO: Is this correct?
          if ( element.resistance === e.resistance || element.voltage === e.voltage ) {
            return element.currentSolution;
          }
        }
      }

      //else compute based on V=IR
      return -this.getVoltage( e ) / e.resistance;
    },

    getNodeVoltage: function( node ) {
      return this.nodeVoltages[ node ];
    },

    getVoltage: function( e ) {
      return this.nodeVoltages[ e.node1 ] - this.nodeVoltages[ e.node0 ];
    }
  } );
} );