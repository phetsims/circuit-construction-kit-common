// Copyright 2019-2025, University of Colorado Boulder

/**
 * Model for an inductor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../axon/js/NumberProperty.js';
import type Property from '../../../axon/js/Property.js';
import Range from '../../../dot/js/Range.js';
import optionize from '../../../phet-core/js/optionize.js';
import type IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import DynamicCircuitElement, { type DynamicCircuitElementOptions } from './DynamicCircuitElement.js';
import type Vertex from './Vertex.js';

// constants
const INDUCTOR_LENGTH = CCKCConstants.INDUCTOR_LENGTH;

type SelfOptions = {
  inductance?: number;
};
type InductorOptions = SelfOptions & DynamicCircuitElementOptions;

export default class Inductor extends DynamicCircuitElement {

  // the inductance in Henries
  public readonly inductanceProperty: NumberProperty;
  public static readonly INDUCTANCE_DEFAULT = CCKCQueryParameters.inductanceDefault;
  public static readonly INDUCTANCE_RANGE = new Range( CCKCQueryParameters.inductanceMin, CCKCQueryParameters.inductanceMax );
  public static readonly INDUCTANCE_NUMBER_OF_DECIMAL_PLACES = CCKCQueryParameters.inductorNumberDecimalPlaces;

  public readonly isTraversableProperty = new BooleanProperty( true );

  public constructor( startVertex: Vertex, endVertex: Vertex, tandem: Tandem, providedOptions?: InductorOptions ) {
    const options = optionize<InductorOptions, SelfOptions, DynamicCircuitElementOptions>()( {
      inductance: Inductor.INDUCTANCE_DEFAULT,
      numberOfDecimalPlaces: Inductor.INDUCTANCE_NUMBER_OF_DECIMAL_PLACES
    }, providedOptions );

    super( 'inductor', startVertex, endVertex, INDUCTOR_LENGTH, tandem, options );

    this.inductanceProperty = new NumberProperty( options.inductance, {
      range: Inductor.INDUCTANCE_RANGE,
      tandem: tandem.createTandem( 'inductanceProperty' )
    } );
  }

  /**
   * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
   */
  public override dispose(): void {
    this.inductanceProperty.dispose();
    super.dispose();
  }

  /**
   * Get the properties so that the circuit can be solved when changed.
   */
  public getCircuitProperties(): Property<IntentionalAny>[] {
    return [ this.inductanceProperty ];
  }
}

circuitConstructionKitCommon.register( 'Inductor', Inductor );