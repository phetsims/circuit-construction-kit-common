// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Circuit = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Circuit' );
  var CircuitStruct = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/CircuitStruct' );
  var Voltmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Voltmeter' );
  var Ammeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Ammeter' );
  var CircuitConstructionKitQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitQueryParameters' );
  var TandemEmitter = require( 'TANDEM/axon/TandemEmitter' );

  // phet-io modules
  var TBoolean = require( 'ifphetio!PHET_IO/types/TBoolean' );
  var TString = require( 'ifphetio!PHET_IO/types/TString' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function CircuitConstructionKitModel( tandem ) {

    var self = this;

    this.circuit = new Circuit( tandem.createTandem( 'circuit' ) );
    this.initialCircuitState = this.circuit.toStateObject();
    this.voltmeter = new Voltmeter( tandem.createTandem( 'voltmeter' ) );
    this.ammeter = new Ammeter( tandem.createTandem( 'ammeter' ) );

    // {boolean} @public changes whether the light bulb brightness and ammeter/voltmeter readouts can be seen
    this.exploreScreenRunningProperty = new Property( !CircuitConstructionKitQueryParameters.showPlayPauseButton, {
      tandem: tandem.createTandem( 'exploreScreenRunningProperty' ),
      phetioValueType: TBoolean
    } );

    // @public - whether the user is in the 'investigate' or 'build' mode
    this.modeProperty = new Property( 'investigate', {
      tandem: tandem.createTandem( 'modeProperty' ),
      phetioValueType: TString
    } );

    // When the user manipulates something, hide the readouts, see https://github.com/phetsims/circuit-construction-kit/issues/130
    // The following cases result in pausing
    // 1. More components are dragged out of the toolbox
    // 2. Any vertex is broken
    // 3. Component voltage/resistance is edited
    // 4. A component within a circuit is deleted, see https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/16
    if ( CircuitConstructionKitQueryParameters.showPlayPauseButton ) {
      var pause = function() {
        self.exploreScreenRunningProperty.value = false;
      };
      this.circuit.vertices.lengthProperty.link( pause );
      this.circuit.componentEditedEmitter.addListener( pause );
      this.circuit.componentAddedEmitter.addListener( pause );
      this.circuit.componentDeletedEmitter.addListener( pause );
    }

    var circuitChangedEmitter = new TandemEmitter( {
      tandem: tandem.createTandem( 'circuitChangedEmitter' ),
      phetioArgumentTypes: [ TString ]
    } );

    // For PhET-iO, when a component is edited or a vertex is added, connected, or cut, output the circuit to the data stream
    // Only do this for phet-io brand so it doesn't disturb performance of other brands
    if ( phet.chipper.brand === 'phet-io' ) {

      var emitCircuitChanged = function() {

        // Wait until fully wired up.  If we send out messages immediately here, some vertices are not registered and cause exceptions
        setTimeout( function() {
          var circuit = JSON.stringify( self.circuit.toStateObject() );
          circuitChangedEmitter.emit1( circuit );
        }, 0 );
      };
      this.circuit.vertices.lengthProperty.link( emitCircuitChanged );
      this.circuit.componentEditedEmitter.addListener( emitCircuitChanged );
    }

    this.exploreScreenRunningProperty.link( function( exploreScreenRunning ) {
      self.circuit.constantDensityPropagator.smoothData.clear();
    } );
  }

  circuitConstructionKitCommon.register( 'CircuitConstructionKitModel', CircuitConstructionKitModel );

  return inherit( Object, CircuitConstructionKitModel, {
    step: function( dt ) {

      // Only move electrons if the simulation is not paused.
      if ( this.exploreScreenRunningProperty.value ) {
        this.circuit.step( dt );
      }

      this.circuit.updateElectronsInDirtyCircuitElements();
    },
    reset: function() {
      this.exploreScreenRunningProperty.reset();
      this.modeProperty.reset();
      this.circuit.reset();
      this.voltmeter.reset();
      this.ammeter.reset();

      var struct = CircuitStruct.fromStateObject( this.initialCircuitState );
      this.circuit.loadFromCircuitStruct( struct );
    }
  } );
} );