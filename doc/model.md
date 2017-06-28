The currents and voltage drops throughout the circuit are determined based on the voltage supplies and resistances.  
Kirkhoff's laws are applied using the Modified Nodal Analysis strategy.  Please see 
https://www.swarthmore.edu/NatSci/echeeve1/Ref/mna/MNA2.html for details.

Wires are constrained to have >=1E-6 Ohms of resistance to avoid numerical errors or unsolvable circuits.  Loops cannot
be built without wires, hence this constraint guarantees that each loop will have at least some resistance and be 
solvable.