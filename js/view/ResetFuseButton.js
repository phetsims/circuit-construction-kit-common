// Copyright 2019, University of Colorado Boulder

/**
 * Button that resets a Fuse.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCRoundPushButton = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CCKCRoundPushButton' );
  const Circle = require( 'SCENERY/nodes/Circle' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Shape = require( 'KITE/Shape' );
  const Vector2 = require( 'DOT/Vector2' );

  class ResetFuseButton extends CCKCRoundPushButton {

    /**
     * @param {Fuse} fuse - the Fuse to reset
     * @param {Tandem} tandem
     */
    constructor( fuse, tandem ) {

      const shape = new Shape().moveTo( 0, 0 ).zigZagToPoint( new Vector2( 35, 0 ), 4.7, 4, false );

      const icon = new Node( {
        children: [ new Path( shape, {
          stroke: 'black',
          lineWidth: 1.2,
          centerX: 0,
          centerY: 0
        } ), new Circle( 2.2, { fill: 'black', centerX: 0, centerY: 0 } ) ],
        scale: 0.9 // to match the size of the trash can icon
      } );

      super( {
        content: icon,
        listener: () => fuse.resetFuse(),
        tandem: tandem
      } );
      fuse.isTrippedProperty.link( isTripped => {
        this.setEnabled( isTripped );
      } );
    }
  }

  return circuitConstructionKitCommon.register( 'ResetFuseButton', ResetFuseButton );
} );