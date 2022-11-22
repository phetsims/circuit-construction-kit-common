// Copyright 2015-2022, University of Colorado Boulder

/**
 * Model for an ammeter than can be connected in series with a circuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import optionize, { EmptySelfOptions } from '../../../phet-core/js/optionize.js';
import IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import FixedCircuitElement, { FixedCircuitElementOptions } from './FixedCircuitElement.js';
import Vertex from './Vertex.js';

type SelfOptions = EmptySelfOptions;
type SeriesAmmeterOptions = SelfOptions & FixedCircuitElementOptions;

export default class SeriesAmmeter extends FixedCircuitElement {

  // the resistance in ohms.  A constant, but modeled as a property for uniformity with other resistive elements.
  public readonly resistanceProperty: NumberProperty;

  public constructor( startVertex: Vertex, endVertex: Vertex, tandem: Tandem, providedOptions?: SeriesAmmeterOptions ) {

    const options = optionize<SeriesAmmeterOptions, SelfOptions, FixedCircuitElementOptions>()( {

      // SeriesAmmeters do not have these features, so opt out of PhET-iO instrumentation here
      isEditablePropertyOptions: {
        tandem: Tandem.OPT_OUT
      },
      isValueDisplayablePropertyOptions: {
        tandem: Tandem.OPT_OUT
      },
      labelStringPropertyOptions: {
        tandem: Tandem.OPT_OUT
      }
    }, providedOptions );
    super( startVertex, endVertex, CCKCConstants.SERIES_AMMETER_LENGTH, tandem, options );
    this.resistanceProperty = new NumberProperty( 0 );
  }

  /**
   * Get the properties so that the circuit can be solved when changed.
   */
  public getCircuitProperties(): Property<IntentionalAny>[] {

    // No internal parameters that can change the circuit
    return [];
  }
}

circuitConstructionKitCommon.register( 'SeriesAmmeter', SeriesAmmeter );