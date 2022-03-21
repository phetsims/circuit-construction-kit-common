// Copyright 2021-2022, University of Colorado Boulder

import CCKCConstants from '../CCKCConstants.js';
import Range from '../../../dot/js/Range.js';
import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

export default class ResistorType extends EnumerationValue {

  static RESISTOR = new ResistorType( 10, new Range( 0, 120 ), false, CCKCConstants.RESISTOR_LENGTH );
  static HIGH_RESISTANCE_RESISTOR = new ResistorType( 1000, new Range( 100, 10000 ), false, CCKCConstants.RESISTOR_LENGTH );
  static COIN = ResistorType.fixed( 0, true, CCKCConstants.COIN_LENGTH );
  static PAPER_CLIP = ResistorType.fixed( 0, true, CCKCConstants.PAPER_CLIP_LENGTH );
  static PENCIL = ResistorType.fixed( 25, false, CCKCConstants.PENCIL_LENGTH );
  static ERASER = ResistorType.fixed( 1000000000, false, CCKCConstants.ERASER_LENGTH );
  static HAND = ResistorType.fixed( 100000, false, CCKCConstants.HAND_LENGTH, 15 );

  // Adjust the dog so the charges travel along the tail/legs, see https://github.com/phetsims/circuit-construction-kit-common/issues/364
  static DOG = ResistorType.fixed( 100000, false, CCKCConstants.DOG_LENGTH, -40 );
  static DOLLAR_BILL = ResistorType.fixed( 1000000000, false, CCKCConstants.DOLLAR_BILL_LENGTH );

  static enumeration = new Enumeration( ResistorType );

  readonly defaultResistance: number;
  readonly range: Range;
  readonly isMetallic: boolean;
  readonly length: number;
  readonly verticalOffset: number;

  /**
   * @param {number} defaultResistance - default value for resistance, in Ohms
   * @param {Range} resistanceRange - possible values for the resistance, in Ohms
   * @param {boolean} isMetallic - whether the item is metallic (non-insulated) and hence can have its value read at any point
   * @param {number} length
   * @param {number} [verticalOffset]
   */
  constructor( defaultResistance: number, resistanceRange: Range, isMetallic: boolean, length: number, verticalOffset = 0 ) {
    super();

    // @public (read-only) {number} - in Ohms
    this.defaultResistance = defaultResistance;

    // @public (read-only) {Range} - in Ohms
    this.range = resistanceRange;

    // @public (read-only) {boolean}
    this.isMetallic = isMetallic;

    // @public (read-only} {number} - in view coordinates
    this.length = length;

    // @public (read-only) {number} - amount the view is shifted down in view coordinates
    this.verticalOffset = verticalOffset;
  }

  /**
   * Convenience function for creating a fixed-resistance resistor, like a household item.
   */
  static fixed( resistance: number, isMetallic: boolean, length: number, verticalOffset = 0 ): ResistorType {
    return new ResistorType( resistance, new Range( resistance, resistance ), isMetallic, length, verticalOffset );
  }
}

circuitConstructionKitCommon.register( 'ResistorType', ResistorType );