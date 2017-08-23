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
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  var Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var RichText = require( 'SCENERY/nodes/RichText' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Color = require( 'SCENERY/util/Color' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Panel = require( 'SUN/Panel' );

  // strings
  var resistanceOhmsSymbolString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistanceOhmsSymbol' );
  var voltageUnitsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltageUnits' );

  // constants
  var VERTICAL_OFFSET = 24;

  // Big enough to see when zoomed out
  var FONT = new PhetFont( { size: 22 } );

  /**
   * @param {CircuitElement} circuitElement
   * @param {Property.<boolean>} showValuesProperty
   * @param {Property.<boolean>} viewProperty - 'lifelike'|'schematic'
   * @param {Tandem} tandem
   * @constructor
   */
  function ValueNode( circuitElement, showValuesProperty, viewProperty, tandem ) {
    var self = this;

    var disposeActions = [];

    var contentNode = null;
    if ( circuitElement instanceof Battery ) {

      var voltageText = new Text( '', _.extend( { tandem: tandem.createTandem( 'voltageText' ) }, { font: FONT } ) );
      var voltageListener = function( voltage ) {

        voltageText.text = StringUtils.fillIn( voltageUnitsString, {
          voltage: Util.toFixed( voltage, circuitElement.numberOfDecimalPlaces )
        } );
        updatePosition && updatePosition();
      };
      circuitElement.voltageProperty.link( voltageListener );

      // Battery readouts shows voltage and internal resistance if it is nonzero
      contentNode = new VBox( {
        align: 'right',
        children: [ voltageText ]
      } );

      var resistanceNode = new Text( '', _.extend( {
        tandem: tandem.createTandem( 'resistanceText' )
      }, { font: FONT } ) );
      var internalResistanceListener = function( internalResistance, lastInternalResistance ) {
        resistanceNode.text = StringUtils.fillIn( resistanceOhmsSymbolString, {
          resistance: Util.toFixed( internalResistance, 1 )
        } );

        // If the children should change, update them here
        if ( lastInternalResistance === null || (internalResistance === 0 || lastInternalResistance === 0) ) {
          var desiredChildren = internalResistance > 0 ? [ voltageText, resistanceNode ] : [ voltageText ];

          // Only set children if changed
          if ( contentNode.getChildrenCount() !== desiredChildren.length ) {
            contentNode.children = desiredChildren;
          }
        }
        updatePosition && updatePosition();
      };
      circuitElement.internalResistanceProperty.link( internalResistanceListener );

      disposeActions.push( function() {
        circuitElement.voltageProperty.unlink( voltageListener );
        circuitElement.internalResistanceProperty.unlink( internalResistanceListener );
      } );
      contentNode.maxWidth = 100;
    }

    else if ( circuitElement instanceof Resistor || circuitElement instanceof LightBulb ) {
      contentNode = new Text( '', _.extend( { tandem: tandem.createTandem( 'resistanceText' ) }, { font: FONT } ) );

      // Items like the hand and dog and high resistance resistor shouldn't show ".0"
      var linkResistance = function( resistance ) {
        contentNode.text = StringUtils.fillIn( resistanceOhmsSymbolString, {
          resistance: Util.toFixed( resistance, circuitElement.numberOfDecimalPlaces )
        } );
        updatePosition && updatePosition();
      };
      circuitElement.resistanceProperty.link( linkResistance );
      disposeActions.push( function() {
        circuitElement.resistanceProperty.unlink( linkResistance );
      } );
      contentNode.maxWidth = 100;
    }
    else if ( circuitElement instanceof Switch ) {

      // Make it easier to read the infinity symbol, see https://github.com/phetsims/circuit-construction-kit-dc/issues/135
      contentNode = new RichText( '', { tandem: tandem.createTandem( 'switchText' ), font: FONT } );

      var updateResistance = function( resistance ) {
        contentNode.text = StringUtils.fillIn( resistanceOhmsSymbolString, {

          // Using a serif font makes the infinity symbol look less lopsided
          resistance: resistance > 100000 ? '<font size="26px" face="serif"><b>∞</b></font>' : '0'
        } );

        // Account for the switch open and close geometry for positioning the label.  When the switch is open
        // the label must be higher
        updatePosition && updatePosition();
      };
      circuitElement.resistanceProperty.link( updateResistance );
      disposeActions.push( function() {
        circuitElement.resistanceProperty.unlink( updateResistance );
      } );
      contentNode.maxWidth = 100;
    }
    else {
      contentNode = new Text( '', { font: FONT } );
    }

    assert && assert( contentNode, 'Content node should be defined' );

    Panel.call( this, contentNode, {
      stroke: null,
      fill: new Color( 255, 255, 255, 0.6 ),// put transparency in the color so that the children aren't transparent
      tandem: tandem,
      cornerRadius: 3,
      xMargin: 3,
      yMargin: 1
    } );

    var updatePosition = function() {

      // Only update position when the value is displayed
      if ( showValuesProperty.get() ) {

        // For a light bulb, choose the part of the filament in the top center for the label, see
        // https://github.com/phetsims/circuit-construction-kit-common/issues/325
        var distance = circuitElement instanceof LightBulb ? 0.56 : 0.5;

        // The label partially overlaps the component to make it clear which label goes with which component
        var centerPositionAndAngle = circuitElement.getPositionAndAngle( circuitElement.chargePathLength * distance );
        var delta = Vector2.createPolar( VERTICAL_OFFSET, centerPositionAndAngle.angle + 3 * Math.PI / 2 );
        self.center = centerPositionAndAngle.position.plus( delta ); // above light bulb
      }
    };

    circuitElement.vertexMovedEmitter.addListener( updatePosition );
    updatePosition();
    showValuesProperty.link( updatePosition );
    viewProperty.link( updatePosition );

    // @private
    this.disposeValueNode = function() {
      circuitElement.vertexMovedEmitter.removeListener( updatePosition );
      showValuesProperty.unlink( updatePosition );
      viewProperty.unlink( updatePosition );
      disposeActions.forEach( function( disposeAction ) {
        disposeAction();
      } );
    };
  }

  circuitConstructionKitCommon.register( 'ValueNode', ValueNode );

  return inherit( Panel, ValueNode, {

    /**
     * @public - dispose when no longer used
     * @override
     */
    dispose: function() {
      Panel.prototype.dispose.call( this );
      this.disposeValueNode();
    }
  } );
} );