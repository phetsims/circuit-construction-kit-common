# Circuit Construction Kit: Common - Model Description

This document is a high-level description of the model used in PhET's _Circuit Construction Kit: Common_ code which is
used in the Circuit Construction Kit simulations.

## Circuit-Solving Model

This simulation uses Kirchoff's laws to determine voltages and currents with the Modified Nodal Analysis strategy. The
currents and voltages throughout the circuit are determined based on the battery voltages and component resistances. See
https://www.swarthmore.edu/NatSci/echeeve1/Ref/mna/MNA2.html for details.

For the AC simulations, we use companion models for the nonlinear circuit elements such as Inductors and Capacitors, as described in DynamicCircuit.js

## Battery Internal Resistance

Batteries are ideal (very low resistance) unless given a custom internal resistance in the 'Lab' screen.

* The minimum internal resistance of a battery is 1E-4 Ohms.

## Wire Resistivity

Wires are constrained to have small but nonzero resistivity to avoid numerical errors or unsolvable circuits. Loops
cannot
be built without wires, hence this constraint guarantees that each loop will have at least some resistance and be
solvable. Wires are ideal (very low resistivity) unless given a custom resisitivity in the 'Lab' screen.

* The minimum wire resistivity is 1E-10 Ohm*meters
* Wire resistance is proportional to wire resistivity as well as the length of the wire

## Household Items

For the purposes of the simulation, we estimate the household item resistances as:

* Coin - 0 Ohms
* Dollar bill - 1,000,000,000 Ohms
* Eraser - 1,000,000,000 Ohms
* Paper clip - 0 Ohms
* Pencil - 25 Ohms

## Ammeters and Voltmeters

The ammeters and voltmeter are ideal, with the following properties:

* Ammeters have zero resistance, and will always have zero voltage across them
* Voltmeters have infinite resistance, and will always have zero current flowing through them