// Copyright 2025, University of Colorado Boulder

/**
 * Sim subclass for circuit construction kit simulations
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import type { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import type { AnyScreen } from '../../../joist/js/Screen.js';
import Sim, { SimOptions } from '../../../joist/js/Sim.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

export default class CCKCSim extends Sim {

  public constructor( simNameProperty: TReadOnlyProperty<string>, allSimScreens: AnyScreen[], providedOptions?: SimOptions ) {
    super( simNameProperty, allSimScreens, providedOptions );
  }
}

circuitConstructionKitCommon.register( 'CCKCSim', CCKCSim );