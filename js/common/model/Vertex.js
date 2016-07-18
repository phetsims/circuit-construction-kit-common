// Copyright 2015-2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

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
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );
  var Emitter = require( 'AXON/Emitter' );

  // constants
  var DEFAULTS = {
    draggable: true, // {boolean} whether the vertex can be dragged, false for Black Box elements
    attachable: true, // {boolean} false for Black box interior elements
    interactive: true // {boolean} Black box interface vertices can be interactive (tap to select) without being draggable
  };

  var counter = 0;

  /**
   *
   * @param {number} x - position (screen coordinates) in x
   * @param {number} y - position (screen coordinates) in y
   * @param options
   * @constructor
   */
  function Vertex( x, y, options ) {
    this.index = counter++; // @private - For debugging
    options = _.extend( _.clone( DEFAULTS ), {

      // Vertices created for icons do not need a tandem
      tandem: null
    }, options );

    var tandemSet = options.tandem ? {
      position: options.tandem.createTandem( 'positionProperty' ),
      voltage: options.tandem.createTandem( 'voltageProperty' ),
      selected: options.tandem.createTandem( 'selectedProperty' )
    } : {};

    PropertySet.call( this, {

      // {Vertex2} Where the vertex is and is shown
      position: new Vector2( x, y ),

      // {Vector2} Where the vertex would be if it hadn't snapped for a proposed connection
      unsnappedPosition: new Vector2( x, y ),

      // {number} Relative voltage of the node, determined by Circuit.solve
      voltage: 0,

      // @public - after the user taps on a vertex it becomes selected, highlighting it and showing a 'cut' button
      // Multiple vertices can be selected on an iPad, unlike CircuitElements, which can only have one vertex selected
      // at a time.
      selected: false,

      // Some of the following properties overlap somewhat.  For example, if 'insideTrueBlackBox' is true, then
      // the interactive will be set to false when the circuit is in 'build' mode.

      // @public - Vertices on the black box interface persist between build/investigate, and cannot be moved/deleted
      draggable: options.draggable,

      // @public - Black box interface vertices can be interactive (tap to select) without being draggable
      interactive: options.interactive,

      // @public - whether the Vertex can be dragged or moved by dragging another part of the circuit
      // must be observable.  When two vertices are joined in Circuit.connect, non-interactivity propagates
      attachable: options.attachable,

      // @public - whether the vertex is on the edge of a black box.  This means it cannot be deleted, but it can be
      // attached to
      blackBoxInterface: false,

      // @public - whether the vertex is inside the true black box, not inside the user-created black box, on the
      // interface or outside of the black box
      insideTrueBlackBox: false
    }, {
      tandemSet: tandemSet
    } );
    this.moveToFrontEmitter = new Emitter();
  }

  circuitConstructionKitCommon.register( 'Vertex', Vertex );

  return inherit( PropertySet, Vertex, {}, {
    DEFAULTS: DEFAULTS
  } );
} );