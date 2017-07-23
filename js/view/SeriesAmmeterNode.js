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
  var CircuitConstructionKitCommonConstants =
    require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var CircuitConstructionKitCommonUtil = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonUtil' );

  // strings
  var currentString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/current' );
  var questionMarkString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/questionMark' );

  // constants
  var PANEL_HEIGHT = 40;
  var PANEL_WIDTH = CircuitConstructionKitCommonConstants.SERIES_AMMETER_LENGTH;
  var ORANGE = '#f39033';
  var WIDEST_LABEL = '99.99 A';
  var CORNER_RADIUS = 4;

  /**
   * This constructor is called dynamically and must match the signature of other circuit element nodes.
   * @param {CircuitConstructionKitScreenView|null} circuitConstructionKitScreenView - main screen view, null for icon
   * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
   * @param {SeriesAmmeter} seriesAmmeter
   * @param {Property.<boolean>} showResultsProperty - supplied for consistency with other CircuitElementNode
   *                                                 - constructors
   * @param {Property.<string>} viewProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function SeriesAmmeterNode( circuitConstructionKitScreenView, circuitLayerNode, seriesAmmeter, showResultsProperty,
                              viewProperty, tandem, options ) {
    var self = this;
    options = options || {};
    viewProperty = new Property( CircuitConstructionKitCommonConstants.LIFELIKE );

    // Charges go behind this panel to give the appearance they go through the ammeter
    var readoutText = new Text( WIDEST_LABEL, { fontSize: 15 } );
    readoutText.setMaxWidth( readoutText.width );
    var maxWidth = readoutText.width;
    var maxHeight = readoutText.height;

    // Margins within the numeric readout text box
    var textPanelMarginX = 3;
    var textPanelMarginY = 1;

    /**
     * Update the text in the numeric readout text box.  Shows '?' if disconnected.
     */
    var updateText = function() {
      var readout = questionMarkString;

      // If it is not an icon and connected at both sides, show the current, otherwise show '?'
      if ( circuitConstructionKitScreenView ) {

        var circuit = circuitConstructionKitScreenView.circuitConstructionKitModel.circuit;
        var startConnection = circuit.getNeighboringVertices( seriesAmmeter.startVertexProperty.get() ).length > 1;
        var endConnection = circuit.getNeighboringVertices( seriesAmmeter.endVertexProperty.get() ).length > 1;

        if ( startConnection && endConnection ) {

          // The ammeter doesn't indicate direction
          var current = Math.abs( seriesAmmeter.currentProperty.get() );
          readout = CircuitConstructionKitCommonUtil.createCurrentReadout( current );
        }
      }

      readoutText.setText( readout );

      // Center the text in the panel
      readoutText.centerX = (maxWidth + textPanelMarginX * 2) / 2;
      readoutText.centerY = (maxHeight + textPanelMarginY * 2) / 2;
    };

    seriesAmmeter.currentProperty.link( updateText );
    seriesAmmeter.startVertexProperty.link( updateText );
    seriesAmmeter.endVertexProperty.link( updateText );

    // The readout panel is in front of the series ammeter node, and makes it look like the charges flow through the
    // series ammeter
    var readoutPanel = new Panel( new VBox( {
      children: [
        new Text( currentString, { fontSize: 12, maxWidth: 54 } ),
        new Rectangle( 0, 0, maxWidth + textPanelMarginX * 2, maxHeight + textPanelMarginY * 2, {
          cornerRadius: 4,
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

      // Rasterize so it can be rendered in WebGL, see https://github.com/phetsims/circuit-construction-kit-dc/issues/67
      return new Rectangle( 0, 0, PANEL_WIDTH, PANEL_HEIGHT, options ).toDataURLNodeSynchronous();
    };

    // This node only has a lifelike representation because it is a sensor
    var lifelikeNode = new Node( {
      children: [

        // orange background panel
        createPanel( { cornerRadius: CORNER_RADIUS, fill: ORANGE } ),

        // gray track
        new Rectangle( 0, 0, PANEL_WIDTH, 20, {
          fill: '#bcbdbf',
          centerY: PANEL_HEIGHT / 2
        } ),

        // black border
        createPanel( {
          cornerRadius: CORNER_RADIUS,
          stroke: '#231f20',
          lineWidth: 2.4
        } )
      ]
    } );

    // Expand the pointer areas with a defensive copy, see
    // https://github.com/phetsims/circuit-construction-kit-common/issues/310
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

    // @private (read-only) {boolean} - whether to show as an icon
    this.icon = options.icon;

    // @private
    this.disposeSeriesAmmeterNode = function() {
      seriesAmmeter.currentProperty.unlink( updateText );
      seriesAmmeter.startVertexProperty.unlink( updateText );
      seriesAmmeter.endVertexProperty.unlink( updateText );
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
     * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
     * @override
     * @protected - CircuitConstructionKitLightBulbNode calls updateRender for its child socket node
     */
    updateRender: function() {
      FixedLengthCircuitElementNode.prototype.updateRender.call( this );
      this.frontPanel.setMatrix( this.contentNode.getMatrix() );
    }
  } );
} );
