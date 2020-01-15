// Copyright 2015-2020, University of Colorado Boulder

/**
 * Model for a resistor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );
  const FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );
  const merge = require( 'PHET_CORE/merge' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Range = require( 'DOT/Range' );
  const validate = require( 'AXON/validate' );

  class Resistor extends FixedCircuitElement {

    /**
     * @param {Vertex} startVertex
     * @param {Vertex} endVertex
     * @param {Resistor.ResistorType} resistorType
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( startVertex, endVertex, resistorType, tandem, options ) {
      options = merge( {
        isFlammable: true // All resistors are flammable except for the dog, which automatically disconnects at high current.
      }, options );

      assert && assert( !options.hasOwnProperty( 'resistance' ), 'Resistance should be passed through resistorType' );

      assert && assert( !options.hasOwnProperty( 'numberOfDecimalPlaces' ), 'supplied by Resistor' );
      options.numberOfDecimalPlaces = options.resistorType === Resistor.ResistorType.RESISTOR ? 1 : 0;

      // validate resistor type
      validate( resistorType, { valueType: Resistor.ResistorType } );

      // @public (read-only)
      assert && assert( !options.hasOwnProperty( 'isMetallic' ), 'isMetallic is given by the resistorType' );
      options.isMetallic = resistorType.isMetallic;

      super( startVertex, endVertex, resistorType.length, tandem, options );

      // @public (read-only) {Resistor.ResistorType} indicates one of ResistorType values
      this.resistorType = resistorType;

      assert && assert( typeof this.resistorType.isMetallic === 'boolean' );

      // @public {Property.<number>} the resistance in ohms
      this.resistanceProperty = new NumberProperty( resistorType.defaultResistance, {
        tandem: tandem.createTandem( 'resistanceProperty' ),

        // Specify the Property range for seamless PhET-iO interoperation
        range: this.resistorType.range
      } );
    }

    /**
     * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
     * @public
     */
    dispose() {
      this.resistanceProperty.dispose();
      super.dispose();
    }

    /**
     * Returns true if the resistance is editable.  Household item resistance is not editable.
     * @returns {boolean}
     * @public
     */
    isResistanceEditable() {
      return this.resistorType === Resistor.ResistorType.HIGH_RESISTANCE_RESISTOR ||
             this.resistorType === Resistor.ResistorType.RESISTOR;
    }

    /**
     * Get the properties so that the circuit can be solved when changed.
     * @override
     * @returns {Property.<*>[]}
     * @public
     */
    getCircuitProperties() {
      return [ this.resistanceProperty ];
    }
  }

  /**
   * Values for the ResistorTypeEnum
   */
  class ResistorEnumValue {

    /**
     * @param {number} defaultResistance - default value for resistance, in Ohms
     * @param {Range} resistanceRange - possible values for the resistance, in Ohms
     * @param {boolean} isMetallic - whether the item is metallic (non-insulated) and hence can have its value read at any point
     * @param {number} length
     */
    constructor( defaultResistance, resistanceRange, isMetallic, length ) {

      // @public (read-only) {number} - in Ohms
      this.defaultResistance = defaultResistance;

      // @public (read-only) {Range} - in Ohms
      this.range = resistanceRange;

      // @public (read-only) {boolean}
      this.isMetallic = isMetallic;

      // @public (read-only} {number} - in view coordinates
      this.length = length;
    }

    /**
     * Convenience function for creating a fixed-resistance resistor, like a household item.
     * @param {number} resistance
     * @param {boolean} isMetallic
     * @param {number} length
     * @returns {ResistorEnumValue}
     * @private (only used in this file)
     */
    static fixed( resistance, isMetallic, length ) {
      return new ResistorEnumValue( resistance, new Range( resistance, resistance ), isMetallic, length );
    }
  }

  // Enumeration for the different resistor types.
  Resistor.ResistorType = Enumeration.byMap( {
    RESISTOR: new ResistorEnumValue( 10, new Range( 0, 120 ), false, CCKCConstants.RESISTOR_LENGTH ),
    HIGH_RESISTANCE_RESISTOR: new ResistorEnumValue( 1000, new Range( 100, 10000 ), false, CCKCConstants.RESISTOR_LENGTH ),
    COIN: ResistorEnumValue.fixed( 10000, true, CCKCConstants.COIN_LENGTH ),
    PAPER_CLIP: ResistorEnumValue.fixed( 1000000000, true, CCKCConstants.PAPER_CLIP_LENGTH ),
    PENCIL: ResistorEnumValue.fixed( 1000000000, false, CCKCConstants.PENCIL_LENGTH ),
    ERASER: ResistorEnumValue.fixed( 1000000000, false, CCKCConstants.ERASER_LENGTH ),
    HAND: ResistorEnumValue.fixed( 100000, false, CCKCConstants.HAND_LENGTH ),
    DOG: ResistorEnumValue.fixed( 100000, false, CCKCConstants.DOG_LENGTH ),
    DOLLAR_BILL: ResistorEnumValue.fixed( 1000000000, false, CCKCConstants.DOLLAR_BILL_LENGTH )
  } );

  return circuitConstructionKitCommon.register( 'Resistor', Resistor );
} );
