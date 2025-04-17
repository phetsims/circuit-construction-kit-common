// Copyright 2021-2025, University of Colorado Boulder

/**
 * Circuits schematic mode can be rendered as IEC or IEEE
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationValue from '../../../phet-core/js/EnumerationValue.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
export default class SchematicType extends EnumerationValue {
  public static readonly IEC = new SchematicType();
  public static readonly IEEE = new SchematicType();
  public static readonly BRITISH = new SchematicType();

  public static readonly enumeration = new Enumeration( SchematicType );
}

circuitConstructionKitCommon.register( 'SchematicType', SchematicType );