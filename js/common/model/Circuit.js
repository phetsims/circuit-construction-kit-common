// Copyright 2002-2015, University of Colorado Boulder

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Wire' );

  /**
   *
   * @constructor
   */
  function Circuit() {
    this.wires = new ObservableArray();
    this.wires.push( new Wire() );
  }

  return inherit( Object, Circuit );
} );