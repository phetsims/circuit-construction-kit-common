// Copyright 2015-2017, University of Colorado Boulder

/**
 * Model for a resistor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );
  const inherit = require( 'PHET_CORE/inherit' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const ResistorType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ResistorType' );

  // constants
  const RESISTOR_LENGTH = CCKCConstants.RESISTOR_LENGTH;

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function Resistor( startVertex, endVertex, tandem, options ) {
    options = _.extend( {
      resistance: CCKCConstants.DEFAULT_RESISTANCE,

      // Support for rendering household items or
      resistorType: ResistorType.VALUES[ 0 ],
      resistorLength: RESISTOR_LENGTH,
      isFlammable: true
    }, options );

    // validate resistor type
    assert && assert( ResistorType.VALUES.indexOf( options.resistorType ) >= 0, 'Unknown resistor type: ' +
                                                                                options.resistorType );

    // @public (read-only) {ResistorType} indicates one of ResistorType values
    this.resistorType = options.resistorType;

    options.isMetallic = ResistorType.isMetallic( this.resistorType );

    FixedCircuitElement.call( this, startVertex, endVertex, options.resistorLength, tandem, options );

    // @public {Property.<number>} the resistance in ohms
    this.resistanceProperty = new NumberProperty( options.resistance );

    // @public (read-only) {number} - the number of decimal places to show in readouts and controls
    this.numberOfDecimalPlaces = this.resistorType === ResistorType.RESISTOR ? 1 : 0;
  }

  circuitConstructionKitCommon.register( 'Resistor', Resistor );

  return inherit( FixedCircuitElement, Resistor, {

    /**
     * Returns true if the resistance is editable.  Household item resistance is not editable.
     * @returns {boolean}
     * @public
     */
    isResistanceEditable: function() {
      return this.resistorType === ResistorType.HIGH_RESISTANCE_RESISTOR || this.resistorType === ResistorType.RESISTOR;
    },

    /**
     * Get the properties so that the circuit can be solved when changed.
     * @override
     * @returns {Property.<*>[]}
     * @public
     */
    getCircuitProperties: function() {
      return [ this.resistanceProperty ];
    },

    /**
     * Get all intrinsic properties of this object, which can be used to load it at a later time.
     * @returns {Object}
     * @public
     */
    toIntrinsicStateObject: function() {
      const parent = FixedCircuitElement.prototype.toIntrinsicStateObject.call( this );
      return _.extend( parent, {
        resistorType: this.resistorType,
        resistance: this.resistanceProperty.value,
        resistorLength: this.chargePathLength
      } );
    }
  } );
} );