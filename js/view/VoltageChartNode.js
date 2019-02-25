// Copyright 2019, University of Colorado Boulder

/**
 * TODO: Documentation
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CCKCChartNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CCKCChartNode' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );

  class VoltageChartNode extends CCKCChartNode {

    /**
     * @param {NumberProperty} timeProperty
     * @param {Object} [options]
     */
    constructor( a, b, c, d, e, f, g ) { // TODO: name args once stabilized
      super( a, b, c, d, e, f, g );
    }
  }

  return circuitConstructionKitCommon.register( 'VoltageChartNode', VoltageChartNode );
} );