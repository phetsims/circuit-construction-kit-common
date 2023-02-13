The currents and voltage drops throughout the circuit are determined based on the voltage supplies and resistances.
Kirkhoff's laws are applied using the Modified Nodal Analysis strategy.  Please see
https://www.swarthmore.edu/NatSci/echeeve1/Ref/mna/MNA2.html for details.

Wires and batteries are constrained to have nonzero resistance to avoid numerical errors or unsolvable circuits.  Loops cannot
be built without wires, hence this constraint guarantees that each loop will have at least some resistance and be
solvable.

Batteries can be ideal (very low resistance) or have an internal resistance (in the 2nd screen of Circuit Construction Kit: DC).

Insulators such as the dollar bill and eraser are modeled as having a very high resistance.

The ammeters and voltmeter are ideal (no resistance).

We use companion models for the nonlinear circuit elements such as Inductors and Capacitors, as described in DynamicCircuit.js