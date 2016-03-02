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
  var ComboBox = require( 'SUN/ComboBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Property = require( 'AXON/Property' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );

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

    var comboBoxTextOptions = {
      fontSize: 16
    };
    var comboBox = new ComboBox( [ {
      node: new Text( 'Warm-up', comboBoxTextOptions ), value: 'scene0'
    }, {
      node: new Text( 'Black Box 1', comboBoxTextOptions ), value: 'scene1'
    } ], new Property( 'scene0' ), this );
    this.addChild( comboBox );

    this.circuitConstructionKitBasicsScreenViewLayoutCompletedEmitter.addListener( function( layoutDimensions ) {
      modeRadioButtonGroup.top = blackBoxScreenView.sensorToolbox.bottom + 20;
      modeRadioButtonGroup.right = blackBoxScreenView.sensorToolbox.right;

      comboBox.centerX = -layoutDimensions.dx + layoutDimensions.width / 2;
      comboBox.top = -layoutDimensions.dy + CircuitConstructionKitBasicsConstants.layoutInset;
    } );
  }

  return inherit( CircuitConstructionKitBasicsScreenView, BlackBoxScreenView );
} );