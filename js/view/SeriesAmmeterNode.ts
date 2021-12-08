// Copyright 2015-2021, University of Colorado Boulder

/**
 * Renders the view for the SeriesAmmeter, which looks the same in lifelike mode or schematic mode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import { Node } from '../../../scenery/js/imports.js';
import { Rectangle } from '../../../scenery/js/imports.js';
import { Text } from '../../../scenery/js/imports.js';
import { VBox } from '../../../scenery/js/imports.js';
import { Color } from '../../../scenery/js/imports.js';
import Panel from '../../../sun/js/Panel.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCUtils from '../CCKCUtils.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import FixedCircuitElementNode from './FixedCircuitElementNode.js';
import CCKCScreenView from './CCKCScreenView.js';
import CircuitLayerNode from './CircuitLayerNode.js';
import SeriesAmmeter from '../model/SeriesAmmeter.js';
import Tandem from '../../../tandem/js/Tandem.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import ammeterReadoutTypeProperty from './ammeterReadoutTypeProperty.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';

const currentString = circuitConstructionKitCommonStrings.current;

// constants
const PANEL_HEIGHT = 40;
const PANEL_WIDTH = CCKCConstants.SERIES_AMMETER_LENGTH;
const ORANGE = '#f39033';

// Widest text to use for max width, hardcoded to use english, otherwise uses lengthened translation strings which
// may already be too long, see https://github.com/phetsims/circuit-construction-kit-common/issues/419
const WIDEST_LABEL = '99.99 A';

const CORNER_RADIUS = 4;

/**
 * Utility function for creating a panel for the sensor body
 * Rasterize so it can be rendered in WebGL, see https://github.com/phetsims/circuit-construction-kit-dc/issues/67
 * @param {Object} [providedOptions]
 * @returns {Rectangle}
 */
const createPanel = ( providedOptions?: any ) => new Rectangle( 0, 0, PANEL_WIDTH, PANEL_HEIGHT, providedOptions ).rasterized( { wrap: false } );

const orangeBackgroundPanel = createPanel( { cornerRadius: CORNER_RADIUS, fill: ORANGE } );
const blackBorder = createPanel( {
  cornerRadius: CORNER_RADIUS,
  stroke: '#231f20',
  lineWidth: 2.4
} );

class SeriesAmmeterNode extends FixedCircuitElementNode {
  private readonly frontPanelContainer: Node;
  private readonly disposeSeriesAmmeterNode: () => void;

