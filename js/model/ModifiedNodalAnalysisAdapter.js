// Copyright 2019, University of Colorado Boulder

/**
 * Takes a Circuit, creates a corresponding DynamicCircuit, solves the DynamicCircuit and applies the results back
 * to the original Circuit.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ACVoltage = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ACVoltage' );
  const Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  const Capacitor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Capacitor' );
  const CCKCQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCQueryParameters' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const DynamicCircuit = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/DynamicCircuit' );
  const Fuse = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Fuse' );
  const Inductor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Inductor' );
  const LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  const ModifiedNodalAnalysisCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisCircuitElement' );
  const Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  const SeriesAmmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/SeriesAmmeter' );
  const Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  const TimestepSubdivisions = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/TimestepSubdivisions' );
  const Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );

  // constants
  const ERROR_THRESHOLD = 1E-5;
  const MINIMUM_DT = 1E-5;
  const TIMESTEP_SUBDIVISIONS = new TimestepSubdivisions( ERROR_THRESHOLD, MINIMUM_DT );

  class ResistiveBatteryAdapter extends DynamicCircuit.ResistiveBattery {
    constructor( c, battery ) {
      super( c.vertexGroup.array.indexOf( battery.startVertexProperty.value ), c.vertexGroup.array.indexOf( battery.endVertexProperty.value ), battery.voltageProperty.value, battery.internalResistanceProperty.value );

      // @public (read-only)
      this.battery = battery;
    }

    applySolution( dynamicCircuit ) {

      //don't set voltage on the battery; that actually changes its nominal voltage
      // TODO: we don't need this, right?
      // this.battery.setMNACurrent( result.getInstantaneousCurrent( this ) );
      this.battery.currentProperty.value = dynamicCircuit.getTimeAverageCurrent( this );
    }
  }

  class ResistorAdapter extends ModifiedNodalAnalysisCircuitElement {
    constructor( c, resistor ) {
      super(
        c.vertexGroup.array.indexOf( resistor.startVertexProperty.value ),
        c.vertexGroup.array.indexOf( resistor.endVertexProperty.value ),
        resistor,
        resistor.resistanceProperty.value
      );
      this.resistor = resistor;
    }

    applySolution( dynamicCircuit ) {
      this.resistor.currentProperty.value = dynamicCircuit.getTimeAverageCurrent( this );

      // TODO: is this necessary?  Where would it be used?
      //use average since it doesn't feed back in to the MNA solution
      // this.resistor.setVoltageDrop( solution.getTimeAverageVoltage( this ) );

      // TODO: only used for capacitors and inductors
      // this.resistor.setMNACurrent( solution.getInstantaneousCurrent( this ) );
    }
  }

  class CapacitorAdapter extends DynamicCircuit.DynamicCapacitor {

    constructor( c, capacitor ) {
      const dynamicCircuitCapacitor = new DynamicCircuit.Capacitor(
        c.vertexGroup.array.indexOf( capacitor.startVertexProperty.value ),
        c.vertexGroup.array.indexOf( capacitor.endVertexProperty.value ),
        capacitor.capacitanceProperty.value
      );
      super( dynamicCircuitCapacitor, new DynamicCircuit.DynamicElementState( capacitor.mnaVoltageDrop, capacitor.mnaCurrent ) );
      this._capacitor = capacitor;
    }

    applySolution( dynamicCircuit ) {
      this._capacitor.currentProperty.value = dynamicCircuit.getTimeAverageCurrent( this.capacitor );
      this._capacitor.mnaCurrent = dynamicCircuit.getInstantaneousCurrent( this.capacitor );

      // TODO: is this needed?
      // this._capacitor.setVoltageDrop( solution.getTimeAverageVoltage( this.capacitor ) );
      this._capacitor.mnaVoltageDrop = dynamicCircuit.getInstantaneousVoltage( this.capacitor );
    }
  }

  class InductorAdapter extends DynamicCircuit.DynamicInductor {

    constructor( c, inductor ) {
      const dynamicCircuitInductor = new DynamicCircuit.Inductor(
        c.vertexGroup.array.indexOf( inductor.startVertexProperty.value ),
        c.vertexGroup.array.indexOf( inductor.endVertexProperty.value ),
        inductor.inductanceProperty.value
      );

      // TODO(sign-error): sign error
      super( dynamicCircuitInductor, new DynamicCircuit.DynamicElementState( inductor.mnaVoltageDrop, -inductor.mnaCurrent ) );
      this._inductor = inductor;
    }

    applySolution( dynamicCircuit ) {

      // TODO: differentiate this.inductor from this._inductor.  They are very different types
      // TODO(sign-error): Why is there a negative sign here?
      this._inductor.currentProperty.value = -dynamicCircuit.getTimeAverageCurrent( this.inductor );
      this._inductor.mnaCurrent = -dynamicCircuit.getInstantaneousCurrent( this.inductor );
      // this._inductor.setVoltageDrop( solution.getTimeAverageVoltage( this.inductor ) ); // TODO: is this needed?
      this._inductor.mnaVoltageDrop = dynamicCircuit.getInstantaneousVoltage( this.inductor );
    }
  }

  class ModifiedNodalAnalysisAdapter {

    /**
     * Solves the system with Modified Nodal Analysis, and apply the results back to the Circuit.
     * @param {Circuit} circuit
     * @param {number} dt
     */
    static solveModifiedNodalAnalysis( circuit, dt ) {
      const resistiveBatteryAdapters = [];
      const resistorAdapters = [];
      const capacitorAdapters = [];
      const inductorAdapters = [];
      for ( let i = 0; i < circuit.circuitElements.length; i++ ) {
        const branch = circuit.circuitElements.get( i );
        if ( branch instanceof Battery ) {
          branch.passProperty.reset(); // also resets the internalResistance for the first pass computation
          resistiveBatteryAdapters.push( new ResistiveBatteryAdapter( circuit, branch ) );
        }
        else if ( branch instanceof Resistor ||
                  branch instanceof Fuse ||
                  branch instanceof Wire ||
                  branch instanceof LightBulb ||
                  branch instanceof SeriesAmmeter ||

                  // Since no closed circuit there; see below where current is zeroed out
                  ( branch instanceof Switch && branch.closedProperty.value ) ) {
          resistorAdapters.push( new ResistorAdapter( circuit, branch ) );
        }
        else if ( branch instanceof Switch && !branch.closedProperty.value ) {

          // no element for an open switch
        }
        else if ( branch instanceof Capacitor ) {
          capacitorAdapters.push( new CapacitorAdapter( circuit, branch ) );
        }
        else if ( branch instanceof ACVoltage ) {
          resistiveBatteryAdapters.push( new ResistiveBatteryAdapter( circuit, branch ) );
        }
        else if ( branch instanceof Inductor ) {
          inductorAdapters.push( new InductorAdapter( circuit, branch ) );
        }
        else {
          assert && assert( false, 'Type not found: ' + branch.constructor.name );
        }
      }

      const dynamicCircuit = new DynamicCircuit( resistorAdapters, resistiveBatteryAdapters, capacitorAdapters, inductorAdapters );
      let circuitResult = dynamicCircuit.solveWithSubdivisions( TIMESTEP_SUBDIVISIONS, dt );

      // if any battery exceeds its current threshold, increase its resistance and run the solution again.
      // see https://github.com/phetsims/circuit-construction-kit-common/issues/245
      let needsHelp = false;
      resistiveBatteryAdapters.forEach( batteryAdapter => {
        if ( circuitResult.getTimeAverageCurrent( batteryAdapter ) > CCKCQueryParameters.batteryCurrentThreshold ) {
          batteryAdapter.battery.passProperty.value = 2;
          batteryAdapter.resistance = batteryAdapter.battery.internalResistanceProperty.value;
          needsHelp = true;
        }
      } );
      if ( needsHelp ) {
        circuitResult = dynamicCircuit.solveWithSubdivisions( TIMESTEP_SUBDIVISIONS, dt );
      }

      resistiveBatteryAdapters.forEach( batteryAdapter => batteryAdapter.applySolution( circuitResult ) );
      resistorAdapters.forEach( resistorAdapter => resistorAdapter.applySolution( circuitResult ) );
      capacitorAdapters.forEach( capacitorAdapter => capacitorAdapter.applySolution( circuitResult ) );
      inductorAdapters.forEach( inductorAdapter => inductorAdapter.applySolution( circuitResult ) );

      // zero out currents on open branches
      for ( let i = 0; i < circuit.circuitElements.length; i++ ) {
        const branch = circuit.circuitElements.get( i );
        if ( branch instanceof Switch && !branch.closedProperty.value ) {
          branch.currentProperty.value = 0.0;
          // sw.setVoltageDrop( 0.0 );
        }
      }

      // Apply the node voltages to the vertices
      circuit.vertexGroup.forEach( ( vertex, i ) => {
        const v = circuitResult.resultSet.getFinalState().dynamicCircuitSolution.getNodeVoltage( i );

        // Unconnected vertices like those in the black box may not have an entry in the matrix, so mark them as zero.
        vertex.voltageProperty.set( v || 0 );
      } );
    }
  }

  return circuitConstructionKitCommon.register( 'ModifiedNodalAnalysisAdapter', ModifiedNodalAnalysisAdapter );
} );