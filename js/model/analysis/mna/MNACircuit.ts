// Copyright 2015-2022, University of Colorado Boulder

/**
 * Modified Nodal Analysis for a circuit.  An Equation is a sum of Terms equal to a numeric value.  A Term is composed
 * of a coefficient times a variable.  The variables are UnknownCurrent or UnknownVoltage.  The system of all
 * Equations is solved as a linear system.  Here is a good reference that was used during the development of this code
 * https://www.swarthmore.edu/NatSci/echeeve1/Ref/mna/MNA2.html
 *
 * No listeners are attached and hence no dispose implementation is necessary.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import QRDecomposition from '../../../../../dot/js/QRDecomposition.js';
import Matrix from '../../../../../dot/js/Matrix.js';
import Utils from '../../../../../dot/js/Utils.js';
import arrayRemove from '../../../../../phet-core/js/arrayRemove.js';
import circuitConstructionKitCommon from '../../../circuitConstructionKitCommon.js';
import MNASolution from './MNASolution.js';
import MNACircuitElement from './MNACircuitElement.js';
import MNABattery from './MNABattery.js';
import MNAResistor from './MNAResistor.js';
import MNACurrent from './MNACurrent.js';
import IntentionalAny from '../../../../../phet-core/js/types/IntentionalAny.js';

export default class MNACircuit {
  private readonly batteries: MNABattery[];
  private readonly resistors: MNAResistor[];
  private readonly currentSources: MNACurrent[];

  // the list of all the elements for ease of access
  private readonly elements: MNACircuitElement[];

  // an object with index for all keys that have a node in the circuit, such as: {0:0, 1:1, 2:2, 7:7}
  private readonly nodeSet: Record<string, string>;

  // the number of nodes in the set
  private readonly nodeCount: number;
  private readonly nodes: string[];

  public constructor( batteries: MNABattery[], resistors: MNAResistor[], currentSources: MNACurrent[] ) {
    assert && assert( batteries, 'batteries should be defined' );
    assert && assert( resistors, 'resistors should be defined' );
    assert && assert( currentSources, 'currentSources should be defined' );

    this.batteries = batteries;
    this.resistors = resistors;
    this.currentSources = currentSources;
    this.elements = [ ...this.batteries, ...this.resistors, ...this.currentSources ];

    this.nodeSet = {};
    for ( let k = 0; k < this.elements.length; k++ ) {
      const element = this.elements[ k ];
      this.nodeSet[ element.nodeId0 ] = element.nodeId0;
      this.nodeSet[ element.nodeId1 ] = element.nodeId1;
    }

    this.nodeCount = _.size( this.nodeSet );

    // the node indices
    this.nodes = _.values( this.nodeSet );
  }

  /**
   * Returns a string representation of the circuit for debugging.
   */
  public toString(): string {
    if ( assert ) { // stripped out for builds
      return `resistors:\n${this.resistors.map( resistorToString ).join( '\n' )}\n` +
             `batteries:\n${this.batteries.map( batteryToString ).join( '\n' )}\n` +
             `currentSources:\n${this.currentSources.map( c => c.toString() ).join( '\n' )}`;
    }
    else {
      return 'toString() only defined when assertions are enabled';
    }
  }

  /**
   * Counts the number of unknown currents in the circuit.  There is an unknown current in each battery and
   * 0-resistance resistor.
   */
  private getCurrentCount(): number {
    let numberOfResistanceFreeResistors = 0;
    for ( let i = 0; i < this.resistors.length; i++ ) {
      if ( this.resistors[ i ].resistance === 0 ) {
        numberOfResistanceFreeResistors++;
      }
    }
    return this.batteries.length + numberOfResistanceFreeResistors;
  }

  /**
   * Gets the number of variables for the system, one for each voltage and one for each current.
   */
  private getNumVars(): number {
    return this.nodeCount + this.getCurrentCount();
  }

  /**
   * Sums all of the current leaving the node (subtracting current flowing into the node).
   *
   * @param nodeIndex - the node at which to compute current sources
   */
  private getCurrentSourceTotal( nodeIndex: string ): number {
    let currentSourceTotal = 0.0;
    for ( let i = 0; i < this.currentSources.length; i++ ) {
      const currentSource = this.currentSources[ i ];
      if ( currentSource.nodeId1 === nodeIndex ) {

        // positive current is entering the node, and the convention is for incoming current to be negative
        currentSourceTotal = currentSourceTotal - currentSource.current;
      }
      if ( currentSource.nodeId0 === nodeIndex ) {

        // positive current is leaving the node, and the convention is for outgoing current to be positive
        currentSourceTotal = currentSourceTotal + currentSource.current;
      }
    }
    return currentSourceTotal;
  }

  /**
   * Gets current conservation terms going into or out of a node. Incoming current is negative, outgoing is positive.
   * @param node - the node
   * @param side - 'nodeId0' for outgoing current or 'nodeId1' for incoming current
   * @param sign - 1 for incoming current and -1 for outgoing current
   * @param nodeTerms - to accumulate the result
   */
  private getCurrentTerms( node: string, side: 'nodeId0' | 'nodeId1', sign: number, nodeTerms: Term[] ): Term[] {
    // Each battery introduces an unknown current through the battery
    for ( let i = 0; i < this.batteries.length; i++ ) {
      const battery = this.batteries[ i ];
      if ( battery[ side ] === node ) {
        nodeTerms.push( new Term( sign, new UnknownCurrent( battery ) ) );
      }
    }

    for ( let i = 0; i < this.resistors.length; i++ ) {
      const resistor = this.resistors[ i ];

      if ( resistor[ side ] === node ) {
        if ( resistor.resistance === 0 ) {

          // Each resistor with 0 resistance introduces an unknown current, and v1=v2
          nodeTerms.push( new Term( sign, new UnknownCurrent( resistor ) ) );
        }
        else {

          // Each resistor with nonzero resistance has unknown voltages
          nodeTerms.push( new Term( -sign / resistor.resistance, new UnknownVoltage( resistor.nodeId1 ) ) );
          nodeTerms.push( new Term( sign / resistor.resistance, new UnknownVoltage( resistor.nodeId0 ) ) );
        }
      }
    }

    return nodeTerms;
  }

  /**
   * Selects one node for each connected component to have the reference voltage of 0 volts.
   * @returns the node IDs selected for references
   */
  private getReferenceNodeIds(): string[] {

    // The nodes which need to be visited.
    const toVisit = _.values( this.nodeSet );

    // Mark reference nodes as they are discovered
    const referenceNodeIds = [];
    while ( toVisit.length > 0 ) {

      const referenceNodeId = toVisit[ 0 ];
      referenceNodeIds.push( referenceNodeId );
      const connectedNodeIds = this.getConnectedNodeIds( referenceNodeId );

      // No need to visit any nodes connected to the reference node, since their connected component already has a reference node.
      for ( let i = 0; i < connectedNodeIds.length; i++ ) {
        arrayRemove( toVisit, connectedNodeIds[ i ] );
      }
    }
    return referenceNodeIds;
  }

  /**
   * Finds all nodes connected (by any path) to the given node
   */
  private getConnectedNodeIds( node: string ): string[] {
    const visited = [];
    const toVisit: string[] = [ node ];

    while ( toVisit.length > 0 ) {

      const nodeToVisit = toVisit.shift()!;
      visited.push( nodeToVisit );
      for ( let i = 0; i < this.elements.length; i++ ) {
        const element = this.elements[ i ];
        if ( element.containsNodeId( nodeToVisit ) ) {
          const oppositeNode = element.getOppositeNode( nodeToVisit );
          if ( !visited.includes( oppositeNode ) ) {
            toVisit.push( oppositeNode );
          }
        }
      }
    }
    return _.uniq( visited );
  }

  /**
   * Returns an array of Equation instances that will be solved as a linear algebra problem to find the unknown
   * variables of the circuit.
   */
  private getEquations(): Equation[] {
    const equations = [];

    // Reference node in each connected circuit element has a voltage of 0.0
    const referenceNodeIds = this.getReferenceNodeIds();
    for ( let i = 0; i < referenceNodeIds.length; i++ ) {
      equations.push( new Equation( 0, [ new Term( 1, new UnknownVoltage( referenceNodeIds[ i ] ) ) ] ) );
    }

    // phet.log && phet.log( referenceNodeIds );

    // For each node, charge is conserved
    const nodes = this.nodes;
    for ( let i = 0; i < nodes.length; i++ ) {
      const node = nodes[ i ];
      const currentTerms: Term[] = [];

      this.getCurrentTerms( node, 'nodeId1', +1, currentTerms );
      this.getCurrentTerms( node, 'nodeId0', -1, currentTerms );
      equations.push( new Equation( this.getCurrentSourceTotal( node ), currentTerms ) );
    }

    // For each battery, voltage drop is given
    // Within the battery, the current flows from low to high potential, so V = -(v1-v0) in this case.
    // Because the battery moves the current from low voltage to high voltage.
    for ( let i = 0; i < this.batteries.length; i++ ) {
      const battery = this.batteries[ i ];
      equations.push( new Equation( battery.voltage, [
        new Term( 1, new UnknownVoltage( battery.nodeId0 ) ),
        new Term( -1, new UnknownVoltage( battery.nodeId1 ) )
      ] ) );
    }

    // If resistor has no resistance, nodeId0 and nodeId1 should have same voltage
    for ( let i = 0; i < this.resistors.length; i++ ) {
      const resistor = this.resistors[ i ];
      if ( resistor.resistance === 0 ) {
        equations.push( new Equation( 0, [
          new Term( 1, new UnknownVoltage( resistor.nodeId0 ) ),
          new Term( -1, new UnknownVoltage( resistor.nodeId1 ) )
        ] ) );
      }
    }

    return equations;
  }

  /**
   * Gets an array of the unknown currents in the circuit.
   */
  private getUnknownCurrents(): UnknownCurrent[] {
    const unknownCurrents: UnknownCurrent[] = [];

    // Each battery has an unknown current
    for ( let i = 0; i < this.batteries.length; i++ ) {
      unknownCurrents.push( new UnknownCurrent( this.batteries[ i ] ) );
    }

    // Treat resistors with R=0 as having unknown current and v1=v2
    for ( let i = 0; i < this.resistors.length; i++ ) {
      if ( this.resistors[ i ].resistance === 0 ) {
        unknownCurrents.push( new UnknownCurrent( this.resistors[ i ] ) );
      }
    }
    return unknownCurrents;
  }

  /**
   * Solves for all unknown currents and voltages in the circuit.
   */
  public solve(): MNASolution {
    const equations = this.getEquations();
    const unknownCurrents = this.getUnknownCurrents();
    const unknownVoltages = this.nodes.map( node => new UnknownVoltage( node ) );

    const unknowns = [ ...unknownCurrents, ...unknownVoltages ];

    // Gets the index of the specified unknown.
    const getIndex = ( unknown: UnknownCurrent | UnknownVoltage ) => {
      const index = getIndexByEquals( unknowns, unknown );
      assert && assert( index >= 0, 'unknown was missing' );
      return index;
    };

    // Prepare the A and z matrices for the linear system Ax=z
    const A = new Matrix( equations.length, this.getNumVars() );
    const z = new Matrix( equations.length, 1 );

    // solve the linear matrix system for the unknowns
    let x;
    try {

      for ( let i = 0; i < equations.length; i++ ) {
        equations[ i ].stamp( i, A, z, getIndex );
      }

      x = new QRDecomposition( A ).solve( z );
    }
    catch( e ) {

      // Sometimes a fuzz test gives a deficient matrix rank.  It is a rare error and I haven't got one in the
      // debugger yet to understand the cause.  Catch it and provide a solution of zeroes of the correct dimension
      // See https://github.com/phetsims/circuit-construction-kit-dc/issues/113
      x = new Matrix( A.n, 1 );
    }

    if ( phet.log ) {
      console.log( getDebugInfo( this, A, z, equations, unknowns, x ) );
    }

    const voltageMap = new Map<string, number>();
    for ( let i = 0; i < unknownVoltages.length; i++ ) {
      const unknownVoltage = unknownVoltages[ i ];
      const rhs = x.get( getIndexByEquals( unknowns, unknownVoltage ), 0 );

      // Guard assertion because it is expensive to compute the debug info.
      if ( assert && isNaN( rhs ) ) {
        assert && assert( !isNaN( rhs ), `the right-hand-side-value must be a number. Instead it was ${rhs}. debug info=${getDebugInfo( this, A, z, equations, unknowns, x )}` );
      }

      voltageMap.set( unknownVoltage.node, rhs );
    }

    const currentMap = new Map<MNACircuitElement, number>();

    for ( let i = 0; i < unknownCurrents.length; i++ ) {
      const unknownCurrent = unknownCurrents[ i ];
      currentMap.set( unknownCurrent.element, x.get( getIndexByEquals( unknowns, unknownCurrent ), 0 ) );
    }

    return new MNASolution( voltageMap, currentMap );
  }
}

