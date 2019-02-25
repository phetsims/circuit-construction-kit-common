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
  const ProbeNode = require( 'SCENERY_PHET/ProbeNode' );

  class CCKCProbeNode extends ProbeNode {

    /**
     * @param {Property.<Bounds2>} visibleBoundsProperty - visible bounds of the ScreenView
     * @param {Object} [options]
     */
    constructor( visibleBoundsProperty, options ) {

      options = _.extend( {
        cursor: 'pointer',
        sensorTypeFunction: ProbeNode.crosshairs( { stroke: 'white' } ),
        scale: 0.4,
        drag: () => {}
      }, options );

      super( options );

      visibleBoundsProperty.link( visibleBounds => this.setCenter( visibleBounds.closestPointTo( this.center ) ) );

      this.addInputListener( new DragListener( {
        translateNode: true,
        dragBoundsProperty: visibleBoundsProperty,
        drag: () => options.drag()
      } ) );
    }
  }

  return circuitConstructionKitCommon.register( 'CCKCProbeNode', CCKCProbeNode );
} );