// Copyright 2019-2020, University of Colorado Boulder

/**
 * One probe for the WaveMeterNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import Node from '../../../scenery/js/nodes/Node.js';
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
  constructor( node: Node, visibleBoundsProperty: Property<Bounds2>, options: object ) {

    options = merge( {
      cursor: 'pointer',
      sensorTypeFunction: ProbeNode.crosshairs( { stroke: 'white' } ),
      scale: 0.4,
      drag: () => {},
      tandem: Tandem.OPTIONAL
    }, options );

    super( options );

    visibleBoundsProperty.link( ( visibleBounds: Bounds2 ) => this.setCenter( visibleBounds.closestPointTo( this.center ) ) );

    this.addInputListener( new DragListener( {
      translateNode: true,
      dragBoundsProperty: visibleBoundsProperty,
      press: () => node.moveToFront(),

      // @ts-ignore
      drag: () => options.drag(),

      // @ts-ignore
      tandem: options.tandem.createTandem( 'dragListener' )
    } ) );
  }
}

circuitConstructionKitCommon.register( 'CCKCProbeNode', CCKCProbeNode );
export default CCKCProbeNode;