# EEcircuit Engine Integration for PhET

This document describes how to integrate the eecircuit-engine npm package into PhET's Circuit Construction Kit simulations.

## Overview

EEcircuit-engine is an Ngspice circuit simulator compiled to WebAssembly. It provides SPICE-compatible circuit simulation in the browser. The engine is ~18MB because the WASM binary is embedded as base64 directly in the JavaScript bundle.

## The Problem

PhET's build system doesn't support ES modules for third-party libraries on the frontend. Instead, PhET uses "preload" scripts that attach globals to `window`. The eecircuit-engine package is distributed as an ES module (`.mjs`) with:

1. `import.meta.url` references (not allowed outside ES modules)
2. `export` statements (syntax error in non-module scripts)
3. `new URL()` constructor calls that use `import.meta.url` as a base URL

These features cause errors when the file is loaded as a regular script.

## Solution Steps

### 1. Copy the engine to sherpa

Copy the eecircuit-engine bundle to PhET's third-party library location:

```bash
cp node_modules/eecircuit-engine/dist/eecircuit-engine.mjs \
   sherpa/lib/eecircuit-engine-1.5.6.js
```

### 2. Add a global export

The engine's `Simulation` class is internally named `sC`. Add a global export at the end of the file:

```javascript
// PhET global export
window.EEcircuit = { Simulation: sC };
```

### 3. Remove ES module syntax

Replace `import.meta.url` with a placeholder URL (the actual value doesn't matter since the WASM is embedded):

```bash
sed -i '' 's/import\.meta\.url/"https:\/\/localhost\/"/g' sherpa/lib/eecircuit-engine-1.5.6.js
```

Comment out or remove the ES `export` statement at the end of the file.

### 4. Fix the URL constructor calls

The engine uses `new URL("data:application/wasm;base64,...", baseUrl).href` to create a data URL for the embedded WASM. Since data URLs are absolute and don't need a base URL, simplify these to just return the data URL string directly:

- Replace `new URL("data:` with `"data:`
- Replace `", "").href` with `"` (for calls that had `.href`)
- Replace `", "");` with `";` at end of lines (for calls without `.href`)

### 5. Configure PhET to load the preload

In the simulation's `package.json`, add:

```json
"phet": {
  "phetLibs": [
    "circuit-construction-kit-common",
    "twixt",
    "griddle",
    "bamboo",
    "sherpa"
  ],
  "preload": [
    "../sherpa/lib/eecircuit-engine-1.5.6.js"
  ]
}
```

Then regenerate the HTML:

```bash
grunt generate-development-html
```

### 6. Add TypeScript declarations

Create a type declaration file (e.g., `circuit-construction-kit-common/js/EEcircuitTypes.d.ts`) to provide TypeScript support for the global:

```typescript
type ResultType = {
  header: string;
  numVariables: number;
  variableNames: string[];
  numPoints: number;
  dataType: 'real' | 'complex';
  data: Array<{
    name: string;
    type: 'voltage' | 'current' | 'time' | 'frequency' | 'notype';
    values: number[] | Array<{ real: number; img: number }>;
  }>;
};

interface EEcircuitSimulation {
  start: () => Promise<void>;
  setNetList: (input: string) => void;
  runSim: () => Promise<ResultType>;
  getInfo: () => string;
  getInitInfo: () => string;
  getError: () => string[];
  isInitialized: () => boolean;
}

declare global {
  interface Window {
    EEcircuit: {
      Simulation: new () => EEcircuitSimulation;
    };
  }
}

export {};
```

## Usage

```typescript
const sim = new window.EEcircuit.Simulation();
await sim.start();

const netlist = `RC Circuit
v1 1 0 dc 5
r1 1 2 1k
c1 2 0 1u
.tran 0.01m 5m
.end`;

sim.setNetList(netlist);
const result = await sim.runSim();
console.log(result);
```

## Result Format

The `runSim()` method returns an object with:

- `header`: Raw SPICE output header with simulation metadata
- `numVariables`: Number of variables in the output (e.g., 4)
- `variableNames`: Array of variable names (e.g., `['time', 'v(1)', 'v(2)', 'i(v1)']`)
- `numPoints`: Number of data points in the simulation
- `dataType`: Either `'real'` or `'complex'`
- `data`: Array of data objects, each containing `name`, `type`, and `values`

## Files Modified

- `sherpa/lib/eecircuit-engine-1.5.6.js` - Modified engine preload
- `circuit-construction-kit-dc/package.json` - Added preload configuration
- `circuit-construction-kit-common/js/EEcircuitTypes.d.ts` - TypeScript declarations
