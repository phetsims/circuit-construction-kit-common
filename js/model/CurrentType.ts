// Copyright 2017-2025, University of Colorado Boulder

/**
 * Enumeration for how to render the current: electrons or conventional (arrows).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

export default class CurrentType extends EnumerationValue {
  public static readonly ELECTRONS = new CurrentType( 'electrons' );
  public static readonly CONVENTIONAL = new CurrentType( 'conventional' );

  public static readonly enumeration = new Enumeration( CurrentType );

  public constructor( public readonly value: 'electrons' | 'conventional' ) {
    super();
  }
}

circuitConstructionKitCommon.register( 'CurrentType', CurrentType );