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
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/FixedLengthCircuitElement' );

  // constants
  var RESISTOR_LENGTH = 110;

  /**
   *
   * @constructor
   */
  function Resistor( startVertex, endVertex, resistance ) {
    FixedLengthCircuitElement.call( this, RESISTOR_LENGTH, startVertex, endVertex, {
      resistance: resistance
    } );
  }

  circuitConstructionKit.register( 'Resistor', Resistor );

  return inherit( FixedLengthCircuitElement, Resistor, {
      toStateObjectWithVertexIndices: function( getVertexIndex ) {
        return _.extend( { resistance: this.resistance }, FixedLengthCircuitElement.prototype.toStateObjectWithVertexIndices.call( this, getVertexIndex ) );
      }
    }, {
      RESISTOR_LENGTH: RESISTOR_LENGTH
    }
  );
} );