// Copyright 2020, University of Colorado Boulder

import ScreenView from '../../../../joist/js/ScreenView.js';
import Shape from '../../../../kite/js/Shape.js';
import Path from '../../../../scenery/js/nodes/Path.js';

// Constants for the resistor
const SCHEMATIC_SCALE = 0.54;
const SCHEMATIC_PERIOD = 22 * SCHEMATIC_SCALE;
const SCHEMATIC_STEM_WIDTH = 84 * SCHEMATIC_SCALE;
const SCHEMATIC_WAVELENGTH = 54 * SCHEMATIC_SCALE;

// Constants for the light bulb
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
      lineWidth: 3,
      stroke: 'black',
      center: this.layoutBounds.center
    } );
    this.addChild( resistorPath );

    const rightLeadX = 25;
    const schematicCircleRadius = 12;

    // The "blip" in the filament that looks like an upside down "u" semicircle
    const INNER_RADIUS = 5;

    const originalBulbShape = new Shape()

      // Left lead
      .moveTo( 0, 0 )
      .lineTo( 0, LEAD_Y )

      // Right lead
      .moveTo( rightLeadX, LEAD_Y )
      .lineTo( rightLeadX, 0 )

      // Outer circle
      .moveTo( 0, LEAD_Y )
      .arc( rightLeadX / 2, LEAD_Y, schematicCircleRadius, Math.PI, -Math.PI, true )

      // Filament
      .moveTo( 0, LEAD_Y )
      .arc( schematicCircleRadius, LEAD_Y, INNER_RADIUS, Math.PI, 0, false )
      .lineTo( rightLeadX, LEAD_Y );

    const lightBulbPath = new Path( originalBulbShape, {
      lineWidth: 4,
      stroke: 'green',
      top: resistorPath.bottom + 20,
      centerX: resistorPath.centerX
    } );
    this.addChild( lightBulbPath );

    //////////
    /// FUSE
    ///////////

    // Schematic view is a line with a box around it, looks the same whether tripped or untripped.
    const boxHeight = 30;
    const chargePathLength = 150;
    const fuseShape = new Shape()
      .moveTo( 0, 0 )
      .lineToRelative( chargePathLength, 0 )
      .moveTo( 0, 0 )
      .rect( SCHEMATIC_STEM_WIDTH, -boxHeight / 2, chargePathLength - SCHEMATIC_STEM_WIDTH * 2, boxHeight );

    this.addChild( new Path( fuseShape, {
      lineWidth: 4,
      stroke: 'red',
      bottom: resistorPath.top - 20,
      centerX: resistorPath.centerX
    } ) );
  }
}

export default CCKCDemoScreenView;