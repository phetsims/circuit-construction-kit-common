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
  var Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Switch' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/LightBulb' );
  var Util = require( 'DOT/Util' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );

  // strings
  var voltageUnitsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltageUnits' );
  var resistanceOhmsSymbolString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistanceOhmsSymbol' );

  /**
   * @param {CircuitElement} circuitElement
   * @param {Property.<boolean>} visibleProperty
   * @param {Tandem} tandem
   * @constructor
   */
  function ValueNode( circuitElement, visibleProperty, tandem ) {
    var self = this;

    // Big enough to see when zoomed out
    var TEXT_OPTIONS = { fontSize: 22 };

    var contentNode = null;
    if ( circuitElement instanceof Battery ) {

      // Battery readouts shows voltage and internal resistance if it is nonzero
      contentNode = new VBox( {
        align: 'left'
      } );

      var voltageText = new Text( '', _.extend( { tandem: tandem.createTandem( 'voltageText' ) }, TEXT_OPTIONS ) );
      circuitElement.voltageProperty.link( function( voltage ) {

        // TODO: factor out formatter with control panel
        voltageText.text = StringUtils.fillIn( voltageUnitsString, { voltage: Util.toFixed( voltage, 1 ) } );
        updatePosition && updatePosition();
      } );

      var resistanceNode = new Text( '', _.extend( { tandem: tandem.createTandem( 'resistanceText' ) }, TEXT_OPTIONS ) );
      circuitElement.internalResistanceProperty.link( function( internalResistance, lastInternalResistance ) {
        resistanceNode.text = StringUtils.fillIn( resistanceOhmsSymbolString, { resistance: Util.toFixed( internalResistance, 1 ) } );

        // If the children should change, update them here
        if ( lastInternalResistance === null || (internalResistance === 0 || lastInternalResistance === 0) ) {
          contentNode.children = internalResistance > 0 ? [ voltageText, resistanceNode ] : [ voltageText ];
        }
        updatePosition && updatePosition();
      } );
    }
    else if ( circuitElement instanceof Resistor || circuitElement instanceof LightBulb ) {
      contentNode = new Text( '', _.extend( { tandem: tandem.createTandem( 'resistanceText' ) }, TEXT_OPTIONS ) );
      circuitElement.resistanceProperty.link( function( resistance ) {
        contentNode.text = StringUtils.fillIn( resistanceOhmsSymbolString, { resistance: Util.toFixed( resistance, 1 ) } );
      } );
    }
    else if ( circuitElement instanceof Switch ) {
      contentNode = new Text( '', _.extend( { tandem: tandem.createTandem( 'switchText' ) }, TEXT_OPTIONS ) );
      circuitElement.resistanceProperty.link( function( resistance ) {
        contentNode.text = StringUtils.fillIn( resistanceOhmsSymbolString, { resistance: resistance > 100000 ? '∞' : Util.toFixed( resistance, 1 ) } );
      } );
    }
    else {
      contentNode = new Text( '', TEXT_OPTIONS );
    }

    assert && assert( contentNode, 'Content node should be defined' );

    Panel.call( this, contentNode, {
      lineWidth: 0,
      fill: new Color( 255, 255, 255, 0.6 ),// put transparency in the color so that the children aren't transparent
      tandem: tandem,
      cornerRadius: 3,
      xMargin: 3,
      yMargin: 1
    } );
    var updatePosition = function() {

      // TODO: position should account for the size of the text label so it doesn't overlap the component.
      var centerPositionAndAngle = circuitElement.getPositionAndAngle( circuitElement.chargePathLength / 2 );
      self.center = centerPositionAndAngle.position.plus( Vector2.createPolar( 24, centerPositionAndAngle.angle + 3 * Math.PI / 2 ) ); // above light bulb
    };
    circuitElement.vertexMovedEmitter.addListener( updatePosition );
    updatePosition();
    visibleProperty.link( function( visible ) { self.visible = visible; } );

    // TODO: implement dispose
  }

  circuitConstructionKitCommon.register( 'ValueNode', ValueNode );

  return inherit( Panel, ValueNode );
} );