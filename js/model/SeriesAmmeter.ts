// Copyright 2015-2022, University of Colorado Boulder

/**
 * Model for an ammeter than can be connected in series with a circuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import FixedCircuitElement, { FixedCircuitElementOptions } from './FixedCircuitElement.js';
import Vertex from './Vertex.js';

type SelfOptions = {};
type SeriesAmmeterOptions = SelfOptions & FixedCircuitElementOptions;

export default class SeriesAmmeter extends FixedCircuitElement {

  // the resistance in ohms.  A constant, but modeled as a property for uniformity with other resistive elements.
  readonly resistanceProperty: NumberProperty;

  constructor( startVertex: Vertex, endVertex: Vertex, tandem: Tandem, providedOptions?: SeriesAmmeterOptions ) {
    super( startVertex, endVertex, CCKCConstants.SERIES_AMMETER_LENGTH, tandem, providedOptions );
    this.resistanceProperty = new NumberProperty( 0 );
  }

  /**
   * Get the properties so that the circuit can be solved when changed.
   */
  getCircuitProperties(): Property<any>[] {

    // No internal parameters that can change the circuit
    return [];
  }
}

circuitConstructionKitCommon.register( 'SeriesAmmeter', SeriesAmmeter );