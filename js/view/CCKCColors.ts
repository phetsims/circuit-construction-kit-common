// Copyright 2020-2023, University of Colorado Boulder

/**
 * Colors for the 'Circuit Construction Kit' sim.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Matthew Blackman (PhET Interactive Simulations)
 */

import { ProfileColorProperty } from '../../../scenery/js/imports.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Tandem from '../../../tandem/js/Tandem.js';

const tandem = Tandem.GLOBAL_VIEW.createTandem( 'colorProfile' );

const CCKCColors = {

  // Background color used for all screens
  screenBackgroundColorProperty: new ProfileColorProperty( circuitConstructionKitCommon, 'screenBackgroundColor', {
    default: '#99c1ff'
  }, {
    tandem: tandem.createTandem( 'screenBackgroundColorProperty' )
  } ),

  textFillProperty: new ProfileColorProperty( circuitConstructionKitCommon, 'textFill', {
    default: 'black'
  }, {
    tandem: tandem.createTandem( 'textFillProperty' )
  } ),

  // // Fill for Panel-like Containers
  panelFillProperty: new ProfileColorProperty( circuitConstructionKitCommon, 'panelFill', {
    default: '#f1f1f2'
  }, {
    tandem: tandem.createTandem( 'panelFillProperty' )
  } ),

  // // Stroke for Panel-like Containers
  panelStrokeProperty: new ProfileColorProperty( circuitConstructionKitCommon, 'panelStroke', {
    default: 'black'
  }, {
    tandem: tandem.createTandem( 'panelStrokeProperty' )
  } ),

  // Color for selected objects (CircuitElement and Vertex)
  highlightStrokeProperty: new ProfileColorProperty( circuitConstructionKitCommon, 'highlightStroke', {
    default: 'yellow'
  }, {
    tandem: tandem.createTandem( 'highlightStrokeProperty' )
  } ),

  editPanelFillProperty: new ProfileColorProperty( circuitConstructionKitCommon, 'editPanelFill', {
    default: 'rgba( 255, 255, 255, 0.5 )'
  }, {
    tandem: tandem.createTandem( 'editPanelFillProperty' )
  } ),

  conventionalCurrentArrowFillProperty: new ProfileColorProperty( circuitConstructionKitCommon, 'conventionalCurrentArrowFill', {
    default: 'red'
  }, {
    tandem: tandem.createTandem( 'conventionalCurrentArrowFillProperty' )
  } ),

  conventionalCurrentArrowStrokeProperty: new ProfileColorProperty( circuitConstructionKitCommon, 'conventionalCurrentArrowStroke', {
    default: 'white'
  }, {
    tandem: tandem.createTandem( 'conventionalCurrentArrowStrokeProperty' )
  } )

  //
  // // Fill for the background of Original Graph
  // originalChartBackgroundFillProperty: new ProfileColorProperty( calculusGrapher, 'originalChartBackgroundFill', {
  //   default: 'white'
  // } ),
  //
  // // Stroke for the background of Original Graph
  // originalChartBackgroundStrokeProperty: new ProfileColorProperty( calculusGrapher, 'originalChartBackgroundStroke', {
  //   default: 'black'
  // } ),
  //
  // // Fill for the background of all Graphs (besides Original)
  // defaultChartBackgroundFillProperty: new ProfileColorProperty( calculusGrapher, 'defaultChartBackgroundFill', {
  //   default: SCREEN_BACKGROUND_COLOR
  // } ),
  //
  // // Stroke for the background of all Graphs (besides Original)
  // defaultChartBackgroundStrokeProperty: new ProfileColorProperty( calculusGrapher, 'defaultChartBackgroundStroke', {
  //   default: 'rgba( 0, 0, 0, 0.4 )'
  // } ),
  //
  // // Stroke for the major gridlines of graph
  // majorGridlinesStrokeProperty: new ProfileColorProperty( calculusGrapher, 'majorGridlinesStroke', {
  //   default: Color.grayColor( 192 )
  // } ),
  //
  // // Stroke for the minor gridlines of graph
  // minorGridlinesStrokeProperty: new ProfileColorProperty( calculusGrapher, 'minorGridlinesStroke', {
  //   default: Color.grayColor( 230 )
  // } ),
  //
  // // Stroke for the original curve
  // originalCurveStrokeProperty: new ProfileColorProperty( calculusGrapher, 'originalCurveStroke', {
  //   default: Color.BLUE
  // }, {
  //   tandem: tandem.createTandem( 'originalCurveStrokeProperty' )
  // } ),
  //
  // // Stroke for the predict curve
  // predictCurveStrokeProperty: new ProfileColorProperty( calculusGrapher, 'predictCurveStroke', {
  //   default: '#ff00cf'
  // }, {
  //   tandem: tandem.createTandem( 'predictCurveStrokeProperty' )
  // } ),
  //
  // // Stroke for integral curve
  // integralCurveStrokeProperty: integralCurveStrokeProperty,
  //
  // // Stroke for derivative curve
  // derivativeCurveStrokeProperty: new ProfileColorProperty( calculusGrapher, 'derivativeCurveStroke', {
  //   default: Color.RED
  // }, {
  //   tandem: tandem.createTandem( 'derivativeCurveStrokeProperty' )
  // } ),
  //
  // // Stroke for second derivative curve
  // secondDerivativeCurveStrokeProperty: new ProfileColorProperty( calculusGrapher, 'secondDerivativeCurveStroke', {
  //   default: 'rgb( 102, 45, 145 )'
  // }, {
  //   tandem: tandem.createTandem( 'secondDerivativeCurveStrokeProperty' )
  // } ),
  //
  // // Fill for integral curve (when area is positive)
  // integralPositiveFillProperty: new DerivedProperty( [ integralCurveStrokeProperty ],
  //   integralCurveStroke => integralCurveStroke.withAlpha( CalculusGrapherQueryParameters.positiveAlpha ), {
  //     tandem: tandem.createTandem( 'integralPositiveFillProperty' ),
  //     phetioValueType: Color.ColorIO,
  //     phetioDocumentation: 'Color for positive area in the "Net Signed Area" accordion box.'
  //   } ),
  //
  // // Fill for integral curve (when area is negative)
  // integralNegativeFillProperty: new DerivedProperty( [ integralCurveStrokeProperty ],
  //   integralCurveStroke => integralCurveStroke.withAlpha( CalculusGrapherQueryParameters.negativeAlpha ), {
  //     tandem: tandem.createTandem( 'integralNegativeFillProperty' ),
  //     phetioValueType: Color.ColorIO,
  //     phetioDocumentation: 'Color for negative area in the "Net Signed Area" accordion box.'
  //   } ),
  //
  // // fill for the cueing arrows on original graph
  // cueingArrowsFillProperty: new ProfileColorProperty( calculusGrapher, 'cueingArrowsFill', {
  //   default: Color.ORANGE
  // } ),
  //
  // // the vertical reference line
  // referenceLineStrokeProperty: new ProfileColorProperty( calculusGrapher, 'referenceLineStroke', {
  //   default: 'black'
  // } ),
  //
  // // the handle (shaded sphere) for moving the reference line
  // referenceLineHandleColorProperty: new ProfileColorProperty( calculusGrapher, 'referenceLineHandleColor', {
  //   default: 'blue'
  // } )
};

circuitConstructionKitCommon.register( 'CCKCColors', CCKCColors );
export default CCKCColors;
