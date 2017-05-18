// Copyright 2015-2016, University of Colorado Boulder

/**
 * Model for a switch which can be opened and closed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedLengthCircuitElement' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Util = require( 'DOT/Util' );

  // constants
  var SWITCH_LENGTH = CircuitConstructionKitConstants.SWITCH_LENGTH;

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Tandem} tandem
   * @constructor
   */
  function Switch( startVertex, endVertex, tandem ) {
    FixedLengthCircuitElement.call( this, startVertex, endVertex, SWITCH_LENGTH, SWITCH_LENGTH, tandem );
    var self = this;

    // @public (read-only) the resistance in ohms
    this.resistanceProperty = new NumberProperty( 0 );

    // @public (read-only) whether the switch is closed (and current is flowing)
    this.closedProperty = new BooleanProperty( false );

    this.closedProperty.link( function( closed ) {
      self.resistanceProperty.value = closed ? 0 : 1000000000; // TODO: Do I need to model this topologically?
    } );
  }

  circuitConstructionKitCommon.register( 'Switch', Switch );

  return inherit( FixedLengthCircuitElement, Switch, {

    getPositionAndAngle: function( distanceAlongWire ) {

      // TODO: factor out 1/3 and 2/3 as the important points.
      var startPosition = this.startVertexProperty.get().positionProperty.get();
      var endPosition = this.endVertexProperty.get().positionProperty.get();
      var fractionAlongWire = distanceAlongWire / this.chargePathLength;

      // If the electron is halfway up the switch lever for an open switch, show it along the raised lever
      if ( fractionAlongWire > 1 / 3 && fractionAlongWire < 2 / 3 && !this.closedProperty.get() ) {
        var pivot = startPosition.blend( endPosition, 1 / 3 );

        var twoThirdsPoint = startPosition.blend( endPosition, 2 / 3 );
        var rotatedPoint = twoThirdsPoint.rotatedAboutPoint( pivot, -Math.PI / 4 );

        var distanceAlongSegment = Util.linear( 1 / 3, 2 / 3, 0, 1, fractionAlongWire );
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