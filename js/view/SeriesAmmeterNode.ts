// Copyright 2015-2025, University of Colorado Boulder

/**
 * Renders the view for the SeriesAmmeter, which looks the same in lifelike mode or schematic mode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import EnumerationProperty from '../../../axon/js/EnumerationProperty.js';
import StringProperty from '../../../axon/js/StringProperty.js';
import type { TReadOnlyProperty } from '../../../axon/js/TReadOnlyProperty.js';
import affirm from '../../../perennial-alias/js/browser-and-node/affirm.js';
import MathSymbols from '../../../scenery-phet/js/MathSymbols.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Rectangle, { type RectangleOptions } from '../../../scenery/js/nodes/Rectangle.js';
import Text from '../../../scenery/js/nodes/Text.js';
import Panel from '../../../sun/js/Panel.js';
import type Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCUtils from '../CCKCUtils.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import type SeriesAmmeter from '../model/SeriesAmmeter.js';
import ammeterReadoutTypeProperty from './ammeterReadoutTypeProperty.js';
import type CCKCScreenView from './CCKCScreenView.js';
import type CircuitNode from './CircuitNode.js';
import FixedCircuitElementNode, { type FixedCircuitElementNodeOptions } from './FixedCircuitElementNode.js';
import ProbeTextNode from './ProbeTextNode.js';

const currentStringProperty = CircuitConstructionKitCommonFluent.currentStringProperty;

// constants
const PANEL_HEIGHT = 40;
const PANEL_WIDTH = CCKCConstants.SERIES_AMMETER_LENGTH;
const ORANGE = '#f39033';

const CORNER_RADIUS = 4;

/**
 * Utility function for creating a panel for the sensor body
 * @param [providedOptions]
 */
const createPanel = ( providedOptions?: RectangleOptions ) => new Node( {
  children: [
    new Rectangle( 0, 0, PANEL_WIDTH, PANEL_HEIGHT, providedOptions )
  ]
} );

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
     * Update the text in the numeric readout text box. Shows '?' if not fully connected.
     * The currentReadoutProperty is computed by the model (Circuit) and includes connection status and sign.
     */
    const updateText = () => {
      stringProperty.value = CCKCUtils.createCurrentReadout( seriesAmmeter.currentReadoutProperty.value, false );
    };

    seriesAmmeter.currentReadoutProperty.link( updateText );
    ammeterReadoutTypeProperty.lazyLink( updateText );
    CircuitConstructionKitCommonFluent.currentUnitsStringProperty.lazyLink( updateText );

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
      affirm( !!circuitNode );
      if ( circuitNode && !seriesAmmeter.phetioIsArchetype && seriesAmmeter.tandem.supplied ) {
        circuitNode.seriesAmmeterNodeReadoutPanelLayer.addChild( this.frontPanelContainer );
      }
    }

    // whether to show as an isIcon
    this.isIcon = !!( providedOptions && providedOptions.isIcon );

    this.disposeSeriesAmmeterNode = () => {

      seriesAmmeter.currentReadoutProperty.unlink( updateText );
      ammeterReadoutTypeProperty.unlink( updateText );
      CircuitConstructionKitCommonFluent.currentUnitsStringProperty.unlink( updateText );

      if ( !this.isIcon ) {
        affirm( !!circuitNode );
        if ( circuitNode ) {
          circuitNode.seriesAmmeterNodeReadoutPanelLayer.removeChild( this.frontPanelContainer );
        }
      }
      lifelikeNode.dispose();
      this.frontPanelContainer.dispose();
      probeTextNode.dispose();
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