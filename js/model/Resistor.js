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
      options = merge( {
        resistance: CCKCConstants.DEFAULT_RESISTANCE,

        // Support for rendering household items or
        resistorType: Resistor.ResistorType.VALUES[ 0 ],
        resistorLength: RESISTOR_LENGTH,
        isFlammable: true
      }, options );

      assert && assert( !options.hasOwnProperty( 'numberOfDecimalPlaces' ), 'supplied by Resistor' );
      options.numberOfDecimalPlaces = options.resistorType === Resistor.ResistorType.RESISTOR ? 1 : 0;

      // validate resistor type
      assert && assert( Resistor.ResistorType.VALUES.indexOf( options.resistorType ) >= 0, 'Unknown resistor type: ' +
                                                                                           options.resistorType );

      super( startVertex, endVertex, options.resistorLength, tandem, options );

      // @public (read-only) {Resistor.ResistorType} indicates one of ResistorType values
      this.resistorType = options.resistorType;

      options.isMetallic = Resistor.ResistorType.isMetallic( this.resistorType );

      // @public {Property.<number>} the resistance in ohms
      this.resistanceProperty = new NumberProperty( options.resistance, {
        tandem: tandem.createTandem( 'resistanceProperty' ),

        // Specify the Property range for seamless PhET-iO interoperation
        range: options.resistorType.range
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

  // Enumeration for the different resistor types.
  Resistor.ResistorType = Enumeration.byKeys( [
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

      // TODO: Get the ranges correct for grab bag objects
      ResistorType.RESISTOR.range = new Range( 0, 120 );
      ResistorType.HIGH_RESISTANCE_RESISTOR.range = new Range( 100, 10000 );
      ResistorType.COIN.range = new Range( 0, 10000 );
      ResistorType.PENCIL.range = new Range( 0, 1000000000 );
      ResistorType.ERASER.range = new Range( 0, 1000000000 );
      ResistorType.HAND.range = new Range( 0, 1000000000 );
      ResistorType.DOG.range = new Range( 0, 1000000000 );
      ResistorType.DOLLAR_BILL.range = new Range( 0, 1000000000 );
    }
  } );

  return circuitConstructionKitCommon.register( 'Resistor', Resistor );
} );