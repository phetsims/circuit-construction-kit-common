// Copyright 2015-2019, University of Colorado Boulder

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

  // constants
  const RESISTOR_LENGTH = CCKCConstants.RESISTOR_LENGTH;

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

        // Support for rendering household items
        resistorLength: RESISTOR_LENGTH,
        isFlammable: true
      }, options );

      assert && assert( !options.hasOwnProperty( 'resistance' ), 'Resistance should be passed through resistorType' );

      assert && assert( !options.hasOwnProperty( 'numberOfDecimalPlaces' ), 'supplied by Resistor' );
      options.numberOfDecimalPlaces = options.resistorType === Resistor.ResistorType.RESISTOR ? 1 : 0;

      // validate resistor type
      validate( resistorType, { valueType: Resistor.ResistorType } );

      super( startVertex, endVertex, options.resistorLength, tandem, options );

      // @public (read-only) {Resistor.ResistorType} indicates one of ResistorType values
      this.resistorType = resistorType;

      assert && assert( typeof this.resistorType.isMetallic === 'boolean' );

      // @public (read-only) // TODO: is this correct?  Is it necessary?
      options.isMetallic = this.resistorType.isMetallic;

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
     * @param isMetallic - whether the item is metallic (non-insulated) and hence can have its value read at any point
     */
    constructor( defaultResistance, resistanceRange, isMetallic ) { // TODO: Move length into this enum

      // @public (read-only) {number} - in Ohms
      this.defaultResistance = defaultResistance;

      // @public (read-only) {Range} - in Ohms
      this.range = resistanceRange;

      // @public (read-only) {boolean}
      this.isMetallic = isMetallic;
    }
  }

  // Enumeration for the different resistor types.
  Resistor.ResistorType = Enumeration.byMap( {
    RESISTOR: new ResistorEnumValue( 10, new Range( 0, 120 ), false ),
    HIGH_RESISTANCE_RESISTOR: new ResistorEnumValue( 1000, new Range( 100, 10000 ), false ),

    // TODO: better API
    COIN: new ResistorEnumValue( 10000, new Range( 10000, 10000 ), true ),
    PAPER_CLIP: new ResistorEnumValue( 1000000000, new Range( 1000000000, 1000000000 ), true ),
    PENCIL: new ResistorEnumValue( 1000000000, new Range( 1000000000, 1000000000 ), false ),
    ERASER: new ResistorEnumValue( 1000000000, new Range( 1000000000, 1000000000 ), false ),
    HAND: new ResistorEnumValue( 100000, new Range( 100000, 100000 ), false ),
    DOG: new ResistorEnumValue( 100000, new Range( 100000, 100000 ), false ),
    DOLLAR_BILL: new ResistorEnumValue( 1000000000, new Range( 1000000000, 1000000000 ), false )
  } );

  return circuitConstructionKitCommon.register( 'Resistor', Resistor );
} );
