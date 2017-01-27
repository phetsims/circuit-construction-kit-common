// Copyright 2015-2016, University of Colorado Boulder

/**
 * Contains circuit, voltmeter, ammeter and properties to indicate what mode the model is in.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Property = require( 'AXON/Property' );
  var Circuit = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Circuit' );
  var Voltmeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Voltmeter' );
  var Ammeter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Ammeter' );
  var CircuitConstructionKitQueryParameters = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitQueryParameters' );
  var TandemEmitter = require( 'TANDEM/axon/TandemEmitter' );

  // phet-io modules
  var TString = require( 'ifphetio!PHET_IO/types/TString' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function CircuitConstructionKitModel( tandem ) {

    var self = this;

    // @public (read-only)
    this.circuit = new Circuit( tandem.createTandem( 'circuit' ) );

    // @public (read-only)
    this.voltmeter = new Voltmeter( tandem.createTandem( 'voltmeter' ) );

    // @public (read-only)
    this.ammeter = new Ammeter( tandem.createTandem( 'ammeter' ) );

    // @public (read-only) {Property.<boolean>} changes whether the light bulb brightness and ammeter/voltmeter readouts can be seen
    this.exploreScreenRunningProperty = new BooleanProperty( !CircuitConstructionKitQueryParameters.showPlayPauseButton, {
      tandem: tandem.createTandem( 'exploreScreenRunningProperty' )
    } );

    // @public (read-only) {Property.<boolean>} true if the labels in the toolbox should be shown
    this.showLabelsProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'showLabelsProperty' )
    } );

    // @public (read-only) {Property.<string>} - whether the user is in the 'investigate' or 'build' mode
    this.modeProperty = new Property( 'investigate', {
      validValues: [ 'investigate', 'build' ],
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
      this.circuit.vertices.lengthProperty.lazyLink( pause );
      this.circuit.componentEditedEmitter.addListener( pause );
      this.circuit.circuitElements.addItemAddedListener( pause );
      this.circuit.circuitElements.addItemRemovedListener( pause );
    }

    // For PhET-iO, when a component is edited or a vertex is added, connected, or cut, output the circuit to the data stream
    // Only do this for phet-io brand so it doesn't disturb performance of other brands
    if ( phet.chipper.brand === 'phet-io' ) {

      var circuitChangedEmitter = new TandemEmitter( {
        tandem: tandem.createTandem( 'circuitChangedEmitter' ),
        phetioArgumentTypes: [ TString ]
      } );

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

    // When the simulation pauses and resumes, clear the time scaling factor (so it doesn't show a stale value)
    this.exploreScreenRunningProperty.link( function() {
      self.circuit.constantDensityPropagator.timeScaleRunningAverage.clear();
    } );
  }

  circuitConstructionKitCommon.register( 'CircuitConstructionKitModel', CircuitConstructionKitModel );

  return inherit( Object, CircuitConstructionKitModel, {

    /**
     * Update the circuit when the simulation clock steps.
     * @param {number} dt - elapsed time in seconds
     */
    step: function( dt ) {

      // Only move electrons if the simulation is not paused.
      if ( this.exploreScreenRunningProperty.value ) {
        this.circuit.step( dt );
      }

      this.circuit.updateElectronsInDirtyCircuitElements();
    },

    /**
     * Reset the circuit.
     */
    reset: function() {
      this.exploreScreenRunningProperty.reset();
      this.modeProperty.reset();
      this.circuit.reset();
      this.voltmeter.reset();
      this.ammeter.reset();
    }
  } );
} );