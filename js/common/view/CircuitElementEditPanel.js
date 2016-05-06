// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var NumberControl = require( 'SCENERY_PHET/NumberControl' );
  var RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var Range = require( 'DOT/Range' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT/CircuitConstructionKitConstants' );

  function CircuitElementEditPanel( title, units, valueProperty, circuit, circuitElement, options ) {
    options = _.extend( { numberControlEnabled: true }, options );

    var font = new PhetFont( 14 );
    var numberControlOptions = {
      titleFont: font,
      valueFont: font,
      decimalPlaces: 1
    };

    var numberControl = new NumberControl( title, valueProperty, new Range( 0, 100 ), _.extend( {
      units: units
    }, numberControlOptions ) );
    var roundPushButton = new RoundPushButton( {
      baseColor: 'yellow',
      content: new FontAwesomeNode( 'trash', {
        scale: CircuitConstructionKitConstants.fontAwesomeIconScale
      } ),
      listener: function() {
        circuit.remove( circuitElement );
      },
      minXMargin: 10,
      minYMargin: 10
    } );
    var children = [];
    if ( options.numberControlEnabled ) {
      children.push( numberControl );
    }
    if ( circuitElement.canBeDroppedInToolbox ) {
      children.push( roundPushButton );
    }
    HBox.call( this, {
      spacing: 40,
      align: 'bottom',
      children: children
    } );

    this.disposeCircuitElementEditPanel = function() {
      numberControl.dispose();
    };
  }

  circuitConstructionKit.register( 'CircuitElementEditPanel', CircuitElementEditPanel );
  
  return inherit( HBox, CircuitElementEditPanel, {
    dispose: function() {
      this.disposeCircuitElementEditPanel();
      HBox.prototype.dispose.call( this );
    }
  } );
} );