circuitConstructionKitCommon.register( 'MNACircuit', MNACircuit );

/**
 * Find the index of an element in an array comparing with the equals() method.
 * Could have used lodash's _.findIndex, but this will be called many times per frame and could be faster without
 * lodash
 * @param array
 * @param element
 * @returns the index or -1 if not found
 */
const getIndexByEquals = <T extends { equals: ( t: IntentionalAny ) => boolean }>( array: Array<T>, element: IntentionalAny ) => {
  for ( let i = 0; i < array.length; i++ ) {
    if ( array[ i ].equals( element ) ) {
      return i;
    }
  }
  return -1;
};

/**
 * For debugging, display a Resistor as a string
 */
const resistorToString = ( resistor: MNAResistor ) =>
  `node${resistor.nodeId0} -> node${resistor.nodeId1} @ ${resistor.resistance} Ohms`;

/**
 * For debugging, display a Battery as a string
 */
const batteryToString = ( battery: MNABattery ) =>
  `node${battery.nodeId0} -> node${battery.nodeId1} @ ${battery.voltage} Volts`;

class Term {

  // the coefficient for the term, like '7' in 7x
  public readonly coefficient: number;

  // the variable for the term, like the x variable in 7x
  public readonly variable: UnknownCurrent | UnknownVoltage;

