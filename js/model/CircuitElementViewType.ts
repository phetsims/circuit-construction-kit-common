// Copyright 2021-2022, University of Colorado Boulder

import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import Enumeration from '../../../phet-core/js/Enumeration.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

/**
 * Enumeration for how to render the circuit elements: lifelike or schematic.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

export default class CircuitElementViewType extends EnumerationValue {
  public static readonly LIFELIKE = new CircuitElementViewType();
  public static readonly SCHEMATIC = new CircuitElementViewType();

  private static readonly enumeration = new Enumeration( CircuitElementViewType, {
    phetioDocumentation: 'Enumeration that determines how the circuit elements are rendered: lifelike or schematic'
  } );
}

circuitConstructionKitCommon.register( 'CircuitElementViewType', CircuitElementViewType );