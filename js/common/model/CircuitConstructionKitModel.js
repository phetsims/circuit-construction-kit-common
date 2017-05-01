// Copyright 2015-2017, University of Colorado Boulder

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
  var EaseAnimation = require( 'TWIXT/EaseAnimation' );

  // phet-io modules
  var TString = require( 'ifphetio!PHET_IO/types/TString' );
  var TNumber = require( 'ifphetio!PHET_IO/types/TNumber' );

  // constants
  var ZOOM_ANIMATION_TIME = 0.35; // seconds

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function CircuitConstructionKitModel( tandem ) {

    var self = this;

    // @private - animation for the zoom level
    this.zoomAnimation = null;

    // @public (read-only)
    this.circuit = new Circuit( tandem.createTandem( 'circuit' ) );

    // @public (read-only)
    this.voltmeter = new Voltmeter( tandem.createTandem( 'voltmeter' ) );

    // @public (read-only)
    this.ammeter = new Ammeter( tandem.createTandem( 'ammeter' ) );

    // @public (read-only) changes whether the light bulb brightness and ammeter/voltmeter readouts, charges, flame,
    // etc. can be seen
    this.exploreScreenRunningProperty = new BooleanProperty( !CircuitConstructionKitQueryParameters.showPlayPauseButton, {
      tandem: tandem.createTandem( 'exploreScreenRunningProperty' )
    } );

    // @public (read-only) true if the labels in the toolbox should be shown
    this.showLabelsProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'showLabelsProperty' )
    } );

    // @public (read-only) scaling applied to the circuit node so the user can zoom out and make larger circuits.
    this.selectedZoomProperty = new Property( 1, {
      tandem: tandem.createTandem( 'selectedZoomProperty' ),
      phetioValueType: TNumber()
    } );

    // @public (read-only) the animated value of the zoom level
    this.currentZoomProperty = new Property( this.selectedZoomProperty.get(), {
      tandem: tandem.createTandem( 'currentZoomProperty' ),
      phetioValueType: TNumber()
    } );

    this.selectedZoomProperty.lazyLink( function( newValue, oldValue ) {
      self.zoomAnimation = new EaseAnimation( {
        duration: ZOOM_ANIMATION_TIME,
        initialValue: oldValue,
        targetValue: newValue,
        delta: function( delta ) {
          self.currentZoomProperty.value += delta;
        }
      } );
    } );

    // @public (read-only) {Property.<string>} - whether the user is in the 'explore' or 'test' mode
    this.modeProperty = new Property( 'explore', {
      validValues: [ 'explore', 'test' ],
      tandem: tandem.createTandem( 'modeProperty' ),
      phetioValueType: TString
    } );

    // @public (read-only) {Property.<string>} - whether to show lifelike or schematic representations
    this.viewProperty = new Property( 'lifelike', {
      validValues: [ 'lifelike', 'schematic' ],
      tandem: tandem.createTandem( 'viewProperty' ),
      phetioValueType: TString
    } );

    // When the user manipulates something, hide the readouts, see https://github.com/phetsims/circuit-construction-kit/issues/130
    // The following cases result in hiding the readouts:
    // 1. More components are dragged out of the toolbox
    // 2. Any vertex is broken
    // 3. Component voltage/resistance is edited
    // 4. A component within a circuit is deleted, see https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/16
    // However, the simulation should not pause when switching between "Explore" and "Test" and "Reveal" in the black box study sim
    var modeChanging = false;
    self.modeProperty.startedCallbacksForChangedEmitter.addListener( function() {
      modeChanging = true;
    } );
    self.modeProperty.endedCallbacksForChangedEmitter.addListener( function() {
      modeChanging = false;
    } );
    if ( CircuitConstructionKitQueryParameters.showPlayPauseButton ) {
      var pause = function() {
        if ( !modeChanging ) {
          self.exploreScreenRunningProperty.value = false;
        }
      };
      this.circuit.vertices.lengthProperty.lazyLink( pause );
      this.circuit.componentEditedEmitter.addListener( pause );
      this.circuit.circuitElements.lengthProperty.link( pause );
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
        // TODO: can we make this synchronous?
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
      self.circuit.chargeAnimator.timeScaleRunningAverage.clear();
    } );
  }

  circuitConstructionKitCommon.register( 'CircuitConstructionKitModel', CircuitConstructionKitModel );

  return inherit( Object, CircuitConstructionKitModel, {

    /**
     * Update the circuit and zoom level when the simulation clock steps.
     * @param {number} dt - elapsed time in seconds
     * @public
     */
    step: function( dt ) {

      if ( this.zoomAnimation ) {
        var overflow = this.zoomAnimation.step( dt );
        if ( overflow > 0 ) {
          this.zoomAnimation = null;
        }
      }

      // Only move charges if the simulation is not paused.
      if ( this.exploreScreenRunningProperty.value ) {
        this.circuit.step( dt );
      }

      this.circuit.layoutChargesInDirtyCircuitElements();
    },

    /**
     * Reset the circuit.
     * @public
     */
    reset: function() {
      this.exploreScreenRunningProperty.reset();
      this.showLabelsProperty.reset();
      this.modeProperty.reset();
      this.circuit.reset();
      this.voltmeter.reset();
      this.ammeter.reset();
      this.viewProperty.reset();
      this.currentZoomProperty.reset();
      this.selectedZoomProperty.reset();
    }
  } );
} );