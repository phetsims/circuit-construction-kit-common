// Copyright 2015, University of Colorado Boulder

/**
 * Modified Nodal Analysis for a circuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var LinearCircuitSolution = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/modified-nodal-analysis/LinearCircuitSolution' );
  var Matrix = require( 'DOT/Matrix' );

  // constants
  var debug = false;

  /**
   * Find the index of an element in an array
   * Could have used lodash's _.findIndex, but this will be called many times per frame and could be faster without
   * lodash
   * @param {Array} array
   * @param {Object} element
   * @returns {number} the index or -1 if not found
   */
  var getIndexByEquals = function( array, element ) {
    for ( var i = 0; i < array.length; i++ ) {
      var e = array[ i ];
      if ( e.equals( element ) ) {
        return i;
      }
    }
    return -1;
  };

  /**
   *
   * @param {number} coefficient
   * @param {UnknownCurrent|UnknownVoltage} variable
   * @constructor
   */
  function Term( coefficient, variable ) {
    this.coefficient = coefficient;
    this.variable = variable;
  }

  inherit( Object, Term, {
    toTermString: function() {
      var prefix = this.coefficient === 1 ? '' : ( ( this.coefficient === -1 ) ? '-' : this.coefficient + '*' );
      return prefix + this.variable.toTermName();
    }
  } );

  /**
   *
   * @param {Element} element
   * @constructor
   */
  function UnknownCurrent( element ) {
    this.element = element;
  }

  inherit( Object, UnknownCurrent, {
    toTermName: function() {
      return 'I' + this.element.node0 + '_' + this.element.node1;
    },
    equals: function( other ) {
      return other.element === this.element;
    }
  } );

  /**
   * @param {number} node
   * @constructor
   */
  function UnknownVoltage( node ) {
    assert && assert( typeof node === 'number', 'nodes should be numbers' );
    this.node = node;
  }

  inherit( Object, UnknownVoltage, {
    toTermName: function() {
      return 'V' + this.node;
    },
    equals: function( other ) {
      return other.node === this.node;
    }
  } );

  /**
   *
   * @param {number} rhs
   * @param {Term[]} terms
   * @constructor
   */
  function Equation( rhs, terms ) {
    this.rhs = rhs;
    this.terms = terms;
  }

  inherit( Object, Equation, {

    /**
     *
     * @param {number} row
     * @param {Matrix} a
     * @param {Matrix} z
     * @param {function} getIndex
     */
    stamp: function( row, a, z, getIndex ) {
      z.set( row, 0, this.rhs );
      for ( var i = 0; i < this.terms.length; i++ ) {
        var term = this.terms[ i ];
        var index = getIndex( term.variable );
        a.set( row, index, term.coefficient + a.get( row, index ) );
      }
    },

    toString: function() {
      var termList = [];
      for ( var i = 0; i < this.terms.length; i++ ) {
        var a = this.terms[ i ];
        termList.push( a.toTermString() );
      }
      var result = '' + termList.join( '+' ) + '=' + this.rhs;
      return result.replace( '\\+\\-', '\\-' ); // TODO: This looks wrong
    }
  } );

  /**
   *
   * @constructor
   */
  function MNACircuit( batteries, resistors, currentSources ) {
    assert && assert( batteries, 'batteries should be defined' );
    assert && assert( resistors, 'resistors should be defined' );
    assert && assert( currentSources, 'currentSources should be defined' );

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
    this.batteries = batteries;
    this.resistors = resistors;
    this.currentSources = currentSources;
  }

  circuitConstructionKitBasics.register( 'MNACircuit', MNACircuit );

  var resistorToString = function( resistor ) {
    return 'node' + resistor.node0 + ' -> node' + resistor.node1 + ' @ ' + resistor.resistance + ' Ohms';
  };

  var batteryToString = function( battery ) {
    return 'node' + battery.node0 + ' -> node' + battery.node1 + ' @ ' + battery.voltage + ' Volts';
  };

  var elementContainsNode = function( element, node ) {
    return element.node0 === node || element.node1 === node;
  };

  var getOpposite = function( element, node ) {
    assert && assert( element.node0 === node || element.node1 === node );
    if ( element.node0 === node ) {
      return element.node1;
    }
    else {
      return element.node0;
    }
  };

  return inherit( Object, MNACircuit, {
    toString: function() {
      return 'Circuit: resistors:' + this.resistors.map( function( r ) {
          return resistorToString( r );
        } ).join( ',' ) + ', batteries: ' + this.batteries.map( function( b ) {
          return batteryToString( b );
        } ).join( ',' ) + ', currentSources: ' + this.currentSources.map( function( c ) {
          return c.toString();
        } ).join( ',' );
    },
    getElements: function() {
      return this.batteries.concat( this.resistors ).concat( this.currentSources );
    },
    getNodeCount: function() {
      return _.size( this.getNodeSet() );
    },
    getCurrentCount: function() {
      var zeroResistors = 0;
      for ( var i = 0; i < this.resistors.length; i++ ) {
        var resistor = this.resistors[ i ];
        if ( resistor.resistance === 0 ) {
          zeroResistors++;
        }
      }
      return this.batteries.length + zeroResistors;
    },
    getNumVars: function() {
      return this.getNodeCount() + this.getCurrentCount();
    },
    getRHS: function( nodeIndex ) {
      var sum = 0.0;
      for ( var i = 0; i < this.currentSources.length; i++ ) {
        var c = this.currentSources[ i ];
        if ( c.node1 === nodeIndex ) {
          sum = sum - c.current;//positive current is entering the node//TODO: these signs seem backwards, shouldn't incoming current add?
        }
        if ( c.node0 === nodeIndex ) {
          sum = sum + c.current;//positive current is leaving the node
        }
      }
      return sum;
    },

    /**
     * TODO: does this get the signs right in all cases?
     * TODO: maybe signs here should depend on circuit element orientation?
     * incoming current is negative, outgoing is positive
     * @param node
     * @returns {Array}
     */
    getIncomingCurrentTerms: function( node ) { // return ArrayList<Term>
      assert && assert( typeof node === 'number' );
      var nodeTerms = [];
      for ( var i = 0; i < this.batteries.length; i++ ) {
        var battery = this.batteries[ i ];
        if ( battery.node1 === node ) {
          nodeTerms.push( new Term( -1, new UnknownCurrent( battery ) ) );
        }
      }
      var r;
      for ( i = 0; i < this.resistors.length; i++ ) {
        r = this.resistors[ i ];

        //Treat resistors with R=0 as having unknown current and v1=v2
        if ( r.node1 === node && r.resistance === 0 ) {
          nodeTerms.push( new Term( -1, new UnknownCurrent( r ) ) );
        }
      }
      for ( i = 0; i < this.resistors.length; i++ ) {
        r = this.resistors[ i ];
        if ( r.node1 === node && r.resistance !== 0 ) {
          nodeTerms.push( new Term( 1 / r.resistance, new UnknownVoltage( r.node1 ) ) );
          nodeTerms.push( new Term( -1 / r.resistance, new UnknownVoltage( r.node0 ) ) );
        }
      }
      return nodeTerms;
    },

    /**
     * outgoing currents are negative so that incoming + outgoing = 0
     * @param {number} node
     * @returns {Term[]}
     */
    getOutgoingCurrentTerms: function( node ) {
      var nodeTerms = [];
      for ( var i = 0; i < this.batteries.length; i++ ) {
        var b = this.batteries[ i ];
        if ( b.node0 === node ) {
          nodeTerms.push( new Term( 1, new UnknownCurrent( b ) ) );
        }
      }
      var r;
      for ( i = 0; i < this.resistors.length; i++ ) {
        r = this.resistors[ i ];
        // Treat resistors with R=0 as having unknown current and v1=v2
        if ( r.node0 === node && r.resistance === 0 ) {
          nodeTerms.push( new Term( 1, new UnknownCurrent( r ) ) );
        }
      }
      for ( i = 0; i < this.resistors.length; i++ ) {
        r = this.resistors[ i ];
        if ( r.node0 === node && r.resistance !== 0 ) {
          nodeTerms.push( new Term( -1 / r.resistance, new UnknownVoltage( r.node1 ) ) );
          nodeTerms.push( new Term( 1 / r.resistance, new UnknownVoltage( r.node0 ) ) );
        }
      }
      return nodeTerms;
    },

    /**
     *
     * @param {number} node
     */
    getCurrentConservationTerms: function( node ) {
      assert && assert( typeof node === 'number' );
      return this.getIncomingCurrentTerms( node ).concat( this.getOutgoingCurrentTerms( node ) );
    },

    getNodeSet: function() {
      var nodeSet = {};
      for ( var i = 0; i < this.getElements().length; i++ ) {
        var element = this.getElements()[ i ];
        nodeSet[ element.node0 ] = true;
        nodeSet[ element.node1 ] = true;
      }
      return nodeSet;
    },
    /**
     * obtain one node for each connected component to have the reference voltage of 0.0
     * TODO: This looks more expensive than necessary, what with all of the _.keys etc.
     */
    getReferenceNodes: function() {
      var remaining = this.getNodeSet(); // A separate copy
      var referenceNodes = {};
      while ( _.size( remaining ) > 0 ) {
        var sorted = this.doSort( _.keys( remaining ) );
        referenceNodes[ sorted[ 0 ] ] = true;
        var connected = _.keys( this.getConnectedNodes( sorted[ 0 ] ) );

        // TODO: remove connected nodes from remaining
        // in Java this was
        // remaining.removeAll( connected );

        for ( var i = 0; i < connected.length; i++ ) {
          var c = connected[ i ];
          delete remaining[ c ];
        }
      }
      return _.keys( referenceNodes );
    },
    /**
     * @param {number[]} objects
     */
    doSort: function( objects ) {
      return _.sortBy( objects );
    },

    /**
     *
     * @param {number} node
     */
    getConnectedNodes: function( node ) {
      var visited = {};
      var toVisit = {};
      toVisit[ node ] = true;
      return this.getConnectedNodesRecursive( visited, toVisit );
    },

    /**
     *
     * @param {object} visited
     * @param {object} toVisit
     */
    getConnectedNodesRecursive: function( visited, toVisit ) {
      while ( _.size( toVisit ) > 0 ) {
        var n = parseInt( _.keys( toVisit )[ 0 ] );
        visited[ n ] = true;
        for ( var i = 0; i < this.getElements().length; i++ ) {
          var e = this.getElements()[ i ];
          if ( elementContainsNode( e, n ) && !visited[ getOpposite( e, n ) ] ) {
            toVisit[ getOpposite( e, n ) ] = true;
          }
        }
        delete toVisit[ n ];
      }
      return visited;
    },

    getEquations: function() {
      var list = [];

      //reference node in each connected circuit element has a voltage of 0.0
      for ( var i = 0; i < this.getReferenceNodes().length; i++ ) {
        var n = this.getReferenceNodes()[ i ];
        list.push( new Equation( 0, [ new Term( 1, new UnknownVoltage( parseInt( n ) ) ) ] ) );
      }

      //for each node, charge is conserved
      var nodeKeys = _.keys( this.getNodeSet() );
      for ( i = 0; i < nodeKeys.length; i++ ) {
        var nodeKey = nodeKeys[ i ];
        var node = parseInt( nodeKey );
        list.push( new Equation( this.getRHS( node ), this.getCurrentConservationTerms( node ) ) );
      }

      //for each battery, voltage drop is given
      for ( i = 0; i < this.batteries.length; i++ ) {
        var battery = this.batteries[ i ];
        list.push( new Equation( battery.voltage, [ new Term( -1, new UnknownVoltage( battery.node0 ) ), new Term( 1, new UnknownVoltage( battery.node1 ) ) ] ) );
      }

      //if resistor has no resistance, node0 and node1 should have same voltage
      for ( i = 0; i < this.resistors.length; i++ ) {
        var resistor = this.resistors[ i ];
        if ( resistor.resistance === 0 ) {
          list.push( new Equation( 0, [ new Term( 1, new UnknownVoltage( resistor.node0 ) ), new Term( -1, new UnknownVoltage( resistor.node1 ) ) ] ) );
        }
      }

      return list;
    },

    getUnknownVoltages: function() {
      var v = [];
      var nodes = _.keys( this.getNodeSet() );
      for ( var i = 0; i < nodes.length; i++ ) {
        var node = parseInt( nodes[ i ] );
        v.push( new UnknownVoltage( node ) );
      }
      return v;
    },
    getUnknownCurrents: function() {
      var unknowns = [];
      for ( var i = 0; i < this.batteries.length; i++ ) {
        var battery = this.batteries[ i ];
        unknowns.push( new UnknownCurrent( battery ) );
      }

      // Treat resisters with R=0 as having unknown current and v1=v2
      for ( i = 0; i < this.resistors.length; i++ ) {
        var resistor = this.resistors[ i ];
        if ( resistor.resistance === 0 ) {
          unknowns.push( new UnknownCurrent( resistor ) );
        }
      }
      return unknowns;
    },

    getUnknowns: function() {
      return this.getUnknownCurrents().concat( this.getUnknownVoltages() );
    },

    // TODO: Why call this.getUnknowns so many times? (applies elsewhere in this file)
    solve: function() {
      var equations = this.getEquations();

      var A = new Matrix( equations.length, this.getNumVars() );
      var z = new Matrix( equations.length, 1 );
      var unknowns = this.getUnknowns();
      for ( var i = 0; i < equations.length; i++ ) {
        var equation = equations[ i ];
        equation.stamp( i, A, z, function( unknown ) {

          var index = getIndexByEquals( unknowns, unknown );
          assert && assert( index >= 0, 'unknown was missing' );
          return index;
        } );// TODO: could be sped up, perhaps just set the index on the unknowns themselves?
      }

      if ( debug ) {
        console.log( 'Debugging circuit: ' + this.toString() );
        console.log( equations.join( '\n' ) );
        console.log( 'a=' );
        console.log( A.toString() );
        console.log( 'z=' );
        console.log( z.toString() );
        console.log( 'unknowns=\n' + this.getUnknowns().map( function( u ) {return u.toString();} ).join( '\n' ) );
      }

      var x = A.solve( z );
      if ( debug ) {
        console.log( 'x=' );
        console.log( x.toString() );
      }

      var voltageMap = {};
      for ( i = 0; i < this.getUnknownVoltages().length; i++ ) {
        var nodeVoltage = this.getUnknownVoltages()[ i ];
        voltageMap[ nodeVoltage.node ] = x.get( getIndexByEquals( unknowns, nodeVoltage ), 0 );
      }
      var unknownCurrents = this.getUnknownCurrents();
      for ( i = 0; i < unknownCurrents.length; i++ ) {
        var currentVar = unknownCurrents[ i ];
        currentVar.element.currentSolution = x.get( getIndexByEquals( unknowns, currentVar ), 0 );
      }

      return new LinearCircuitSolution( voltageMap, unknownCurrents.map( function( u ) {
        return u.element;
      } ) );
    }
  } );
} );