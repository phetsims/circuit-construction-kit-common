// Copyright 2019-2021, University of Colorado Boulder

/**
 * Model for an inductor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Range from '../../../dot/js/Range.js';
import merge from '../../../phet-core/js/merge.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import DynamicCircuitElement from './DynamicCircuitElement.js';

// constants
const INDUCTOR_LENGTH = CCKCConstants.INDUCTOR_LENGTH;

class Inductor extends DynamicCircuitElement {

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( startVertex, endVertex, tandem, options ) {
    options = merge( {
      inductance: CCKCQueryParameters.inductanceDefault,
      numberOfDecimalPlaces: 0
    }, options );

    super( startVertex, endVertex, INDUCTOR_LENGTH, tandem, options );

    // @public {Property.<number>} the inductance in Henries
    this.inductanceProperty = new NumberProperty( options.inductance, {
      range: new Range( CCKCQueryParameters.inductanceMin, CCKCQueryParameters.inductanceMax ),
      tandem: tandem.createTandem( 'inductanceProperty' )
    } );
  }

  /**
   * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
   * @public
   */
  dispose() {
    this.inductanceProperty.dispose();
    super.dispose();
  }

  /**
   * Get the properties so that the circuit can be solved when changed.
   * @override
   * @returns {Property.<*>[]}
   * @public
   */
  getCircuitProperties() {
    return [ this.inductanceProperty ];
  }
}

circuitConstructionKitCommon.register( 'Inductor', Inductor );
export default Inductor;