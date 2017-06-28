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
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedLengthCircuitElement' );
  var NumberProperty = require( 'AXON/NumberProperty' );

  // constants
  var RESISTOR_LENGTH = CircuitConstructionKitConstants.RESISTOR_LENGTH;
  var RESISTOR_TYPES = [ 'resistor', 'highResistanceResistor', 'coin', 'paperClip', 'pencil', 'eraser', 'hand', 'dog', 'dollarBill' ];

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function Resistor( startVertex, endVertex, tandem, options ) {
    options = _.extend( {
      resistance: CircuitConstructionKitConstants.DEFAULT_RESISTANCE,

      // Support for rendering grab bag items or
      resistorType: RESISTOR_TYPES[ 0 ],
      resistorLength: RESISTOR_LENGTH
    }, options );

    // validate resistor type
    assert && assert( RESISTOR_TYPES.indexOf( options.resistorType ) >= 0, 'Unknown resistor type: ' + options.resistorType );

    // @public (read-only) {string} indicates one of RESISTOR_TYPES
    this.resistorType = options.resistorType;

    FixedLengthCircuitElement.call( this, startVertex, endVertex, options.resistorLength, options.resistorLength, tandem, options );

    // @public {Property.<number>} the resistance in ohms
    this.resistanceProperty = new NumberProperty( options.resistance );
  }

  circuitConstructionKitCommon.register( 'Resistor', Resistor );

  return inherit( FixedLengthCircuitElement, Resistor, {


      /**
       * Returns true if the resistance is editable.  Grab bag item resistance is not editable.
       * @returns {boolean}
       * @public
       */
      isResistanceEditable: function() {
        return this.resistorType === 'highResistanceResistor' || this.resistorType === 'resistor';
      },

      /**
       * Get the properties so that the circuit can be solved when changed.
       * @override
       * @returns {Property[]}
       * @public
       */
      getCircuitProperties: function() {
        return [ this.resistanceProperty ];
      },

      /**
       * Get the attributes as a state object for serialization.
       * @returns {Object}
       * @public
       */
      attributesToStateObject: function() {
        return {
          resistance: this.resistanceProperty.get()
        };
      }
    }
  );
} );