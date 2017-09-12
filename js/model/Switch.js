// Copyright 2015-2017, University of Colorado Boulder

/**
 * Model for a switch which can be opened and closed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var FixedCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedCircuitElement' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Util = require( 'DOT/Util' );

  // constants
  var SWITCH_LENGTH = CircuitConstructionKitCommonConstants.SWITCH_LENGTH;
  var SWITCH_START = CircuitConstructionKitCommonConstants.SWITCH_START;
  var SWITCH_END = CircuitConstructionKitCommonConstants.SWITCH_END;

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Tandem} tandem
   * @constructor
   */
  function Switch( startVertex, endVertex, tandem ) {
    FixedCircuitElement.call( this, startVertex, endVertex, SWITCH_LENGTH, tandem, {

      // Use the bounding box of the open lifelike switch to show bounds for all combinations of open/closed x lifelike/schematic
      // See https://github.com/phetsims/circuit-construction-kit-dc/issues/132
      isSizeChangedOnViewChange: false
    } );
    var self = this;

    // @public (read-only) {NumberProperty} the resistance in ohms
    this.resistanceProperty = new NumberProperty( 0 );

    // @public (read-only) {BooleanProperty} whether the switch is closed (and current can flow through it)
    this.closedProperty = new BooleanProperty( false );

    this.closedProperty.link( function( closed ) {
      self.resistanceProperty.value = closed ? 0 : CircuitConstructionKitCommonConstants.MAX_RESISTANCE;
    } );
  }

  circuitConstructionKitCommon.register( 'Switch', Switch );

  return inherit( FixedCircuitElement, Switch, {

      /**
       * Returns the position and angle of the given point along the Switch
       * @param {number} distanceAlongWire
       * @param {Matrix3} matrix to be updated with the position and angle, so that garbage isn't created each time
       * @overrides
       * @public
       */
      updateMatrixForPoint: function( distanceAlongWire, matrix ) {

        var startPosition = this.startPositionProperty.get();
        var endPosition = this.endPositionProperty.get();
        var fractionAlongWire = distanceAlongWire / this.chargePathLength;

        // If the charge is halfway up the switch lever for an open switch, show it along the raised lever
        if ( fractionAlongWire > SWITCH_START && fractionAlongWire < SWITCH_END && !this.closedProperty.get() ) {
          var pivot = startPosition.blend( endPosition, SWITCH_START );

          var twoThirdsPoint = startPosition.blend( endPosition, SWITCH_END );
          var rotatedPoint = twoThirdsPoint.rotatedAboutPoint( pivot, -Math.PI / 4 );

          var distanceAlongSegment = Util.linear( SWITCH_START, SWITCH_END, 0, 1, fractionAlongWire );
          var translation = pivot.blend( rotatedPoint, distanceAlongSegment );
          matrix.setToTranslationRotationPoint( translation, endPosition.minus( startPosition ).angle() );
        }
        else {

          // For a closed switch, there is a straight path from the start vertex to the end vertex
          FixedCircuitElement.prototype.updateMatrixForPoint.call( this, distanceAlongWire, matrix );
        }
      },

      /**
       * Get the properties so that the circuit can be solved when changed.
       * @override
       * @returns {Property.<*>[]}
       * @public
       */
      getCircuitProperties: function() {
        return [ this.resistanceProperty, this.closedProperty ];
      },

    /**
     * Get all intrinsic properties of this object, which can be used to load it at a later time.
     * @returns {Object}
     * @public
     */
    toIntrinsicStateObject: function() {
      var parent = FixedCircuitElement.prototype.toIntrinsicStateObject.call( this );
      return _.extend( parent, {
        closed: this.closedProperty.value
      } );
    }
    }
  );
} );