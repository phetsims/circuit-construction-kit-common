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
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );

  /**
   * @param {CircuitConstructionKitBasicsModel} circuitConstructionKitBasicsModel
   * @constructor
   */
  function BlackBoxScreenView( blackBoxScreenModel ) {
    var blackBoxScreenView = this;
    CircuitConstructionKitBasicsScreenView.call( this, blackBoxScreenModel );

    // Add "Investigate Circuit" and "Build Circuit" radio buttons under the sensor toolbox
    var textOptions = { fontSize: 18 };
    var radioButtonGroup = new RadioButtonGroup( blackBoxScreenModel.modeProperty, [
      {
        value: 'investigate',
        node: new Text( 'Investigate Circuit', textOptions )
      },
      {
        value: 'build',
        node: new Text( 'Build Circuit', textOptions )
      }
    ], {
      baseColor: 'white',
      buttonContentXMargin: 10,
      buttonContentYMargin: 15,
      selectedStroke: ResetAllButton.RESET_ALL_BUTTON_BASE_COLOR,
      selectedLineWidth: 2.5
    } );
    this.addChild( radioButtonGroup );

    this.circuitConstructionKitBasicsScreenViewLayoutCompletedEmitter.addListener( function() {
      radioButtonGroup.top = blackBoxScreenView.sensorToolbox.bottom + 20;
      radioButtonGroup.right = blackBoxScreenView.sensorToolbox.right;
    } );
  }

  return inherit( CircuitConstructionKitBasicsScreenView, BlackBoxScreenView );
} );