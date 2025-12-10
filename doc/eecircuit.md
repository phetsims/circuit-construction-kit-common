# Prompt: Integrate EEcircuit into PhET’s Circuit Construction Kit (MVP with State Pivoting)

You are an expert in:
- Web-based physics simulations
- Circuit simulation (SPICE-style, MNA, transient analysis)
- WebAssembly (WASM), JavaScript/TypeScript
- Performance optimization in browser environments

Your task is to help integrate **EEcircuit** into the PhET **Circuit Construction Kit** codebase as a replacement candidate for our in-house Modified Nodal Analysis (MNA) engine.

---

## Background

PhET’s **Circuit Construction Kit** is an interactive, browser-based educational simulation that lets users build circuits and see them behave over time. We do things like:

- Animate **current flow** using moving charge dots through wires.
- Show **charge accumulation** on capacitors.
- Allow users to **edit the circuit while it is running** (adding/removing components, changing values).

Our current in-house circuit solver is a custom MNA implementation and has several issues, especially with:

- Blown fuses / handling of very large instantaneous currents
- Circuits where **total resistance is very close to zero**
- Multiple reactive components (capacitors/inductors) in series
- Numerical stability and edge cases with ideal/near-ideal components

We want to move to an **industry-standard, robust solver** that supports **transient (time-dependent) analysis** and nonlinear components, but still works smoothly in a highly interactive, educational context.

---

## Target Engine: EEcircuit

We want to use this project as the core circuit solver:

- **EEcircuit repository:** https://github.com/eelab-dev/EEcircuit

EEcircuit is a browser-based circuit simulator that uses **Ngspice compiled to WebAssembly** and runs entirely client-side. It already supports SPICE-style netlists and transient analysis. We want to integrate its core functionality into PhET, not necessarily adopt its UI.

---

## Operational Constraints

Please assume the following constraints and requirements:

1. **100% client-side (no server round-trips)**
  - The solver must run entirely in the browser (WASM/JS), including compilation artifacts.
  - No backend computation allowed during simulation.

2. **Performance and Responsiveness**
  - The simulation must feel **continuous and responsive**.
  - We **cannot pause the UI** for long computations when:
    - A component is added/removed
    - A component’s parameters (e.g., resistance, battery voltage) change
  - The solver should be fast enough to run **real-time or near real-time transient analysis** on small-to-medium educational circuits.

3. **Stateful, Time-Dependent Behavior**
  - We show behavior **as a function of time**, not just static solutions:
    - Example: an RC circuit charging over time.
    - Example: current flow animations through wires and components.
  - The solver must support **transient simulation** and expose voltages and currents at each time step (or at least at regular intervals) so we can animate them.

4. **“Pivoting” / State Preservation**
  - **Key requirement:** We need the ability to **“pivot”** the simulation.
  - By “pivot”, we mean:
    - Run a transient simulation up to time `t_now`.
    - **Preserve the internal state** at `t_now` (capacitor voltages, inductor currents, etc.).
    - Change the circuit (e.g., a component value or topology).
    - **Restart or continue** the simulation from **that state**, not from scratch at `t=0`.
  - This is crucial for the PhET UX:
    - **Example scenario:** An RC circuit with a constant battery charges up a capacitor. We show the charge accumulating on the capacitor. When the user changes the battery voltage (or flips a switch), **the accumulated charge remains** and the system evolves from the charged state. It does **not reset** the capacitor back to uncharged.

5. **Download Size / Runtime Constraints**
  - PhET sims are used widely in classrooms, often on lower-end devices and flaky networks.
  - **MVP goal:** Demonstrate that integrating EEcircuit:
    - Does **not** introduce “too many MB” of additional download (we want it reasonably small).
    - Does **not** cause unacceptable startup or runtime overhead.
  - We need to be conscious of:
    - WASM bundle size
    - Any large dependencies
    - Initialization cost

6. **Component Types and Nonlinear Behavior (for future-proofing)**
  - We need to support (or eventually support):
    - Switches
    - Fuses
    - Batteries with internal resistance
    - Wires with internal resistance
    - Realistic light bulbs (possibly nonlinear, temperature-dependent)
    - Capacitors
    - Inductors
    - Diodes and other nonlinear elements (eventually)
  - For the MVP, you can focus on a **subset** (e.g., R, C, L, ideal voltage source with internal resistance), but keep the architecture ready for nonlinear devices.

---

## What We Need You to Do (MVP Scope)

### 1. Understand and Extract EEcircuit’s Core

- Analyze the EEcircuit repo:
  - How it compiles and loads Ngspice into the browser (WASM).
  - How it passes netlists and retrieves simulation results.
  - How it manages transient analysis and time-stepping.
- Identify **modular pieces** we can reuse:
  - WASM module loading
  - API to send a netlist and control simulations
  - API to get voltages/currents over time

### 2. Integrate EEcircuit into a Minimal PhET-like Harness

- Assume a **JavaScript/TypeScript, HTML5** PhET-style environment.
- Create a **minimal test harness** in JS/TS that:
  1. **Loads the EEcircuit/Ngspice WASM** module.
  2. **Creates a simple RC circuit** via a netlist:
    - One battery (with possible internal resistance)
    - One resistor
    - One capacitor
  3. **Runs a transient simulation** and exposes:
    - Capacitor voltage as a function of time
    - Resistor current as a function of time
  4. Provides a way to **sample the current voltage/current** at regular time intervals, so that our UI could animate current flow and capacitor charge.

