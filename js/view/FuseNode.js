// Copyright 2019, University of Colorado Boulder

/**
 * This node shows a fuse.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Color = require( 'SCENERY/util/Color' );
  const FixedCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedCircuitElementNode' );
  const Fuse = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Fuse' );
  const FuseTripAnimation = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FuseTripAnimation' );
  const Image = require( 'SCENERY/nodes/Image' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const Shape = require( 'KITE/Shape' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );

  // images
  const fuseImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/fuse.png' );

  // constants
  const SCHEMATIC_STEM_WIDTH = 20;
  const HORIZONTAL_ZIG_ZAG_DISTANCE = 5;
  const VERTICAL_ZIG_ZAG_HEIGHT = 4;
  const CAP_WIDTH = 15; // horizontal size of each cap in the image
  const SPLIT_DY = 13; // REVIEW: Doc would be helpful here
  const SPLIT_DX = 8; // REVIEW: Doc would be helpful here
  const VERTICAL_GLASS_MARGIN = 3;
  const DEFAULT_GLASS_FILL = '#c3dbfd';

  class FuseNode extends FixedCircuitElementNode {

    /**
     * @param {CCKCScreenView|null} screenView - main screen view, null for isIcon
     * @param {CircuitLayerNode|null} circuitLayerNode, null for isIcon
     * @param {Fuse} fuse
     * @param {Property.<CircuitElementViewType>} viewTypeProperty
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( screenView, circuitLayerNode, fuse, viewTypeProperty, tandem, options ) {

      assert && assert( fuse instanceof Fuse, 'fuse should be a Fuse' );

      options = _.extend( { isIcon: false }, options );

      const fuseImageNode = new Image( fuseImage, { scale: 0.691 } );
      const numberOfZigZags = ( fuseImageNode.width - CAP_WIDTH * 2 ) / HORIZONTAL_ZIG_ZAG_DISTANCE / 2;

      // zig-zag shape
      const startPoint = new Vector2( CAP_WIDTH, 0 );
      const endPoint = new Vector2( fuseImageNode.width - CAP_WIDTH, 0 );
      const filamentShape = new Shape().moveToPoint( startPoint )
        .zigZagToPoint( endPoint, VERTICAL_ZIG_ZAG_HEIGHT, Util.roundSymmetric( numberOfZigZags ), false );

      const brokenFilamentShape = new Shape().moveToPoint( startPoint )
        .zigZagToPoint( new Vector2( fuseImageNode.width / 2 - SPLIT_DX, SPLIT_DY ), VERTICAL_ZIG_ZAG_HEIGHT, Util.roundSymmetric( numberOfZigZags / 2 ) - 1, false );
      brokenFilamentShape.moveToPoint( endPoint );
      brokenFilamentShape
        .zigZagToPoint( new Vector2( fuseImageNode.width / 2 + SPLIT_DX, -SPLIT_DY ), VERTICAL_ZIG_ZAG_HEIGHT, Util.roundSymmetric( numberOfZigZags / 2 ) - 1, false );

      const filamentPath = new Path( filamentShape, {
        stroke: '#302b2b',
        lineWidth: 4,
        center: fuseImageNode.center
      } );

      // REVIEW: Added doc? "Fuse filament thickness should resemble its rating."
      const updateFilamentPathLineWidth = currentRating => filamentPath.setLineWidth( Util.linear(
        fuse.currentRatingProperty.range.min, fuse.currentRatingProperty.range.max, 1, 4, currentRating
      ) );
      fuse.currentRatingProperty.link( updateFilamentPathLineWidth );

      // Glass covering
      const glassNode = new Rectangle( CAP_WIDTH, VERTICAL_GLASS_MARGIN, fuseImageNode.width - CAP_WIDTH * 2, fuseImageNode.height - VERTICAL_GLASS_MARGIN * 2, {
        fill: DEFAULT_GLASS_FILL,
        opacity: 0.5,
        stroke: 'black',
        lineWidth: 0.5
      } );

      const lifelikeFuseNode = new Node( {
        children: [ filamentPath, glassNode, fuseImageNode ]
      } );

      // Schematic view is a line with a box around it, looks the same whether tripped or untripped.
      const boxHeight = 30;
      let schematicShape = new Shape()
        .moveTo( 0, 0 )
        .lineToRelative( fuse.chargePathLength, 0 )
        .moveTo( 0, 0 )
        .rect( SCHEMATIC_STEM_WIDTH, -boxHeight / 2, fuse.chargePathLength - SCHEMATIC_STEM_WIDTH * 2, boxHeight );

      // Icons should appear the same in the toolbox, see
      // https://github.com/phetsims/circuit-construction-kit-common/issues/389
      const width = options.isIcon ? CCKCConstants.RESISTOR_LENGTH : fuse.distanceBetweenVertices;
      lifelikeFuseNode.mutate( { scale: width / lifelikeFuseNode.width } );

      const scale = lifelikeFuseNode.width / schematicShape.bounds.width;
      schematicShape = schematicShape.transformed( Matrix3.scale( scale, scale ) );
      const schematicNode = new Path( schematicShape, {
        stroke: Color.BLACK,
        lineWidth: CCKCConstants.SCHEMATIC_LINE_WIDTH
      } ).toDataURLImageSynchronous();

      // Center vertically to match the FixedCircuitElementNode assumption that origin is center left
      schematicNode.centerY = 0;
      lifelikeFuseNode.centerY = 0;

      // Expand the pointer areas with a defensive copy, see
      // https://github.com/phetsims/circuit-construction-kit-common/issues/310
      schematicNode.mouseArea = schematicNode.bounds.shiftedY( schematicNode.height / 2 );
      schematicNode.touchArea = schematicNode.bounds.shiftedY( schematicNode.height / 2 );

      super( screenView, circuitLayerNode, fuse, viewTypeProperty, lifelikeFuseNode, schematicNode, tandem, options );

      // @public (read-only) {Fuse} the fuse depicted by this node
      this.fuse = fuse;

      // Update the look when the fuse is tripped
      const updateTripped = isTripped => {
        if ( isTripped ) {
          circuitLayerNode.addChild( new FuseTripAnimation( { center: this.center } ) );
        }
        glassNode.fill = isTripped ? '#4e4e4e' : DEFAULT_GLASS_FILL;
        filamentPath.shape = isTripped ? brokenFilamentShape : filamentShape;
      };
      if ( !options.isIcon ) {
        this.fuse.isTrippedProperty.link( updateTripped );
      }

      // @private
      // REVIEW: Possibly change to disposeFuseNode()?
      this.disposeResistorNode = () => {
        lifelikeFuseNode.dispose();
        fuse.currentRatingProperty.unlink( updateFilamentPathLineWidth );
        if ( !options.isIcon ) {
          this.fuse.isTrippedProperty.unlink( updateTripped );
        }
      };
    }

    /**
     * Returns true if the node hits the sensor at the given point.  Matches the implementation in other types
     * like ResistorNode
     * @param {Vector2} point
     * @returns {boolean}
     * @overrides
     * @public
     */
    containsSensorPoint( point ) {

      // make sure bounds are correct if cut or joined in this animation frame
      this.step();

      // Check against the mouse region
      //
      return !!this.hitTest( point, true, false );
    }

    /**
     * Dispose the FuseNode when it will no longer be used.
     * @public
     * @override
     */
    dispose() {
      // REVIEW: Possibly change to disposeFuseNode()?
      this.disposeResistorNode();
      super.dispose();
    }
  }

  /**
   * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
   * @public {Array.<Image>}
   */
  FuseNode.webglSpriteNodes = [
    new Image( fuseImage )
  ];

  return circuitConstructionKitCommon.register( 'FuseNode', FuseNode );
} );