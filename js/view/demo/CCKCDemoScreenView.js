// Copyright 2020, University of Colorado Boulder

import ScreenView from '../../../../joist/js/ScreenView.js';
import Shape from '../../../../kite/js/Shape.js';
import Path from '../../../../scenery/js/nodes/Path.js';

const SCHEMATIC_SCALE = 0.54;
const SCHEMATIC_PERIOD = 22 * SCHEMATIC_SCALE;
const SCHEMATIC_STEM_WIDTH = 84 * SCHEMATIC_SCALE;
const SCHEMATIC_WAVELENGTH = 54 * SCHEMATIC_SCALE;

// The height from the vertex to the center of the light bulb schematic circle
const LEAD_Y = -73;

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

    const resistorPath = new Path( schematicShape, {
      lineWidth: 4,
      stroke: 'black',
      center: this.layoutBounds.center
    } );
    this.addChild( resistorPath );

    const rightLeadX = 25;
    const schematicCircleRadius = 12;

    // The "blip" in the filament that looks like an upside down "u" semicircle
    const INNER_RADIUS = 5;
    const addSchematicCircle = shape => shape

      // Outer circle
      .moveTo( 0, LEAD_Y )
      .arc( rightLeadX / 2, LEAD_Y, schematicCircleRadius, Math.PI, -Math.PI, true )

      // Filament
      .moveTo( 0, LEAD_Y )
      .arc( schematicCircleRadius, LEAD_Y, INNER_RADIUS, Math.PI, 0, false )
      .lineTo( rightLeadX, LEAD_Y );

    const result = addSchematicCircle( new Shape()

      // Left lead
      .moveTo( 0, 0 )
      .lineTo( 0, LEAD_Y )

      // Right lead
      .moveTo( rightLeadX, LEAD_Y )
      .lineTo( rightLeadX, 0 )
    );

    this.addChild( new Path( result, {
      lineWidth: 4,
      stroke: 'blue',
      top: resistorPath.bottom + 20,
      centerX: resistorPath.centerX
    } ) );
  }
}

export default CCKCDemoScreenView;