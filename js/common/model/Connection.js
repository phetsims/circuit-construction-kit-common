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
  var ObservableArray = require( 'AXON/ObservableArray' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var Property = require( 'AXON/Property' );

  /**
   *
   * @constructor
   */
  function Connection() {
    this.elements = new ObservableArray();
    this.positionProperty = new Property();
  }

  return inherit( Object, Connection, {

    get position() {
      return this.positionProperty.value;
    },

    // @public
    // chainable
    addBranch: function( branch, terminalPositionProperty ) {
      this.elements.add( { branch: branch, terminalPositionProperty: terminalPositionProperty } );
      this.positionProperty.value = terminalPositionProperty.value;
      return this;
    },

    // @public
    isConnectedTo: function( branch, terminalPositionProperty ) {
      for ( var i = 0; i < this.elements.getArray().length; i++ ) {
        var element = this.elements.getArray()[ i ];
        if ( element.branch === branch && element.terminalPositionProperty === terminalPositionProperty ) {
          return true;
        }
      }
      return false;
    },

    // @public
    setPosition: function( position ) {
      for ( var i = 0; i < this.elements.getArray().length; i++ ) {
        var element = this.elements.getArray()[ i ];
        if ( !(element.terminalPositionProperty instanceof DerivedProperty) ) {
          element.terminalPositionProperty.set( position );
        }
      }
      this.positionProperty.value = position;
    }
  } );
} );