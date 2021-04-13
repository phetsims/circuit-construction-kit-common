// Copyright 2019-2020, University of Colorado Boulder

/**
 * Model for a capacitor, which stores charges on parallel plates.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import merge from '../../../phet-core/js/merge.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import DynamicCircuitElement from './DynamicCircuitElement.js';

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

      // The number of decimal places is only used in the view, but we define it in the model as a convenient way to
      // associate the value with the component
      numberOfDecimalPlaces: 2
    }, options );

    super( startVertex, endVertex, CCKCConstants.CAPACITOR_LENGTH, tandem, options );

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
   * Get the Properties that may change the circuit solution, so that the circuit can be re-solved when they change.
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