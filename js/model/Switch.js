// Copyright 2015-2019, University of Colorado Boulder

/**
 * Model for a switch which can be opened and closed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Util = require( 'DOT/Util' );

  // constants
  const SWITCH_LENGTH = CCKCConstants.SWITCH_LENGTH;
  const SWITCH_START = CCKCConstants.SWITCH_START;
  const SWITCH_END = CCKCConstants.SWITCH_END;

  class Switch extends FixedCircuitElement {

    /**
     * @param {Vertex} startVertex
     * @param {Vertex} endVertex
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( startVertex, endVertex, tandem, options ) {

      options = _.extend( { closed: false }, options );

      super( startVertex, endVertex, SWITCH_LENGTH, tandem, {

        // Use the bounding box of the open lifelike switch to show bounds for all combinations of open/closed x lifelike/schematic
        // See https://github.com/phetsims/circuit-construction-kit-dc/issues/132
        isSizeChangedOnViewChange: false
      } );

      // @public (read-only) {NumberProperty} the resistance in ohms
      this.resistanceProperty = new NumberProperty( 0 );

      // @public (read-only) {BooleanProperty} whether the switch is closed (and current can flow through it)
      this.closedProperty = new BooleanProperty( options.closed );

      this.closedProperty.link( closed => {
        this.resistanceProperty.value = closed ? 0 : CCKCConstants.MAX_RESISTANCE;
      } );
    }

    /**
     * Returns the position and angle of the given point along the Switch
     * @param {number} distanceAlongWire
     * @param {Matrix3} matrix to be updated with the position and angle, so that garbage isn't created each time
     * @overrides
     * @public
     */
    updateMatrixForPoint( distanceAlongWire, matrix ) {

      const startPosition = this.startPositionProperty.get();
      const endPosition = this.endPositionProperty.get();
      const fractionAlongWire = distanceAlongWire / this.chargePathLength;

      // If the charge is halfway up the switch lever for an open switch, show it along the raised lever
      if ( fractionAlongWire > SWITCH_START && fractionAlongWire < SWITCH_END && !this.closedProperty.get() ) {
        const pivot = startPosition.blend( endPosition, SWITCH_START );

        const twoThirdsPoint = startPosition.blend( endPosition, SWITCH_END );
        const rotatedPoint = twoThirdsPoint.rotatedAboutPoint( pivot, -Math.PI / 4 );

        const distanceAlongSegment = Util.linear( SWITCH_START, SWITCH_END, 0, 1, fractionAlongWire );
        const translation = pivot.blend( rotatedPoint, distanceAlongSegment );
        matrix.setToTranslationRotationPoint( translation, endPosition.minus( startPosition ).angle() );
      }
      else {

        // For a closed switch, there is a straight path from the start vertex to the end vertex
        super.updateMatrixForPoint( distanceAlongWire, matrix );
      }
    }

    /**
     * Get the properties so that the circuit can be solved when changed.
     * @override
     * @returns {Property.<*>[]}
     * @public
     */
    getCircuitProperties() {
      return [ this.resistanceProperty, this.closedProperty ];
    }

    /**
     * Get all intrinsic properties of this object, which can be used to load it at a later time.
     * @returns {Object}
     * @public
     */
    toIntrinsicStateObject() {
      const parent = super.toIntrinsicStateObject();
      return _.extend( parent, {
        closed: this.closedProperty.value
      } );
    }
  }

  return circuitConstructionKitCommon.register( 'Switch', Switch );
} );