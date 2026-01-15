// Copyright 2026, University of Colorado Boulder

/**
 * Creates a singleton adapter property that allows the same control (e.g., NumberControl) to be repurposed
 * for different circuit components of the same type. This enables a single control for editing any component
 * of that type without recreating the control when selection changes.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import type IntentionalAny from '../../../phet-core/js/types/IntentionalAny.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import type Circuit from '../model/Circuit.js';
import CircuitElement from '../model/CircuitElement.js';

// Type for class constructors, used for instanceof checks
type GConstructor<T> = new ( ...args: IntentionalAny[] ) => T;

/**
 * Creates an adapter property that syncs with the selected circuit element's property.
 *
 * @param initialValue - Default value when no element is selected
 * @param CircuitElementType - The class constructor to filter by (e.g., Resistor, Battery)
 * @param circuit - The circuit model containing the selection
 * @param getter - Function to extract the target property from the circuit element
 * @param predicate - Optional filter to further restrict which elements this applies to
 */
const createSingletonAdapterProperty = <T extends CircuitElement, ValueType>(
  initialValue: ValueType,
  CircuitElementType: GConstructor<T>,
  circuit: Circuit,
  getter: ( circuitElement: T ) => Property<ValueType>,
  predicate: ( element: T ) => boolean = () => true ): Property<ValueType> => {

  // Cannot use DynamicProperty.derivedProperty since the selected circuit element isn't always the right subtype of CircuitElement
  const singletonAdapterProperty = new Property<ValueType>( initialValue, {} );
  singletonAdapterProperty.link( value => {
    if ( circuit.selectionProperty.value && circuit.selectionProperty.value instanceof CircuitElementType ) {
      getter( circuit.selectionProperty.value ).value = value;
    }
  } );

  // When the value in the model changes, say from PhET-iO, we propagate it back to the control
  const modelListener = ( value: ValueType ) => singletonAdapterProperty.set( value );
  circuit.selectionProperty.link( ( newCircuitElement, oldCircuitElement ) => {
    oldCircuitElement instanceof CircuitElementType && predicate( oldCircuitElement ) && getter( oldCircuitElement ).unlink( modelListener );
    newCircuitElement instanceof CircuitElementType && predicate( newCircuitElement ) && getter( newCircuitElement ).link( modelListener );
  } );
  return singletonAdapterProperty;
};

circuitConstructionKitCommon.register( 'createSingletonAdapterProperty', createSingletonAdapterProperty );

export default createSingletonAdapterProperty;
export type { GConstructor };