- Please provide:
  - Clear explanation of how to call into EEcircuit/Ngspice from JS/TS.
  - Example code snippets (TypeScript or ES6) showing:
    - WASM module init
    - Netlist creation
    - Simulation start
    - Retrieving time series data

### 3. Implement “Pivot” / State Preservation for a Simple RC Example

We need a **proof-of-concept implementation** of the “pivot” behavior:

- Scenario (RC circuit):
  1. Start with a battery of voltage `V1`, resistor `R`, capacitor `C`.
  2. Run the transient simulation from `t = 0` to `t = t_now` while:
    - Tracking capacitor voltage and resistor current.
  3. At `t_now`, **change the battery voltage** from `V1` to `V2`.
  4. **Continue the simulation from the existing state**:
    - The capacitor retains the charge it accumulated.
    - The new transient responds to the changed battery.

- Technically, we need a way to:
  - Extract state at `t_now` from EEcircuit/Ngspice (initial conditions for capacitors/inductors).
  - Re-initialize or reconfigure the circuit (e.g., new netlist or parameter change).
  - Re-run transient analysis starting from those initial conditions, not from a blank state.

- Your job:
  - Investigate how EEcircuit/Ngspice can:
    - Save/keep internal state.
    - Accept new initial conditions for capacitors/inductors.
    - Allow parameter changes while reusing or re-deriving state.
  - Propose and implement a **practical method** to achieve this within our constraints, for the RC example:
    - It can be:
      - Re-running a new transient with `.IC` or equivalent initial conditions.
      - Or using some API to modify component values mid-run.
  - Provide concrete example code demonstrating this RC “battery swap” pivot.

### 4. Accuracy and Sanity-Check Tests

- Create **a few simple test circuits** and compare expected behaviors:
  - RC charge and discharge (compare with analytical solution).
  - RL step response.
  - Simple R-only circuit (Ohm’s law).
- You do **not** need a full test framework; small code snippets and explanation are fine.
- The goal is to verify:
  - EEcircuit’s transient results are credible for our educational scenarios.
  - There are no obvious numerical pathologies for these basic cases.

### 5. Size and Performance Evaluation (MVP Level)

- Provide:
  - A rough estimate of:
    - Additional download size for EEcircuit (WASM + JS glue).
  - A qualitative assessment of:
    - Initialization time
    - Runtime performance for small circuits
- You can assume:
  - Typical classroom hardware (Chromebooks, mid-range laptops).
- The goal is to confirm this approach is **feasible** and does not obviously violate our runtime constraints.

---

## Deliverables

Please output:

1. **High-level architecture description**
  - How EEcircuit is integrated into a PhET-style JS/TS codebase.
  - How netlists are generated and sent to the solver.
  - How results are returned and made available to the UI.

2. **Code-level integration plan**
  - Step-by-step instructions for:
    - Cloning/building EEcircuit.
    - Integrating its WASM module into our build system.
    - Initializing and calling the solver from JS/TS.

3. **Concrete example code**
  - Minimal working example showing:
    - RC circuit netlist generation.
    - Running transient simulation.
    - Extracting time series data for voltage/current.
  - Example of the **RC “battery swap” pivot**:
    - Code that runs up to `t_now`, changes the battery, and continues with state preserved.

4. **Notes on current limitations and assumptions**
  - Anything about:
    - What EEcircuit/Ngspice makes easy or hard.
    - Constraints on how often we can pivot.
    - Limitations on circuit complexity for interactive use.

5. **Future Work Section**  
   Draft a **“Future Work” section** that addresses:

  - Replacing PhET’s in-house MNA engine:
    - The long-term plan is to have PhET **output netlists** directly for EEcircuit/Ngspice instead of using the custom solver.
  - Netlist generation:
    - Design how PhET’s internal circuit representation should map to SPICE netlists.
    - Consider supporting:
      - Component parameters
      - Nonlinear devices
      - Switches, fuses, internal resistances, etc.
  - Operating characteristics at `t = t_now`:
    - How we might, in the future, **export the current operating state** (voltages, currents, capacitor charges, inductor currents) from the live simulation as explicit “operating point” data.
    - How that state can be used to:
      - Pivot more complex circuits.
      - Implement undo/redo of circuit changes without losing physical consistency.
  - Extension to more complex and nonlinear components:
    - Plan for adding:
      - Light bulbs with temperature-dependent resistance.
      - Diodes and transistors.
      - Switches and fuses with event-driven behavior (e.g., trip thresholds).
  - Robustness and education-focused constraints:
    - Handling edge cases (near-zero resistance loops, floating nodes) robustly.
    - Ensuring that any numerical “tricks” (small conductances, series resistances) do not confuse educational outcomes.

---

## Style and Format

- Use **clear, technical language** suitable for experienced developers.
- Include code snippets in **JavaScript or TypeScript** where appropriate.
- Organize your answer with headings and subheadings so it can be read as a mini design/implementation document.