// Copyright 2015, University of Colorado Boulder

/**
 * Light bulb, made to 'glow' by modulating opacity of the 'on' image.
 * TODO: Copied from SCENERY_PHET/CustomLightBulbNode, but with different images.
 * Either (a) make the images optional in CustomLightBulbNode or (b) simplify this file and factor out
 * options to LightRaysNode.
 *
 * @author Chris Malley (PixelZoom, Inc.)
 */
define( function( require ) {
  'use strict';

  // modules
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Util = require( 'DOT/Util' );
  var LightRaysNode = require( 'SCENERY_PHET/LightRaysNode' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Shape = require( 'KITE/Shape' );

  // images
  var onImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightbulb.png' );
  var offImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightbulb.png' );
  var baseImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightbulb-front.png' );

  /**
   * @param {Property.<number>} brightnessProperty 0 (off) to 1 (full brightness)
   * @param {Object} [options]
   * @constructor
   */
  function CustomLightBulbNode( brightnessProperty, options ) {
    assert && assert( brightnessProperty, 'brightness property should exist' );
    var defaultOptions = {
      baseOnly: false,
      bulbImageScale: 0.33 * 0.2,
      rayStroke: 'yellow',
      minRays: 8,
      maxRays: 60,
      minRayLength: 0,
      maxRayLength: 200,
      longRayLineWidth: 1.5, // for long rays
      mediumRayLineWidth: 1, // for medium-length rays
      shortRayLineWidth: 0.5 // for short rays
    };

    options = _.extend( {}, defaultOptions, options ); // don't modify defaultOptions!

    var self = this;

    this.baseOnly = options.baseOnly;

    // @private
    self.onNode = new Image( options.baseOnly ? baseImage : onImage, {
      scale: options.bulbImageScale,
      centerX: 0,
      bottom: 0,
      pickable: false
    } ); // @private

    var offNode = new Image( options.baseOnly ? baseImage : offImage, {
      scale: options.bulbImageScale,
      centerX: self.onNode.centerX,
      bottom: self.onNode.bottom,
      pickable: false
    } );

    // rays
    if ( !options.baseOnly ) {
      var bulbRadius = offNode.width / 2; // use 'off' node, the 'on' node is wider because it has a glow around it.
      var rayOptions = _.pick( options, _.keys( defaultOptions ) ); // cherry-pick options that are specific to rays
      rayOptions.x = this.onNode.centerX;
      rayOptions.y = offNode.top + bulbRadius;
      self.raysNode = new LightRaysNode( bulbRadius, rayOptions ); // @private

      options.children = [ self.raysNode, offNode, self.onNode ];
    }
    else {
      options.children = [ offNode, self.onNode ];
    }
    Node.call( self, options );

    if ( !options.baseOnly ) {
      self.brightnessObserver = function() { self.update(); }; // @private
      self.brightnessProperty = brightnessProperty; // @private
      self.brightnessProperty.link( this.brightnessObserver );
    }

    this.disposeCustomLightBulbNode = function() {
      if ( !options.baseOnly ) {
        self.brightnessProperty.unlink( self.brightnessObserver );
      }
    };

    // Custom pick area for the bulb, so it doesn't interfere with the vertices, see https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/5
    var w = this.localBounds.width;
    var h = this.localBounds.height;
    var fractionDown = 0.6; // How far the top part of the bulb extends over the image
    var fractionTrim = 0.1; // How much to trim off of the bottom of the bulb.
    var fractionHorizontalInset = 0.25;
    this.mouseArea = new Shape()
      .moveTo( this.localBounds.minX, this.localBounds.minY )
      .lineToRelative( w, 0 )
      .lineToRelative( 0, h * fractionDown )
      .lineToRelative( -w * fractionHorizontalInset, 0 )
      .lineToRelative( 0, h * (1 - fractionDown - fractionTrim) )
      .lineToRelative( -w * (1 - fractionHorizontalInset * 2), 0 )
      .lineToRelative( 0, -h * (1 - fractionDown - fractionTrim) )
      .lineToRelative( -w * fractionHorizontalInset, 0 )
      .lineTo( this.localBounds.minX, this.localBounds.minY );
    this.touchArea = this.mouseArea;
  }

  circuitConstructionKitCommon.register( 'CustomLightBulbNode', CustomLightBulbNode );

  inherit( Node, CustomLightBulbNode, {

    // @public Ensures that this object is eligible for GC
    dispose: function() {
      this.disposeCustomLightBulbNode();
    },

    // @private
    update: function() {
      if ( this.visible && !this.baseOnly ) {
        var brightness = this.brightnessProperty.value;
        assert && assert( brightness >= 0 && brightness <= 1 );
        this.onNode.visible = ( brightness > 0 );
        if ( this.onNode.visible ) {
          this.onNode.opacity = Util.linear( 0, 1, 0.3, 1, brightness );
        }
        this.raysNode.setBrightness( brightness );
      }
    },

    // @override update when this node becomes visible
    setVisible: function( visible ) {
      var wasVisible = this.visible;
      Node.prototype.setVisible.call( this, visible );
      if ( !wasVisible && visible ) {
        this.update();
      }
    }
  } );

  return CustomLightBulbNode;
} );