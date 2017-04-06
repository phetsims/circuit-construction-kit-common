// Copyright 2015-2016, University of Colorado Boulder

/**
 * Model for a resistor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/FixedLengthCircuitElement' );
  var NumberProperty = require( 'AXON/NumberProperty' );

  // constants
  var RESISTOR_LENGTH = CircuitConstructionKitConstants.RESISTOR_LENGTH;

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {number} resistance
   * @constructor
   */
  function Resistor( startVertex, endVertex, resistance ) {
    FixedLengthCircuitElement.call( this, startVertex, endVertex, RESISTOR_LENGTH, RESISTOR_LENGTH );

    // @public (read-only) {Property.<number>} the resistance in ohms
    this.resistanceProperty = new NumberProperty( resistance );
  }

  circuitConstructionKitCommon.register( 'Resistor', Resistor );

  return inherit( FixedLengthCircuitElement, Resistor, {

    /**
     * @override
     * @returns {Property[]}
     */
    getCircuitProperties: function() {
      return [ this.resistanceProperty ];
    },

    /**
     * Get the attributes as a state object for serialization.
     * @returns {Object}
     */
    attributesToStateObject: function() {
      return {
          resistance: this.resistanceProperty.get()
      };
      }
    }
  );
} );