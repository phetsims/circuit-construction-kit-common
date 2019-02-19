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
  const CCKCChartNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CCKCChartNode' );

  class VoltageChartNode extends CCKCChartNode {

    /**
     * @param {NumberProperty} timeProperty
     * @param {Object} [options]
     */
    constructor( timeProperty, options ) {
      super( timeProperty, options );
    }
  }

  return circuitConstructionKitCommon.register( 'VoltageChartNode', VoltageChartNode );
} );