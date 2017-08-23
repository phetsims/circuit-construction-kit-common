// Copyright 2015-2017, University of Colorado Boulder

/**
 * Model for a resistor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var NumberProperty = require( 'AXON/NumberProperty' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedLengthCircuitElement' );
  var inherit = require( 'PHET_CORE/inherit' );

  // constants
  var RESISTOR_LENGTH = CircuitConstructionKitCommonConstants.RESISTOR_LENGTH;
  var RESISTOR_TYPES = [
    'resistor', 'highResistanceResistor', 'coin', 'paperClip', 'pencil', 'eraser', 'hand', 'dog', 'dollarBill'
  ];

  // See isMetallic
  var METALLIC_RESISTOR_TYPES = [
    'coin', 'paperClip'
  ];

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function Resistor( startVertex, endVertex, tandem, options ) {
    options = _.extend( {
      resistance: CircuitConstructionKitCommonConstants.DEFAULT_RESISTANCE,

      // Support for rendering grab bag items or
      resistorType: RESISTOR_TYPES[ 0 ],
      resistorLength: RESISTOR_LENGTH,
    }, options );

    // validate resistor type
    assert && assert( RESISTOR_TYPES.indexOf( options.resistorType ) >= 0, 'Unknown resistor type: ' +
                                                                           options.resistorType );

    // @public (read-only) {string} indicates one of RESISTOR_TYPES
    this.resistorType = options.resistorType;

    // @public (read-only) metallic resistors behave like exposed wires--sensor values can be read directly on the
    // resistor. For instance, coins and paper clips are metallic and can have their values read directly.
    this.isMetallic = METALLIC_RESISTOR_TYPES.indexOf( this.resistorType ) >= 0;

    FixedLengthCircuitElement.call(
      this, startVertex, endVertex, options.resistorLength, options.resistorLength, tandem, options
    );

    // @public {Property.<number>} the resistance in ohms
    this.resistanceProperty = new NumberProperty( options.resistance );

    // @public (read-only) {number} - the number of decimal places to show in readouts and controls
    this.numberOfDecimalPlaces = this.resistorType === 'resistor' ? 1 : 0;
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
       * @returns {Property[]} REVIEW: Type of Properties? Property.<Circuit>?
       *                       REVIEW(samreid): In discussion in Battery.js
       * @public
       */
      getCircuitProperties: function() {
        return [ this.resistanceProperty ];
      },

      /**
       * Get the attributes as a state object for serialization.
       * @returns {Object}
       * @public
       * REVIEW: Duck typing looks good for these objects, but it should be documented where the spec is.
       * REVIEW(samreid): In discussion in Battery.js
       */
      attributesToStateObject: function() {
        return {
          resistance: this.resistanceProperty.get()
        };
      }
    }
  );
} );