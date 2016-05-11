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
    this.distance = distance; // Distance along the circuit element, in pixels
    this.radius = 0.1;
    this.deleted = false;
    this.observer = function() {
      assert && assert( !electron.deleted, 'Electron was deleted' );
      electron.updatePosition();
    };
    circuitElement.vertexMovedEmitter.addListener( this.observer );
    PropertySet.call( this, {
      position: null
    } );
    this.updatePosition();

    // @public
    this.node = null; // Support map for the view
  }

  circuitConstructionKit.register( 'Electron', Electron );

  return inherit( PropertySet, Electron, {
    updatePosition: function() {
      var position = this.circuitElement.getPosition( this.distance );
      assert && assert( !isNaN( position.x ) && !isNaN( position.y ), 'point was not a number' );
      this.position = position;
    },

    // TODO: use this method
    setDistanceAlongWire: function( distance ) {
      assert && assert( !isNaN( distance ), 'electron position was not a number' );
      assert && assert( !this.deleted, 'electron was already deleted' );
      assert && assert( this.branch.containsScalarLocation( distance ), 'branch did not contain position' );
      if ( this.distance !== distance ) {
        this.distance = distance;
        this.updatePosition();
      }
    },
    delete: function() {
      this.circuitElement.vertexMovedEmitter.removeListener( this.observer );
      this.deleted = true;
    },
    setLocation: function( circuitElement, distance ) {
      assert && assert( !isNaN( distance ), 'Distance was NaN' );
      assert && assert( circuitElement.containsScalarLocation( distance ), 'no location in branch' );
      if ( this.circuitElement !== circuitElement ) {
        this.circuitElement.vertexMovedEmitter.removeListener( this.observer );
        this.circuitElement = circuitElement;
        this.circuitElement.vertexMovedEmitter.addListener( this.observer );
      }
      if ( this.distance !== distance ) {
        this.distance = distance;
        this.updatePosition();
      }
    }
  } );
} );