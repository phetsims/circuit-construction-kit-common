// Copyright 2017, University of Colorado Boulder

/**
 * Renders a red arrow with a white outline which depicts the conventional current.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ArrowNode = require( 'SCENERY_PHET/ArrowNode' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Color = require( 'SCENERY/util/Color' );
  const inherit = require( 'PHET_CORE/inherit' );

  // constants
  const ARROW_LENGTH = 23; // length of the arrow in view coordinates

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function ConventionalCurrentArrowNode( tandem ) {

    ArrowNode.call( this, 0, 0, ARROW_LENGTH, 0, {
      headHeight: 10,
      headWidth: 12,
      tailWidth: 3,
      fill: Color.RED,
      stroke: Color.WHITE,
      tandem: tandem
    } );
  }

  circuitConstructionKitCommon.register( 'ConventionalCurrentArrowNode', ConventionalCurrentArrowNode );

  return inherit( ArrowNode, ConventionalCurrentArrowNode );
} );