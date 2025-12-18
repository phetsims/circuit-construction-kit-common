# EEcircuit Multi-Group Solving and Double-Buffer Pattern

This document explains how Circuit Construction Kit handles multiple disconnected circuit groups and asynchronous SPICE solving with EEcircuit.

## The Problem: Disconnected Circuits

SPICE circuit simulators require a single ground reference node (node 0) for each solve. When a circuit has multiple disconnected components (e.g., two separate battery-resistor loops), they cannot share a ground reference. Attempting to solve them together causes "singular matrix" errors.

Example of disconnected components:
```
Loop 1: Battery1 -> Wire -> Resistor1 -> Wire -> Battery1
Loop 2: Battery2 -> Wire -> Resistor2 -> Wire -> Battery2
```

These loops share no vertices, so SPICE cannot establish voltage relationships between them.

## Solution: Per-Group SPICE Solves

We use `circuit.getGroups()` to identify connected components (groups) and solve each one separately:

1. **Find connected components**: `circuit.getGroups()` returns an array of `CircuitGroup` objects, each containing vertices and circuit elements that are electrically connected.

2. **Filter groups with voltage sources**: Groups without voltage sources have no current flow and don't need solving.

3. **Solve each group independently**: Each group gets its own SPICE solve with its own ground reference (the first node in that group becomes node 0).

```typescript
// In LinearTransientAnalysis.solveWithEEcircuit()
const groups = circuit.getGroups();
const groupsWithVoltageSources = groups.filter( group =>
  group.circuitElements.some( element => element instanceof VoltageSource )
);

for ( const group of groupsWithVoltageSources ) {
  this.solveGroup( group, allNonParticipants );
}
```

## The Problem: Async Solving in a Sync World

PhET's `Circuit.step()` method is synchronous, but EEcircuit's SPICE solver is asynchronous (it runs WebAssembly). We cannot block the UI waiting for results.

### Naive Approach (Broken)
```
Frame N:
1. Clear cached results
2. Queue new solves (async)
3. Read cached results → EMPTY! (solves haven't completed yet)
```

This causes flickering or zero current display because results are cleared before new ones are ready.

## Solution: Double-Buffer Pattern

We use two result buffers:
- **`currentResults`**: Stable buffer returned to callers. Contains completed results from the previous batch.
- **`pendingResults`**: Accumulates results from the current batch of solves.

When all solves in a batch complete, we swap: `currentResults = pendingResults`.

### Flow

```
Frame 1:
├─ startNewBatch() → reset counters, clear pendingResults (currentResults preserved)
├─ requestSolveForGroup() × N → queue groups, increment groupsQueuedThisFrame
├─ getAllCachedResults() → return currentResults (empty on first frame)
└─ [async] solves complete → add to pendingResults, when all done: swap buffers

Frame 2:
├─ startNewBatch() → reset counters, clear pendingResults
├─ requestSolveForGroup() × N → queue groups
├─ getAllCachedResults() → return currentResults (Frame 1's completed results!)
└─ [async] solves complete → swap buffers

Frame 3+:
└─ Same pattern: always returning previous frame's completed results
```

### Implementation Details

**`EEcircuitSolverManager`** manages the async solving:

```typescript
// Double-buffer for async results
private currentResults: CachedSolveResult[] = [];
private pendingResults: CachedSolveResult[] = [];

// Track batch completion
private groupsQueuedThisFrame = 0;
private groupsCompletedThisFrame = 0;

public startNewBatch(): void {
  this.pendingGroups = [];
  this.groupsQueuedThisFrame = 0;
  this.groupsCompletedThisFrame = 0;
  this.pendingResults = [];
  // Note: currentResults is NOT cleared - it's still being read
}

public getAllCachedResults(): CachedSolveResult[] {
  return this.currentResults;  // Always return stable buffer
}

private processNextGroup(): void {
  // ... solve async ...
  this.solveAsync( adapter ).then( solution => {
    this.pendingResults.push( { solution, ... } );
    this.groupsCompletedThisFrame++;

    // Check if batch is complete
    if ( this.groupsCompletedThisFrame === this.groupsQueuedThisFrame ) {
      // Swap buffers
      this.currentResults = this.pendingResults;
      this.pendingResults = [];
    }
  });
}
```

## Latency Characteristics

- **First frame**: No results (currentResults is empty). Circuit shows 0 current.
- **Subsequent frames**: Results are from the previous frame's solves.
- **Latency**: At most 1 frame (~16ms at 60fps). Imperceptible for DC circuits.

For rapidly changing circuits (e.g., dragging a slider), there's a 1-frame delay before the display updates. This is acceptable for the simulation's use case.

## Pre-validation: Complete Path Check

Before sending a circuit to SPICE, we validate that it forms a complete loop. Open circuits (e.g., battery with only one terminal connected) cause SPICE singularity errors.

```typescript
private hasCompletePath( batteries: MNABattery[], resistors: MNAResistor[] ): boolean {
  // Build adjacency graph
  // For each battery, BFS to find if there's a path from one terminal
  // back to the other through other elements (not the battery itself)
  // Return true if at least one battery has a complete loop
}
```

This prevents sending unsolvable circuits to SPICE and avoids crashes.

## Files Involved

- **`EEcircuitSolverManager.ts`**: Singleton managing async solves, double-buffering, and pre-validation
- **`LinearTransientAnalysis.ts`**: Orchestrates per-group solving and applies results to circuit elements
- **`EECircuitAdapter.ts`**: Converts PhET circuit model to SPICE netlist and parses results back
- **`Circuit.ts`**: Provides `getGroups()` for connected component detection

## Debugging

Console logs are included for debugging (can be removed in production):
```
[EEcircuit] processNextGroup: isProcessing=false, pendingGroups=1, queued=1, completed=0
[EEcircuit] Starting async solve...
[EEcircuit] Solve completed, adding to pendingResults
[EEcircuit] Batch complete! Swapping buffers: 1 results
[EEcircuit] getAllCachedResults: 1 current, 0 pending, isProcessing=false
```
