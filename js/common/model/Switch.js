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
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/FixedLengthCircuitElement' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );

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