  /**
   * @param coefficient - the multiplier for this term
   * @param variable - the variable for this term, like the x variable in 7x
   */
  public constructor( coefficient: number, variable: UnknownCurrent | UnknownVoltage ) {

    assert && assert( !isNaN( coefficient ), 'coefficient cannot be NaN' );

    this.coefficient = coefficient;
    this.variable = variable;
  }

  /**
   * Returns a string representation for debugging.
   */
  public toTermString(): string {
    const prefix = this.coefficient === 1 ? '' :
                   this.coefficient === -1 ? '-' :
                   `${this.coefficient}*`;
    return prefix + this.variable.toTermName();
  }
}

class UnknownCurrent {
  public readonly element: MNACircuitElement;

  public constructor( element: MNACircuitElement ) {
    this.element = element;
  }

  /**
   * Returns the name of the term for debugging.
   */
  public toTermName(): string {
    return `I${this.element.nodeId0}_${this.element.nodeId1}`;
  }

  /**
   * Two UnknownCurrents are equal if the refer to the same element.
   * @param other - an UnknownCurrent to compare with this one
   */
  public equals( other: UnknownCurrent ): boolean {
    return other.element === this.element;
  }
}

class UnknownVoltage {
  public readonly node: string; // the index of the node

  public constructor( node: string ) {
    this.node = node;
  }

