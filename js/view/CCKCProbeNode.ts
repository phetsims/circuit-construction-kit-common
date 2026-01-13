// Copyright 2019-2025, University of Colorado Boulder

/**
 * One probe for the WaveMeterNode
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import type Property from '../../../axon/js/Property.js';
import type Bounds2 from '../../../dot/js/Bounds2.js';
import Vector2 from '../../../dot/js/Vector2.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
import optionize from '../../../phet-core/js/optionize.js';
import ProbeNode, { type ProbeNodeOptions } from '../../../scenery-phet/js/ProbeNode.js';
import DragListener from '../../../scenery/js/listeners/DragListener.js';
import type Node from '../../../scenery/js/nodes/Node.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

type SelfOptions = {
  drag?: () => void;
};
type CCKProbeNodeOptions = SelfOptions & ProbeNodeOptions;

export default class CCKCProbeNode extends ProbeNode {

  /**
   * @param node container node which should move to front on press
   * @param visibleBoundsProperty - visible bounds of the ScreenView
   * @param [providedOptions]
   */
  public constructor( node: Node, visibleBoundsProperty: Property<Bounds2>, providedOptions?: CCKProbeNodeOptions ) {

    const options = optionize<CCKProbeNodeOptions, SelfOptions, ProbeNodeOptions>()( {
      cursor: 'pointer',
      sensorTypeFunction: ProbeNode.crosshairs( { stroke: 'white' } ),
      scale: 0.4,
      drag: _.noop
    }, providedOptions );

    super( options );

    // Wire position through PhET-iO so it can be recorded in the state
    const positionProperty = new Vector2Property( new Vector2( 0, 0 ), {
      tandem: options.tandem?.createTandem( 'positionProperty' )
    } );

    positionProperty.link( p => this.setTranslation( p ) );

    visibleBoundsProperty.link( visibleBounds => this.setCenter( visibleBounds.closestPointTo( this.center ) ) );

    this.addInputListener( new DragListener( {
      positionProperty: positionProperty,
      dragBoundsProperty: visibleBoundsProperty,
      press: () => node.moveToFront(),
      drag: () => options.drag(),
      tandem: options.tandem?.createTandem( 'dragListener' )
    } ) );
  }
}

circuitConstructionKitCommon.register( 'CCKCProbeNode', CCKCProbeNode );