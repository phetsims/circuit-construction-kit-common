// Copyright 2019-2020, University of Colorado Boulder

/**
 * One probe for the WaveMeterNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import merge from '../../../phet-core/js/merge.js';
import ProbeNode from '../../../scenery-phet/js/ProbeNode.js';
import DragListener from '../../../scenery/js/listeners/DragListener.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

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
      tandem: Tandem.OPTIONAL
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

circuitConstructionKitCommon.register( 'CCKCProbeNode', CCKCProbeNode );
export default CCKCProbeNode;