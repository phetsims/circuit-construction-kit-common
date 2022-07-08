// Copyright 2020-2022, University of Colorado Boulder

/**
 * Demonstrates different circuit element shapes and nodes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import ScreenView, { ScreenViewOptions } from '../../../../joist/js/ScreenView.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Path } from '../../../../scenery/js/imports.js';
import BarkNode from '../BarkNode.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';

// Constants for the resistor
const SCHEMATIC_SCALE = 0.54;
const SCHEMATIC_PERIOD = 22 * SCHEMATIC_SCALE;
const SCHEMATIC_STEM_WIDTH = 84 * SCHEMATIC_SCALE;
const SCHEMATIC_WAVELENGTH = 54 * SCHEMATIC_SCALE;

// Constants for the light bulb
// The height from the vertex to the center of the light bulb schematic circle
const LEAD_Y = -73;

export default class CCKCDemoScreenView extends ScreenView {

  private constructor( providedOptions: ScreenViewOptions ) {
    super( providedOptions );

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

    // light bulb with a filament inside

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
      stroke: 'black',
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
      stroke: 'black',
      bottom: resistorPath.top - 20,
      centerX: resistorPath.centerX
    } ) );

    // IEC Resistor: it is a box with a left horizontal lead and a right horizontal lead

    const halfBoxHeight = boxHeight / 2;
    const boxLength = 70;
    const resistorIEC = new Shape()
      .moveTo( 0, 50 * SCHEMATIC_SCALE )

      // left horizontal lead
      .lineToRelative( SCHEMATIC_STEM_WIDTH, 0 )

      // upper half of the box
      .lineToRelative( 0, -halfBoxHeight )
      .lineToRelative( boxLength, 0 )
      .lineToRelative( 0, halfBoxHeight )

      // right horizontal lead
      .lineToRelative( SCHEMATIC_STEM_WIDTH, 0 )

      // go back along the right horizontal lead
      .lineToRelative( -SCHEMATIC_STEM_WIDTH, 0 )

      // lower half of the box
      .lineToRelative( 0, halfBoxHeight )
      .lineToRelative( -boxLength, 0 )
      .lineToRelative( 0, -halfBoxHeight );

    const resistorPathIEC = new Path( resistorIEC, {
      lineWidth: 3,
      stroke: 'black',
      bottom: resistorPath.bottom + 160,
      centerX: resistorPath.centerX
    } );
    this.addChild( resistorPathIEC );

    ///// IEC fuse: also a box with two horizontal leads (left and right) and two small vertical lines on the inside
    // (see https://github.com/phetsims/circuit-construction-kit-common/issues/429 for a figure)

    const boxLength7th = boxLength / 7;
    const fuseIEC = new Shape()
      .moveTo( 0, 50 * SCHEMATIC_SCALE )

      // left horizontal lead
      .lineToRelative( SCHEMATIC_STEM_WIDTH, 0 )

      // upper half og the box
      .lineToRelative( 0, -halfBoxHeight )
      .lineToRelative( boxLength, 0 )
      .lineToRelative( 0, halfBoxHeight )

      // right horizontal lead
      .lineToRelative( SCHEMATIC_STEM_WIDTH, 0 )

      // go back along the right horizontal lead
      .lineToRelative( -SCHEMATIC_STEM_WIDTH, 0 )

      // lower half og the box
      .lineToRelative( 0, halfBoxHeight )
      .lineToRelative( -boxLength, 0 )

      // small left vertical line. Place it at x = boxLength / 7 (seems to be visually a good place)
      .lineToRelative( 0, -boxHeight )
      .lineToRelative( boxLength7th, 0 )
      .lineToRelative( 0, boxHeight )

      /* small right vertical line: the 1st 'lineToRelative' below takes to starting point, at the cost
      of drawing a line on an already existing one. */
      .lineToRelative( boxLength - 2 * boxLength7th, 0 )
      .lineToRelative( 0, -boxHeight );

    const fusePathIEC = new Path( fuseIEC, {
      lineWidth: 3,
      stroke: 'black',
      bottom: resistorPath.bottom + 200,
      centerX: resistorPath.centerX
    } );
    this.addChild( fusePathIEC );

    ///// IEC Bulb: a circle with an 'x' inside it
    // (see https://github.com/phetsims/circuit-construction-kit-common/issues/429 for a figure)

    const schematicCircleDiameter = 2 * schematicCircleRadius;
    const cosPi4 = Math.cos( Math.PI / 4 );
    const sinPi4 = Math.sin( Math.PI / 4 );
    const bulbIEC = new Shape()
      .moveTo( 0, LEAD_Y )

      // the circle
      .arc( rightLeadX / 2, LEAD_Y, schematicCircleRadius, Math.PI, -Math.PI, true )

      // left lead
      .horizontalLineToRelative( -SCHEMATIC_STEM_WIDTH )

      // go to the other side of the circle and draw the right lead
      .moveTo( schematicCircleDiameter, LEAD_Y )
      .horizontalLineToRelative( SCHEMATIC_STEM_WIDTH )

      // go to circle center to draw the 'x' (2 crossed lines) inside it.
      // Addition of 0.5 seems to visually work better!
      .moveTo( schematicCircleRadius + 0.5, LEAD_Y )

      // a line from center to circumference
      .lineToRelative( schematicCircleRadius * cosPi4, -schematicCircleRadius * sinPi4 )

      // continue the line to the other side of the circle
      .lineToRelative( -schematicCircleDiameter * cosPi4, schematicCircleDiameter * sinPi4 )

      // repeat to draw the other line at 90 degrees to the first
      .moveTo( schematicCircleRadius, LEAD_Y )
      .lineToRelative( -schematicCircleRadius * cosPi4, -schematicCircleRadius * sinPi4 )
      .lineToRelative( schematicCircleDiameter * cosPi4, schematicCircleDiameter * sinPi4 );

    const bulbPathIEC = new Path( bulbIEC, {
      lineWidth: 3,
      stroke: 'black',
      bottom: resistorPath.bottom + 240,
      centerX: resistorPath.centerX
    } );
    this.addChild( bulbPathIEC );

    const barkNode = new BarkNode( {
      center: this.layoutBounds.center.plusXY( 200, 0 ),
      maxWidth: 70
    } );
    this.addChild( barkNode );
  }
}

circuitConstructionKitCommon.register( 'CCKCDemoScreenView', CCKCDemoScreenView );