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
  var CircuitConstructionKitBasicsPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/CircuitConstructionKitBasicsPanel' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Battery' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/LightBulb' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Vertex' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Wire' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/model/Resistor' );
  var Image = require( 'SCENERY/nodes/Image' );
  var CircuitConstructionKitBasicsConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/CircuitConstructionKitBasicsConstants' );
  var ResistorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/ResistorNode' );
  var WireNode = require( 'CIRCUIT_CONSTRUCTION_KIT_BASICS/common/view/WireNode' );
  var Vector2 = require( 'DOT/Vector2' );
  var LightBulbNode = require( 'SCENERY_PHET/LightBulbNode' );
  var Property = require( 'AXON/Property' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );

  // images
  var batteryImage = require( 'mipmap!CIRCUIT_CONSTRUCTION_KIT_BASICS/battery.png' );

  /**
   * @param {Circuit} circuit
   * @param {CircuitNode} circuitNode
   * @constructor
   */
  function CircuitElementToolbox( circuit, circuitNode, options ) {

    options = _.extend( { orientation: 'vertical' }, options );
    var circuitElementToolbox = this;
    // From: https://github.com/phetsims/scenery-phet/issues/195#issuecomment-186300071
    // @jonathanolson and I looked into the way Charges and Fields just calls startDrag(event) on the play area drag listener (which adds a listener to the pointer, in the usual SimpleDragHandler way), and it seems like a good pattern. I will try this pattern for Circuit Construction Kit, when I am working on the toolbox listeners.

    /**
     *
     * @param {Function} createElement - given a view location, create a circuit element
     * @param {ObservableArray.<Object>} modelList - list of circuit elements the new element should be added to
     * @param {Array.<Node>} viewList - list of nodes where the newly created circuit element node will be found
     * @param {Function} getCircuitElementFromNode - function that gets a model element from a node
     * @returns {{down: down}}
     */
    var createToolIconInputListener = function( createElement, modelList, viewList, getCircuitElementFromNode ) {
      return {
        down: function( event ) {

          // Ignore non-left-mouse-button, see #64
          if ( event.pointer.isMouse && event.domEvent.button !== 0 ) {
            return;
          }

          // initial position of the pointer in the screenView coordinates
          var viewPosition = circuitElementToolbox.globalToParentPoint( event.pointer.point );
          var circuitElement = createElement( viewPosition );
          modelList.add( circuitElement );
          var matchedNodes = viewList.filter( function( circuitElementNode ) {
            return getCircuitElementFromNode( circuitElementNode ) === circuitElement;
          } );
          assert && assert( matchedNodes.length === 1, 'should have found the one and only node for this battery' );
          var circuitElementNode = matchedNodes[ 0 ];
          circuitElementNode.inputListener.startDrag( event );
        }
      };
    };

    var iconWidth = CircuitConstructionKitBasicsConstants.toolboxIconLength;
    var wireNode = new WireNode( null, null, new Wire( new Vertex( 0, 0 ), new Vertex( 100, 0 ), 0 ) );

    var resistorNode = new ResistorNode( null, null, new Resistor( new Vertex( 0, 0 ), new Vertex( Resistor.RESISTOR_LENGTH, 0 ), CircuitConstructionKitBasicsConstants.defaultResistance ), { icon: true } );
    var lightBulbNode = new LightBulbNode( new Property( 0 ) );

    CircuitConstructionKitBasicsPanel.call( this, new LayoutBox( {
      orientation: options.orientation,
      spacing: CircuitConstructionKitBasicsConstants.toolboxItemSpacing,
      children: [
        wireNode.mutate( { scale: iconWidth / Math.max( wireNode.width, wireNode.height ) } )
          .addInputListener( createToolIconInputListener(
            function( position ) {
              return new Wire( new Vertex( position.x - 50, position.y ), new Vertex( position.x + 50, position.y ), CircuitConstructionKitBasicsConstants.defaultResistivity );
            },
            circuit.wires,
            circuitNode.wireNodes,
            function( wireNode ) { return wireNode.wire; }
          ) ),
        new Image( batteryImage, {
          cursor: 'pointer',
          scale: iconWidth / Math.max( batteryImage[ 0 ].width, batteryImage[ 0 ].height )
        } )
          .addInputListener( createToolIconInputListener(
            function( position ) {
              var batteryLength = Battery.BATTERY_LENGTH;
              var startVertex = new Vertex( position.x - batteryLength / 2, position.y );
              var endVertex = new Vertex( position.x + batteryLength / 2, position.y );
              return new Battery( startVertex, endVertex, 9.0 );
            },
            circuit.batteries,
            circuitNode.batteryNodes,
            function( batteryNode ) { return batteryNode.battery; }
          ) ),
        lightBulbNode.mutate( {
            pickable: true,
            cursor: 'pointer',
            scale: iconWidth / Math.max( lightBulbNode.width, lightBulbNode.height ) // constrained by being too tall, not too wide
          } )
          .addInputListener( createToolIconInputListener(
            function( position ) {

              var translation = new Vector2( 30, 10 );

              // Connect at the side and bottom
              var lightBulbLength = LightBulb.DISTANCE_BETWEEN_VERTICES;
              var startPoint = new Vector2( position.x - lightBulbLength / 2, position.y ).plus( translation );
              var endPoint = new Vector2( position.x, position.y + lightBulbLength / 4 ).plus( translation );

              var delta = endPoint.minus( startPoint );
              var angle = delta.angle();

              endPoint = startPoint.plus( Vector2.createPolar( LightBulb.DISTANCE_BETWEEN_VERTICES, angle - Math.PI * 0.3975 ) );

              var startVertex = new Vertex( startPoint.x, startPoint.y );
              var endVertex = new Vertex( endPoint.x, endPoint.y );

              return new LightBulb( startVertex, endVertex, CircuitConstructionKitBasicsConstants.defaultResistance );
            },
            circuit.lightBulbs,
            circuitNode.lightBulbNodes,
            function( lightBulbNode ) { return lightBulbNode.lightBulb; }
          ) ),

        resistorNode.mutate( {
            pickable: true,
            cursor: 'pointer',
            scale: iconWidth / Math.max( resistorNode.width, resistorNode.height )
          } )
          .addInputListener( createToolIconInputListener(
            function( position ) {
              var resistorLength = Resistor.RESISTOR_LENGTH;
              var startVertex = new Vertex( position.x - resistorLength / 2, position.y );
              var endVertex = new Vertex( position.x + resistorLength / 2, position.y );
              return new Resistor( startVertex, endVertex, CircuitConstructionKitBasicsConstants.defaultResistance );
            },
            circuit.resistors,
            circuitNode.resistorNodes,
            function( resistorNode ) { return resistorNode.resistor; }
          ) )
      ]
    } ) );
  }

  circuitConstructionKitBasics.register( 'CircuitElementToolbox', CircuitElementToolbox );

  return inherit( CircuitConstructionKitBasicsPanel, CircuitElementToolbox );
} );