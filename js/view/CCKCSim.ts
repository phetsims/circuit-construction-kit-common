// Copyright 2025, University of Colorado Boulder

/**
 * Sim subclass for circuit construction kit simulations
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import type TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import type { AnyScreen } from '../../../joist/js/Screen.js';
import Sim, { SimOptions } from '../../../joist/js/Sim.js';
import affirm from '../../../perennial-alias/js/browser-and-node/affirm.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

export default class CCKCSim extends Sim {

  public constructor( simNameProperty: TReadOnlyProperty<string>, allSimScreens: AnyScreen[], providedOptions?: SimOptions ) {
    super( simNameProperty, allSimScreens, providedOptions );

    const element = this.display.getFocusablePlaceholder();
    affirm( element );

    // Add a listener to focus in the simulation when interacting. This supports the "delete" and "backspace" key
    // interactions even though there are no focusable elements in the simulation, see https://github.com/phetsims/circuit-construction-kit-common/issues/1027
    this.display.addInputListener( {
      down: () => {

        // Only if there isn't another item focused already.
        if ( document.activeElement === document.body ) {
          element.focus();
        }
      }
    } );

  }
}

circuitConstructionKitCommon.register( 'CCKCSim', CCKCSim );