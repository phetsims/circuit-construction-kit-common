# Spice Integration: Next Steps

This document outlines how to extend the Spice (Ngspice WASM) integration beyond the current DC-only implementation to support reactive components and special elements.

## Current State (Completed)

- DC circuits with batteries and resistors working
- Async buffered solver pattern in `SpiceSolverManager`
- Query parameter `?solver=spice` (default) vs `?solver=phet`
- Sign conventions verified and working
- Maps stored with cached solution for correct element lookup

## Phase 2: Capacitors

### SPICE Representation
```
C1 <node1> <node2> <capacitance>
```

### Implementation Approach

1. **Add capacitors to netlist generation** in `SpiceAdapter.generateTransientNetlist()`:
   ```typescript
   for ( const capacitor of this.capacitors ) {
     lines.push( `C${i} ${capacitor.nodeId0} ${capacitor.nodeId1} ${capacitor.capacitance}` );
   }
   ```

2. **Set initial conditions**: SPICE supports `.IC V(node)=value` to set initial voltage across capacitor. We can derive this from the capacitor's current charge state.

3. **Transient analysis timing**: Currently using `.tran 1m 10m`. For capacitors:
   - Step size should be small enough to capture RC time constant
   - Simulation time should be long enough to show charging/discharging
   - May need adaptive timing based on circuit components

4. **Result extraction**: Continue using last value for "current state" display, but the full transient data could enable:
   - Animated charging curves
   - Oscilloscope-style display

### Challenges
- PhET's current approach uses companion models (resistor approximation per timestep)
- Spice handles the differential equations natively
- Need to sync PhET's `dt` stepping with SPICE transient time

## Phase 3: Inductors

### SPICE Representation
```
L1 <node1> <node2> <inductance>
```

### Implementation Approach

Similar to capacitors:
1. Add to netlist with inductance value
2. Set initial current via `.IC I(L1)=value`
3. SPICE handles L*di/dt natively

### Challenges
- Initial current state needs to be tracked
- L-R time constants may require different simulation parameters than R-C

## Phase 4: AC Sources

### SPICE Representation
```
V1 <n+> <n-> SIN(<offset> <amplitude> <frequency> [delay] [damping])
V1 <n+> <n-> AC <magnitude> [phase]
```

### Implementation Approach

1. **For AC analysis** (frequency domain): Use `.AC` analysis
2. **For time-domain AC**: Use `SIN` source with `.TRAN`

PhET's AC source already has `frequency` and `amplitude` properties that map directly.

### Challenges
- Continuous animation requires ongoing transient simulation
- May need to run simulation ahead of display time
- Phase relationships between multiple AC sources

## Phase 5: Nonlinear Elements

### Light Bulbs (Temperature-Dependent Resistance)

Current PhET approach: Iterative solver that updates resistance based on power dissipation.

**Option A: Behavioral Resistor**
```
R1 <n1> <n2> R='expression'
```
Ngspice supports behavioral modeling, but syntax compatibility with Spice needs verification.

**Option B: Iterative Approach**
1. Solve with current resistance
2. Calculate power dissipation
3. Update resistance based on temperature model
4. Re-solve until convergence

This mirrors PhET's current approach and may be simpler to implement.

### Fuses

Fuses have state: intact or blown.

**Implementation:**
- Intact: Model as small resistance
- Blown: Model as open circuit (remove from netlist or use very high resistance)
- Track cumulative current to determine blow threshold

The state transition is handled by PhET logic, not SPICE.

### Switches

Already working - modeled as:
- Closed: Small resistance (included in netlist)
- Open: Not traversible (excluded from netlist)

## Phase 6: Special Components

### Series Ammeter
- Zero resistance (use minimum resistance ~1e-9)
- Already working in current implementation

### Voltmeter (Parallel)
- Very high resistance probe
- Doesn't affect circuit significantly
- May not need SPICE modeling at all

### Dogs, Dollar Bills, etc. (CCK easter eggs)
- Treated as resistors with specific resistance values
- Should work with current implementation

## Architecture Considerations

### Simulation Timing

Current buffered approach works for DC because solutions converge instantly. For transient analysis:

**Option A: Continuous Background Simulation**
- Run SPICE simulation continuously in background
- Buffer results for smooth playback
- Allows pause/resume without losing state

**Option B: Per-Frame Transient Steps**
- Each frame requests simulation from t to t+dt
- SPICE maintains internal state
- More tightly coupled to PhET's stepping

**Option C: Hybrid**
- DC portions use instant solve
- Transient portions (capacitor charging) use time-stepped simulation
- Switch modes based on circuit composition

### State Synchronization

For reactive components, SPICE internal state must match PhET's displayed state:
- Capacitor voltage ↔ displayed charge
- Inductor current ↔ displayed magnetic field

May need bidirectional sync when user manipulates components.

### Performance

Current WASM-based Spice is fast for simple circuits. Monitor:
- Solve time vs circuit complexity
- Memory usage for long transient simulations
- Impact of increased netlist size

Consider circuit complexity limits or solver timeout.

## Testing Strategy

1. **Unit tests**: Extend `SpiceAdapterTests.ts` for each new component type
2. **Comparison tests**: Run same circuit with `?solver=phet` and `?solver=spice`, compare results
3. **Transient validation**: Compare capacitor charging curves against analytical solutions
4. **Edge cases**: Open circuits, short circuits, zero-value components

## File Checklist

| File | Changes Needed |
|------|----------------|
| `SpiceAdapter.ts` | Add capacitor/inductor netlist generation |
| `SpiceSolverManager.ts` | Handle transient state, timing parameters |
| `LinearTransientAnalysis.ts` | Route reactive components to Spice |
| `LTACapacitor.ts` | May need modification or bypass |
| `LTAInductor.ts` | May need modification or bypass |
| `CCKCQueryParameters.ts` | Possibly add solver tuning parameters |

## Recommended Order

1. **Capacitors** - Most common reactive component, well-understood behavior
2. **Inductors** - Similar implementation pattern to capacitors
3. **AC sources** - Enables full AC circuit analysis
4. **Light bulbs** - Requires iterative solving, more complex
5. **Fuses** - State machine logic, relatively simple

## Success Criteria

- All existing PhET circuit behaviors reproduced with Spice
- Performance equal or better than current MNA solver
- Transient simulations show physically accurate dynamics
- Seamless fallback to PhET solver via query parameter
