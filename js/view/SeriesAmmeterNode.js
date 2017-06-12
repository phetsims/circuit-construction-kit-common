// Copyright 2015-2017, University of Colorado Boulder

/**
 * Renders the view for the SeriesAmmeter, which looks the same in lifelike mode or schematic mode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var FixedLengthCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedLengthCircuitElementNode' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Property = require( 'AXON/Property' );
  var Node = require( 'SCENERY/nodes/Node' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Panel = require( 'SUN/Panel' );
  var Util = require( 'DOT/Util' );
  var StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var CCKUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKUtil' );
  
  // strings
  var currentString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/current' );
  var ampereUnitsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/ampereUnits' );

  // constants
  var PANEL_HEIGHT = 40;
  var PANEL_WIDTH = CircuitConstructionKitConstants.SERIES_AMMETER_LENGTH;
  var ORANGE = '#f39033';
  var WIDEST_LABEL = '99.99 A';

  /**
   * @param {CCKScreenView} circuitConstructionKitScreenView
   * @param {CircuitLayerNode} circuitLayerNode
   * @param {SeriesAmmeter} seriesAmmeter
   * @param {Property.<boolean>} showResultsProperty - supplied for consistency with other CircuitElementNode constructors
   * @param {Property.<string>} viewProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function SeriesAmmeterNode( circuitConstructionKitScreenView, circuitLayerNode, seriesAmmeter, showResultsProperty, viewProperty, tandem, options ) {
    var self = this;
    options = options || {};
    viewProperty = new Property( 'lifelike' );

    // Electrons go behind this panel to give the appearance they go through the ammeter
    var readoutText = new Text( WIDEST_LABEL, { fontSize: 15 } );
    readoutText.setMaxWidth( readoutText.width );
    var maxWidth = readoutText.width;
    var maxHeight = readoutText.height;

    // Margins within the numeric readout text box
    var textPanelMarginX = 3;
    var textPanelMarginY = 1;

    /**
     * Update the text in the numeric readout text box
     * @param {number} current
     */
    var updateText = function( current ) {

      // The ammeter doesn't indicate direction
      current = Math.abs( current );
      var currentText = ( current < 1E-10 ) ? '' : CCKUtil.createMeasurementReadout( ampereUnitsString, 'ampere', current, 2 );
      readoutText.setText( currentText );

      // Center the text in the panel
      readoutText.centerX = (maxWidth + textPanelMarginX * 2) / 2;
      readoutText.centerY = (maxHeight + textPanelMarginY * 2) / 2;
    };

    seriesAmmeter.currentProperty.link( updateText );

    // The readout panel is in front of the series ammeter node, and makes it look like the electrons flow through
    // the series ammeter
    var readoutPanel = new Panel( new VBox( {
      children: [
        new Text( currentString, { fontSize: 12, maxWidth: 54 } ),
        new Rectangle( 0, 0, maxWidth + textPanelMarginX * 2, maxHeight + textPanelMarginY * 2, 4, 4, {
          stroke: 'black',
          fill: 'white',
          lineWidth: 0.75,
          children: [
            readoutText
          ]
        } )
      ]
    } ), {
      pickable: false,
      fill: ORANGE,
      stroke: null,
      xMargin: 4,
      yMargin: 0,
      tandem: tandem.createTandem( 'readoutPanel' )
    } );

    /**
     * Utility function for creating a panel for the sensor body
     * @param {Object} options
     * @returns {Rectangle}
     */
    var createPanel = function( options ) {
      return new Rectangle( 0, 0, PANEL_WIDTH, PANEL_HEIGHT, 4, 4, options );
    };

    // This node only has a lifelike representation because it is a sensor
    var lifelikeNode = new Node( {
      children: [

        // orange background panel
        createPanel( { fill: ORANGE } ),

        // gray track
        new Rectangle( 0, 0, PANEL_WIDTH, 20, {
          fill: '#bcbdbf',
          centerY: PANEL_HEIGHT / 2
        } ),

        // black border
        createPanel( {
          stroke: '#231f20',
          lineWidth: 2.4
        } )
      ]
    } );

    // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
    lifelikeNode.mouseArea = lifelikeNode.bounds.copy();
    lifelikeNode.touchArea = lifelikeNode.bounds.copy();

    // Center vertically to match the FixedLengthCircuitElementNode assumption that origin is center left
    lifelikeNode.centerY = 0;

    // Center the readout within the main body of the sensor
    readoutPanel.centerX = lifelikeNode.centerX;
    readoutPanel.centerY = lifelikeNode.centerY;

    // @private - the panel to be shown in front for z-ordering.  Wrap centered in a child node to make the layout
    // in updateRender trivial.
    this.frontPanel = new Node( {
      children: [
        readoutPanel
      ]
    } );

    if ( options.icon ) {
      lifelikeNode.addChild( this.frontPanel.mutate( { centerY: lifelikeNode.height / 2 - 2 } ) );
    }
    else {
      circuitLayerNode.seriesAmmeterNodeReadoutPanelLayer.addChild( this.frontPanel );
    }

    FixedLengthCircuitElementNode.call( this,
      circuitConstructionKitScreenView,
      circuitLayerNode,
      seriesAmmeter,
      viewProperty,
      lifelikeNode,
      new Node( { children: [ lifelikeNode ] } ),// reuse lifelike view for the schematic view
      tandem,
      options
    );

    // @private (read-only)
    this.icon = options.icon;

    // @private
    this.disposeSeriesAmmeterNode = function() {
      seriesAmmeter.currentProperty.unlink( updateText );
      if ( !this.icon ) {
        circuitLayerNode.seriesAmmeterNodeReadoutPanelLayer.removeChild( self.frontPanel );
      }
    };
  }

  circuitConstructionKitCommon.register( 'SeriesAmmeterNode', SeriesAmmeterNode );

  return inherit( FixedLengthCircuitElementNode, SeriesAmmeterNode, {

    /**
     * @public - dispose resources when no longer used
     */
    dispose: function() {
      this.disposeSeriesAmmeterNode();
      FixedLengthCircuitElementNode.prototype.dispose.call( this );
    },

    /**
     * @public - update the transforms in the view step
     */
    updateRender: function() {
      FixedLengthCircuitElementNode.prototype.updateRender.call( this );
      this.frontPanel.setMatrix( this.contentNode.getMatrix() );
    }
  } );
} );