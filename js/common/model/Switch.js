// Copyright 2015-2016, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/CircuitElement' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT/CircuitConstructionKitConstants' );

  /**
   *
   * @constructor
   */
  function Switch( startVertex, endVertex, resistivity, options ) {
    assert && assert( typeof resistivity === 'number' && resistivity >= 0, 'bad value for resistivity: ' + resistivity );
    var switchModel = this;
    CircuitElement.call( this, startVertex, endVertex, {
      resistance: CircuitConstructionKitConstants.minimumResistance,
      resistivity: resistivity
    }, options );

    var updateResistance = function() {
      var length = switchModel.startVertex.position.minus( switchModel.endVertex.position ).magnitude();
      var javaLength = length / 990 * 15.120675866835684;
      switchModel.resistance = Math.max( CircuitConstructionKitConstants.minimumResistance, javaLength * switchModel.resistivity );
      assert && assert( !isNaN( switchModel.resistance ) );
    };

    var updateStartVertex = function( newStartVertex, oldStartVertex ) {
      oldStartVertex && oldStartVertex.positionProperty.unlink( updateResistance );
      newStartVertex.positionProperty.link( updateResistance );
    };
    this.startVertexProperty.link( updateStartVertex );

    var updateEndVertex = function( newEndVertex, oldEndVertex ) {
      oldEndVertex && oldEndVertex.positionProperty.unlink( updateResistance );
      newEndVertex.positionProperty.link( updateResistance );
    };
    this.endVertexProperty.link( updateEndVertex );

    this.disposeSwitch = function() {
      switchModel.startVertex.unlink( updateResistance );
      switchModel.endVertex.unlink( updateResistance );
    };
  }

  circuitConstructionKit.register( 'Switch', Switch );

  return inherit( CircuitElement, Switch, {
    dispose: function() {
      this.disposeSwitch();
      CircuitElement.prototype.dispose.call( this );
    },
    toStateObjectWithVertexIndices: function( getVertexIndex ) {
      return _.extend( {
        resistance: this.resistance,
        resistivity: this.resistivity
      }, CircuitElement.prototype.toStateObjectWithVertexIndices.call( this, getVertexIndex ) );
    }
  } );
} );