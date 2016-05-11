// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKit = require( 'CIRCUIT_CONSTRUCTION_KIT/circuitConstructionKit' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Electron = require( 'CIRCUIT_CONSTRUCTION_KIT/common/model/Electron' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT/CircuitConstructionKitConstants' );

  // constants
  var dolayout = true;
  var electronsVisible = true;
  var ELECTRON_DX = CircuitConstructionKitConstants.electronDX;

  function ConstantDensityLayout( circuit, particleSet ) {
    this.circuit = circuit;
    this.particleSet = particleSet;
  }

  circuitConstructionKit.register( 'ConstantDensityLayout', ConstantDensityLayout );

  return inherit( Object, ConstantDensityLayout, {

    // TODO: Whenever a branch moves, relayout all electrons in all connected branches.
    branchesMoved: function( branches ) {
      if ( !dolayout ) {
        return;
      }
      var bs = [];
      // var bs = new BranchSet( this.circuit, branches );
      // for ( var i = 0; i < branches.length; i++ ) {
      //   bs.addBranches( this.circuit.getStrongConnections( branches[ i ].getStartJunction() ) );
      //   bs.addBranches( this.circuit.getStrongConnections( branches[ i ].getEndJunction() ) );
      // }
      // var torelayout = bs.getBranches();
      this.layoutElectronsForBranches( bs );
    },
    layoutElectronsForBranches: function( branches ) {
      for ( var i = 0; i < branches.length; i++ ) {
        var branch = branches[ i ];
        this.layoutElectrons( branch );
      }
    },
    layoutElectrons: function( circuitElement ) {
      var particlesInBranch = this.particleSet.filter( function( electron ) {
        return electron.circuitElement === circuitElement;
      } );
      this.particleSet.removeAll( particlesInBranch.getArray() );

      if ( electronsVisible ) {
        var offset = ELECTRON_DX / 2;
        var endingPoint = circuitElement.length - offset;

        //compress or expand, but fix a particle at startingPoint and endingPoint.
        var L = endingPoint - offset;
        var desiredDensity = 1 / ELECTRON_DX;
        var N = L * desiredDensity;
        var integralNumberParticles = Math.ceil( N );
        var mydensity = ( integralNumberParticles - 1 ) / L;
        var dx = 1 / mydensity;
        if ( mydensity === 0 ) {
          integralNumberParticles = 0;
        }
        for ( var i = 0; i < integralNumberParticles; i++ ) {
          this.particleSet.add( new Electron( circuitElement, i * dx + offset ) );
        }
      }

    }
  } );
} );