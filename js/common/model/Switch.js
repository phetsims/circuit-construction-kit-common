// Copyright 2015-2016, University of Colorado Boulder

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/CircuitElement' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var NumberProperty = require( 'AXON/NumberProperty' );

  // constants
  var OPEN_RESISTANCE = 1E11;
  var MINIMUM_RESISTANCE = CircuitConstructionKitConstants.MINIMUM_RESISTANCE;

  /**
   *
   * @constructor
   */
  function Switch( startVertex, endVertex, resistivity, tandem, options ) {
    assert && assert( typeof resistivity === 'number' && resistivity >= 0, 'bad value for resistivity: ' + resistivity );
    var chargePathLength = startVertex.positionProperty.get().distance( endVertex.positionProperty.get() );
    var self = this;
    CircuitElement.call( this, startVertex, endVertex, chargePathLength, tandem, options );
    this.resistanceProperty = new NumberProperty( CircuitConstructionKitConstants.MINIMUM_RESISTANCE );
    this.resistivityProperty = new NumberProperty( resistivity );
    this.closedProperty = new BooleanProperty( false );

    var updateResistance = function() {
      var length = self.startVertexProperty.get().positionProperty.get().minus( self.endVertexProperty.get().positionProperty.get() ).magnitude();
      var javaLength = length / 990 * 15.120675866835684;
      self.resistanceProperty.set( self.closed ? Math.max( MINIMUM_RESISTANCE, javaLength * self.resistivityProperty.get() ) :
                                   OPEN_RESISTANCE );
      assert && assert( !isNaN( self.resistanceProperty.get() ) );
    };

    var updateLength = function() {
      self.length = self.startVertexProperty.get().positionProperty.get().distance( self.endVertexProperty.get().positionProperty.get() );
    };

    var vertexMovedListener = function() {
      updateResistance();
      updateLength();
    };
    this.vertexMovedEmitter.addListener( vertexMovedListener );
    vertexMovedListener();
    this.closedProperty.link( updateResistance );

    this.disposeSwitch = function() {
      self.closedProperty.unlink( updateResistance );
      self.vertexMovedEmitter.removeListener( vertexMovedListener );
    };
  }

  circuitConstructionKitCommon.register( 'Switch', Switch );

  return inherit( CircuitElement, Switch, {

    /**
     * Get the properties so that the circuit can be solved when changed.
     * @override
     * @returns {Property[]}
     * @public
     */
    getCircuitProperties: function() {
      return [
        this.resistanceProperty
        // The closed property modifies the resistance property, so would be redundant and double the amount of work
        // necessary if reported here.
      ];
    },

    /**
     * Dispose the switch when it will no longer be used.
     * @public
     */
    dispose: function() {
      CircuitElement.prototype.dispose.call( this );
      this.disposeSwitch();
    },

    /**
     * Gets all of the attributes in a serializable state object.
     * @returns {{resistance: *, resistivity: *}}
     * @public
     */
    attributesToStateObject: function() {
      return {
        resistance: this.resistanceProperty.get(),
        resistivity: this.resistivityProperty.get()
      };
    }
  } );
} );