  /**
   * @param {CCKCScreenView|null} screenView - main screen view, null for isIcon
   * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
   * @param {SeriesAmmeter} seriesAmmeter
   * @param {Tandem} tandem
   * @param {Object} [providedOptions]
   */
  constructor( screenView: CCKCScreenView | null, circuitLayerNode: CircuitLayerNode | null, seriesAmmeter: SeriesAmmeter,
               tandem: Tandem, providedOptions?: any ) {
    providedOptions = providedOptions || {};

    // Charges go behind this panel to give the appearance they go through the ammeter
    const readoutText = new Text( WIDEST_LABEL, { fontSize: 15 } );
    readoutText.maxWidth = readoutText.width;
    const maxBounds = readoutText.bounds.copy();

    // Margins within the numeric readout text box
    const textPanelMarginX = 3;
    const textPanelMarginY = 1;

    /**
     * Update the text in the numeric readout text box.  Shows '?' if disconnected.
     */
    const updateText = () => {
      let readout = MathSymbols.NO_VALUE;

      // If it is not an icon and connected at both sides, show the current, otherwise show '?'
      if ( screenView ) {

        const circuit = screenView.model.circuit;
        const startConnection = circuit.getNeighboringVertices( seriesAmmeter.startVertexProperty.get() ).length > 1;
        const endConnection = circuit.getNeighboringVertices( seriesAmmeter.endVertexProperty.get() ).length > 1;

        if ( startConnection && endConnection ) {

          const sign = seriesAmmeter.currentSenseProperty.value === 'backward' ? -1 : +1;
          readout = CCKCUtils.createCurrentReadout( seriesAmmeter.currentProperty.get() * sign, false );
        }
      }

      readoutText.setText( readout );

      // Center the text in the panel
      readoutText.centerX = ( maxBounds.width + textPanelMarginX * 2 ) / 2;
      readoutText.centerY = ( maxBounds.height + textPanelMarginY * 2 ) / 2;
    };

    seriesAmmeter.currentProperty.link( updateText );
    seriesAmmeter.startVertexProperty.lazyLink( updateText );
    seriesAmmeter.endVertexProperty.lazyLink( updateText );
    seriesAmmeter.currentSenseProperty.lazyLink( updateText );
    ammeterReadoutTypeProperty.lazyLink( updateText );
    circuitLayerNode && circuitLayerNode.circuit.circuitChangedEmitter.addListener( updateText );

    // The readout panel is in front of the series ammeter node, and makes it look like the charges flow through the
    // series ammeter
    const readoutPanel = new Panel( new VBox( {
      children: [
        new Text( currentString, { fontSize: 12, maxWidth: 54 } ),
        new Rectangle( 0, 0, maxBounds.width + textPanelMarginX * 2, maxBounds.height + textPanelMarginY * 2, {
          cornerRadius: 4,
          stroke: Color.BLACK,
          fill: Color.WHITE,
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

    // This node only has a lifelike representation because it is a sensor
    const lifelikeNode = new Node( {
      children: [

        // orange background panel
        orangeBackgroundPanel,

        // gray track
        new Rectangle( 0, 0, PANEL_WIDTH, 20, {
          fill: '#bcbdbf',
          centerY: PANEL_HEIGHT / 2
        } ),

        // black border
        blackBorder
      ]
    } );

    // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
    lifelikeNode.mouseArea = lifelikeNode.bounds.copy();
    lifelikeNode.touchArea = lifelikeNode.bounds.copy();

    // Center vertically to match the FixedCircuitElementNode assumption that origin is center left
    lifelikeNode.centerY = 0;

    // Center the readout within the main body of the sensor
    readoutPanel.center = lifelikeNode.center;

    super(
      screenView,
      circuitLayerNode,
      seriesAmmeter,
      new Property<CircuitElementViewType>( 'lifelike' ),
      lifelikeNode,
      new Node( { children: [ lifelikeNode ] } ), // reuse lifelike view for the schematic view
      tandem,
      providedOptions
    );

    // @private {Node} - the panel to be shown in front for z-ordering.  Wrap centered in a child node to make the layout
    // in updateRender trivial.
    this.frontPanelContainer = new Node( {
      children: [ readoutPanel ]
    } );

    if ( providedOptions.isIcon ) {
      lifelikeNode.addChild( this.frontPanelContainer.mutate( { centerY: lifelikeNode.height / 2 - 2 } ) );
    }
    else {
      assert && assert( !!circuitLayerNode );
      if ( circuitLayerNode && !seriesAmmeter.phetioIsArchetype ) {
        circuitLayerNode.seriesAmmeterNodeReadoutPanelLayer.addChild( this.frontPanelContainer );
      }
    }

    // @private (read-only) {boolean} - whether to show as an isIcon
    this.isIcon = providedOptions.isIcon;

    // @private {function}
    this.disposeSeriesAmmeterNode = () => {
      seriesAmmeter.currentProperty.unlink( updateText );
      seriesAmmeter.startVertexProperty.unlink( updateText );
      seriesAmmeter.endVertexProperty.unlink( updateText );
      ammeterReadoutTypeProperty.unlink( updateText );
      if ( !this.isIcon ) {
        assert && assert( !!circuitLayerNode );
        if ( circuitLayerNode ) {
          circuitLayerNode.seriesAmmeterNodeReadoutPanelLayer.removeChild( this.frontPanelContainer );
        }
      }
      lifelikeNode.dispose();
      this.frontPanelContainer.dispose();
      readoutPanel.dispose();
      circuitLayerNode && circuitLayerNode.circuit.circuitChangedEmitter.removeListener( updateText );
    };
  }

  /**
   * @public - dispose resources when no longer used
   * @override
   */
  dispose() {
    this.disposeSeriesAmmeterNode();
    super.dispose();
  }

  /**
   * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
   * @public - CCKCLightBulbNode calls updateRender for its child socket node
   * @override
   */
  updateRender() {
    super.updateRender();
    this.frontPanelContainer.setMatrix( this.contentNode.getMatrix() );
  }
}

circuitConstructionKitCommon.register( 'SeriesAmmeterNode', SeriesAmmeterNode );
export default SeriesAmmeterNode;