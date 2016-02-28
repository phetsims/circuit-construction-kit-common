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
  var PropertySet = require( 'AXON/PropertySet' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Vertex' );

  /**
   *
   * @constructor
   */
  function Wire( position ) {
    PropertySet.call( this, {
      startVertex: new Vertex( position.x - 50, position.y ),
      endVertex: new Vertex( position.x + 50, position.y ),
      resistance: 0
    } );
  }

  return inherit( PropertySet, Wire );
} );