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

    var thisNode = this;

    // @private
    thisNode.onNode = new Image( options.baseOnly ? baseImage : onImage, {
      scale: options.bulbImageScale,
      centerX: 0,
      bottom: 0
    } ); // @private

    var offNode = new Image( options.baseOnly ? baseImage : offImage, {
      scale: options.bulbImageScale,
      centerX: thisNode.onNode.centerX,
      bottom: thisNode.onNode.bottom
    } );

    // rays
    if ( !options.baseOnly ) {
      var bulbRadius = offNode.width / 2; // use 'off' node, the 'on' node is wider because it has a glow around it.
      var rayOptions = _.pick( options, _.keys( defaultOptions ) ); // cherry-pick options that are specific to rays
      rayOptions.x = this.onNode.centerX;
      rayOptions.y = offNode.top + bulbRadius;
      thisNode.raysNode = new LightRaysNode( bulbRadius, rayOptions ); // @private

      options.children = [ thisNode.raysNode, offNode, thisNode.onNode ];
    }
    else {
      options.children = [ offNode, thisNode.onNode ];
    }
    Node.call( thisNode, options );

    if ( !options.baseOnly ) {
      thisNode.brightnessObserver = function() { thisNode.update(); }; // @private
      thisNode.brightnessProperty = brightnessProperty; // @private
      thisNode.brightnessProperty.link( this.brightnessObserver );
    }

    this.disposeCustomLightBulbNode = function() {
      if ( !options.baseOnly ) {
        thisNode.brightnessProperty.unlink( thisNode.brightnessObserver );
      }
    };
  }

  circuitConstructionKitCommon.register( 'CustomLightBulbNode', CustomLightBulbNode );

  inherit( Node, CustomLightBulbNode, {

    // @public Ensures that this object is eligible for GC
    dispose: function() {
      this.disposeCustomLightBulbNode();
    },

    // @private
    update: function() {
      if ( this.visible ) {
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