// Copyright 2016-2017, University of Colorado Boulder

/**
 * A Vertex indicates the end of one or more CircuitElements, or an open connection for the Black Box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var Emitter = require( 'AXON/Emitter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Property = require( 'AXON/Property' );
  var Tandem = require( 'TANDEM/Tandem' );
  var TProperty = require( 'AXON/TProperty' );
  var TVector2 = require( 'DOT/TVector2' );

  // Index counter for debugging
  var counter = 0;

  /**
   * @param {Vector2} position - position in view coordinates
   * @param {Object} [options]
   * @constructor
   */
  function Vertex( position, options ) {

    // @private {number} - Index counter for hashing in CircuitLayerNode.  Also useful for debugging and can be shown
    // with ?vertexDisplay=index
    this.index = counter++;

    options = _.extend( {
      draggable: true, // whether the vertex can be dragged, false for Black Box elements
      attachable: true, // Black box interior elements cannot be connected while the box is closed
      interactive: true, // Black box interface vertices can be interactive (tap to select) without being draggable
      blackBoxInterface: false, // Black box interface vertices cannot be dragged or deleted, but can be connected to
      insideTrueBlackBox: false, // Behavior differs in explore vs test mode
      tandem: Tandem.tandemOptional() // Temporary vertices (for icons) should not be instrumented since they
                                      // are more of an implementation detail rather than a feature
    }, options );

    // @public (read-only)
    this.vertexTandem = options.tandem;

    // @public {Property.<Vector2>} - location of the vertex
    this.positionProperty = new Property( position, {
      tandem: options.tandem && options.tandem.createTandem( 'positionProperty' ),
      phetioType: TProperty( TVector2 ),
      useDeepEquality: true,
      isValidValue: assert && function( p ) {
        return !isNaN( p.x ) && !isNaN( p.y );
      }
    } );

    // @public {Property.<Vector2>} - where the vertex would be if it hadn't snapped to a proposed connection
    this.unsnappedPositionProperty = new Property( position, {
      isValidValue: assert && function( p ) {
        return !isNaN( p.x ) && !isNaN( p.y );
      }
    } );

    // @public {NumberProperty} Relative voltage of the node, determined by Circuit.solve
    this.voltageProperty = new NumberProperty( 0, {
      tandem: options.tandem && options.tandem.createTandem( 'voltageProperty' ),
      units: 'volts'
    } );

    // @public {BooleanProperty} - after the user taps on a vertex it becomes selected, highlighting it and showing a
    // 'cut' button. Multiple vertices can be selected on an iPad, unlike CircuitElements, which can only have one
    // vertex selected at a time.
    this.selectedProperty = new BooleanProperty( false, {
      tandem: options.tandem && options.tandem.createTandem( 'selectedProperty' )
    } );

    // Some of the following properties overlap.  For example, if 'insideTrueBlackBox' is true, then the interactive
    // flag will be set to false when the circuit is in InteractionMode.TEST mode.

    // @public {BooleanProperty} - Vertices on the black box interface persist between build/investigate, and cannot be
    // moved/deleted
    this.draggableProperty = new BooleanProperty( options.draggable );

    // @public {BooleanProperty} - Black box interface vertices can be interactive (tap to select) without being
    // draggable
    this.interactiveProperty = new BooleanProperty( options.interactive );

    // @public {BooleanProperty} - whether the Vertex can be dragged or moved by dragging another part of the circuit
    // must be observable.  When two vertices are joined in Circuit.connect, non-interactivity propagates
    this.attachableProperty = new BooleanProperty( options.attachable );

    // @public (read-only) {BooleanProperty} - whether the vertex is on the edge of a black box.  This means it cannot
    // be deleted, but it can be attached to
    this.blackBoxInterfaceProperty = new BooleanProperty( options.blackBoxInterface );

    // @public {BooleanProperty} - whether the vertex is inside the true black box, not inside the
    // user-created black box, on the interface or outside of the black box
    this.insideTrueBlackBoxProperty = new BooleanProperty( options.insideTrueBlackBox );

    // @public {Emitter} - indicate when the vertex has been moved to the front in z-ordering and layering in the
    // view must be updated
    this.relayerEmitter = new Emitter();

    // @public {function|null} - added by Circuit.js so that listeners can be removed when vertices are removed
    this.vertexSelectedPropertyListener = null;

    // @public {boolean} - Whether the vertex is being actively dragged.
    this.isDragged = false;

    // Tandem.addInstance is not necessary because all of the sub-properties are already tracked, we do not need to
    // refer to the Vertex by reference (tandem name) and it doesn't have events other than those in the sub-properties
  }

  circuitConstructionKitCommon.register( 'Vertex', Vertex );

  return inherit( Object, Vertex, {

    /**
     * Called when vertices are cut.
     * @param {Vector2} position
     * @public
     */
    setPosition: function( position ) {
      this.positionProperty.set( position );
      this.unsnappedPositionProperty.set( position );
    }
  } );
} );