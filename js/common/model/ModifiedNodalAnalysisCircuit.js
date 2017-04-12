// Copyright 2015-2016, University of Colorado Boulder

/**
 * Modified Nodal Analysis for a circuit.  An Equation is a sum of Terms equal to a numeric value.  A Term is composed
 * of a coefficient times a variable.  The variables are UnknownCurrent or UnknownVoltage.  The system of all
 * Equations is solved as a linear system.  Here is a good reference that was used during the development of this code
 * https://www.swarthmore.edu/NatSci/echeeve1/Ref/mna/MNA2.html
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModifiedNodalAnalysisSolution = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/ModifiedNodalAnalysisSolution' );
  var Matrix = require( 'DOT/Matrix' );

  // constants
  var DEBUG = false;

  /**
   * @param {Object[]} batteries - {node0:number,node1:number,circuitElement:CircuitElement,voltage:number}
   * @param {Object[]} resistors - {node0:number,node1:number,circuitElement:CircuitElement,resistance:number}
   * @param {Object[]} currentSources {node0:number,node1:number,circuitElement:CircuitElement,current:number}
   * @constructor
   */
  function ModifiedNodalAnalysisCircuit( batteries, resistors, currentSources ) {
    assert && assert( batteries, 'batteries should be defined' );
    assert && assert( resistors, 'resistors should be defined' );
    assert && assert( currentSources, 'currentSources should be defined' );

    // validate input types but only when asserts are enabled
    if ( assert ) {
      for ( var i = 0; i < batteries.length; i++ ) {
        var battery = batteries[ i ];
        assert && assert( typeof battery.node0 === 'number' );
        assert && assert( typeof battery.node1 === 'number' );
        assert && assert( typeof battery.voltage === 'number' );
      }
      for ( i = 0; i < resistors.length; i++ ) {
        var resistor = resistors[ i ];
        assert && assert( typeof resistor.node0 === 'number' );
        assert && assert( typeof resistor.node1 === 'number' );
        assert && assert( typeof resistor.resistance === 'number' );
      }
      for ( i = 0; i < currentSources.length; i++ ) {
        var currentSource = currentSources[ i ];
        assert && assert( typeof currentSource.node0 === 'number' );
        assert && assert( typeof currentSource.node1 === 'number' );
        assert && assert( typeof currentSource.current === 'number' );
      }
    }

    // @public (read-only)
    this.batteries = batteries;

    // @public (read-only)
    this.resistors = resistors;

    // @public (read-only)
    this.currentSources = currentSources;

    // @public (read-only) - the list of all the elements for ease of access
    this.elements = this.batteries.concat( this.resistors ).concat( this.currentSources );

    // @public (read-only) - an object with true set for all keys that have a node in the circuit, such as:
    // {0:true, 1:true, 2:true, 7:true}
    this.nodeSet = {};
    for ( var k = 0; k < this.elements.length; k++ ) {
      var element = this.elements[ k ];
      this.nodeSet[ element.node0 ] = true;
      this.nodeSet[ element.node1 ] = true;
    }

    // @public the number of nodes in the set
    this.nodeCount = _.size( this.nodeSet );
  }

  circuitConstructionKitCommon.register( 'ModifiedNodalAnalysisCircuit', ModifiedNodalAnalysisCircuit );

  inherit( Object, ModifiedNodalAnalysisCircuit, {

    /**
     * Returns a string representation of the circuit for debugging.
     * @returns {string}
     * @private
     */
    toString: function() {
      return 'resistors:' + this.resistors.map( resistorToString ).join( ',' ) + ', ' +
             'batteries: ' + this.batteries.map( batteryToString ).join( ',' ) + ', ' +
             'currentSources: ' + this.currentSources.map( function( c ) { return c.toString(); } )
               .join( ',' );
    },

    /**
     * Counts the number of unknown currents in the circuit.  There is an unknown current in each battery and 0-resistance resistor.
     * @returns {number}
     * @private
     */
    getCurrentCount: function() {
      var resistorsWithNoResistance = 0;
      for ( var i = 0; i < this.resistors.length; i++ ) {
        if ( this.resistors[ i ].resistance === 0 ) {
          resistorsWithNoResistance++;
        }
      }
      return this.batteries.length + resistorsWithNoResistance;
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
        var c = this.currentSources[ i ];
        if ( c.node1 === nodeIndex ) {

          // positive current is entering the node, and the convention is for incoming current to be negative
          currentSourceTotal = currentSourceTotal - c.current;
        }
        if ( c.node0 === nodeIndex ) {

          // positive current is leaving the node, and the convention is for outgoing current to be positive
          currentSourceTotal = currentSourceTotal + c.current;
        }
      }
      return currentSourceTotal;
    },

    /**
     * Gets current conservation terms going into or out of a node. Incoming current is negative, outgoing is positive.
     * @param {number} node - the node
     * @param {string} side - 'node0' for outgoing current or 'node1' for incoming current
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
        if ( resistor[ side ] === node && resistor.resistance === 0 ) {
          nodeTerms.push( new Term( sign, new UnknownCurrent( resistor ) ) );
        }
      }

      // Each resistor with nonzero resistance has an unknown voltage
      for ( i = 0; i < this.resistors.length; i++ ) {
        resistor = this.resistors[ i ];
        if ( resistor[ side ] === node && resistor.resistance !== 0 ) {
          nodeTerms.push( new Term( -sign / resistor.resistance, new UnknownVoltage( resistor.node1 ) ) );
          nodeTerms.push( new Term( sign / resistor.resistance, new UnknownVoltage( resistor.node0 ) ) );
        }
      }
      return nodeTerms;
    },

    /**
     * Selects one node for each connected component to have the reference voltage of 0 volts.
     * @returns {number[]}
     * @private
     */
    getReferenceNodes: function() {

      // The nodes which need to be visited
      var remaining = _.clone( this.nodeSet );

      // Mark reference nodes as they are discovered as map keys.
      var referenceNodes = [];
      while ( _.size( remaining ) > 0 ) {
        var referenceNode = _.minBy( _.keys( remaining ) );
        referenceNodes.push( referenceNode );
        var connectedNodes = this.getConnectedNodes( referenceNode );

        // No need to visit any nodes connected to the reference node, since their connected component already has
        // a reference node.
        for ( var i = 0; i < connectedNodes.length; i++ ) {
          var connectedNode = connectedNodes[ i ];
          delete remaining[ connectedNode ];
        }
      }
      return referenceNodes.map( toNumber );
    },

    /**
     * Finds all nodes connected (by any path) to the given node
     * @param {number} node
     * @returns {number[]}
     * @private
     */
    getConnectedNodes: function( node ) {
      var visited = {};
      var toVisit = {};
      toVisit[ node ] = true;

      while ( _.size( toVisit ) > 0 ) {

        // TODO: get rid of all parse ints in this file
        var nodeToVisit = parseInt( _.keys( toVisit )[ 0 ], 10 ); // TODO: it is nice to use maps for O[1] access but not nice that the keys are strings
        visited[ nodeToVisit ] = true;
        for ( var i = 0; i < this.elements.length; i++ ) {
          var e = this.elements[ i ];
          if ( elementContainsNode( e, nodeToVisit ) ) {
            var oppositeNode = getOppositeNode( e, nodeToVisit );
            if ( !visited[ oppositeNode ] ) {
              toVisit[ oppositeNode ] = true;
            }
          }
        }
        delete toVisit[ nodeToVisit ];
      }
      return _.keys( visited );
    },

    /**
     * Returns an array of Equation instances that will be solved as a linear algebra problem to find the unknown variables
     * of the circuit.
     * @returns {Equation[]}
     * @private
     */
    getEquations: function() {
      var equations = [];

      // Reference node in each connected circuit element has a voltage of 0.0
      var referenceNodes = this.getReferenceNodes();
      for ( var i = 0; i < referenceNodes.length; i++ ) {
        equations.push( new Equation( 0, [ new Term( 1, new UnknownVoltage( referenceNodes[ i ] ) ) ] ) );
      }

      // For each node, charge is conserved
      var nodeKeys = _.keys( this.nodeSet );
      for ( i = 0; i < nodeKeys.length; i++ ) {
        var nodeKey = nodeKeys[ i ];
        var node = parseInt( nodeKey, 10 ); // TODO: get rid of all parse ints in this file
        var incomingCurrentTerms = this.getCurrentTerms( node, 'node1', -1 );
        var outgoingCurrentTerms = this.getCurrentTerms( node, 'node0', +1 );
        var currentConservationTerms = incomingCurrentTerms.concat( outgoingCurrentTerms );
        equations.push( new Equation( this.getCurrentSourceTotal( node ), currentConservationTerms ) );
      }

      // For each battery, voltage drop is given
      for ( i = 0; i < this.batteries.length; i++ ) {
        var battery = this.batteries[ i ];
        equations.push( new Equation( battery.voltage, [ new Term( -1, new UnknownVoltage( battery.node0 ) ), new Term( 1, new UnknownVoltage( battery.node1 ) ) ] ) );
      }

      // If resistor has no resistance, node0 and node1 should have same voltage
      for ( i = 0; i < this.resistors.length; i++ ) {
        var resistor = this.resistors[ i ];
        if ( resistor.resistance === 0 ) {
          equations.push( new Equation( 0, [ new Term( 1, new UnknownVoltage( resistor.node0 ) ), new Term( -1, new UnknownVoltage( resistor.node1 ) ) ] ) );
        }
      }

      return equations;
    },

    /**
     * Gets an array of all the unknown voltages in the circuit.
     * @returns {UnknownVoltage[]}
     * @private
     */
    getUnknownVoltages: function() {

      // TODO: stop using _.keys for nodeSet everywhere
      return _.keys( this.nodeSet ).map( stringToUnknownVoltage );
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
        if ( this.resistors[ i ].resistance === 0 ) {
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
      var unknownVoltages = this.getUnknownVoltages();
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

      DEBUG && console.log( 'Debugging circuit: ' + this.toString() );
      DEBUG && console.log( equations.join( '\n' ) );
      DEBUG && console.log( 'A=\n' + A.toString() );
      DEBUG && console.log( 'z=\n' + z.toString() );
      DEBUG && console.log( 'unknowns=\n' + this.getUnknowns().map( function( u ) {return u.toString();} ).join( '\n' ) );

      // solve the linear matrix system for the unknowns
      var x = A.solve( z );

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

      return new ModifiedNodalAnalysisSolution( voltageMap, unknownCurrents.map( function( u ) {
        return u.element;
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
   * Converts a string integer to a number.  Used when converting object keys to indices.
   * @param {string} string
   * @returns {Number}
   */
  var toNumber = function( string ) {
    return parseInt( string, 10 );
  };

  /**
   * Creates an UnknownVoltage for the node (by string)
   * @param {string} nodeString
   * @returns {UnknownVoltage}
   */
  var stringToUnknownVoltage = function( nodeString ) {
    return new UnknownVoltage( parseInt( nodeString, 10 ) );
  };
  /**
   * For debugging, display a Resistor as a string
   * @param {Resistor} resistor
   * @returns {string}
   */
  var resistorToString = function( resistor ) {
    return 'node' + resistor.node0 + ' -> node' + resistor.node1 + ' @ ' + resistor.resistance + ' Ohms';
  };

  /**
   * For debugging, display a Battery as a string
   * @param {Battery} battery
   * @returns {string}
   */
  var batteryToString = function( battery ) {
    return 'node' + battery.node0 + ' -> node' + battery.node1 + ' @ ' + battery.voltage + ' Volts';
  };

  /**
   * Determine if an element contains the given node
   * @param {Element} element
   * @param {number} node
   * @returns {boolean}
   */
  var elementContainsNode = function( element, node ) {
    return element.node0 === node || element.node1 === node;
  };

  /**
   * Find the node across from the specified node.
   * @param {Element} element
   * @param {number} node
   */
  var getOppositeNode = function( element, node ) {
    assert && assert( element.node0 === node || element.node1 === node );
    return element.node0 === node ? element.node1 : element.node0;
  };

  /**
   * @param {number} coefficient - the multiplier for this term
   * @param {UnknownCurrent|UnknownVoltage} variable - the variable for this term, like the x variable in 7x
   * @constructor
   */
  function Term( coefficient, variable ) {

    // @public (read-only) the coefficient for the term, like '7' in 7x
    this.coefficient = coefficient;

    // @public (read-only) the variable for the term, like the x variable in 7x
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
   * @param {Element} element - the circuit element through which the current runs
   * @constructor
   */
  function UnknownCurrent( element ) {

    assert && assert( element, 'element should be defined' );

    // @public (read-only)
    this.element = element;
  }

  inherit( Object, UnknownCurrent, {

    /**
     * Returns the name of the term for debugging.
     * @returns {string}
     * @public
     */
    toTermName: function() {
      return 'I' + this.element.node0 + '_' + this.element.node1;
    },

    /**
     * Two UnknownCurrents are equal if the refer to the same element.
     * @param {Object} other - an object to compare with this one
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

    // @public (read-only)
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
     * @param {Object} other - another object to compare with this one
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

    // @public (read-only) the value of the equation.  For instance in x+3y=12, the value is 12
    this.value = value;

    // @public (read-only) the terms on the left-hand side of the equation.  E.g., in 3x+y=12 the terms are 3x and y
    this.terms = terms;
  }

  inherit( Object, Equation, {

    /**
     * Enter this Equation into the given Matrices for solving the system.
     * @param {number} row - the index of the row for this equation
     * @param {Matrix} a - the matrix of coefficients in Ax=z
     * @param {Matrix} z - the matrix on the right hand side in Ax=z
     * @param {function} getIndex
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