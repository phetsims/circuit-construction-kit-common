// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitBasics = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/circuitConstructionKitBasics' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Node = require( 'SCENERY/nodes/Node' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var ProbeTextNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/ProbeTextNode' );
  var DerivedProperty = require( 'AXON/DerivedProperty' );
  var Util = require( 'DOT/Util' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );

  // images
  var ammeterBodyImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/ammeter_body.png' );

  // TODO: Should we use ProbeNode from scenery-phet?
  var ammeterProbeImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/ammeter_probe.png' );

  // TODO: Factor out things between AmmeterNode and VoltmeterNode
  function AmmeterNode( ammeter, options ) {
    var ammeterNode = this;
    options = _.extend( { icon: false }, options );
    var s = 0.5;
    this.ammeter = ammeter;
    var probeTextNode = new ProbeTextNode( new DerivedProperty( [ ammeter.currentProperty ], function( current ) {
      return current === null ? '?' : Util.toFixed( current, 2 ) + ' A';
    } ) );
    var bodyNode = new Image( ammeterBodyImage, {
      scale: s,
      cursor: 'pointer',
      children: [
        // TODO: Move title to ProbeTextNode
        new VBox( {
          spacing: 6,
          centerX: ammeterBodyImage[ 0 ].width / 2,
          centerY: ammeterBodyImage[ 0 ].height / 2,
          align: 'center',
          children: [ new Text( 'Current', { fontSize: 42 } ), probeTextNode ]
        } )
      ]

    } );
    this.probeNode = new Image( ammeterProbeImage, {
      cursor: 'pointer',
      scale: 0.6 * s
    } );

    Node.call( this, {
      children: [ bodyNode, this.probeNode ]
    } );
    ammeter.bodyPositionProperty.link( function( bodyPosition ) {
      bodyNode.centerTop = bodyPosition;
    } );

    ammeter.probePositionProperty.link( function( probePosition ) {
      ammeterNode.probeNode.centerTop = probePosition;
    } );
    ammeter.bodyPositionProperty.link( function( bodyPosition ) {
      if ( ammeter.draggingTogether ) {
        ammeter.probePosition = bodyPosition.plusXY( 80 / 2, -140 / 2 );
      }
    } );

    this.movableDragHandler = new MovableDragHandler( ammeter.bodyPositionProperty, {
      endDrag: function() {
        ammeter.droppedEmitter.emit1( bodyNode.globalBounds );

        // After dropping in the play area the probes move independently of the body
        ammeter.draggingTogether = false;
      }
    } );
    !options.icon && bodyNode.addInputListener( this.movableDragHandler );
    !options.icon && this.probeNode.addInputListener( new MovableDragHandler( ammeter.probePositionProperty, {} ) );
  }

  circuitConstructionKitBasics.register( 'AmmeterNode', AmmeterNode );

  return inherit( Node, AmmeterNode, {} );
} );