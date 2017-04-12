// Copyright 2015-2016, University of Colorado Boulder

/**
 * A Vertex indicates the end of one or more CircuitElements, or an open connection for the Black Box.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Vector2 = require( 'DOT/Vector2' );
  var Emitter = require( 'AXON/Emitter' );
  var TVector2 = require( 'DOT/TVector2' );

  // phet-io modules
  var TNumber = require( 'ifphetio!PHET_IO/types/TNumber' );

  // Index counter for debugging
  var counter = 0;

  /**
   * @param {number} x - position (screen coordinates) in x
   * @param {number} y - position (screen coordinates) in y
   * @param {Object} [options]
   * @constructor
   */
  function Vertex( x, y, options ) {

    // @private - Index counter for debugging, can be shown with ?vertexDisplay=index
    this.index = counter++;

    options = _.extend( {
      draggable: true, // whether the vertex can be dragged, false for Black Box elements
      attachable: true, // Black box interior elements cannot be connected while the box is closed
      interactive: true, // Black box interface vertices can be interactive (tap to select) without being draggable
      blackBoxInterface: false, // Black box interface vertices cannot be dragged or deleted, but can be connected to
      insideTrueBlackBox: false, // Behavior differs in explore vs test mode
      tandem: null
    }, options );

    // @public (read-only)  - location of the vertex
    this.positionProperty = new Property( new Vector2( x, y ), {
      tandem: options.tandem && options.tandem.createTandem( 'positionProperty' ),
      phetioValueType: TVector2
    } );

    // @public (read-only) - where the vertex would be if it hadn't snapped for a proposed connection
    this.unsnappedPositionProperty = new Property( new Vector2( x, y ) );

    // @public (read-only) {number} Relative voltage of the node, determined by Circuit.solve
    this.voltageProperty = new NumberProperty( 0, {
      tandem: options.tandem && options.tandem.createTandem( 'voltageProperty' ),
      phetioValueType: TNumber( { units: 'volts' } )
    } );

    // @public (read-only) - after the user taps on a vertex it becomes selected, highlighting it and showing a 'cut' button
    // Multiple vertices can be selected on an iPad, unlike CircuitElements, which can only have one vertex selected
    // at a time.
    this.selectedProperty = new BooleanProperty( false, {
      tandem: options.tandem && options.tandem.createTandem( 'selectedProperty' )
    } );

    // Some of the following properties overlap.  For example, if 'insideTrueBlackBox' is true, then the interactive
    // flag will be set to false when the circuit is in 'test' mode.

    // @public (read-only) - Vertices on the black box interface persist between build/investigate, and cannot be moved/deleted
    this.draggableProperty = new BooleanProperty( options.draggable );

    // @public (read-only) - Black box interface vertices can be interactive (tap to select) without being draggable
    this.interactiveProperty = new BooleanProperty( options.interactive );

    // @public (read-only) - whether the Vertex can be dragged or moved by dragging another part of the circuit
    // must be observable.  When two vertices are joined in Circuit.connect, non-interactivity propagates
    this.attachableProperty = new BooleanProperty( options.attachable );

    // @public (read-only) - whether the vertex is on the edge of a black box.  This means it cannot be deleted, but it can be
    // attached to
    this.blackBoxInterfaceProperty = new BooleanProperty( options.blackBoxInterface );

    // @public (read-only) - whether the vertex is inside the true black box, not inside the user-created black box, on the
    // interface or outside of the black box
    this.insideTrueBlackBoxProperty = new BooleanProperty( options.insideTrueBlackBox );

    // @public (read-only) - indicate when the vertex has been moved to the front in z-ordering
    this.relayerEmitter = new Emitter();

    // TODO: Does this need Tandem.addInstance(this,TVertex?)?
  }

  circuitConstructionKitCommon.register( 'Vertex', Vertex );

  return inherit( Object, Vertex );
} );