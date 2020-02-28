// Copyright 2019-2020, University of Colorado Boulder

/**
 * Model for a capacitor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import merge from '../../../phet-core/js/merge.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import DynamicCircuitElement from './DynamicCircuitElement.js';

// constants
const CAPACITOR_LENGTH = CCKCConstants.CAPACITOR_LENGTH;

class Capacitor extends DynamicCircuitElement {

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( startVertex, endVertex, tandem, options ) {
    options = merge( {
      capacitance: CCKCConstants.DEFAULT_CAPACITANCE,
      numberOfDecimalPlaces: 2
    }, options );

    super( startVertex, endVertex, CAPACITOR_LENGTH, tandem, options );

    // @public {Property.<number>} the capacitance in farads
    this.capacitanceProperty = new NumberProperty( options.capacitance, {
      range: new Range( 0.05, 0.20 ),
      tandem: tandem.createTandem( 'capacitanceProperty' )
    } );
  }

  /**
   * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
   * @public
   */
  dispose() {
    this.capacitanceProperty.dispose();
    super.dispose();
  }

  /**
   * Get the properties so that the circuit can be solved when changed.
   * @override
   * @returns {Property.<*>[]}
   * @public
   */
  getCircuitProperties() {
    return [ this.capacitanceProperty ];
  }
}

circuitConstructionKitCommon.register( 'Capacitor', Capacitor );
export default Capacitor;