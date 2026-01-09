// Copyright 2025-2026, University of Colorado Boulder

/**
 * Shared utility functions for circuit element descriptions.
 * These are used by both model (CircuitContextStateTracker) and view (CircuitDescription) code.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import circuitConstructionKitCommon from './circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from './CircuitConstructionKitCommonFluent.js';
import Battery from './model/Battery.js';
import type Circuit from './model/Circuit.js';
import CircuitElement from './model/CircuitElement.js';
import type CircuitElementType from './model/CircuitElementType.js';
import LightBulb from './model/LightBulb.js';
import Resistor from './model/Resistor.js';
import ResistorType from './model/ResistorType.js';
import Vertex from './model/Vertex.js';

// Household item ResistorTypes that have a max of 1 in the circuit
const HOUSEHOLD_RESISTOR_TYPES = [
  ResistorType.COIN,
  ResistorType.PAPER_CLIP,
  ResistorType.PENCIL,
  ResistorType.THIN_PENCIL,
  ResistorType.ERASER,
  ResistorType.HAND,
  ResistorType.DOLLAR_BILL
];

const CircuitDescriptionUtils = {

  /**
   * Gets the description type string for a circuit element. For household item resistors,
   * returns their specific type (e.g., 'coin', 'paperClip'). For other elements, returns
   * the standard CircuitElementType.
   */
  getDescriptionType( circuitElement: CircuitElement ): string {
    if ( circuitElement instanceof Resistor ) {
      const resistorType = circuitElement.resistorType;
      if ( resistorType === ResistorType.COIN ) { return 'coin'; }
      if ( resistorType === ResistorType.PAPER_CLIP ) { return 'paperClip'; }
      if ( resistorType === ResistorType.PENCIL ) { return 'pencil'; }
      if ( resistorType === ResistorType.THIN_PENCIL ) { return 'thinPencil'; }
      if ( resistorType === ResistorType.ERASER ) { return 'eraser'; }
      if ( resistorType === ResistorType.HAND ) { return 'hand'; }
      if ( resistorType === ResistorType.DOLLAR_BILL ) { return 'dollarBill'; }
      if ( resistorType === ResistorType.EXTREME_RESISTOR ) { return 'extremeResistor'; }
    }
    if ( circuitElement instanceof Battery && circuitElement.batteryType === 'high-voltage' ) {
      return 'extremeBattery';
    }
    if ( circuitElement instanceof LightBulb && circuitElement.isExtreme ) {
      return 'extremeLightBulb';
    }
    if ( circuitElement instanceof LightBulb && circuitElement.isReal ) {
      return 'realLightBulb';
    }
    return circuitElement.type;
  },

  /**
   * Returns true if the circuit element is a household item that can only have one instance.
   */
  isSingleMaxItem( circuitElement: CircuitElement ): boolean {
    return circuitElement instanceof Resistor &&
           HOUSEHOLD_RESISTOR_TYPES.includes( circuitElement.resistorType );
  },

  /**
   * Gets the human-readable label for a circuit element type or description type.
   * Accepts both CircuitElementType and description types like 'coin', 'paperClip', etc.
   */
  getCircuitElementTypeLabel( type: CircuitElementType | string ): string {
    switch( type ) {
      case 'wire':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.wireStringProperty.value;
      case 'battery':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.batteryStringProperty.value;
      case 'resistor':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.resistorStringProperty.value;
      case 'capacitor':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.capacitorStringProperty.value;
      case 'inductor':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.inductorStringProperty.value;
      case 'lightBulb':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.lightBulbStringProperty.value;
      case 'acSource':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.acSourceStringProperty.value;
      case 'fuse':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.fuseStringProperty.value;
      case 'switch':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.switchStringProperty.value;
      case 'voltmeter':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.voltmeterStringProperty.value;
      case 'ammeter':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.ammeterStringProperty.value;
      case 'stopwatch':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.stopwatchStringProperty.value;
      // Extreme variants
      case 'extremeBattery':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.extremeBatteryStringProperty.value;
      case 'extremeResistor':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.extremeResistorStringProperty.value;
      case 'extremeLightBulb':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.extremeLightBulbStringProperty.value;
      case 'realLightBulb':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.realLightBulbStringProperty.value;
      // Household item types
      case 'coin':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.coinStringProperty.value;
      case 'paperClip':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.paperClipStringProperty.value;
      case 'pencil':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.pencilStringProperty.value;
      case 'thinPencil':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.thinPencilStringProperty.value;
      case 'eraser':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.eraserStringProperty.value;
      case 'hand':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.handStringProperty.value;
      case 'dollarBill':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypeLabels.dollarBillStringProperty.value;
      default:
        return type;
    }
  },

  /**
   * Returns the plural form for a circuit element type or description type.
   */
  getPluralTypeLabel( type: CircuitElementType | string ): string {
    switch( type ) {
      case 'wire':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.wireStringProperty.value;
      case 'battery':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.batteryStringProperty.value;
      case 'resistor':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.resistorStringProperty.value;
      case 'capacitor':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.capacitorStringProperty.value;
      case 'inductor':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.inductorStringProperty.value;
      case 'lightBulb':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.lightBulbStringProperty.value;
      case 'acSource':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.acSourceStringProperty.value;
      case 'fuse':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.fuseStringProperty.value;
      case 'switch':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.switchStringProperty.value;
      case 'voltmeter':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.voltmeterStringProperty.value;
      case 'ammeter':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.ammeterStringProperty.value;
      case 'stopwatch':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.stopwatchStringProperty.value;
      // Extreme variants
      case 'extremeBattery':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.extremeBatteryStringProperty.value;
      case 'extremeResistor':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.extremeResistorStringProperty.value;
      case 'extremeLightBulb':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.extremeLightBulbStringProperty.value;
      case 'realLightBulb':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.realLightBulbStringProperty.value;
      // Household items (max 1, so plurals unlikely but included for completeness)
      case 'coin':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.coinStringProperty.value;
      case 'paperClip':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.paperClipStringProperty.value;
      case 'pencil':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.pencilStringProperty.value;
      case 'thinPencil':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.thinPencilStringProperty.value;
      case 'eraser':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.eraserStringProperty.value;
      case 'hand':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.handStringProperty.value;
      case 'dollarBill':
        return CircuitConstructionKitCommonFluent.a11y.circuitDescription.circuitComponentTypePlurals.dollarBillStringProperty.value;
      default:
        return type + 's';
    }
  },

  /**
   * Formats a brief name for a circuit element for use in junction descriptions and other contexts.
   * For household items (single-max), just returns the name without position.
   */
  formatCircuitElementBriefName( circuitElement: CircuitElement, position: number ): string {
    const descriptionType = CircuitDescriptionUtils.getDescriptionType( circuitElement );
    const typeLabel = CircuitDescriptionUtils.getCircuitElementTypeLabel( descriptionType );

    // For single-max items (household items), don't show position numbers
    if ( CircuitDescriptionUtils.isSingleMaxItem( circuitElement ) ) {
      return typeLabel;
    }
    return CircuitConstructionKitCommonFluent.a11y.circuitDescription.briefName.format( {
      typeLabel: typeLabel,
      position: position
    } );
  },

  /**
   * Returns the 1-based position of a circuit element among elements of the same description type.
   * For example, if there are 3 batteries in the circuit and this is the 2nd one, returns 2.
   */
  getElementPosition( circuit: Circuit, circuitElement: CircuitElement ): number {
    const targetType = CircuitDescriptionUtils.getDescriptionType( circuitElement );
    let position = 0;
    for ( let i = 0; i < circuit.circuitElements.length; i++ ) {
      const element = circuit.circuitElements[ i ];
      if ( CircuitDescriptionUtils.getDescriptionType( element ) === targetType ) {
        position++;
        if ( element === circuitElement ) {
          return position;
        }
      }
    }
    return 1; // Fallback
  },

  /**
   * Returns the terminal type for a vertex's connection to a circuit element.
   * Used with the terminalPrefix pattern to create the full description.
   */
  getTerminalType( vertex: Vertex, circuitElement: CircuitElement ): 'positiveTerminal' | 'negativeTerminal' | 'side' | 'bottom' | 'none' {
    if ( circuitElement.type === 'battery' ) {
      const battery = circuitElement as Battery;

      // endVertex is the positive terminal (higher voltage)
      return vertex === battery.endVertexProperty.value ? 'positiveTerminal' : 'negativeTerminal';
    }
    else if ( circuitElement.type === 'lightBulb' ) {
      const lightBulb = circuitElement as LightBulb;

      // startVertex is the side, endVertex is the bottom
      return vertex === lightBulb.endVertexProperty.value ? 'side' : 'bottom';
    }
    return 'none';
  },

  /**
   * Returns the formatted description for a vertex's connection to a circuit element,
   * including the terminal type prefix (e.g., "Positive Terminal of Battery 1").
   */
  formatTerminalDescription( vertex: Vertex, circuitElement: CircuitElement, componentName: string ): string {
    const terminalType = CircuitDescriptionUtils.getTerminalType( vertex, circuitElement );
    return CircuitConstructionKitCommonFluent.a11y.circuitDescription.terminalPrefix.format( {
      terminalType: terminalType,
      componentName: componentName
    } );
  },

  /**
   * Returns the 1-based group index for a circuit element if it's in a multi-element group,
   * or null if it's disconnected (single-element group).
   */
  getGroupIndex( circuit: Circuit, circuitElement: CircuitElement ): number | null {
    const groups = circuit.getGroups();
    const multiElementGroups = groups.filter( group => group.circuitElements.length > 1 );

    for ( let i = 0; i < multiElementGroups.length; i++ ) {
      if ( multiElementGroups[ i ].circuitElements.includes( circuitElement ) ) {
        return i + 1; // 1-based index
      }
    }
    return null; // Disconnected element
  }
};

circuitConstructionKitCommon.register( 'CircuitDescriptionUtils', CircuitDescriptionUtils );

export default CircuitDescriptionUtils;
