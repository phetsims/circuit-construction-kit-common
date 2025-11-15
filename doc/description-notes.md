``
## Context Response Snapshotting – Design Notes

### Goals

- Capture the exact electrical/structural state of the circuit *before* user changes (vertex joins/splits, value edits, deletions) so that the accessibility layer can describe what changed after the solver runs.
- Emit a single, aggregated narration per step (e.g., “Connected: wire, resistor. Current changed to 0.35 amps.”) so PDOM announcements remain concise and timely.
- Keep `Circuit.ts` focused on simulation responsibilities by moving context logic into a dedicated helper (`CircuitContextStateTracker`).

### Implementation Overview

1. **`CircuitContextStateTracker`**
   - Lives in `js/model/CircuitContextStateTracker.ts`, owns snapshot + string selection.
   - Listens for circuit-element additions/removals to register property observers (battery voltage, resistor/light-bulb resistance) and track disposals.
   - Provides API hooks (`handleVertexMerged`, `handleVertexSplit`, `handleElementRemoved`, `handleStepCompleted`) that `Circuit` calls whenever topology actions occur.
   - On snapshot trigger, records current magnitude, voltages/resistances, light-bulb brightness states, and vertex connection counts.
   - After the solver finishes (`handleStepCompleted`), diffs the old vs new data to determine:``
     - Connected element labels (“Connected: wire, light bulb, resistor”).
     - Light-bulb brightness transitions.
     - Component value edits with before/after formatting.
     - Global current flow messaging (single magnitude, different speeds, or stopped).
     - Element deletions (“Battery removed.”)
   - Emits a combined sentence via `contextAnnouncementEmitter`, which `CircuitNode` forwards to `addAccessibleContextResponse`.

2. **`Circuit` integration**
   - On element add/remove, call tracker hooks instead of keeping inline state.
   - Before connect/split operations, notify the tracker so it can capture pre-change state.
   - After `step`, call `contextStateTracker.handleStepCompleted()` to flush announcements.
   - Expose the tracker’s emitter as `circuitContextAnnouncementEmitter` to keep the view unchanged.

3. **Strings**
   - Added Fluent definitions for connected-elements lines, current-change sentences, element removal, etc., so future locales get the right phrasing automatically.

### Next Steps / Future Enhancements

1. **Enumerating duplicate element types**
   - Today the tracker deduplicates element types, so “wire, wire, battery” is collapsed to “wire, battery”.
   - Enhancement: include counts (or repeat the label) so the context response can say “Connected: wire, wire, battery” or even “Connected: two wires, one battery.”
   - Implementation sketch: when building `connectedElements`, keep the raw array and either (a) repeat labels, or (b) map to `{ label, count }` with plural-aware strings.

2. **Surface multi-element topologies**
   - We currently only list element types; later we may want to mention specific circuits or branches (e.g., “Connected: wire between battery and resistor”).
   - This would require consulting positional and naming info from `CircuitDescription` or the view hierarchy; outline the heuristics before coding.

3. **Group-aware announcements**
   - `CircuitDescription.ts` assigns “groups” (connected components shown in the PDOM). We want to align context responses with those group indices:
     - When current starts/stops, say “Current started flowing in Group 1.”
     - If nothing changed elsewhere, optionally mention “Other groups unchanged.”
   - Potential approach:
     - Expose group assignment logic (or factor it into a shared utility) so the tracker can stamp each `CircuitElement` with its group index during snapshot.
     - Store the group index on the announcement state (and possibly on the elements themselves) to reference later.
     - When two previously separate groups merge, detect it and emit “Groups 1 and 3 joined.”
   - Requires coordination with `CircuitDescription` to ensure numbering stays consistent (perhaps by sharing a method that computes group IDs from the same algorithm).

4. **Group merge announcements**
   - Similar to vertex merges but at the group level: when connecting elements causes two PDOM groups to form a single circuit, announce “Group 2 joined with Group 4.”
   - Implementation idea: store a map of “group representatives” during snapshot; after solving, re-run grouping and detect merges/splits before announcing.

> **Important:** All items above are documentation for future work only. No code changes were made for them yet.


----------------------------------------------------------------------------- //
Codex Ideas
----------------------------------------------------------------------------- //
1. Group-aware announcements
   - Persist each circuit group's index alongside its Node so we can quickly announce "Current flowing in Group 2"
     and highlight differences between groups when the user navigates with a screen reader.
   - Consider emitting a short summary whenever groups merge/split ("Group 1 now includes the battery and light bulb").
2. Spatial orientation cues
   - Provide optional verbal hints about where a group lies in the construction area (e.g., "Group 3 is near the top-right")
     to help blind users mentally map the workspace. Could leverage vertex positions and quantize into compass directions.
3. Vertex navigation shortcuts
   - Add hidden controls or ARIA landmarks that let screen-reader users jump between junctions and component groups
     without traversing every element sequentially. This would reduce verbosity and give more direct control.
4Interaction hints for edits
   - When a component becomes focusable (like an edit panel opening), announce the available edit affordances ("Use arrow keys to increase resistance")
     so non-visual users know what manipulations exist without exploring multiple controls blindly.
