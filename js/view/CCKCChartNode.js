// Copyright 2019, University of Colorado Boulder

/**
 * TODO: Documentation
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const DragListener = require( 'SCENERY/listeners/DragListener' );
  const DynamicSeries = require( 'GRIDDLE/DynamicSeries' );
  const LabeledScrollingChartNode = require( 'GRIDDLE/LabeledScrollingChartNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const ScrollingChartNode = require( 'GRIDDLE/ScrollingChartNode' );
  const Text = require( 'SCENERY/nodes/Text' );

  class CCKCChartNode extends Node {

    /**
     * @param {NumberProperty} timeProperty
     * @param {Object} [options]
     */
    constructor( timeProperty, options ) {
      super( options );

      this.series1 = new DynamicSeries();
      this.series2 = new DynamicSeries();

      this.labeledScrollingChartNode = new LabeledScrollingChartNode( new ScrollingChartNode( timeProperty, [ this.series1, this.series2 ], {
        width: 150,
        height: 110
      } ), new Text( 'verticalAxisTitle' ), new Text( 'scale indicator' ), 'time' );

      const paneledNode = new Panel( this.labeledScrollingChartNode, {
        cursor: 'pointer',
        backgroundPickable: true
      } );
      this.addChild( paneledNode );

      paneledNode.addInputListener( new DragListener( {
        translateNode: true
      } ) );
    }
  }

  return circuitConstructionKitCommon.register( 'CCKCChartNode', CCKCChartNode );
} );