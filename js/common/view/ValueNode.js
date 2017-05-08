// Copyright 2017, University of Colorado Boulder

/**
 * When enabled, shows the readout above circuit elements, such as "9.0 V" for a 9 volt battery.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Color = require( 'SCENERY/util/Color' );
  var Vector2 = require( 'DOT/Vector2' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Battery' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Resistor' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/LightBulb' );
  var Util = require( 'DOT/Util' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  /**
   * @param {CircuitElement} circuitElement
   * @param {Property.<boolean>} visibleProperty
   * @constructor
   */
  function ValueNode( circuitElement, visibleProperty ) {
    var self = this;

    // Big enough to see when zoomed out
    var TEXT_OPTIONS = { fontSize: 25 };

    var textNode = null;
    if ( circuitElement instanceof Battery ) {

      // Show voltage.  Also show internal resistance if it is nonzero
      textNode = new VBox( {
        align: 'left'
      } );

      // TODO: use Node with children which update if internal resistance > 0
      var voltageNode = new Text( '9.0 V', TEXT_OPTIONS );
      circuitElement.voltageProperty.link( function( voltage ) {
        voltageNode.text = Util.toFixed( voltage, 1 ) + ' V'; // TODO: pattern and i18n and factor out formatter with control panel
        // TODO: internal resistance
        updatePosition && updatePosition();
      } );

      var resistanceNode = new Text( 'some ohms', TEXT_OPTIONS );
      circuitElement.internalResistanceProperty.link( function( internalResistance ) {
        resistanceNode.text = Util.toFixed( internalResistance, 1 ) + ' Ω';
        textNode.children = internalResistance > 0 ? [ voltageNode, resistanceNode ] : [ voltageNode ]; // TODO: performance
        updatePosition && updatePosition();
      } );
    }
    else if ( circuitElement instanceof Resistor || circuitElement instanceof LightBulb ) {
      textNode = new Text( '9.0 V', TEXT_OPTIONS );
      circuitElement.resistanceProperty.link( function( resistance ) {
        textNode.text = Util.toFixed( resistance, 1 ) + ' Ω';
      } );
    }
    else {
      textNode = new Text( 'hello!', TEXT_OPTIONS );
    }

    assert && assert( textNode, 'Text node should be defined' );

    Panel.call( this, textNode, {
      lineWidth: 0,
      fill: new Color( 255, 255, 255, 0.5 )// put transparency in the color so that the children aren't transparent
    } );
    var updatePosition = function() {

      // TODO: position should account for the size of the text label so it doesn't overlap the component.
      var centerPositionAndAngle = circuitElement.getPositionAndAngle( circuitElement.chargePathLength / 2 );
      self.center = centerPositionAndAngle.position.plus( Vector2.createPolar( 60, centerPositionAndAngle.angle + 3 * Math.PI / 2 ) ); // above light bulb
    };
    circuitElement.vertexMovedEmitter.addListener( updatePosition );
    updatePosition();
    visibleProperty.link( function( visible ) {
      self.visible = visible;
    } );
  }

  circuitConstructionKitCommon.register( 'ValueNode', ValueNode );

  return inherit( Panel, ValueNode );
} );