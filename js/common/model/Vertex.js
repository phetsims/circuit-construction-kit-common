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
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );
  var Emitter = require( 'AXON/Emitter' );

  // phet-io modules
  var TNumber = require( 'ifphetio!PHET_IO/types/TNumber' );
  var TVector2 = require( 'ifphetio!PHET_IO/types/dot/TVector2' );
  var TBoolean = require( 'ifphetio!PHET_IO/types/TBoolean' );

  // constants
  var DEFAULTS = {
    draggable: true, // {boolean} whether the vertex can be dragged, false for Black Box elements
    attachable: true, // {boolean} false for Black box interior elements
    interactive: true // {boolean} Black box interface vertices can be interactive (tap to select) without being draggable
  };

  var counter = 0;

  /**
   * @param {number} x - position (screen coordinates) in x
   * @param {number} y - position (screen coordinates) in y
   * @param {Object} [options]
   * @constructor
   */
  function Vertex( x, y, options ) {

    this.index = counter++; // @private - For debugging

    options = _.extend( _.clone( DEFAULTS ), {
      tandem: null // Vertices created for icons do not need a tandem
    }, options );

    // {Property.<Vertex2>} Where the vertex is and is shown
    this.positionProperty = new Property( new Vector2( x, y ), {
      tandem: options.tandem && options.tandem.createTandem( 'positionProperty' ),
      phetioValueType: TVector2
    } );

    // {Property.<Vector2>} Where the vertex would be if it hadn't snapped for a proposed connection
    this.unsnappedPositionProperty = new Property( new Vector2( x, y ) );

    // {number} Relative voltage of the node, determined by Circuit.solve
    this.voltageProperty = new Property( 0, {
      tandem: options.tandem && options.tandem.createTandem( 'voltageProperty' ),
      phetioValueType: TNumber( { units: 'volts' } )
    } );

    // @public - after the user taps on a vertex it becomes selected, highlighting it and showing a 'cut' button
    // Multiple vertices can be selected on an iPad, unlike CircuitElements, which can only have one vertex selected
    // at a time.
    this.selectedProperty = new Property( false, {
      tandem: options.tandem && options.tandem.createTandem( 'selectedProperty' ),
      phetioValueType: TBoolean
    } );

    // Some of the following properties overlap somewhat.  For example, if 'insideTrueBlackBox' is true, then
    // the interactive will be set to false when the circuit is in 'build' mode.

    // @public - Vertices on the black box interface persist between build/investigate, and cannot be moved/deleted
    this.draggableProperty = new Property( options.draggable );

    // @public - Black box interface vertices can be interactive (tap to select) without being draggable
    this.interactiveProperty = new Property( options.interactive );

    // @public - whether the Vertex can be dragged or moved by dragging another part of the circuit
    // must be observable.  When two vertices are joined in Circuit.connect, non-interactivity propagates
    this.attachableProperty = new Property( options.attachable );

    // @public - whether the vertex is on the edge of a black box.  This means it cannot be deleted, but it can be
    // attached to
    this.blackBoxInterfaceProperty = new Property( false );

    // @public - whether the vertex is inside the true black box, not inside the user-created black box, on the
    // interface or outside of the black box
    this.insideTrueBlackBoxProperty = new Property( false );

    Property.preventGetSet( this, 'position' );
    Property.preventGetSet( this, 'unsnappedPosition' );
    Property.preventGetSet( this, 'voltage' );
    Property.preventGetSet( this, 'selected' );
    Property.preventGetSet( this, 'draggable' );
    Property.preventGetSet( this, 'interactive' );
    Property.preventGetSet( this, 'attachable' );
    Property.preventGetSet( this, 'blackBoxInterface' );
    Property.preventGetSet( this, 'insideTrueBlackBox' );

    // @public (read-only) - indicate when the vertex has been moved to the front in z-ordering
    this.moveToFrontEmitter = new Emitter();
  }

  circuitConstructionKitCommon.register( 'Vertex', Vertex );

  return inherit( Object, Vertex, {}, {
    DEFAULTS: DEFAULTS
  } );
} );