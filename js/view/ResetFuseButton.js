// Copyright 2019, University of Colorado Boulder

/**
 * Button that resets a Fuse
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  const ResetShape = require( 'SCENERY_PHET/ResetShape' );
  const RoundPushButton = require( 'SUN/buttons/RoundPushButton' );

  class ResetFuseButton extends RoundPushButton {

    /**
     * @param {Fuse} fuse - the Fuse to reset
     * @param {Tandem} tandem
     */
    constructor( fuse, tandem ) {
      super( {
        baseColor: PhetColorScheme.BUTTON_YELLOW,
        content: new Path( new ResetShape( 23 ), { fill: 'black' } ),
        listener: () => fuse.resetFuse(),
        minXMargin: 10,
        minYMargin: 10,
        tandem: tandem
      } );
      fuse.isTrippedProperty.link( isTripped => {
        this.setEnabled( isTripped );
      } );
    }
  }

  return circuitConstructionKitCommon.register( 'ResetFuseButton', ResetFuseButton );
} );