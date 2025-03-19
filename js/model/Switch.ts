// Copyright 2015-2025, University of Colorado Boulder

/**
 * Model for a switch which can be opened and closed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import type Property from '../../../axon/js/Property.js';
import type Matrix3 from '../../../dot/js/Matrix3.js';
import Utils from '../../../dot/js/Utils.js';
import type IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import type Circuit from './Circuit.js';
import FixedCircuitElement from './FixedCircuitElement.js';
import type Vertex from './Vertex.js';

// constants
const SWITCH_LENGTH = CCKCConstants.SWITCH_LENGTH;
const SWITCH_START = CCKCConstants.SWITCH_START;
const SWITCH_END = CCKCConstants.SWITCH_END;

export default class Switch extends FixedCircuitElement {

  // the resistance in ohms
  public readonly resistanceProperty: Property<number>;

  // whether the switch is closed (and current can flow through it)
  public readonly isClosedProperty: Property<boolean>;

  public constructor( startVertex: Vertex, endVertex: Vertex, tandem: Tandem, circuit: Circuit | null ) {

    super( startVertex, endVertex, SWITCH_LENGTH, tandem, {

      // Do not instrument isEditableProperty for switches as there is nothing to edit
      isEditablePropertyOptions: {
        tandem: Tandem.OPT_OUT
      },

      // Use the bounding box of the open lifelike switch to show bounds for all combinations of open/closed x lifelike/schematic
      // See https://github.com/phetsims/circuit-construction-kit-dc/issues/132
      isSizeChangedOnViewChange: false
    } );

    this.resistanceProperty = new NumberProperty( 0 );

    this.isClosedProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'isClosedProperty' ),
      phetioFeatured: true
    } );

    this.isClosedProperty.link( closed => {
      this.resistanceProperty.value = closed ? 0 : CCKCConstants.MAX_RESISTANCE;
      circuit && circuit.componentEditedEmitter.emit();
    } );
  }

  /**
   * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
   */
  public override dispose(): void {
    this.isClosedProperty.dispose();
    super.dispose();
  }

  /**
   * Returns the position and angle of the given point along the Switch
   * @param distanceAlongWire
   * @param matrix to be updated with the position and angle, so that garbage isn't created each time
   */
  public override updateMatrixForPoint( distanceAlongWire: number, matrix: Matrix3 ): void {

    const startPosition = this.startPositionProperty.get();
    const endPosition = this.endPositionProperty.get();
    const fractionAlongWire = distanceAlongWire / this.chargePathLength;

    // If the charge is halfway up the switch lever for an open switch, show it along the raised lever
    if ( fractionAlongWire > SWITCH_START && fractionAlongWire < SWITCH_END && !this.isClosedProperty.value ) {
      const pivot = startPosition.blend( endPosition, SWITCH_START );

      const twoThirdsPoint = startPosition.blend( endPosition, SWITCH_END );
      const rotatedPoint = twoThirdsPoint.rotatedAboutPoint( pivot, -Math.PI / 4 );

      const distanceAlongSegment = Utils.linear( SWITCH_START, SWITCH_END, 0, 1, fractionAlongWire );
      const translation = pivot.blend( rotatedPoint, distanceAlongSegment );
      matrix.setToTranslationRotationPoint( translation, endPosition.minus( startPosition ).angle );
    }
    else {

      // For a closed switch, there is a straight path from the start vertex to the end vertex
      super.updateMatrixForPoint( distanceAlongWire, matrix );
    }
  }

  /**
   * Get the properties so that the circuit can be solved when changed.
   */
  public getCircuitProperties(): Property<IntentionalAny>[] {
    return [ this.resistanceProperty, this.isClosedProperty ];
  }
}

circuitConstructionKitCommon.register( 'Switch', Switch );