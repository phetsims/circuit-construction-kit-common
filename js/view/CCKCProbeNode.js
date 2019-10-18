// Copyright 2019, University of Colorado Boulder

/**
 * One probe for the WaveMeterNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const DragListener = require( 'SCENERY/listeners/DragListener' );
  const merge = require( 'PHET_CORE/merge' );
  const ProbeNode = require( 'SCENERY_PHET/ProbeNode' );
  const Tandem = require( 'TANDEM/Tandem' );

  class CCKCProbeNode extends ProbeNode {

    /**
     * @param {Node} node container node which should move to front on press
     * @param {Property.<Bounds2>} visibleBoundsProperty - visible bounds of the ScreenView
     * @param {Object} [options]
     */
    constructor( node, visibleBoundsProperty, options ) {

      options = merge( {
        cursor: 'pointer',
        sensorTypeFunction: ProbeNode.crosshairs( { stroke: 'white' } ),
        scale: 0.4,
        drag: () => {},
        tandem: Tandem.optional
      }, options );

      super( options );

      visibleBoundsProperty.link( visibleBounds => this.setCenter( visibleBounds.closestPointTo( this.center ) ) );

      this.addInputListener( new DragListener( {
        translateNode: true,
        dragBoundsProperty: visibleBoundsProperty,
        press: () => node.moveToFront(),
        drag: () => options.drag(),
        tandem: options.tandem.createTandem( 'dragListener' )
      } ) );
    }
  }

  return circuitConstructionKitCommon.register( 'CCKCProbeNode', CCKCProbeNode );
} );