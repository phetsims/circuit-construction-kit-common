// Copyright 2021-2025, University of Colorado Boulder

// We originally had the resistance of the eraser and dollar as 1E9 ohms, but that led to erratic behavior as the circuit
// was adjusted, see https://github.com/phetsims/circuit-construction-kit-common/issues/1032
// Reducing this to 1E6 ohms stabilizes the behavior, but unfortunately shows some current when you have several high
// voltage batteries in series. Still, we prefer this value since the erratic values are problematic.
// We are aware that the actual resistance of the eraser is orders of magnitude higher.

/**
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Range from '../../../dot/js/Range.js';
import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

const LARGE_RESISTANCE = 1E6;
export default class ResistorType extends EnumerationValue {

  public static readonly RESISTOR = new ResistorType( 10, new Range( 0, 120 ), false, CCKCConstants.RESISTOR_LENGTH );
  public static readonly EXTREME_RESISTOR = new ResistorType( 1000, new Range( 100, 10000 ), false, CCKCConstants.RESISTOR_LENGTH );
  public static readonly COIN = ResistorType.fixed( 0, true, CCKCConstants.COIN_LENGTH );
  public static readonly PAPER_CLIP = ResistorType.fixed( 0, true, CCKCConstants.PAPER_CLIP_LENGTH );
  public static readonly PENCIL = ResistorType.fixed( 25, false, CCKCConstants.PENCIL_LENGTH );
  public static readonly THIN_PENCIL = ResistorType.fixed( 50, false, CCKCConstants.PENCIL_LENGTH );
  public static readonly ERASER = ResistorType.fixed( LARGE_RESISTANCE, false, CCKCConstants.ERASER_LENGTH );
  public static readonly HAND = ResistorType.fixed( 100000, false, CCKCConstants.HAND_LENGTH, 15 );
  public static readonly DOLLAR_BILL = ResistorType.fixed( LARGE_RESISTANCE, false, CCKCConstants.DOLLAR_BILL_LENGTH );

  public static readonly enumeration = new Enumeration( ResistorType );

  // In ohms
  public readonly defaultResistance: number;

  // In ohms
  public readonly range: Range;
  public readonly isMetallic: boolean;

  // in view coordinates
  public readonly length: number;

  // amount the view is shifted down in view coordinates
  public readonly verticalOffset: number;

  /**
   * @param defaultResistance - default value for resistance, in Ohms
   * @param resistanceRange - possible values for the resistance, in Ohms
   * @param isMetallic - whether the item is metallic (non-insulated) and hence can have its value read at any point
   * @param length
   * @param [verticalOffset]
   */
  public constructor( defaultResistance: number, resistanceRange: Range, isMetallic: boolean, length: number, verticalOffset = 0 ) {
    super();

    this.defaultResistance = defaultResistance;
    this.range = resistanceRange;
    this.isMetallic = isMetallic;
    this.length = length;
    this.verticalOffset = verticalOffset;
  }

  /**
   * Convenience function for creating a fixed-resistance resistor, like a household item.
   */
  private static fixed( resistance: number, isMetallic: boolean, length: number, verticalOffset = 0 ): ResistorType {
    return new ResistorType( resistance, new Range( resistance, resistance ), isMetallic, length, verticalOffset );
  }
}

circuitConstructionKitCommon.register( 'ResistorType', ResistorType );