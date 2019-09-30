// Copyright 2015-2019, University of Colorado Boulder

/**
 * The ACVoltage is a circuit element that provides an oscillating voltage difference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );
  const NumberProperty = require( 'AXON/NumberProperty' );

  // constants
  const BATTERY_LENGTH = CCKCConstants.BATTERY_LENGTH;

  class ACVoltage extends FixedCircuitElement {

    /**
     * @param {Vertex} startVertex - one of the battery vertices
     * @param {Vertex} endVertex - the other battery vertex
     * @param {Property.<number>} internalResistanceProperty - the resistance of the battery
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( startVertex, endVertex, internalResistanceProperty, tandem, options ) {
      assert && assert( internalResistanceProperty, 'internalResistanceProperty should be defined' );
      options = _.extend( {
        initialOrientation: 'right',
        voltage: 9.0,
        isFlammable: true,
        numberOfDecimalPlaces: 1
      }, options );
      super( startVertex, endVertex, BATTERY_LENGTH, tandem, options );

      // @public {NumberProperty} - the current voltage of the battery in volts, oscillates as the model updates
      this.voltageProperty = new NumberProperty( 0 );

      // @public {NumberProperty} - the maximum voltage, which can be controlled by the CircuitElementEditNode
      this.maximumVoltageProperty = new NumberProperty( options.voltage );

      this.frequencyProperty = new NumberProperty( 0.5 );

      // @public {Property.<number>} the internal resistance of the battery
      this.internalResistanceProperty = internalResistanceProperty;

      // @public (read-only) {string} - track which way the battery "button" (plus side) was facing the initial state so
      // the user can only create a certain number of "left" or "right" batteries from the toolbox.
      this.initialOrientation = options.initialOrientation;

      // @private
      this.phase = 0;

      // @private
      this.time = 0;

      // Phase matching so the chart doesn't get jagged
      this.frequencyProperty.link( ( frequency, oldFrequency ) => {
        const oldArgument = 2 * Math.PI * oldFrequency * this.time + this.phase;
        //  2 * Math.PI * frequency * this.time + newPhase  = oldArg;
        this.phase = oldArgument - 2 * Math.PI * frequency * this.time;
      } );
    }

    /**
     * Get the properties so that the circuit can be solved when changed.
     * @returns {Property.<*>[]}
     * @override
     * @public
     */
    getCircuitProperties() {
      return [ this.voltageProperty ];
    }

    /**
     * Get all intrinsic properties of this object, which can be used to load it at a later time.
     * @returns {Object}
     * @public
     */
    toIntrinsicStateObject() {
      const parent = super.toIntrinsicStateObject();
      return _.extend( parent, {
        batteryType: this.batteryType,
        voltage: this.voltageProperty.value
      } );
    }

    /**
     * @param {number} time - total elapsed time
     * @param {number} dt - delta between last frame and current frame
     * @public
     */
    step( time, dt ) {
      this.time = time;
      this.voltageProperty.set(
        this.maximumVoltageProperty.value * Math.sin( 2 * Math.PI * this.frequencyProperty.value * time + this.phase )
      );
    }
  }

  return circuitConstructionKitCommon.register( 'ACVoltage', ACVoltage );
} );