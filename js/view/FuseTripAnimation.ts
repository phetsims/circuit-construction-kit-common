// Copyright 2019-2022, University of Colorado Boulder

/**
 * Displayed when the fuse trips
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Shape } from '../../../kite/js/imports.js';
import { Node, NodeOptions, Path } from '../../../scenery/js/imports.js';
import Animation from '../../../twixt/js/Animation.js';
import Easing from '../../../twixt/js/Easing.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

export default class FuseTripAnimation extends Node {

  public constructor( providedOptions?: NodeOptions ) {
    super();

    // Geometry sampled by exporting circuit-construction-kit-common/assets/spark.ai to SVG then copying the
    // polylines data
    const polylines = [
      '29.2,11.5 34.3,1.9 34.7,12.8 50.7,1.8 38.7,16.9 49.6,17.6 39.8,22.5',
      '11.1,22.5 1.5,17.3 12.4,16.9 1.3,1 16.5,13 17.2,2.1 22.1,11.8',
      '22.8,40.5 17.7,50.1 17.3,39.2 1.3,50.2 13.3,35.1 2.4,34.4 12.2,29.5',
      '40.9,29.5 50.5,34.7 39.6,35.1 50.7,51 35.5,39 34.8,49.9 29.9,40.2' ];

    const shape = new Shape();

    // Parse the string data and render each string as a set of connected line segments.
    polylines.forEach( polyline => {
      const pairs = polyline.split( ' ' );
      const vectors = pairs.map( pair => {
        const p = pair.split( ',' );
        return new Vector2( Number( p[ 0 ] ), Number( p[ 1 ] ) );
      } );
      shape.moveToPoint( vectors[ 0 ] );
      for ( let i = 1; i < vectors.length; i++ ) {
        shape.lineToPoint( vectors[ i ] );
      }
    } );

    const path = new Path( shape, { stroke: 'yellow', lineWidth: 2 } );
    providedOptions = providedOptions || {};
    providedOptions.children = [ path ];
    this.mutate( providedOptions );

    const animation = new Animation( {
      setValue: ( value: number ) => {
        const center = this.center;
        const scale = Utils.linear( 0, 1, 0.75, 2, value );
        const opacity = Utils.clamp( Utils.linear( 0.8, 1, 1, 0, value ), 0, 1 );
        this.setScaleMagnitude( scale );
        this.setOpacity( opacity );
        this.center = center;
      },
      from: 0,
      to: 1,
      duration: 0.3,
      easing: Easing.QUADRATIC_IN_OUT
    } );
    animation.endedEmitter.addListener( () => this.dispose() );
    animation.start();
  }
}

circuitConstructionKitCommon.register( 'FuseTripAnimation', FuseTripAnimation );