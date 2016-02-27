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
  var Circle = require( 'SCENERY/nodes/Circle' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );

  /**
   *
   * @constructor
   */
  function ConnectionNode( snapContext, connection ) {
    Circle.call( this, 20, { fill: CircuitConstructionKitBasicsConstants.wireColor } );
    var connectionNode = this;
    connection.positionProperty.link( function( position ) {
      connectionNode.center = position;
    } );
  }

  circuitConstructionKitBasics.register( 'ConnectionNode', ConnectionNode );

  return inherit( Circle, ConnectionNode );
} );