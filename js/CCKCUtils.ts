// Copyright 2017-2023, University of Colorado Boulder

/**
 * Static utilities for the Circuit Construction Kit: DC simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Utils from '../../dot/js/Utils.js';
import { Node } from '../../scenery/js/imports.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import CCKCQueryParameters from './CCKCQueryParameters.js';
import CircuitConstructionKitCommonStrings from './CircuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from './circuitConstructionKitCommon.js';
import ammeterReadoutTypeProperty from './view/ammeterReadoutTypeProperty.js';
import MathSymbols from '../../scenery-phet/js/MathSymbols.js';
import AmmeterReadoutType from './model/AmmeterReadoutType.js';
import CCKCConstants from './CCKCConstants.js';
import Bounds2 from '../../dot/js/Bounds2.js';

const currentUnitsStringProperty = CircuitConstructionKitCommonStrings.currentUnitsStringProperty;
const voltageUnitsStringProperty = CircuitConstructionKitCommonStrings.voltageUnitsStringProperty;

// Number of accumulated solve steps within a single frame.  We use high precision for the first
// several steps, then go to high performance for remaining steps.
const CCKCUtils = {

  /**
   * Returns a string that adjusts its ampere value.
   * @param current - in Amps
   */
  createCurrentReadout: function( current: number | null, blackBoxStudy: boolean ): string {
    if ( CCKCQueryParameters.fullPrecisionAmmeter ) {
      return current + '';
    }
    else {

      const max = blackBoxStudy ? 1E3 : 1E10;
      const maxString = blackBoxStudy ? '> 10^3' : '> 10^10';
      const minString = blackBoxStudy ? '< -10^3' : '< -10^10';
      const ammeterReadoutType = ammeterReadoutTypeProperty.value;

      if ( current === null ) {
        return MathSymbols.NO_VALUE;
      }
      else if ( ammeterReadoutType === AmmeterReadoutType.MAGNITUDE && Math.abs( current ) > max ) {
        return maxString;
      }
      else if ( ammeterReadoutType === AmmeterReadoutType.SIGNED && current > max ) {
        return maxString;
      }
      else if ( ammeterReadoutType === AmmeterReadoutType.SIGNED && current < -max ) {
        return minString;
      }
      else {
        const signedCurrent = ammeterReadoutTypeProperty.value === AmmeterReadoutType.MAGNITUDE ? Math.abs( current ) : current;
        return StringUtils.fillIn( currentUnitsStringProperty, { current: Utils.toFixed( signedCurrent, CCKCConstants.METER_PRECISION ) } );
      }
    }
  },

  /**
   * Returns a string that adjusts its voltage value.
   * @param value - voltage value in Volts
   */
  createVoltageReadout: function( value: number ): string {
    return StringUtils.fillIn( voltageUnitsStringProperty, { voltage: Utils.toFixed( value, CCKCConstants.METER_PRECISION ) } );
  },

  /**
   * Checks whether a child should be in the scene graph and adds/removes it as necessary.  This is to improve
   * performance so that the DOM only contains displayed items and doesn't try to update invisible ones.
   * @param inSceneGraph - should the child be shown in the scene graph
   * @param parent - parent that contains the child in the scene graph
   * @param child - child added/removed from scene graph
   */
  setInSceneGraph: function( inSceneGraph: boolean, parent: Node, child: Node ): void {
    if ( inSceneGraph && !parent.hasChild( child ) ) {
      parent.addChild( child );
    }
    else if ( !inSceneGraph && parent.hasChild( child ) ) {
      parent.removeChild( child );
    }
  },

  /**
   * Clamp the magnitude of a signed number to keep it in range.
   */
  clampMagnitude( value: number, magnitude = 1E20 ): number {
    assert && assert( magnitude >= 0, 'magnitude should be non-negative' );
    if ( Math.abs( value ) > magnitude ) {
      return Math.sign( value ) * magnitude;
    }
    else {
      return value;
    }
  },

  /**
   * Erode bounds to make hit box dimensions RETURN_ITEM_HIT_BOX_RATIO * nodeBounds
   */
  getDropItemHitBoxForBounds( nodeBounds: Bounds2 ): Bounds2 {
    const erosionRatio = 0.5 * ( 1 - CCKCConstants.RETURN_ITEM_HIT_BOX_RATIO );
    return nodeBounds.erodedXY( erosionRatio * nodeBounds.width, erosionRatio * nodeBounds.height );
  }
};

circuitConstructionKitCommon.register( 'CCKCUtils', CCKCUtils );
export default CCKCUtils;