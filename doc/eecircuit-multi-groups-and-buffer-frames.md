# Spice Multi-Group Solving and Callback Pattern

This document explains how Circuit Construction Kit handles multiple disconnected circuit groups and asynchronous SPICE solving with Spice.

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
// In LinearTransientAnalysis.solveWithSpice()
const groups = circuit.getGroups();
const groupsWithVoltageSources = groups.filter( group =>
  group.circuitElements.some( element => element instanceof VoltageSource )
);

for ( const group of groupsWithVoltageSources ) {
  this.solveGroup( circuit, group );
}
```

## Async Pattern: Callback-Based Direct Application

Since `Circuit.step()` is synchronous but Spice's SPICE solver is asynchronous, we use a simple callback pattern:

1. **Request solve with callback**: Pass a callback function that will apply results when the solve completes
2. **Queue processing**: Solves are processed sequentially (SPICE limitation)
3. **Direct application**: When each solve completes, its callback immediately applies results to circuit elements

### Flow

```
Frame N:
├─ For each group with voltage source:
│   └─ requestSolve(batteries, resistors, callback)
│       └─ callback captures: circuit, batteryMap, resistorMap, etc.
└─ [async] When solve completes:
    └─ callback(solution) → applies results directly to circuit elements
```

### Implementation

**`SpiceSolverManager`** manages the async solving:

```typescript
public requestSolve(
  batteries: MNABattery[],
  resistors: MNAResistor[],
  onSolved: (solution: MNASolution) => void
): void {
  // Validate circuit has complete loop
  if (!this.hasCompletePath(batteries, resistors)) return;

  // Add to queue
  const adapter = new SpiceAdapter(batteries, resistors);
  this.solveQueue.push({ adapter, onSolved });

  // Process queue
  this.processQueue();
}

private processQueue(): void {
  if (this.isProcessing || this.solveQueue.length === 0) return;

  this.isProcessing = true;
  const { adapter, onSolved } = this.solveQueue.shift()!;

  this.solveAsync(adapter).then(solution => {
    onSolved(solution);  // Apply results via callback
    this.isProcessing = false;
    this.processQueue();  // Process next
  });
}
```

**`LinearTransientAnalysis`** uses the callback to apply results:

```typescript
SpiceSolverManager.instance.requestSolve(
  batteries,
  resistors,
  (solution: MNASolution) => {
    this.applySpiceSolution(circuit, solution, batteryMap, ...);
  }
);
```

## Latency Characteristics

- **First frame**: Results may not be ready yet (solve in progress)
- **Subsequent frames**: Results apply as soon as each solve completes
- **Typical latency**: Depends on SPICE solve time, but usually < 1 frame

For rapidly changing circuits (e.g., dragging a slider), there may be a brief delay before the display updates. This is acceptable for the simulation's use case.

## Pre-validation: Complete Path Check

Before sending a circuit to SPICE, we validate that it forms a complete loop. Open circuits (e.g., battery with only one terminal connected) cause SPICE singularity errors.

```typescript
private hasCompletePath(batteries: MNABattery[], resistors: MNAResistor[]): boolean {
  // Build adjacency graph
  // For each battery, BFS to find if there's a path from one terminal
  // back to the other through other elements (not the battery itself)
  // Return true if at least one battery has a complete loop
}
```

This prevents sending unsolvable circuits to SPICE and avoids crashes.

## Files Involved

- **`SpiceSolverManager.ts`**: Singleton managing async solves with callback queue
- **`LinearTransientAnalysis.ts`**: Orchestrates per-group solving and provides callbacks to apply results
- **`SpiceAdapter.ts`**: Converts PhET circuit model to SPICE netlist and parses results back
- **`Circuit.ts`**: Provides `getGroups()` for connected component detection

## Architecture Summary

| Component | Responsibility |
|-----------|---------------|
| `SpiceSolverManager` | Queue management, async solve execution |
| `LinearTransientAnalysis` | Build MNA elements, provide result callbacks |
| `SpiceAdapter` | Netlist generation, result parsing |
| Callback closure | Captures context, applies results to circuit |
