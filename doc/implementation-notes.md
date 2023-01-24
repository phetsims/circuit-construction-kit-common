# Circuit Construction Kit Common - implementation notes

This document contains miscellaneous notes related to the implementation of circuit-construction-kit-common. It
supplements the internal (source code) documentation, and (hopefully) provides insight into "big picture" implementation
issues.  The audience for this document is software developers who are familiar with JavaScript and PhET simulation
development (as described in [PhET Development Overview](https://github.com/phetsims/phet-info/blob/master/doc/phet-development-overview.md)).

This repo contains code that is used in the following sims:

* circuit-construction-kit-dc
* circuit-construction-kit-dc-virtual-lab
* circuit-construction-kit-ac
* circuit-construction-kit-ac-virtual-lab
* circuit-construction-kit-black-box-study

First, read [model.md](https://github.com/phetsims/circuit-construction-kit-common/blob/master/doc/model.md), which
provides a high-level description of the simulation model.

## Terminology

This section enumerates types that you'll see used throughout the internal and external documentation. In no particular
order:

* CircuitElement - a model object that can participate in a circuit, such as a Wire, Resistor, Battery, etc.
* FixedCircuitElement - a CircuitElement that cannot be stretched out, such as a Battery or Resistor.  The only
stretchy element is a Wire, so every CircuitElement that is not a Wire is a FixedCircuitElement.
* Vertex - the circuit is organized as a graph, where the edges are CircuitElements, and the vertices are Vertex
instances.  After the circuit is solved for unknown currents, a voltage is assigned to each Vertex.
* Ammeter - this ammeter is a "non-contact" ammeter which can take readings of a current by measuring magnetic fields
(without touching the circuit)
* SeriesAmmeter - this ammeter is a CircuitElement which measures current flowing through it.
* Circuit - this contains the CircuitElements and Vertices as well as logic for solving for the unknown voltages
and currents given the voltages sources and resistances.
* CircuitNode - this displays the Circuit and contains logic for dragging and connecting vertices to each other.
* Resistor -  depicts the normal resistor, the high resistance resistor and the household items, which are treated
as resistors.

## General

This section describes how this simulation uses patterns that are common to most PhET simulations.

**Model-view transform**: Many PhET simulations have a model-view transform that maps between model and view coordinate
frames (see [ModelViewTransform2](https://github.com/phetsims/phetcommon/blob/master/js/view/ModelViewTransform2.js)).
While the CircuitElements are treated as physical objects, the dimensions of the objects have no bearing on the physics
of the circuitry (aside from the resistivity of wires), hence the model and view coordinates are taken as the same, with
the origin at the center of the screen. (If you don't understand that, don't worry about it.).  The layout reflows to
move control panels to the edges to maximize the available play area.

**Query parameters**: Query parameters are used to enable sim-specific features, mainly for debugging and
testing. All such query parameters are documented in
[CCKCQueryParameters](https://github.com/phetsims/circuit-construction-kit-common/blob/master/js/CCKCQueryParameters.js).

**Memory management**: This simulation dynamically creates and disposes many objects (no CircuitElements are preallocated).
This helps in modularity of the code and will provide a straightforward interface for PhET-iO.  However, dispose()
must be properly implemented in all CircuitElements and CircuitElementNodes, and called when items are removed.

## Model
See [model.md](https://github.com/phetsims/circuit-construction-kit-common/blob/master/doc/model.md)

In Circuit.solve, each CircuitElement is converted to a corresponding model element which can be used in the solver which
is implemented in ModifedNodalAnalysisCircuit and ModifiedNodalAnalysisSolution.  ModifiedNodalAnalysis implements
Kirkhoff's Laws for each connected subcircuit, and solves them as a linear algebra problem.  Please see ModifiedNodalAnalysisCircuit.js
for details.

## View

* Each node defines its own lifelike and schematic nodes internally, so nothing needs to be disposed or re-created when
the view type changes.  Hence the "lifelike/schematic" radio buttons are not treated like independent scenes, but
rather a single view property.
* Likewise, ChargeNode can render positive or negative charges, though they are cleared and re-added when the charge view
is changed.
* The CircuitElementNode subtypes like BatteryNode, ResistorNode, etc have the same signature because they are invoked
dynamically from CircuitNode.initializeCircuitElementType.
* View Layering: the CircuitNode shows circuit elements, highlights, solder, and sensors.  Each CircuitElementNode
may have node parts that appear in different layers, such as the highlight and the light bulb socket.  Having the light
bulb socket in another layer makes it possible to show the electrons going "through" the socket (in z-ordering). The
CircuitElementNode constructors populate different layers of the CircuitNode in their constructors and depopulate
in their dispose functions.
* To attain reasonable performance on iPad2, some of the CircuitNode child node layers have been implemented in
WebGL using `renderer:'webgl'`.  This means all of the nodes must be rendered with solid-fill Rectangle (without rounded
corners or gradients), and images.  Node.rasterized is used throughout these view layers to rasterize as
images.
* CircuitElementNumberControl (which appears at the bottom of the screen when a CircuitElement is selected) and
ValueNode.js (which shows a text readout over an item when "values" is checked) use a similar pattern of containing
logic for the different kinds of CircuitElements.  Other ways to solve this may have been:
(1) create subclasses of CircuitElementNumberControl and ValueNode specific to the types
(2) create abstract methods in CircuitElement or FixedCircuitElement that can be called by CircuitElementNumberControl
and ValueNode.
It seems best to isolate the code relevant to each within its file rather than scattering it around, hence there are
type checks in those view classes.  On the downside, when a new element type is added, these files will need to be
updated.

This document was adapted from the [Implementation Notes for Function Builder](https://github.com/phetsims/function-builder/blob/master/doc/implementation-notes.md)

## Unit Tests
This simulation provides 60+ unit tests to ensure accuracy of the model for a variety of circuit topologies, please
test by launching localhost/circuit-construction-kit-common/circuit-construction-kit-common-tests.html

### PhET-iO
In order to filter unwanted items from the studio tree, we use a pattern like:

```ts
    this.addRealBulbsProperty = new BooleanProperty( CCKCQueryParameters.addRealBulbs, {
      tandem: includeLabElements ? tandem.createTandem( 'addRealBulbsProperty' ) : Tandem.OPT_OUT
    } );
```

This gives the simplicity of being able to create and wire up everything eagerly, but excluding sim- or screen-specific 
items as necessary.