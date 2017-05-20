// Copyright 2015-2017, University of Colorado Boulder
// TODO: docs i18n cleanup etc

/**
 * Renders the lifelike/schematic view for a Schematic Ammeter.
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

  // constants
  var PANEL_HEIGHT = 40;
  var PANEL_WIDTH = 110;
  var ORANGE = '#f39033';

  /**
   * @param {CircuitConstructionKitScreenView} circuitConstructionKitScreenView
   * @param {CircuitNode} circuitNode
   * @param {SeriesAmmeter} seriesAmmeter
   * @param {Property.<boolean>} runningProperty - supplied for consistency with other CircuitElementNode constructors
   * @param {Property.<string>} viewProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function SeriesAmmeterNode( circuitConstructionKitScreenView, circuitNode, seriesAmmeter, runningProperty, viewProperty, tandem, options ) {
    var self = this;
    options = options || {};
    viewProperty = new Property( 'lifelike' );

    // @public (read-only) - the seriesAmmeter rendered by this Node
    this.seriesAmmeter = seriesAmmeter;

    // Electrons go behind this panel to give the appearance they go through the ammeter
    var WIDEST_LABEL = '9.99 A';
    var readoutText = new Text( WIDEST_LABEL, { fontSize: 14 } );
    readoutText.setMaxWidth( readoutText.width );

    var updateText = function( current ) {
      readoutText.setText( Util.toFixed( current, 2 ) + ' A' ); // TODO i18n and fillIn
    };

    seriesAmmeter.currentProperty.link( updateText );
    var readoutPanel = new Panel( new VBox( {
      children: [
        new Text( 'Current', { fontSize: 14 } ),
        new Panel( readoutText, {
          cornerRadius: 0,
          xMargin: 2,
          yMargin: 1,
          stroke: 'gray',
          resize: false
        } )
      ]
    } ), {
      fill: ORANGE,
      stroke: null,
      xMargin: 4,
      yMargin: 0
    } );

    var createPanel = function( options ) {
      return new Rectangle( 0, 0, PANEL_WIDTH, PANEL_HEIGHT, 14, 14, options );
    };

    var node = new Node( {
      children: [

        // orange background panel
        createPanel( {
          fill: ORANGE
        } ),

        // gray track
        new Rectangle( 0, 0, PANEL_WIDTH, 20, {
          fill: '#bcbdbf',
          centerY: PANEL_HEIGHT / 2
        } ),

        // black border
        createPanel( {
          stroke: '#231f20',
          lineWidth: 4
        } )
      ]
    } );

    // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
    node.mouseArea = node.bounds.copy();
    node.touchArea = node.bounds.copy();

    // Center vertically to match the FixedLengthCircuitElementNode assumption that origin is center left
    node.centerY = 0;

    readoutPanel.centerX = node.centerX;
    readoutPanel.centerY = node.centerY;

    node.frontPanel = new Node( {
      children: [
        readoutPanel
      ]
    } );
    if ( options.icon ) {
      node.addChild( node.frontPanel );
    }
    else {

      // TODO: use a dedicated layer
      circuitNode.highlightLayer.addChild( node.frontPanel );
    }

    this.lifelikeNode = node;

    FixedLengthCircuitElementNode.call( this,
      circuitConstructionKitScreenView,
      circuitNode,
      seriesAmmeter,
      viewProperty,
      this.lifelikeNode,
      new Node( { children: [ this.lifelikeNode ] } ),// reuse lifelike view for the schematic view
      tandem,
      options
    );

    // @private (read-only)
    this.icon = options.icon;

    this.updateRender();

    // @private
    this.disposeSeriesAmmeterNode = function() {
      seriesAmmeter.currentProperty.unlink( updateText );
      if ( !this.icon ) {
        circuitNode.highlightLayer.removeChild( self.lifelikeNode.frontPanel );
      }
    };
  }

  circuitConstructionKitCommon.register( 'SeriesAmmeterNode', SeriesAmmeterNode );

  return inherit( FixedLengthCircuitElementNode, SeriesAmmeterNode, {

    // TODO: make it so you can dispose it by putting it in the correct toolbox
    dispose: function() {
      this.disposeSeriesAmmeterNode();
      FixedLengthCircuitElementNode.prototype.dispose.call( this );
    },
    updateRender: function() {
      FixedLengthCircuitElementNode.prototype.updateRender.call( this );
      this.lifelikeNode.frontPanel.setMatrix( this.contentNode.getMatrix() );
      this.icon && this.lifelikeNode.frontPanel.translate( 0, 17 ); // TODO: this line is a hack
    }
  } );
} );