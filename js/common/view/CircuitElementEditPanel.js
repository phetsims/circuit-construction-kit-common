// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var NumberControl = require( 'SCENERY_PHET/NumberControl' );
  var Range = require( 'DOT/Range' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Resistor' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/LightBulb' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Battery' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  function CircuitElementEditPanel( selectedCircuitElementProperty, visibleBoundsProperty ) {
    var circuitElementEditPanel = this;
    Node.call( this );
    this.addChild( new Rectangle( 0, 0, 10, 10, { fill: null } ) ); // blank spacer so layout doesn't exception out
    var updatePosition = function() {
      var visibleBounds = visibleBoundsProperty.get();
      circuitElementEditPanel.centerX = visibleBounds.centerX;
      circuitElementEditPanel.bottom = visibleBounds.bottom - 14; // TODO: Factor out insets
    };

    var lastNumberControl = null;
    selectedCircuitElementProperty.link( function( selectedCircuitElement ) {
      lastNumberControl && lastNumberControl.dispose();
      lastNumberControl && circuitElementEditPanel.removeChild( lastNumberControl );
      lastNumberControl = null;

      if ( selectedCircuitElement ) {
        if ( selectedCircuitElement instanceof Resistor || selectedCircuitElement instanceof LightBulb ) {

          lastNumberControl = new NumberControl( 'Resistance', selectedCircuitElement.resistanceProperty, new Range( 0, 100, 4.5 ), {} );
          circuitElementEditPanel.addChild( lastNumberControl );
        }
        else if ( selectedCircuitElement instanceof Battery ) {
          lastNumberControl = new NumberControl( 'Voltage', selectedCircuitElement.voltageProperty, new Range( 0, 100, 4.5 ), {} );
          circuitElementEditPanel.addChild( lastNumberControl );
        }
        else {
          lastNumberControl = null;
        }
      }
      updatePosition();
    } );

    visibleBoundsProperty.link( updatePosition );
  }

  return inherit( Node, CircuitElementEditPanel, {} );
} );