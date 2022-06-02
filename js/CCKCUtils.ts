// Copyright 2017-2022, University of Colorado Boulder

/**
 * Static utilities for the Circuit Construction Kit: DC simulation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Utils from '../../dot/js/Utils.js';
import { Node } from '../../scenery/js/imports.js';
import StringUtils from '../../phetcommon/js/util/StringUtils.js';
import CCKCQueryParameters from './CCKCQueryParameters.js';
import circuitConstructionKitCommonStrings from './circuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from './circuitConstructionKitCommon.js';
import ammeterReadoutTypeProperty from './view/ammeterReadoutTypeProperty.js';
import MathSymbols from '../../scenery-phet/js/MathSymbols.js';
import AmmeterReadoutType from './model/AmmeterReadoutType.js';

const currentUnitsString = circuitConstructionKitCommonStrings.currentUnits;
const voltageUnitsString = circuitConstructionKitCommonStrings.voltageUnits;

// Number of accumulated solve steps within a single frame.  We use high precision for the first
// several steps, then go to high performance for remaining steps.
const CCKCUtils = {

  /**
   * Typically show 2 decimal places for current and voltage readouts in the play area, but if it is a smaller value,
   * below 0.02 and 0.001, then it should show 3 decimal places.
   * @param value - the value to be formatted for display
   * @returns the number of decimal places to use for the display
   */
  getNumberOfDecimalPoints: function( value: number ): number {
    const abs = Math.abs( value );
    return ( abs >= 0 && abs < 0.02 ) ? 3 : 2;
  },

  /**
   * Returns a string that adjusts its ampere value.
   * @param current - in Amps
   * @param blackBoxStudy
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
        const decimals = this.getNumberOfDecimalPoints( signedCurrent );

        // Show 3 decimal places so that current can still be seen with a glowing high-resistance bulb
        return StringUtils.fillIn( currentUnitsString, { current: Utils.toFixed( signedCurrent, decimals ) } );
      }
    }
  },

  /**
   * Returns a string that adjusts its voltage value.
   * @param value - voltage value in Volts
   */
  createVoltageReadout: function( value: number ): string {
    const decimals = this.getNumberOfDecimalPoints( value );

    return StringUtils.fillIn( voltageUnitsString, { voltage: Utils.toFixed( value, decimals ) } );
  },

  /**
   * Checks whether a child should be in the scene graph and adds/removes it as necessary.  This is to improve
   * performance so that the DOM only contains displayed items and doesn't try to update invisible ones.
   * @param inSceneGraph - should the child be shown in the scene graph
   * @param parent - parent that contains the child in the scene graph
   * @param child - child added/removed from scene graph
   */
  setInSceneGraph: function( inSceneGraph: boolean, parent: Node, child: Node ) {
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

  validateNodeIndex( nodeIndex: string ) {
    if ( assert ) {
      assert && assert( typeof nodeIndex === 'string' || typeof nodeIndex === 'number', 'nodeIndex must be string or number' );
      if ( typeof nodeIndex === 'number' ) {
        assert && assert( !isNaN( nodeIndex ), 'nodeIndex may not be NaN' );
      }
    }
  }
};

circuitConstructionKitCommon.register( 'CCKCUtils', CCKCUtils );
export default CCKCUtils;