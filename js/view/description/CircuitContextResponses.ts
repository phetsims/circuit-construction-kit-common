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
   * Detects 'stopped' as a special case when current was flowing and is now zero.
   */
  private analyzeCurrentChange(
    oldCurrents: number[],
    newCurrents: number[]
  ): { hasChange: boolean; scope: 'some' | 'all'; direction: 'increased' | 'decreased' | 'changed' | 'stopped' } {

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

    // Check if current has stopped: was flowing before, now all below threshold
    const wasFlowing = oldCurrents.some( current => current > CURRENT_THRESHOLD );
    const nowStopped = newCurrents.every( current => current <= CURRENT_THRESHOLD );

    // Determine direction
    let direction: 'increased' | 'decreased' | 'changed' | 'stopped';
    if ( wasFlowing && nowStopped ) {
      direction = 'stopped';
    }
    else if ( increasedCount > 0 && decreasedCount === 0 ) {
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
   * @param targetVertex - The vertex that remains after the merge
   * @param oldVertex - The vertex that was removed (already disposed when this is called)
   * @param oldVertexElements - The elements that were connected to oldVertex BEFORE the merge
   */
  public createConnectionResponse(
    targetVertex: Vertex,
    oldVertex: Vertex,
    oldVertexElements: CircuitElement[]
  ): string | null {
    // Get elements still connected to targetVertex (excludes the ones that came from oldVertex)
    // Note: After merge, targetVertex has ALL elements, so we need to exclude oldVertexElements
    const allTargetElements = this.circuit.getNeighborCircuitElements( targetVertex );
    const originalTargetElements = allTargetElements.filter( e => !oldVertexElements.includes( e ) );

    // Build element descriptions
    // element1: from the original target vertex
    // element2: from the old vertex (now moved to target)
    const element1Description = this.getElementDescriptionFromList( targetVertex, originalTargetElements );
    const element2Description = this.getElementDescriptionFromList( oldVertex, oldVertexElements );

    if ( !element1Description || !element2Description ) {
      return null;
    }

    // Only include current information if "Show Current" is checked
    if ( this.circuit.showCurrentProperty.value ) {
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
    }

    return CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.vertexConnectedSimple.format( {
      element1: element1Description,
      element2: element2Description
    } );
  }

  /**
   * Get description for a vertex using a provided list of elements.
   */
  private getElementDescriptionFromList( vertex: Vertex, elements: CircuitElement[] ): string | null {
    if ( elements.length === 0 ) {
      return null;
    }

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

  /**
   * Create a response for when a switch is opened or closed.
   * @param switchElement - The switch that was toggled
   * @param isClosed - The new state of the switch (true = closed, false = open)
   */
  public createSwitchToggleResponse( switchElement: CircuitElement, isClosed: boolean ): string | null {
    // Get the group index for this switch
    const groupIndex = CircuitDescriptionUtils.getGroupIndex( this.circuit, switchElement );

    // If disconnected (single-element group), just announce the state change
    if ( groupIndex === null ) {
      return isClosed ?
             CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.switchClosedNoChangeStringProperty.value :
             CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.switchOpenedNoChangeStringProperty.value;
    }

    // Get the group and analyze current changes
    const groups = this.circuit.getGroups();
    const multiElementGroups = groups.filter( group => group.circuitElements.length > 1 );
    const group = multiElementGroups[ groupIndex - 1 ];

    if ( !group ) {
      return isClosed ?
             CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.switchClosedNoChangeStringProperty.value :
             CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.switchOpenedNoChangeStringProperty.value;
    }

    const currentState = this.getGroupState( group );
    const previousState = this.previousGroupStates?.get( groupIndex );

    // Build the current phrase based on what changed
    let currentPhrase: string | null = null;

    if ( previousState ) {
      const currentChange = this.analyzeCurrentChange( previousState.currentMagnitudes, currentState.currentMagnitudes );
      const brightnessChange = this.analyzeBrightnessChange( previousState.brightnessValues, currentState.brightnessValues );

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

      if ( parts.length > 0 ) {
        currentPhrase = parts.join( ' ' );
      }
    }

    // Return appropriate response based on whether there were current/brightness changes
    if ( currentPhrase ) {
      return isClosed ?
             CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.switchClosed.format( { currentPhrase: currentPhrase } ) :
             CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.switchOpened.format( { currentPhrase: currentPhrase } );
    }

    return isClosed ?
           CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.switchClosedNoChangeStringProperty.value :
           CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.switchOpenedNoChangeStringProperty.value;
  }

  /**
   * Create a response for when a fuse trips or is repaired.
   * @param fuseElement - The fuse that changed state
   * @param isTripped - The new state of the fuse (true = tripped/blown, false = repaired)
   */
  public createFuseStateChangeResponse( fuseElement: CircuitElement, isTripped: boolean ): string | null {
    // Get the group index for this fuse
    const groupIndex = CircuitDescriptionUtils.getGroupIndex( this.circuit, fuseElement );

    // If disconnected (single-element group), just announce the state change
    if ( groupIndex === null ) {
      return isTripped ?
             CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.fuseTrippedNoChangeStringProperty.value :
             CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.fuseRepairedNoChangeStringProperty.value;
    }

    // Get the group and analyze current changes
    const groups = this.circuit.getGroups();
    const multiElementGroups = groups.filter( group => group.circuitElements.length > 1 );
    const group = multiElementGroups[ groupIndex - 1 ];

    if ( !group ) {
      return isTripped ?
             CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.fuseTrippedNoChangeStringProperty.value :
             CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.fuseRepairedNoChangeStringProperty.value;
    }

    const currentState = this.getGroupState( group );
    const previousState = this.previousGroupStates?.get( groupIndex );

    // Build the current phrase based on what changed
    let currentPhrase: string | null = null;

    if ( previousState ) {
      const currentChange = this.analyzeCurrentChange( previousState.currentMagnitudes, currentState.currentMagnitudes );
      const brightnessChange = this.analyzeBrightnessChange( previousState.brightnessValues, currentState.brightnessValues );

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

      if ( parts.length > 0 ) {
        currentPhrase = parts.join( ' ' );
      }
    }

    // Return appropriate response based on whether there were current/brightness changes
    if ( currentPhrase ) {
      return isTripped ?
             CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.fuseTripped.format( { currentPhrase: currentPhrase } ) :
             CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.fuseRepaired.format( { currentPhrase: currentPhrase } );
    }

    return isTripped ?
           CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.fuseTrippedNoChangeStringProperty.value :
           CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.fuseRepairedNoChangeStringProperty.value;
  }

  /**
   * Create a response for when a battery is reversed.
   * @param batteryElement - The battery that was reversed
   */
  public createBatteryReversedResponse( batteryElement: CircuitElement ): string | null {
    // Get the group index for this battery
    const groupIndex = CircuitDescriptionUtils.getGroupIndex( this.circuit, batteryElement );

    // If disconnected (single-element group), just announce the state change
    if ( groupIndex === null ) {
      return CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.batteryReversedNoChangeStringProperty.value;
    }

    // Get the group and analyze current changes
    const groups = this.circuit.getGroups();
    const multiElementGroups = groups.filter( group => group.circuitElements.length > 1 );
    const group = multiElementGroups[ groupIndex - 1 ];

    if ( !group ) {
      return CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.batteryReversedNoChangeStringProperty.value;
    }

    const currentState = this.getGroupState( group );
    const previousState = this.previousGroupStates?.get( groupIndex );

    // Build the current phrase based on what changed
    let currentPhrase: string | null = null;

    if ( previousState ) {
      const currentChange = this.analyzeCurrentChange( previousState.currentMagnitudes, currentState.currentMagnitudes );
      const brightnessChange = this.analyzeBrightnessChange( previousState.brightnessValues, currentState.brightnessValues );

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

      if ( parts.length > 0 ) {
        currentPhrase = parts.join( ' ' );
      }
    }

    // Return appropriate response based on whether there were current/brightness changes
    if ( currentPhrase ) {
      return CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.batteryReversed.format( { currentPhrase: currentPhrase } );
    }

    return CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.batteryReversedNoChangeStringProperty.value;
  }

  /**
   * Create a response for when vertices are disconnected (split).
   * @param disconnectedElements - The circuit elements that were connected to the split vertex
   * @param splitVertex - The vertex that was split
   */
  public createDisconnectionResponse( disconnectedElements: CircuitElement[], splitVertex: Vertex ): string | null {
    if ( disconnectedElements.length === 0 ) {
      return null;
    }

    // Build descriptions for each disconnected element
    const elementDescriptions: string[] = [];
    for ( const element of disconnectedElements ) {
      const position = CircuitDescriptionUtils.getElementPosition( this.circuit, element );
      const briefName = CircuitDescriptionUtils.formatCircuitElementBriefName( element, position );

      // Determine which terminal was at the split vertex
      const terminalDescription = CircuitDescriptionUtils.formatTerminalDescription( splitVertex, element, briefName );
      elementDescriptions.push( terminalDescription );
    }

    const elementList = elementDescriptions.join( ', ' );

    // Check if any of the disconnected elements were in a multi-element group
    // Use the first element to find the group (they were all in the same group before split)
    const groupIndex = CircuitDescriptionUtils.getGroupIndex( this.circuit, disconnectedElements[ 0 ] );

    // If no group (all now disconnected), just announce the disconnection
    if ( groupIndex === null ) {
      return CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.vertexDisconnectedNoChange.format( {
        elementList: elementList
      } );
    }

    // Get the group and analyze current changes
    const groups = this.circuit.getGroups();
    const multiElementGroups = groups.filter( group => group.circuitElements.length > 1 );
    const group = multiElementGroups[ groupIndex - 1 ];

    if ( !group ) {
      return CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.vertexDisconnectedNoChange.format( {
        elementList: elementList
      } );
    }

    const currentState = this.getGroupState( group );
    const previousState = this.previousGroupStates?.get( groupIndex );

    // Build the current phrase based on what changed
    let currentPhrase: string | null = null;

    if ( previousState ) {
      const currentChange = this.analyzeCurrentChange( previousState.currentMagnitudes, currentState.currentMagnitudes );
      const brightnessChange = this.analyzeBrightnessChange( previousState.brightnessValues, currentState.brightnessValues );

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

      if ( parts.length > 0 ) {
        currentPhrase = parts.join( ' ' );
      }
    }

    // Return appropriate response based on whether there were current/brightness changes
    if ( currentPhrase ) {
      return CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.vertexDisconnected.format( {
        elementList: elementList,
        currentPhrase: currentPhrase
      } );
    }

    return CircuitConstructionKitCommonFluent.a11y.circuitContextResponses.vertexDisconnectedNoChange.format( {
      elementList: elementList
    } );
  }
}

circuitConstructionKitCommon.register( 'CircuitContextResponses', CircuitContextResponses );
