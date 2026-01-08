// Copyright 2025, University of Colorado Boulder

/**
 * CircuitContextResponses generates context response strings for accessibility.
 * It tracks circuit state (current magnitudes, light bulb brightness) and compares
 * before/after states to generate appropriate announcements.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { clamp } from '../../../../dot/js/util/clamp.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../../CircuitConstructionKitCommonFluent.js';
import CircuitDescriptionUtils from '../../CircuitDescriptionUtils.js';
import type Circuit from '../../model/Circuit.js';
import CircuitElement from '../../model/CircuitElement.js';
import type CircuitGroup from '../../model/CircuitGroup.js';
import LightBulb from '../../model/LightBulb.js';
import type Vertex from '../../model/Vertex.js';

// Brightness calculation constants (from CircuitContextStateTracker)
const LIGHT_BULB_BRIGHTNESS_MULTIPLIER = 0.35;
const LIGHT_BULB_MAXIMUM_POWER = 2000;

// Current threshold for considering current as "flowing" (for vertex connection responses)
const CURRENT_THRESHOLD = 1e-4;

// Tolerance for comparing values - very small to catch any real change
// while avoiding floating-point noise
const VALUE_EQUALITY_TOLERANCE = 1e-10;

type GroupState = {
  currentMagnitudes: number[]; // Current magnitude for each circuit element in the group
  brightnessValues: number[]; // Brightness value (0-1) for each light bulb in the group
};

export default class CircuitContextResponses {
  private readonly circuit: Circuit;
  private previousGroupStates: Map<number, GroupState> | null = null;

  public constructor( circuit: Circuit ) {
    this.circuit = circuit;
  }

  /**
   * Capture the current circuit state before a change. Call this at the start of an interaction.
   */
  public captureState(): void {
    this.previousGroupStates = this.getCurrentGroupStates();
  }

  /**
   * Clear the captured state after processing.
   */
  public clearState(): void {
    this.previousGroupStates = null;
  }

  /**
   * Get current state for all groups.
   */
  private getCurrentGroupStates(): Map<number, GroupState> {
    const groups = this.circuit.getGroups();
    const multiElementGroups = groups.filter( group => group.circuitElements.length > 1 );
    const stateMap = new Map<number, GroupState>();

    multiElementGroups.forEach( ( group, index ) => {
      stateMap.set( index + 1, this.getGroupState( group ) );
    } );

    return stateMap;
  }

  /**
   * Get the state for a single group.
   */
  private getGroupState( group: CircuitGroup ): GroupState {
    const currentMagnitudes = group.circuitElements.map(
      element => Math.abs( element.currentProperty.value )
    );

    const lightBulbs = group.circuitElements.filter( ( element ): element is LightBulb => element instanceof LightBulb );
    const brightnessValues = lightBulbs.map( bulb => this.computeLightBulbBrightness( bulb ) );

    return {
      currentMagnitudes: currentMagnitudes,
      brightnessValues: brightnessValues
    };
  }

  /**
   * Compute normalized brightness (0-1) for a light bulb.
   */
  private computeLightBulbBrightness( lightBulb: LightBulb ): number {
    const current = lightBulb.currentProperty.value;
    const resistance = lightBulb.resistanceProperty.value;
    const power = Math.abs( current * current * resistance );
    const numerator = Math.log( 1 + power * LIGHT_BULB_BRIGHTNESS_MULTIPLIER );
    const denominator = Math.log( 1 + LIGHT_BULB_MAXIMUM_POWER * LIGHT_BULB_BRIGHTNESS_MULTIPLIER );
    return clamp( denominator === 0 ? 0 : numerator / denominator, 0, 1 );
  }

  /**
   * Called by slider's createContextResponseAlert.
   * Returns null for no announcement, or the context response string.
   */
  public createValueChangeResponse( circuitElement: CircuitElement ): string | null {
    // Get the group index for this element
    const groupIndex = CircuitDescriptionUtils.getGroupIndex( this.circuit, circuitElement );

    // CASE 1: Disconnected element (single-element group) - no response
    if ( groupIndex === null ) {
      return null;
    }

    // Get the group and its current state
    const groups = this.circuit.getGroups();
    const multiElementGroups = groups.filter( group => group.circuitElements.length > 1 );
    const group = multiElementGroups[ groupIndex - 1 ];

    if ( !group ) {
      return null;
    }

    const currentState = this.getGroupState( group );
    const previousState = this.previousGroupStates?.get( groupIndex );

    // If we don't have previous state, we can't compare
    if ( !previousState ) {
      return null;
    }

    const currentChange = this.analyzeCurrentChange( previousState.currentMagnitudes, currentState.currentMagnitudes );
    const brightnessChange = this.analyzeBrightnessChange( previousState.brightnessValues, currentState.brightnessValues );

    // Check if there are light bulbs in the group
    const hasLightBulbs = currentState.brightnessValues.length > 0;

    // CASE 2: Connected but no changes
    if ( !currentChange.hasChange && !brightnessChange.hasChange ) {
      return CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.noChangesInGroup.format( {
        groupIndex: groupIndex,
        hasLightBulbs: hasLightBulbs ? 'true' : 'false'
      } );
    }

    // CASE 3: Connected with changes - build response
    const parts: string[] = [];

    if ( currentChange.hasChange ) {
      parts.push( CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.currentChangePhrase.format( {
        scope: currentChange.scope,
        direction: currentChange.direction,
        groupIndex: groupIndex
      } ) );
    }

    if ( brightnessChange.hasChange ) {
      parts.push( CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.lightBulbChangePhrase.format( {
        scope: brightnessChange.scope,
        direction: brightnessChange.direction
      } ) );
    }

    return parts.join( ' ' );
  }

  /**
   * Analyze how current has changed between two states.
   * Uses a very small tolerance to detect any real change.
   */
  private analyzeCurrentChange(
    oldCurrents: number[],
    newCurrents: number[]
  ): { hasChange: boolean; scope: 'some' | 'all'; direction: 'increased' | 'decreased' | 'changed' } {

    // Count how many elements had current changes
    let increasedCount = 0;
    let decreasedCount = 0;
    let changedCount = 0;

    const count = Math.min( oldCurrents.length, newCurrents.length );
    for ( let i = 0; i < count; i++ ) {
      const diff = newCurrents[ i ] - oldCurrents[ i ];
      if ( Math.abs( diff ) > VALUE_EQUALITY_TOLERANCE ) {
        changedCount++;
        if ( diff > 0 ) {
          increasedCount++;
        }
        else {
          decreasedCount++;
        }
      }
    }

    if ( changedCount === 0 ) {
      return { hasChange: false, scope: 'all', direction: 'changed' };
    }

    const scope: 'some' | 'all' = changedCount === count ? 'all' : 'some';

    // Determine direction
    let direction: 'increased' | 'decreased' | 'changed';
    if ( increasedCount > 0 && decreasedCount === 0 ) {
      direction = 'increased';
    }
    else if ( decreasedCount > 0 && increasedCount === 0 ) {
      direction = 'decreased';
    }
    else {
      direction = 'changed';
    }

    return { hasChange: true, scope: scope, direction: direction };
  }

  /**
   * Analyze how light bulb brightness has changed between two states.
   * Uses actual brightness values (0-1) to detect any change.
   */
  private analyzeBrightnessChange(
    oldValues: number[],
    newValues: number[]
  ): { hasChange: boolean; scope: 'some' | 'all'; direction: 'brighter' | 'dimmer' | 'changed' } {

    if ( oldValues.length === 0 || newValues.length === 0 ) {
      return { hasChange: false, scope: 'all', direction: 'changed' };
    }

    let brighterCount = 0;
    let dimmerCount = 0;
    let changedCount = 0;

    const count = Math.min( oldValues.length, newValues.length );
    for ( let i = 0; i < count; i++ ) {
      const diff = newValues[ i ] - oldValues[ i ];
      if ( Math.abs( diff ) > VALUE_EQUALITY_TOLERANCE ) {
        changedCount++;
        if ( diff > 0 ) {
          brighterCount++;
        }
        else {
          dimmerCount++;
        }
      }
    }

    if ( changedCount === 0 ) {
      return { hasChange: false, scope: 'all', direction: 'changed' };
    }

    const scope: 'some' | 'all' = changedCount === count ? 'all' : 'some';

    // Determine direction
    let direction: 'brighter' | 'dimmer' | 'changed';
    if ( brighterCount > 0 && dimmerCount === 0 ) {
      direction = 'brighter';
    }
    else if ( dimmerCount > 0 && brighterCount === 0 ) {
      direction = 'dimmer';
    }
    else {
      direction = 'changed';
    }

    return { hasChange: true, scope: scope, direction: direction };
  }

  /**
   * Create a response for when vertices are connected.
   */
  public createConnectionResponse( targetVertex: Vertex, oldVertex: Vertex ): string | null {
    // Get the elements connected to each vertex before the merge
    const targetElements = this.circuit.getNeighborCircuitElements( targetVertex );

    // Build element descriptions
    const element1Description = this.getVertexElementDescription( targetVertex, targetElements );
    const element2Description = this.getVertexElementDescription( oldVertex, [] );

    if ( !element1Description || !element2Description ) {
      return null;
    }

    // Check if current is now flowing in the connected group
    const groupIndex = this.findGroupIndexForVertex( targetVertex );
    const currentPhrase = this.buildCurrentPhraseIfFlowing( groupIndex );

    if ( currentPhrase ) {
      return CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.vertexConnectedWithCurrent.format( {
        element1: element1Description,
        element2: element2Description,
        currentPhrase: currentPhrase
      } );
    }

    return CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.vertexConnectedSimple.format( {
      element1: element1Description,
      element2: element2Description
    } );
  }

  /**
   * Get a description for a vertex based on its connected elements.
   */
  private getVertexElementDescription( vertex: Vertex, elements: CircuitElement[] ): string | null {
    if ( elements.length === 0 ) {
      // Get elements connected to this vertex
      const connectedElements = this.circuit.getNeighborCircuitElements( vertex );
      if ( connectedElements.length === 0 ) {
        return null;
      }
      elements = connectedElements;
    }

    // Use the first element for description
    const element = elements[ 0 ];
    const position = CircuitDescriptionUtils.getElementPosition( this.circuit, element );
    const briefName = CircuitDescriptionUtils.formatCircuitElementBriefName( element, position );

    return CircuitDescriptionUtils.formatTerminalDescription( vertex, element, briefName );
  }

  /**
   * Find the group index for a vertex.
   */
  private findGroupIndexForVertex( vertex: Vertex ): number | null {
    const elements = this.circuit.getNeighborCircuitElements( vertex );
    if ( elements.length === 0 ) {
      return null;
    }
    return CircuitDescriptionUtils.getGroupIndex( this.circuit, elements[ 0 ] );
  }

  /**
   * Build a current phrase if current is flowing in the group.
   */
  private buildCurrentPhraseIfFlowing( groupIndex: number | null ): string | null {
    if ( groupIndex === null ) {
      return null;
    }

    const groups = this.circuit.getGroups();
    const multiElementGroups = groups.filter( group => group.circuitElements.length > 1 );
    const group = multiElementGroups[ groupIndex - 1 ];

    if ( !group ) {
      return null;
    }

    // Check if any element in the group has current flowing
    const hasCurrentFlowing = group.circuitElements.some(
      element => Math.abs( element.currentProperty.value ) > CURRENT_THRESHOLD
    );

    if ( !hasCurrentFlowing ) {
      return null;
    }

    // Current is flowing - return a simple phrase
    return CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.currentChangePhrase.format( {
      scope: 'all',
      direction: 'changed',
      groupIndex: groupIndex
    } );
  }
}

circuitConstructionKitCommon.register( 'CircuitContextResponses', CircuitContextResponses );
