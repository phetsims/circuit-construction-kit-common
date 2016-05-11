// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var PropertySet = require( 'AXON/PropertySet' );

  function Electron( circuitElement, distance ) {
    assert && assert( _.isNumber( distance ), 'distance should be a number' );
    assert && assert( distance >= 0 && distance <= circuitElement.length, 'electron out of bounds' );
    var electron = this;
    this.circuitElement = circuitElement;
    this.radius = 0.1;
    this.deleted = false;

    PropertySet.call( this, {
      distance: distance
    } );
    this.addDerivedProperty( 'position', [ 'distance' ], function( distance ) {
      assert && assert( !electron.deleted, 'Electron was deleted' );
      assert && assert( !isNaN( distance ), 'electron position was not a number' );
      assert && assert( !electron.deleted, 'electron was already deleted' );
      assert && assert( electron.circuitElement.containsScalarLocation( distance ), 'branch did not contain position' );
      var position = electron.circuitElement.getPosition( distance );
      assert && assert( !isNaN( position.x ) && !isNaN( position.y ), 'point was not a number' );
      return position;
    } );

    // @public
    this.node = null; // Support map for the view
  }

  circuitConstructionKit.register( 'Electron', Electron );

  return inherit( PropertySet, Electron, {

    dispose: function() {
      this.deleted = true;
    },
    setLocation: function( circuitElement, distance ) {
      assert && assert( !isNaN( distance ), 'Distance was NaN' );
      assert && assert( circuitElement.containsScalarLocation( distance ), 'no location in branch' );
      if ( this.circuitElement !== circuitElement ) {
        this.circuitElement = circuitElement;
      }
      this.distance = distance;
    }
  } );
} );