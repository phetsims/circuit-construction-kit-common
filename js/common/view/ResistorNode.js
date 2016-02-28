// Copyright 2015, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var FixedLengthComponentNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/FixedLengthComponentNode' );

  // images
  var resistorImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/resistor.png' );

  /**
   *
   * @constructor
   */
  function ResistorNode( circuitNode, resistor ) {
    this.resistor = resistor;
    FixedLengthComponentNode.call( this, circuitNode, resistor, resistorImage );
  }

  circuitConstructionKitBasics.register( 'ResistorNode', ResistorNode );

  return inherit( FixedLengthComponentNode, ResistorNode );
} );