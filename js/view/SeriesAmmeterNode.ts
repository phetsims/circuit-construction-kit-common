// Copyright 2015-2023, University of Colorado Boulder

/**
 * Renders the view for the SeriesAmmeter, which looks the same in lifelike mode or schematic mode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import { Node, Rectangle, RectangleOptions, Text } from '../../../scenery/js/imports.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCUtils from '../CCKCUtils.js';
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import FixedCircuitElementNode, { FixedCircuitElementNodeOptions } from './FixedCircuitElementNode.js';
import CCKCScreenView from './CCKCScreenView.js';
import CircuitNode from './CircuitNode.js';
import SeriesAmmeter from '../model/SeriesAmmeter.js';
import Tandem from '../../../tandem/js/Tandem.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import ammeterReadoutTypeProperty from './ammeterReadoutTypeProperty.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import CurrentSense from '../model/CurrentSense.js';
import ProbeTextNode from './ProbeTextNode.js';
import TReadOnlyProperty from '../../../axon/js/TReadOnlyProperty.js';
import Panel from '../../../sun/js/Panel.js';
import StringProperty from '../../../axon/js/StringProperty.js';

const currentStringProperty = CircuitConstructionKitCommonStrings.currentStringProperty;

// constants
const PANEL_HEIGHT = 40;
const PANEL_WIDTH = CCKCConstants.SERIES_AMMETER_LENGTH;
const ORANGE = '#f39033';

const CORNER_RADIUS = 4;

/**
 * Utility function for creating a panel for the sensor body
 * Rasterize so it can be rendered in WebGL, see https://github.com/phetsims/circuit-construction-kit-dc/issues/67
 * @param [providedOptions]
 */
const createPanel = ( providedOptions?: RectangleOptions ) => new Rectangle( 0, 0, PANEL_WIDTH, PANEL_HEIGHT, providedOptions ).rasterized( { wrap: false } );

const orangeBackgroundPanel = createPanel( { cornerRadius: CORNER_RADIUS, fill: ORANGE } );
const blackBorder = createPanel( {
  cornerRadius: CORNER_RADIUS,
  stroke: '#231f20',
  lineWidth: 2.4
} );

export default class SeriesAmmeterNode extends FixedCircuitElementNode {
  private readonly frontPanelContainer: Node;
  private readonly disposeSeriesAmmeterNode: () => void;

  public constructor( screenView: CCKCScreenView | null, circuitNode: CircuitNode | null, seriesAmmeter: SeriesAmmeter,
                      tandem: Tandem, isValueDepictionEnabledProperty: TReadOnlyProperty<boolean>, providedOptions?: FixedCircuitElementNodeOptions ) {

    const stringProperty = new StringProperty( MathSymbols.NO_VALUE, {
      tandem: tandem.createTandem( 'probeReadoutText' ).createTandem( Text.STRING_PROPERTY_TANDEM_NAME ),
      phetioReadOnly: true
    } );

    const probeTextNode = new ProbeTextNode(
      stringProperty, isValueDepictionEnabledProperty, currentStringProperty,

      // No need for an extra level of nesting in the tandem tree, since that is just an implementation detail
      // and not a feature
      tandem, {
        seriesAmmeter: true
      } );

    /**
     * Update the text in the numeric readout text box.  Shows '?' if disconnected.
     */
    const updateText = () => {
      let readout: string = MathSymbols.NO_VALUE;

      // If it is not an icon and connected at both sides, show the current, otherwise show '-'
      if ( screenView ) {

        const circuit = screenView.model.circuit;
        const startConnection = circuit.getNeighboringVertices( seriesAmmeter.startVertexProperty.get() ).length > 1;
        const endConnection = circuit.getNeighboringVertices( seriesAmmeter.endVertexProperty.get() ).length > 1;

        if ( startConnection && endConnection ) {

          const sign = seriesAmmeter.currentSenseProperty.value === CurrentSense.BACKWARD ? -1 : +1;
          readout = CCKCUtils.createCurrentReadout( seriesAmmeter.currentProperty.get() * sign, false );
        }
      }

      stringProperty.value = readout;
    };

    seriesAmmeter.currentProperty.link( updateText );
    seriesAmmeter.startVertexProperty.lazyLink( updateText );
    seriesAmmeter.endVertexProperty.lazyLink( updateText );
    seriesAmmeter.currentSenseProperty.lazyLink( updateText );
    ammeterReadoutTypeProperty.lazyLink( updateText );
    CircuitConstructionKitCommonStrings.currentUnitsStringProperty.lazyLink( updateText );

    // NOTE: This is called every frame
    circuitNode && circuitNode.circuit.circuitChangedEmitter.addListener( updateText );

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

    super(
      screenView,
      circuitNode,
      seriesAmmeter,
      new EnumerationProperty( CircuitElementViewType.LIFELIKE ),
      lifelikeNode,
      new Node( { children: [ lifelikeNode ] } ), // reuse lifelike view for the schematic view
      tandem,
      providedOptions
    );

    // the panel to be shown in front for z-ordering.  Wrap centered in a child node to make the layout
    // in updateRender trivial.
    this.frontPanelContainer = new Panel( probeTextNode, {
      fill: ORANGE,
      stroke: null,
      xMargin: 10,
      yMargin: 1,
      pickable: false
    } );

    if ( providedOptions && providedOptions.isIcon ) {
      lifelikeNode.addChild( this.frontPanelContainer.mutate( {
        centerX: lifelikeNode.width / 2,
        centerY: lifelikeNode.height / 2 - 2
      } ) );
    }
    else {
      assert && assert( !!circuitNode );
      if ( circuitNode && !seriesAmmeter.phetioIsArchetype && seriesAmmeter.tandem.supplied ) {
        circuitNode.seriesAmmeterNodeReadoutPanelLayer.addChild( this.frontPanelContainer );
      }
    }

    // whether to show as an isIcon
    this.isIcon = !!( providedOptions && providedOptions.isIcon );

    this.disposeSeriesAmmeterNode = () => {

      seriesAmmeter.currentSenseProperty.unlink( updateText );
      CircuitConstructionKitCommonStrings.currentUnitsStringProperty.unlink( updateText );

      seriesAmmeter.currentProperty.unlink( updateText );
      seriesAmmeter.startVertexProperty.unlink( updateText );
      seriesAmmeter.endVertexProperty.unlink( updateText );
      ammeterReadoutTypeProperty.unlink( updateText );
      if ( !this.isIcon ) {
        assert && assert( !!circuitNode );
        if ( circuitNode ) {
          circuitNode.seriesAmmeterNodeReadoutPanelLayer.removeChild( this.frontPanelContainer );
        }
      }
      lifelikeNode.dispose();
      this.frontPanelContainer.dispose();
      probeTextNode.dispose();
      circuitNode && circuitNode.circuit.circuitChangedEmitter.removeListener( updateText );
      stringProperty.dispose();
    };
  }

  public override dispose(): void {
    this.disposeSeriesAmmeterNode();
    super.dispose();
  }

  /**
   * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
   * CCKCLightBulbNode calls updateRender for its child socket node
   */
  public override updateRender(): void {
    super.updateRender();
    this.frontPanelContainer.setMatrix( this.contentNode.getMatrix() ); // For rotation
    this.frontPanelContainer.center = this.center; // for translation
  }
}

circuitConstructionKitCommon.register( 'SeriesAmmeterNode', SeriesAmmeterNode );