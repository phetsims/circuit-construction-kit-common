// Copyright 2015-2017, University of Colorado Boulder

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
define( function( require ) {
  'use strict';

  // modules
  var arrayRemove = require( 'PHET_CORE/arrayRemove' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CCKCQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCQueryParameters' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix = require( 'DOT/Matrix' );
  var ModifiedNodalAnalysisSolution = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisSolution' );

  // constants
  var DEBUG = CCKCQueryParameters.debugModifiedNodalAnalysis;

  /**
   * @param {ModifiedNodalAnalysisCircuitElement[]} batteries
   * @param {ModifiedNodalAnalysisCircuitElement[]} resistors
   * @param {ModifiedNodalAnalysisCircuitElement[]} currentSources
   * @constructor
   */
  function ModifiedNodalAnalysisCircuit( batteries, resistors, currentSources ) {
    assert && assert( batteries, 'batteries should be defined' );
    assert && assert( resistors, 'resistors should be defined' );
    assert && assert( currentSources, 'currentSources should be defined' );

    // @public (read-only) {ModifiedNodalAnalysisCircuitElement[]}
    this.batteries = batteries;

    // @public (read-only) {ModifiedNodalAnalysisCircuitElement[]}
    this.resistors = resistors;

    // @public (read-only) {ModifiedNodalAnalysisCircuitElement[]}
    this.currentSources = currentSources;

    // @public (read-only) {ModifiedNodalAnalysisCircuitElement[]} - the list of all the elements for ease of access
    this.elements = this.batteries.concat( this.resistors ).concat( this.currentSources );

    // @public (read-only) {Object} - an object with index for all keys that have a node in the circuit, such as:
    // {0:0, 1:1, 2:2, 7:7}
    this.nodeSet = {};
    for ( var k = 0; k < this.elements.length; k++ ) {
      var element = this.elements[ k ];
      this.nodeSet[ element.nodeId0 ] = element.nodeId0;
      this.nodeSet[ element.nodeId1 ] = element.nodeId1;
    }

    // @public {number} - the number of nodes in the set
    this.nodeCount = _.size( this.nodeSet );

    // {number[]} the node indices
    this.nodes = _.values( this.nodeSet );
  }

  circuitConstructionKitCommon.register( 'ModifiedNodalAnalysisCircuit', ModifiedNodalAnalysisCircuit );

  inherit( Object, ModifiedNodalAnalysisCircuit, {

    /**
     * Returns a string representation of the circuit for debugging.
     * @returns {string}
     * @private
     */
    toString: function() {
      if ( assert ) { // stripped out for builds
        return 'resistors:' + this.resistors.map( resistorToString ).join( ',' ) + ', ' +
               'batteries: ' + this.batteries.map( batteryToString ).join( ',' ) + ', ' +
               'currentSources: ' + this.currentSources.map( function( c ) { return c.toString(); } )
                 .join( ',' );
      }
    },

    /**
     * Counts the number of unknown currents in the circuit.  There is an unknown current in each battery and
     * 0-resistance resistor.
     * @returns {number}
     * @private
     */
    getCurrentCount: function() {
      var numberOfResistanceFreeResistors = 0;
      for ( var i = 0; i < this.resistors.length; i++ ) {
        if ( this.resistors[ i ].value === 0 ) {
          numberOfResistanceFreeResistors++;
        }
      }
      return this.batteries.length + numberOfResistanceFreeResistors;
    },

    /**
     * Gets the number of variables for the system, one for each voltage and one for each current.
     * @returns {number}
     * @private
     */
    getNumVars: function() {
      return this.nodeCount + this.getCurrentCount();
    },

    /**
     * Sums all of the current leaving the node (subtracting current flowing into the node).
     *
     * @param {number} nodeIndex - the node at which to compute current sources
     * @returns {number}
     * @private
     */
    getCurrentSourceTotal: function( nodeIndex ) {
      var currentSourceTotal = 0.0;
      for ( var i = 0; i < this.currentSources.length; i++ ) {
        var currentSource = this.currentSources[ i ];
        if ( currentSource.nodeId1 === nodeIndex ) {

          // positive current is entering the node, and the convention is for incoming current to be negative
          currentSourceTotal = currentSourceTotal - currentSource.value;
        }
        if ( currentSource.nodeId0 === nodeIndex ) {

          // positive current is leaving the node, and the convention is for outgoing current to be positive
          currentSourceTotal = currentSourceTotal + currentSource.value;
        }
      }
      return currentSourceTotal;
    },

    /**
     * Gets current conservation terms going into or out of a node. Incoming current is negative, outgoing is positive.
     * @param {number} node - the node
     * @param {string} side - 'nodeId0' for outgoing current or 'nodeId1' for incoming current
     * @param {number} sign - 1 for incoming current and -1 for outgoing current
     * @returns {Term[]}
     * @private
     */
    getCurrentTerms: function( node, side, sign ) {
      assert && assert( typeof node === 'number', 'node should be a number' );
      var nodeTerms = [];

      // Each battery introduces an unknown current through the battery
      for ( var i = 0; i < this.batteries.length; i++ ) {
        var battery = this.batteries[ i ];
        if ( battery[ side ] === node ) {
          nodeTerms.push( new Term( sign, new UnknownCurrent( battery ) ) );
        }
      }
      var resistor;

      // Each resistor with 0 resistance introduces an unknown current
      for ( i = 0; i < this.resistors.length; i++ ) {
        resistor = this.resistors[ i ];

        // Treat resistors with R=0 as having unknown current and v1=v2
        if ( resistor[ side ] === node && resistor.value === 0 ) {
          nodeTerms.push( new Term( sign, new UnknownCurrent( resistor ) ) );
        }
      }

      // Each resistor with nonzero resistance has an unknown voltage
      for ( i = 0; i < this.resistors.length; i++ ) {
        resistor = this.resistors[ i ];
        if ( resistor[ side ] === node && resistor.value !== 0 ) {
          nodeTerms.push( new Term( -sign / resistor.value, new UnknownVoltage( resistor.nodeId1 ) ) );
          nodeTerms.push( new Term( sign / resistor.value, new UnknownVoltage( resistor.nodeId0 ) ) );
        }
      }
      return nodeTerms;
    },

    /**
     * Selects one node for each connected component to have the reference voltage of 0 volts.
     * @returns {number[]} - the node IDs selected for references
     * @private
     */
    getReferenceNodeIds: function() {

      // The nodes which need to be visited.
      var toVisit = _.values( this.nodeSet );

      // Mark reference nodes as they are discovered
      var referenceNodeIds = [];
      while ( toVisit.length > 0 ) {

        var referenceNodeId = toVisit[ 0 ];
        referenceNodeIds.push( referenceNodeId );
        var connectedNodeIds = this.getConnectedNodeIds( referenceNodeId );

        // No need to visit any nodes connected to the reference node, since their connected component already has a reference node.
        for ( var i = 0; i < connectedNodeIds.length; i++ ) {
          arrayRemove( toVisit, connectedNodeIds[ i ] );
        }
      }
      return referenceNodeIds;
    },

    /**
     * Finds all nodes connected (by any path) to the given node
     * @param {number} node
     * @returns {number[]}
     * @private
     */
    getConnectedNodeIds: function( node ) {
      assert && assert( typeof node === 'number', 'node should be a number' );
      var visited = [];
      var toVisit = [ node ];

      while ( toVisit.length > 0 ) {

        var nodeToVisit = toVisit.shift();
        visited.push( nodeToVisit );
        for ( var i = 0; i < this.elements.length; i++ ) {
          var element = this.elements[ i ];
          if ( element.containsNodeId( nodeToVisit ) ) {
            var oppositeNode = element.getOppositeNode( nodeToVisit );
            if ( visited.indexOf( oppositeNode ) === -1 ) {
              toVisit.push( oppositeNode );
            }
          }
        }
      }
      return _.uniq( visited );
    },

    /**
     * Returns an array of Equation instances that will be solved as a linear algebra problem to find the unknown
     * variables of the circuit.
     * @returns {Equation[]}
     * @private
     */
    getEquations: function() {
      var equations = [];

      // Reference node in each connected circuit element has a voltage of 0.0
      var referenceNodeIds = this.getReferenceNodeIds();
      for ( var i = 0; i < referenceNodeIds.length; i++ ) {
        equations.push( new Equation( 0, [ new Term( 1, new UnknownVoltage( referenceNodeIds[ i ] ) ) ] ) );
      }

      // DEBUG && console.log( referenceNodeIds );

      // For each node, charge is conserved
      var nodes = this.nodes;
      for ( i = 0; i < nodes.length; i++ ) {
        var node = nodes[ i ];

        // having charge conservation at each node is overconstraining and causes problems for QR.  In each connected
        // circuit element, we must choose exactly one node at which to avoid the current conservation term.
        if ( referenceNodeIds.indexOf( node ) === -1 ) {

          var incomingCurrentTerms = this.getCurrentTerms( node, 'nodeId1', -1 );
          var outgoingCurrentTerms = this.getCurrentTerms( node, 'nodeId0', +1 );
          var currentConservationTerms = incomingCurrentTerms.concat( outgoingCurrentTerms );
          equations.push( new Equation( this.getCurrentSourceTotal( node ), currentConservationTerms ) );
        }
      }

      // For each battery, voltage drop is given
      for ( i = 0; i < this.batteries.length; i++ ) {
        var battery = this.batteries[ i ];
        equations.push( new Equation( battery.value, [
          new Term( -1, new UnknownVoltage( battery.nodeId0 ) ),
          new Term( 1, new UnknownVoltage( battery.nodeId1 ) )
        ] ) );
      }

      // If resistor has no resistance, nodeId0 and nodeId1 should have same voltage
      for ( i = 0; i < this.resistors.length; i++ ) {
        var resistor = this.resistors[ i ];
        if ( resistor.value === 0 ) {
          equations.push( new Equation( 0, [
            new Term( 1, new UnknownVoltage( resistor.nodeId0 ) ),
            new Term( -1, new UnknownVoltage( resistor.nodeId1 ) )
          ] ) );
        }
      }

      return equations;
    },

    /**
     * Gets an array of the unknown currents in the circuit.
     * @returns {Array}
     * @private
     */
    getUnknownCurrents: function() {
      var unknownCurrents = [];

      // Each battery has an unknown current
      for ( var i = 0; i < this.batteries.length; i++ ) {
        unknownCurrents.push( new UnknownCurrent( this.batteries[ i ] ) );
      }

      // Treat resisters with R=0 as having unknown current and v1=v2
      for ( i = 0; i < this.resistors.length; i++ ) {
        if ( this.resistors[ i ].value === 0 ) {
          unknownCurrents.push( new UnknownCurrent( this.resistors[ i ] ) );
        }
      }
      return unknownCurrents;
    },

    /**
     * Solves for all unknown currents and voltages in the circuit.
     * @returns {ModifiedNodalAnalysisSolution}
     * @public
     */
    solve: function() {
      var equations = this.getEquations();
      var unknownCurrents = this.getUnknownCurrents();
      var unknownVoltages = this.nodes.map( function( node ) { return new UnknownVoltage( node ); } );
      var unknowns = unknownCurrents.concat( unknownVoltages );

      // Gets the index of the specified unknown.
      var getIndex = function( unknown ) {
        var index = getIndexByEquals( unknowns, unknown );
        assert && assert( index >= 0, 'unknown was missing' );
        return index;
      };

      // Prepare the A and z matrices for the linear system Ax=z
      var A = new Matrix( equations.length, this.getNumVars() );
      var z = new Matrix( equations.length, 1 );
      for ( var i = 0; i < equations.length; i++ ) {
        equations[ i ].stamp( i, A, z, getIndex );
      }
      DEBUG && console.log( A.m, A.n );
      DEBUG && console.log( 'Debugging circuit: ' + this.toString() );
      DEBUG && console.log( equations.join( '\n' ) );
      DEBUG && console.log( 'A=\n' + A.toString() );
      DEBUG && console.log( 'z=\n' + z.toString() );
      DEBUG && console.log( 'unknowns=\n' + unknowns.map( function( u ) {
        return u.toTermName();
      } ).join( '\n' ) );

      // solve the linear matrix system for the unknowns
      var x;
      try {
        x = A.solve( z );
      }
      catch( e ) {

        // Sometimes a fuzz test gives a deficient matrix rank.  It is a rare error and I haven't got one in the
        // debugger yet to understand the cause.  Catch it and provide a solution of zeroes of the correct dimension
        // See https://github.com/phetsims/circuit-construction-kit-dc/issues/113
        x = new Matrix( A.n, 1 );
      }

      // The matrix should be square since it is an exact analytical solution, see https://github.com/phetsims/circuit-construction-kit-dc/issues/96
      assert && assert( A.m === A.n, 'Matrix should be square' );
      DEBUG && console.log( 'x=\n' + x.toString() );

      var voltageMap = {};
      for ( i = 0; i < unknownVoltages.length; i++ ) {
        var unknownVoltage = unknownVoltages[ i ];
        voltageMap[ unknownVoltage.node ] = x.get( getIndexByEquals( unknowns, unknownVoltage ), 0 );
      }
      for ( i = 0; i < unknownCurrents.length; i++ ) {
        var unknownCurrent = unknownCurrents[ i ];
        unknownCurrent.element.currentSolution = x.get( getIndexByEquals( unknowns, unknownCurrent ), 0 );
      }

      return new ModifiedNodalAnalysisSolution( voltageMap, unknownCurrents.map( function( unknownCurrent ) {
        return unknownCurrent.element;
      } ) );
    }
  } );

  /**
   * Find the index of an element in an array comparing with the equals() method.
   * Could have used lodash's _.findIndex, but this will be called many times per frame and could be faster without
   * lodash
   * @param {Array} array
   * @param {Object} element
   * @returns {number} the index or -1 if not found
   */
  var getIndexByEquals = function( array, element ) {
    for ( var i = 0; i < array.length; i++ ) {
      if ( array[ i ].equals( element ) ) {
        return i;
      }
    }
    return -1;
  };

  /**
   * For debugging, display a Resistor as a string
   * @param {Resistor} resistor
   * @returns {string}
   */
  var resistorToString = function( resistor ) {
    return 'node' + resistor.nodeId0 + ' -> node' + resistor.nodeId1 + ' @ ' + resistor.value + ' Ohms';
  };

  /**
   * For debugging, display a Battery as a string
   * @param {Battery} battery
   * @returns {string}
   */
  var batteryToString = function( battery ) {
    return 'node' + battery.nodeId0 + ' -> node' + battery.nodeId1 + ' @ ' + battery.value + ' Volts';
  };

  /**
   * @param {number} coefficient - the multiplier for this term
   * @param {UnknownCurrent|UnknownVoltage} variable - the variable for this term, like the x variable in 7x
   * @constructor
   */
  function Term( coefficient, variable ) {

    // @public (read-only) {number} the coefficient for the term, like '7' in 7x
    this.coefficient = coefficient;

    // @public (read-only) {UnknownCurrent|UnknownVoltage} the variable for the term, like the x variable in 7x
    this.variable = variable;
  }

  inherit( Object, Term, {

    /**
     * Returns a string representation for debugging.
     * @returns {string}
     * @public
     */
    toTermString: function() {
      var prefix = this.coefficient === 1 ? '' :
                   this.coefficient === -1 ? '-' :
                   this.coefficient + '*';
      return prefix + this.variable.toTermName();
    }
  } );

  /**
   * @param {ModifiedNodalAnalysisCircuitElement} element
   * @constructor
   */
  function UnknownCurrent( element ) {

    assert && assert( element, 'element should be defined' );

    // @public (read-only) {Object}
    this.element = element;
  }

  inherit( Object, UnknownCurrent, {

    /**
     * Returns the name of the term for debugging.
     * @returns {string}
     * @public
     */
    toTermName: function() {
      return 'I' + this.element.nodeId0 + '_' + this.element.nodeId1;
    },

    /**
     * Two UnknownCurrents are equal if the refer to the same element.
     * @param {UnknownCurrent|UnknownVoltage} other - an UnknownCurrent to compare with this one
     * @returns {boolean}
     * @public
     */
    equals: function( other ) {
      return other.element === this.element;
    }
  } );

  /**
   * @param {number} node - the index of the node
   * @constructor
   */
  function UnknownVoltage( node ) {
    assert && assert( typeof node === 'number', 'nodes should be numbers' );

    // @public (read-only) {number}
    this.node = node;
  }

  inherit( Object, UnknownVoltage, {

    /**
     * Returns a string variable name for this term, for debugging.
     * @returns {string}
     * @public
     */
    toTermName: function() {
      return 'V' + this.node;
    },

    /**
     * Two UnknownVoltages are equal if they refer to the same node.
     * @param {UnknownVoltage|UnknownCurrent} other - another object to compare with this one
     * @returns {boolean}
     * @public
     */
    equals: function( other ) {
      return other.node === this.node;
    }
  } );

  /**
   * @param {number} value - the value on the right hand side of the equation, such as x+y=7
   * @param {Term[]} terms
   * @constructor
   */
  function Equation( value, terms ) {

    // @public (read-only) {number} the value of the equation.  For instance in x+3y=12, the value is 12
    this.value = value;

    // @public (read-only) {Term[]} the terms on the left-hand side of the equation.  E.g., in 3x+y=12 the terms are 3x
    // and y
    this.terms = terms;
  }

  inherit( Object, Equation, {

    /**
     * Enter this Equation into the given Matrices for solving the system.
     * @param {number} row - the index of the row for this equation
     * @param {Matrix} a - the matrix of coefficients in Ax=z
     * @param {Matrix} z - the matrix on the right hand side in Ax=z
     * @param {function} getIndex - (UnknownCurrent|UnknownVoltage) => number
     * @public
     */
    stamp: function( row, a, z, getIndex ) {

      // Set the equation's value into the solution matrix
      z.set( row, 0, this.value );

      // For each term, augment the coefficient matrix
      for ( var i = 0; i < this.terms.length; i++ ) {
        var term = this.terms[ i ];
        var index = getIndex( term.variable );
        a.set( row, index, term.coefficient + a.get( row, index ) );
      }
    },

    /**
     * Returns a string representation for debugging.
     * @returns {string}
     * @public
     */
    toString: function() {
      var termList = [];
      for ( var i = 0; i < this.terms.length; i++ ) {
        termList.push( this.terms[ i ].toTermString() );
      }
      var result = '' + termList.join( '+' ) + '=' + this.value;

      // replace +- with -. For instance, x+-3 should just be x-3
      return result.replace( '\\+\\-', '\\-' );
    }
  } );

  return ModifiedNodalAnalysisCircuit;
} );