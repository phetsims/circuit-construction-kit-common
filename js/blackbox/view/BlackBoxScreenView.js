// Copyright 2015, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var CircuitConstructionKitBasicsScreenView = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitConstructionKitBasicsScreenView' );
  var ModeRadioButtonGroup = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/blackbox/view/ModeRadioButtonGroup' );

  /**
   * @param {BlackBoxScreenModel} blackBoxScreenModel
   * @constructor
   */
  function BlackBoxScreenView( blackBoxScreenModel ) {
    var blackBoxScreenView = this;
    CircuitConstructionKitBasicsScreenView.call( this, blackBoxScreenModel );

    // Add "Investigate Circuit" and "Build Circuit" radio buttons under the sensor toolbox
    var modeRadioButtonGroup = new ModeRadioButtonGroup( blackBoxScreenModel.modeProperty );
    this.addChild( modeRadioButtonGroup );

    this.circuitConstructionKitBasicsScreenViewLayoutCompletedEmitter.addListener( function() {
      modeRadioButtonGroup.top = blackBoxScreenView.sensorToolbox.bottom + 20;
      modeRadioButtonGroup.right = blackBoxScreenView.sensorToolbox.right;
    } );
  }

  return inherit( CircuitConstructionKitBasicsScreenView, BlackBoxScreenView );
} );