  /**
   * Returns a string variable name for this term, for debugging.
   */
  public toTermName(): string {
    return `V${this.node}`;
  }

  /**
   * Two UnknownVoltages are equal if they refer to the same node.
   * @param other - another object to compare with this one
   */
  public equals( other: UnknownVoltage ): boolean {
    return other.node === this.node;
  }
}

class Equation {
  private readonly value: number;
  private readonly terms: Term[];

  /**
   * @param value - the value on the right hand side of the equation, such as x+y=7
   * @param terms
   */
  public constructor( value: number, terms: Term[] ) {

    assert && assert( !isNaN( value ) );

    // the value of the equation.  For instance in x+3y=12, the value is 12
    this.value = value;

    // the terms on the left-hand side of the equation.  E.g., in 3x+y=12 the terms are 3x and y
    this.terms = terms;
  }

  /**
   * Enter this Equation into the given Matrices for solving the system.
   * @param row - the index of the row for this equation
   * @param a - the matrix of coefficients in Ax=z
   * @param z - the matrix on the right hand side in Ax=z
   * @param getColumn - (UnknownCurrent|UnknownVoltage) => number
   */
  public stamp( row: number, a: Matrix, z: Matrix, getColumn: {
    ( unknown: UnknownCurrent | UnknownVoltage ): number;
    ( arg0: UnknownCurrent | UnknownVoltage ): number;
  } ): void {

    // Set the equation's value into the solution matrix
    z.set( row, 0, this.value );

    // For each term, augment the coefficient matrix
    for ( let i = 0; i < this.terms.length; i++ ) {
      const term = this.terms[ i ];
      const column = getColumn( term.variable );
      assert && assert( !isNaN( term.coefficient ), 'coefficient should be a number' );
      a.set( row, column, term.coefficient + a.get( row, column ) );
    }
  }

  /**
   * Returns a string representation for debugging.
   */
  private toString(): string {
    const termList = [];
    for ( let i = 0; i < this.terms.length; i++ ) {
      termList.push( this.terms[ i ].toTermString() );
    }
    const result = `${termList.join( '+' )}=${this.value}`;

    // replace +- with -. For instance, x+-3 should just be x-3
    return result.replace( '\\+\\-', '\\-' );
  }
}

const getDebugInfo = ( modifiedNodalAnalysisCircuit: MNACircuit, A: Matrix, z: Matrix, equations: Equation[], unknowns: ( UnknownCurrent | UnknownVoltage )[], x: Matrix ) => {
  const conditionNumber = A.cond();
  const debugInfo = `Debugging circuit: ${modifiedNodalAnalysisCircuit.toString()}
    equations:
${equations.join( '\n' )}

A.cond=1E${Utils.toFixed( Math.log10( conditionNumber ), 4 )} = ${Utils.toFixed( conditionNumber, 4 )}  
A=\n${A.transpose().toString()}
z=\n${z.transpose().toString()}
unknowns=\n${unknowns.map( u => u.toTermName() ).join( ', ' )}
x=\n${x.transpose().toString()}
    `;

  return debugInfo;
};