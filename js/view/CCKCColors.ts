// Copyright 2023, University of Colorado Boulder

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

  // Fill for Panel-like Containers
  panelFillProperty: new ProfileColorProperty( circuitConstructionKitCommon, 'panelFill', {
    default: '#f1f1f2'
  }, {
    tandem: tandem.createTandem( 'panelFillProperty' )
  } ),

  // Stroke for Panel-like Containers
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
};

circuitConstructionKitCommon.register( 'CCKCColors', CCKCColors );
export default CCKCColors;
