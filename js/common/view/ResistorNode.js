// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var FixedLengthCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/FixedLengthCircuitElementNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ResistorColors = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/view/ResistorColors' );
  var Image = require( 'SCENERY/nodes/Image' );

  // images
  var resistorImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistor.png' );

  /**
   *
   * @param circuitConstructionKitScreenView
   * @param {CircuitNode} [circuitNode] optional, null for icons
   * @param resistor
   * @param {Property.<boolean>} runningProperty - not used here but appears in signature to keep same signature as other components.
   * @param tandem
   * @param options
   * @constructor
   */
  function ResistorNode( circuitConstructionKitScreenView, circuitNode, resistor, runningProperty, tandem, options ) {
    this.resistor = resistor;

    var imageScale = 0.7;
    var resistorImageNode = new Image( resistorImage );

    var imageWidth = resistorImageNode.imageWidth / imageScale;
    var bandWidth = 10;
    var bandHeight = 34;
    var bandTopDY = -2; // Account for vertical asymmetry in the image
    var inset = 40;
    var availableBandSpace = imageWidth * 0.75 - 2 * inset;
    var remainingSpace = availableBandSpace - 4 * bandWidth;// max is 4 bands, even though they are not always shown
    var bandSeparation = remainingSpace / 4; // two spaces before last band
    var y = resistorImageNode.imageHeight / 2 / imageScale - bandHeight / imageScale / 2 + bandTopDY;
    var colorBands = [
      new Rectangle( 0, 0, bandWidth, bandHeight, { x: inset + (bandWidth + bandSeparation) * 0, y: y } ),
      new Rectangle( 0, 0, bandWidth, bandHeight, { x: inset + (bandWidth + bandSeparation) * 1, y: y } ),
      new Rectangle( 0, 0, bandWidth, bandHeight, { x: inset + (bandWidth + bandSeparation) * 2, y: y } ),
      new Rectangle( 0, 0, bandWidth, bandHeight + 3, {
        x: inset + (bandWidth + bandSeparation) * 3 + bandSeparation,
        y: y - 1.5
      } )
    ];
    var updateColorBands = function( resistance ) {
      var colors = ResistorColors.getColorArray( resistance );
      for ( var i = 0; i < colorBands.length; i++ ) {
        colorBands[ i ].fill = colors[ i ];// Last one could be null
      }
    };
    resistor.resistanceProperty.link( updateColorBands );
    for ( var i = 0; i < colorBands.length; i++ ) {
      resistorImageNode.addChild( colorBands[ i ] );
    }

    FixedLengthCircuitElementNode.call( this, circuitConstructionKitScreenView, circuitNode, resistor, resistorImageNode, imageScale, tandem, options );
    this.disposeResistorNode = function() {
      resistor.resistanceProperty.unlink( updateColorBands );
    };
  }

  circuitConstructionKitCommon.register( 'ResistorNode', ResistorNode );

  return inherit( FixedLengthCircuitElementNode, ResistorNode, {
    dispose: function() {
      FixedLengthCircuitElementNode.prototype.dispose.call( this );
      this.disposeResistorNode();
    }
  } );
} );