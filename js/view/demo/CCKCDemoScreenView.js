// Copyright 2020, University of Colorado Boulder

import ScreenView from '../../../../joist/js/ScreenView.js';
import Shape from '../../../../kite/js/Shape.js';
import Path from '../../../../scenery/js/nodes/Path.js';

const SCHEMATIC_SCALE = 0.54;
const SCHEMATIC_PERIOD = 22 * SCHEMATIC_SCALE;
const SCHEMATIC_STEM_WIDTH = 84 * SCHEMATIC_SCALE;
const SCHEMATIC_WAVELENGTH = 54 * SCHEMATIC_SCALE;

class CCKCDemoScreenView extends ScreenView {
  constructor( options ) {
    super( options );

    // Classical zig-zag shape
    const schematicShape = new Shape()
      .moveTo( 0, 50 * SCHEMATIC_SCALE )
      .lineToRelative( SCHEMATIC_STEM_WIDTH, 0 )
      .lineToRelative( SCHEMATIC_PERIOD / 2, -SCHEMATIC_WAVELENGTH / 2 )
      .lineToRelative( SCHEMATIC_PERIOD, SCHEMATIC_WAVELENGTH )
      .lineToRelative( SCHEMATIC_PERIOD, -SCHEMATIC_WAVELENGTH )
      .lineToRelative( SCHEMATIC_PERIOD, SCHEMATIC_WAVELENGTH )
      .lineToRelative( SCHEMATIC_PERIOD, -SCHEMATIC_WAVELENGTH )
      .lineToRelative( SCHEMATIC_PERIOD, SCHEMATIC_WAVELENGTH )
      .lineToRelative( SCHEMATIC_PERIOD / 2, -SCHEMATIC_WAVELENGTH / 2 )
      .lineToRelative( SCHEMATIC_STEM_WIDTH, 0 );

    this.addChild( new Path( schematicShape, {
      lineWidth: 4,
      stroke: 'black',
      center: this.layoutBounds.center
    } ) );
  }
}

export default CCKCDemoScreenView;