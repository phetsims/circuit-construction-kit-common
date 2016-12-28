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
  var Property = require( 'AXON/Property' );

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {number} resistance
   * @constructor
   */
  function Resistor( startVertex, endVertex, resistance ) {
    FixedLengthCircuitElement.call( this, CircuitConstructionKitConstants.RESISTOR_LENGTH, startVertex, endVertex );

    // @public (read-only) {Property.<number>} the resistance in ohms
    this.resistanceProperty = new Property( resistance );
    Property.preventGetSet( this, 'resistance' );
  }

  circuitConstructionKitCommon.register( 'Resistor', Resistor );

  return inherit( FixedLengthCircuitElement, Resistor, {

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