// Copyright 2017, University of Colorado Boulder

/**
 * Renders a red arrow with a white outline which depicts the conventional current.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ArrowNode = require( 'SCENERY_PHET/ArrowNode' );

  // constants
  var ARROW_LENGTH = 23; // length of the arrow in view coordinates

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function ConventionalCurrentArrowNode( tandem ) {

    // center so it is easy to position
    ArrowNode.call( this, -ARROW_LENGTH / 2, 0, ARROW_LENGTH / 2, 0, {
      headHeight: 10,
      headWidth: 12,
      tailWidth: 3,
      fill: 'red',
      stroke: 'white',
      tandem: tandem
    } );
  }

  circuitConstructionKitCommon.register( 'ConventionalCurrentArrowNode', ConventionalCurrentArrowNode );

  return inherit( ArrowNode, ConventionalCurrentArrowNode );
} );