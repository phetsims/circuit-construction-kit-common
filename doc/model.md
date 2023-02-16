# Circuit Construction Kit: DC - Model Description

This document is a high-level description of the model used in PhET's _Circuit Construction Kit: DC_ simulation.

## Circuit-Solving Model

This simulation uses Kirchoff's laws to determine voltages and currents with the Modified Nodal Analysis strategy. The 
currents and voltages throughout the circuit are determined based on the battery voltages and component resistances. See
https://www.swarthmore.edu/NatSci/echeeve1/Ref/mna/MNA2.html for details.

## Battery Internal Resistance

Batteries are ideal (very low resistance) unless given a custom internal resistance in the 'Lab' screen.

* The minimum internal resistance of a battery is 1E-4 Ohms.

## Wire Resistivity

Wires are constrained to have small but nonzero resistivity to avoid numerical errors or unsolvable circuits. Loops cannot
be built without wires, hence this constraint guarantees that each loop will have at least some resistance and be
solvable. Wires are ideal (very low resistivity) unless given a custom resisitivity in the 'Lab' screen.

* The minimum wire resistivity is 1E-10 Ohm*meters
* Wire resistance is proportional to wire resistivity as well as the length of the wire

## Household Items

Household items have the following resistances:

* Dollar bill - 1,000,000,000 Ohms // Note: This may not be accurate - https://core.ac.uk/download/pdf/39983441.pdf
* Paper clip - 0 Ohms // Note: This may not be accurate - https://byjus.com/physics/resistivity-various-materials/#:~:text=Metals%20are%20good%20conductors%20of,compared%20to%20the%20metallic%20conductors.
* Coin - 0 Ohms // Note: This may not be accurate - https://byjus.com/physics/resistivity-various-materials/#:~:text=Metals%20are%20good%20conductors%20of,compared%20to%20the%20metallic%20conductors.
* Eraser - 1,000,000,000 Ohms // Note: This may not be accurate - http://hyperphysics.phy-astr.gsu.edu/hbase/Tables/rstiv.html
* Pencil - 25 Ohms

## Ammeters and Voltmeters

The ammeters and voltmeter are ideal, with the following properties:

* Ammeters have zero resistance, and will always have zero voltage across them
* Voltmeters have infinite resistance, and will always have zero current flowing through them