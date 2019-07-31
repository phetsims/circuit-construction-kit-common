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
  const NumberProperty = require( 'AXON/NumberProperty' );

  // constants
  const RESISTOR_LENGTH = CCKCConstants.RESISTOR_LENGTH;

  class Resistor extends FixedCircuitElement {

    /**
     * @param {Vertex} startVertex
     * @param {Vertex} endVertex
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( startVertex, endVertex, tandem, options ) {
      options = _.extend( {
        resistance: CCKCConstants.DEFAULT_RESISTANCE,

        // Support for rendering household items or
        resistorType: Resistor.ResistorType.VALUES[ 0 ],
        resistorLength: RESISTOR_LENGTH,
        isFlammable: true
      }, options );

      // validate resistor type
      assert && assert( Resistor.ResistorType.VALUES.indexOf( options.resistorType ) >= 0, 'Unknown resistor type: ' +
                                                                                           options.resistorType );

      super( startVertex, endVertex, options.resistorLength, tandem, options );

      // @public (read-only) {Resistor.ResistorType} indicates one of ResistorType values
      this.resistorType = options.resistorType;

      options.isMetallic = Resistor.ResistorType.isMetallic( this.resistorType );

      // @public {Property.<number>} the resistance in ohms
      this.resistanceProperty = new NumberProperty( options.resistance );

      // @public (read-only) {number} - the number of decimal places to show in readouts and controls
      this.numberOfDecimalPlaces = this.resistorType === Resistor.ResistorType.RESISTOR ? 1 : 0;
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

    /**
     * Get all intrinsic properties of this object, which can be used to load it at a later time.
     * @returns {Object}
     * @public
     */
    toIntrinsicStateObject() {
      const parent = super.toIntrinsicStateObject();
      return _.extend( parent, {
        resistorType: this.resistorType,
        resistance: this.resistanceProperty.value,
        resistorLength: this.chargePathLength
      } );
    }
  }

  // Enumeration for the different resistor types.
  Resistor.ResistorType = new Enumeration( [
    'RESISTOR',
    'HIGH_RESISTANCE_RESISTOR',
    'COIN',
    'PAPER_CLIP',
    'PENCIL',
    'ERASER',
    'HAND',
    'DOG',
    'DOLLAR_BILL'
  ], {
    beforeFreeze: ResistorType => {
      ResistorType.isMetallic = type => type === ResistorType.COIN || type === ResistorType.PAPER_CLIP;
    }
  } );

  return circuitConstructionKitCommon.register( 'Resistor', Resistor );
} );