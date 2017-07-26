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
  var NumberProperty = require( 'AXON/NumberProperty' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedLengthCircuitElement' );
  var Util = require( 'DOT/Util' );
  var inherit = require( 'PHET_CORE/inherit' );

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
    FixedLengthCircuitElement.call( this, startVertex, endVertex, SWITCH_LENGTH, SWITCH_LENGTH, tandem );
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

  return inherit( FixedLengthCircuitElement, Switch, {

      /**
       * Returns the position and angle of the given point along the Switch
       * @param {number} distanceAlongWire
       * @returns {Object} with {position,angle}
       * @overrides
       * @public
       */
      getPositionAndAngle: function( distanceAlongWire ) {

        var startPosition = this.startVertexProperty.get().positionProperty.get();
        var endPosition = this.endVertexProperty.get().positionProperty.get();
        var fractionAlongWire = distanceAlongWire / this.chargePathLength;

        // If the charge is halfway up the switch lever for an open switch, show it along the raised lever
        if ( fractionAlongWire > SWITCH_START && fractionAlongWire < SWITCH_END && !this.closedProperty.get() ) {
          var pivot = startPosition.blend( endPosition, SWITCH_START );

          var twoThirdsPoint = startPosition.blend( endPosition, SWITCH_END );
          var rotatedPoint = twoThirdsPoint.rotatedAboutPoint( pivot, -Math.PI / 4 );

          var distanceAlongSegment = Util.linear( SWITCH_START, SWITCH_END, 0, 1, fractionAlongWire );
          return {

            position: pivot.blend( rotatedPoint, distanceAlongSegment ),
            angle: endPosition.minus( startPosition ).angle()
          };
        }
        else {

          // For a closed switch, there is a straight path from the start vertex to the end vertex
          return FixedLengthCircuitElement.prototype.getPositionAndAngle.call( this, distanceAlongWire );
        }
      },

      /**
       * Get the properties so that the circuit can be solved when changed.
       * @override
       * @returns {Property[]}
       * @public
       */
      getCircuitProperties: function() {
        return [ this.resistanceProperty, this.closedProperty ];
      },

      /**
       * Get the attributes as a state object for serialization.
       * @returns {Object}
       * @public
       */
      attributesToStateObject: function() {
        return {
          resistance: this.resistanceProperty.get(),
          closed: this.closedProperty.get()
        };
      }
    }
  );
} );