// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var NumberControl = require( 'SCENERY_PHET/NumberControl' );
  var RoundPushButton = require( 'SUN/buttons/RoundPushButton' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var FontAwesomeNode = require( 'SUN/FontAwesomeNode' );
  var Range = require( 'DOT/Range' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );

  function CircuitElementEditPanel( title, units, valueProperty, circuit, circuitElement ) {

    var font = new PhetFont( 14 );
    var numberControlOptions = {
      titleFont: font,
      valueFont: font,
      decimalPlaces: 1
    };

    HBox.call( this, {
      spacing: 40,
      align: 'bottom',
      children: [
        new NumberControl( title, valueProperty, new Range( 0, 100 ), _.extend( {
          units: units
        }, numberControlOptions ) ),
        new RoundPushButton( {
          baseColor: 'yellow',
          content: new FontAwesomeNode( 'trash', {
            scale: CircuitConstructionKitBasicsConstants.fontAwesomeIconScale
          } ),
          listener: function() {
            circuit.remove( circuitElement );
          },
          minXMargin: 10,
          minYMargin: 10
        } )
      ]
    } );
  }

  return inherit( HBox, CircuitElementEditPanel, {} );
} );