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
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var FixedLengthComponentNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/FixedLengthComponentNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ResistorColors = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/ResistorColors' );

  // images
  var resistorImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/resistor.png' );

  /**
   *
   * @param {CircuitNode} [circuitNode] optional, null for icons
   * @param resistor
   * @param options
   * @constructor
   */
  function ResistorNode( circuitNode, resistor, options ) {
    this.resistor = resistor;
    var imageScale = 0.7;
    FixedLengthComponentNode.call( this, circuitNode, resistor, resistorImage, imageScale, options );

    var imageWidth = this.imageNode.imageWidth / imageScale;
    var bandWidth = 10;
    var bandHeight = 40;
    var inset = 40;
    var availableBandSpace = imageWidth * 0.75 - 2 * inset;
    var remainingSpace = availableBandSpace - 4 * bandWidth;// max is 4 bands, even though they are not always shown
    var bandSeparation = remainingSpace / 4; // two spaces before last band
    var y = this.imageNode.imageHeight / 2 / imageScale - bandHeight / imageScale / 2;
    var colorBands = [
      new Rectangle( 0, 0, bandWidth, bandHeight, { x: inset + (bandWidth + bandSeparation) * 0, y: y } ),
      new Rectangle( 0, 0, bandWidth, bandHeight, { x: inset + (bandWidth + bandSeparation) * 1, y: y } ),
      new Rectangle( 0, 0, bandWidth, bandHeight, { x: inset + (bandWidth + bandSeparation) * 2, y: y } ),
      new Rectangle( 0, 0, bandWidth, bandHeight, {
        x: inset + (bandWidth + bandSeparation) * 3 + bandSeparation,
        y: y
      } )
    ];
    var updateColorBands = function( resistance ) {
      var colors = ResistorColors.toThreeColors( resistance );
      for ( var i = 0; i < colorBands.length; i++ ) {
        colorBands[ i ].fill = colors[ i ];// Last one could be null
      }
    };
    resistor.resistanceProperty.link( updateColorBands );
    for ( var i = 0; i < colorBands.length; i++ ) {
      this.imageNode.addChild( colorBands[ i ] );
    }

    this.disposeResistorNode = function() {
      resistor.resistanceProperty.unlink( updateColorBands );
    };
  }

  circuitConstructionKitBasics.register( 'ResistorNode', ResistorNode );

  return inherit( FixedLengthComponentNode, ResistorNode, {
    dispose: function() {
      FixedLengthComponentNode.prototype.dispose.call( this );
      this.disposeResistorNode();
    }
  } );
} );