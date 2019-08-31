// Copyright 2019, University of Colorado Boulder

/**
 * TODO: Documentation
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ACVoltage = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ACVoltage' );
  const Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  const Capacitor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Capacitor' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const DynamicCircuit = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/DynamicCircuit' );
  const LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  const ModifiedNodalAnalysisCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ModifiedNodalAnalysisCircuitElement' );
  const Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  const SeriesAmmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/SeriesAmmeter' );
  const Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  const TimestepSubdivisions = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/TimestepSubdivisions' );
  const Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );

  const errorThreshold = 1E-5;
  const minDT = 1E-5;

  class ResistiveBatteryAdapter extends DynamicCircuit.ResistiveBattery {

    constructor( c, battery ) {
      super( c.vertices.indexOf( battery.startVertexProperty.value ), c.vertices.indexOf( battery.endVertexProperty.value ), battery.voltageProperty.value, battery.internalResistanceProperty.value );
      this.battery = battery;
    }

    applySolution( result ) {

      //don't set voltage on the battery; that actually changes its nominal voltage
      // TODO: we don't need this, right?
      // this.battery.setMNACurrent( result.getInstantaneousCurrent( this ) );
      this.battery.currentProperty.value = result.getTimeAverageCurrent( this );
    }
  }

  class ResistorAdapter extends ModifiedNodalAnalysisCircuitElement {
    constructor( c, resistor ) {
      super(
        c.vertices.indexOf( resistor.startVertexProperty.value ),
        c.vertices.indexOf( resistor.endVertexProperty.value ),
        resistor,
        resistor.resistanceProperty.value
      );
      this.resistor = resistor;
    }

    applySolution( solution ) {
      this.resistor.currentProperty.value = solution.getTimeAverageCurrent( this );

      // TODO: is this necessary?  Where would it be used?
      //use average since it doesn't feed back in to the MNA solution
      // this.resistor.setVoltageDrop( solution.getTimeAverageVoltage( this ) );
      // this.resistor.setMNACurrent( solution.getInstantaneousCurrent( this ) ); // TODO: only used for capacitors and inductors
    }
  }

  class CapacitorAdapter extends DynamicCircuit.DynamicCapacitor {

    constructor( c, capacitor ) {
      const dynamicCircuitCapacitor = new DynamicCircuit.Capacitor(
        c.vertices.indexOf( capacitor.startVertexProperty.value ),
        c.vertices.indexOf( capacitor.endVertexProperty.value ),
        capacitor.capacitanceProperty.value
      );
      super( dynamicCircuitCapacitor, new DynamicCircuit.DynamicElementState( capacitor.mnaVoltageDrop, capacitor.mnaCurrent ) );
      this._capacitor = capacitor;
    }

    applySolution( solution ) {
      this._capacitor.currentProperty.value = solution.getTimeAverageCurrent( this.capacitor );
      this._capacitor.mnaCurrent = solution.getInstantaneousCurrent( this.capacitor );
      // this._capacitor.setVoltageDrop( solution.getTimeAverageVoltage( this.capacitor ) ); // TODO: hallo?
      this._capacitor.mnaVoltageDrop = solution.getInstantaneousVoltage( this.capacitor );
    }
  }

  // TODO:
  // class InductorAdapter extends DynamicCircuit.DynamicInductor {
  //
  //   constructor( c, inductor ) {
  //     super( new DynamicCircuit.Inductor( c.vertices.indexOf( inductor.startVertexProperty.value ), c.vertices.indexOf( inductor.endVertexProperty.value ), inductor.getInductance() ),
  //       new DynamicCircuit.DynamicElementState( inductor.getMNAVoltageDrop(), -inductor.getMNACurrent() ) );//todo: sign error
  //     this.inductor = inductor;
  //   }
  //
  //   applySolution( solution ) {
  //     this.inductor.setCurrent( -solution.getTimeAverageCurrent( this.getInductor() ) );//todo: sign error
  //     this.inductor.setMNACurrent( -solution.getInstantaneousCurrent( this.getInductor() ) );
  //     this.inductor.setVoltageDrop( solution.getTimeAverageVoltage( this.getInductor() ) );
  //     this.inductor.setMNAVoltageDrop( solution.getInstantaneousVoltage( this.getInductor() ) );
  //   }
  // }

  class ModifiedNodalAnalysisAdapter {

    static apply( circuit, dt ) {
      const batteries = []; // ResistiveBatteryAdapter
      const resistors = []; // ResistorAdapter
      const capacitors = []; // CapacitorAdapter
      const inductors = []; // InductorAdapter
      for ( let i = 0; i < circuit.circuitElements.length; i++ ) {
        const branch = circuit.circuitElements.get( i ); // Branch
        if ( branch instanceof Battery ) {
          batteries.push( new ResistiveBatteryAdapter( circuit, branch ) );
        }
        else if ( branch instanceof Resistor ) {
          resistors.push( new ResistorAdapter( circuit, branch ) );
        }
        else if ( branch instanceof Wire ) {
          resistors.push( new ResistorAdapter( circuit, branch ) );
        }
        // else if ( branch instanceof Filament ) {
        //   resistors.push( new ResistorAdapter( circuit, branch ) );
        // }
        else if ( branch instanceof Switch ) {
          if ( branch.isClosed() ) {
            resistors.push( new ResistorAdapter( circuit, branch ) );
          } //else do nothing, since no closed circuit there; see below where current is zeroed out
        }
        else if ( branch instanceof LightBulb ) {
          resistors.push( new ResistorAdapter( circuit, branch ) );
        }
        else if ( branch instanceof SeriesAmmeter ) {
          resistors.push( new ResistorAdapter( circuit, branch ) );
        }
        else if ( branch instanceof Capacitor ) {
          capacitors.push( new CapacitorAdapter( circuit, branch ) );
        }
        else if ( branch instanceof ACVoltage ) {
          batteries.push( new ResistiveBatteryAdapter( circuit, branch ) );
        }
        // TODO: Inductors!
        // else if ( branch instanceof Inductor ) {
        //   inductors.push( new InductorAdapter( circuit, branch ) );
        // }
        else {
          assert && assert( false, 'Type not found' );
        }
      }

      const dynamicCircuit = new DynamicCircuit( [], resistors, [], batteries, capacitors, inductors ); // new ObjectOrientedMNA() );

      const results = dynamicCircuit.solveWithSubdivisions( new TimestepSubdivisions( errorThreshold, minDT ), dt );
      batteries.forEach( batteryAdapter => batteryAdapter.applySolution( results ) );
      resistors.forEach( resistorAdapter => resistorAdapter.applySolution( results ) );
      capacitors.forEach( capacitorAdapter => capacitorAdapter.applySolution( results ) );
      inductors.forEach( inductorAdapter => inductorAdapter.applySolution( results ) );

      //zero out currents on open branches
      for ( let i = 0; i < circuit.circuitElements.length; i++ ) {
        const branch = circuit.circuitElements.get( i );
        if ( branch instanceof Switch ) {
          const sw = branch;
          if ( !sw.isClosed() ) {
            sw.setCurrent( 0.0 );
            sw.setVoltageDrop( 0.0 );
          }
        }
      }
      circuit.setSolution( results );
      // fireCircuitSolved();
    }
  }

  return circuitConstructionKitCommon.register( 'ModifiedNodalAnalysisAdapter', ModifiedNodalAnalysisAdapter );
} );