// Copyright 2015-2022, University of Colorado Boulder

/**
 * Model for a switch which can be opened and closed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Utils from '../../../dot/js/Utils.js';
import optionize from '../../../phet-core/js/optionize.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import FixedCircuitElement, { FixedCircuitElementOptions } from './FixedCircuitElement.js';
import Vertex from './Vertex.js';

// constants
const SWITCH_LENGTH = CCKCConstants.SWITCH_LENGTH;
const SWITCH_START = CCKCConstants.SWITCH_START;
const SWITCH_END = CCKCConstants.SWITCH_END;

type SwitchSelfOptions = {
  closed?: boolean;
};
type SwitchOptions = SwitchSelfOptions & FixedCircuitElementOptions;

class Switch extends FixedCircuitElement {
  readonly resistanceProperty: Property<number>;
  readonly closedProperty: Property<boolean>;

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Tandem} tandem
   * @param {Object} [providedOptions]
   */
  constructor( startVertex: Vertex, endVertex: Vertex, tandem: Tandem, providedOptions?: SwitchOptions ) {

    const options = optionize<SwitchOptions, SwitchSelfOptions, FixedCircuitElementOptions>( {
      closed: false,

      // Use the bounding box of the open lifelike switch to show bounds for all combinations of open/closed x lifelike/schematic
      // See https://github.com/phetsims/circuit-construction-kit-dc/issues/132
      isSizeChangedOnViewChange: false
    }, providedOptions );

    super( startVertex, endVertex, SWITCH_LENGTH, tandem, options );

    // @public (read-only) {NumberProperty} the resistance in ohms
    this.resistanceProperty = new NumberProperty( 0 );

    // @public (read-only) {BooleanProperty} whether the switch is closed (and current can flow through it)
    this.closedProperty = new BooleanProperty( options.closed, {
      tandem: tandem.createTandem( 'closedProperty' )
    } );

    this.closedProperty.link( closed => {
      this.resistanceProperty.value = closed ? 0 : CCKCConstants.MAX_RESISTANCE;
    } );
  }

  /**
   * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
   * @public
   */
  dispose() {
    this.closedProperty.dispose();
    super.dispose();
  }

  /**
   * Returns the position and angle of the given point along the Switch
   * @param {number} distanceAlongWire
   * @param {Matrix3} matrix to be updated with the position and angle, so that garbage isn't created each time
   * @overrides
   * @public
   */
  updateMatrixForPoint( distanceAlongWire: number, matrix: Matrix3 ) {

    const startPosition = this.startPositionProperty.get();
    const endPosition = this.endPositionProperty.get();
    const fractionAlongWire = distanceAlongWire / this.chargePathLength;

    // If the charge is halfway up the switch lever for an open switch, show it along the raised lever
    if ( fractionAlongWire > SWITCH_START && fractionAlongWire < SWITCH_END && !this.closedProperty.get() ) {
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
   * @override
   * @returns {Property.<*>[]}
   * @public
   */
  getCircuitProperties() {
    return [ this.resistanceProperty, this.closedProperty ];
  }
}

circuitConstructionKitCommon.register( 'Switch', Switch );
export default Switch;