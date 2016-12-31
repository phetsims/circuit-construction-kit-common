// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/CircuitElement' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var Property = require( 'AXON/Property' );

  /**
   *
   * @constructor
   */
  function Wire( startVertex, endVertex, resistivity, options ) {
    assert && assert( typeof resistivity === 'number' && resistivity >= 0, 'bad value for resistivity: ' + resistivity );
    var self = this;
    CircuitElement.call( this, startVertex, endVertex, options );

    this.resistanceProperty = new Property( CircuitConstructionKitConstants.MINIMUM_RESISTANCE );
    this.resistivityProperty = new Property( resistivity );
    Property.preventGetSet( this, 'resistance' );
    Property.preventGetSet( this, 'resistivity' );

    var updateResistance = function() {
      var length = self.startVertexProperty.get().positionProperty.get().minus( self.endVertexProperty.get().positionProperty.get() ).magnitude();
      var javaLength = length / 990 * 15.120675866835684;
      self.resistanceProperty.set( Math.max( CircuitConstructionKitConstants.MINIMUM_RESISTANCE, javaLength * self.resistivityProperty.get() ) );
      assert && assert( !isNaN( self.resistanceProperty.get() ), 'wire resistance should not be NaN' );
    };

    this.disposeWire = function() {
      this.vertexMovedEmitter.removeListener( vertexMovedListener );
    };

    var updateCircuitElementLength = function() {
      self.circuitElementLength = self.startVertexProperty.get().positionProperty.get().distance( self.endVertexProperty.get().positionProperty.get() );
    };

    var vertexMovedListener = function() {
      updateResistance();
      updateCircuitElementLength();
    };
    this.vertexMovedEmitter.addListener( vertexMovedListener );
    vertexMovedListener();

    Property.preventGetSet( this, 'length' );
  }

  circuitConstructionKitCommon.register( 'Wire', Wire );

  return inherit( CircuitElement, Wire, {
    dispose: function() {
      this.disposeWire();
      CircuitElement.prototype.dispose.call( this );
    },
    attributesToStateObject: function() {
      return {
        resistance: this.resistanceProperty.get(),
        resistivity: this.resistivityProperty.get()
      };
    }
  } );
} );