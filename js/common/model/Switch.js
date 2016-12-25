// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * TODO: Factor out duplicated code with Wire
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/CircuitElement' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var Property = require( 'AXON/Property' );

  // constants
  var OPEN_RESISTANCE = 1E11;
  var MINIMUM_RESISTANCE = CircuitConstructionKitConstants.minimumResistance;

  /**
   *
   * @constructor
   */
  function Switch( startVertex, endVertex, resistivity, options ) {
    assert && assert( typeof resistivity === 'number' && resistivity >= 0, 'bad value for resistivity: ' + resistivity );
    var self = this;
    CircuitElement.call( this, startVertex, endVertex, options );
    this.resistanceProperty = new Property( CircuitConstructionKitConstants.minimumResistance );
    this.resistivityProperty = new Property( resistivity );
    this.closedProperty = new Property( false );
    Property.preventGetSet( this, 'resistance' );
    Property.preventGetSet( this, 'resistivity' );
    Property.preventGetSet( this, 'closed' );

    var updateResistance = function() {
      var length = self.startVertexProperty.get().position.minus( self.endVertexProperty.get().position ).magnitude();
      var javaLength = length / 990 * 15.120675866835684;
      self.resistanceProperty.set( self.closed ? Math.max( MINIMUM_RESISTANCE, javaLength * self.resistivityProperty.get() ) :
                                   OPEN_RESISTANCE );
      assert && assert( !isNaN( self.resistanceProperty.get() ) );
    };

    var updateLength = function() {
      self.length = self.startVertexProperty.get().position.distance( self.endVertexProperty.get().position );
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
    dispose: function() {
      CircuitElement.prototype.dispose.call( this );
      this.disposeSwitch();
    },
    toStateObjectWithVertexIndices: function( getVertexIndex ) {
      return _.extend( {
        resistance: this.resistanceProperty.get(),
        resistivity: this.resistivityProperty.get()
      }, CircuitElement.prototype.toStateObjectWithVertexIndices.call( this, getVertexIndex ) );
    }
  } );
} );