// Copyright 2016-2025, University of Colorado Boulder

/**
 * Keyboard listener that allows attaching an ammeter probe to the centroid of a circuit element.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import animationFrameTimer from '../../../axon/js/animationFrameTimer.js';
import Property from '../../../axon/js/Property.js';
import type TProperty from '../../../axon/js/TProperty.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { pdomFocusProperty } from '../../../scenery/js/accessibility/pdomFocusProperty.js';
import { OneKeyStroke } from '../../../scenery/js/input/KeyDescriptor.js';
import KeyboardListener from '../../../scenery/js/listeners/KeyboardListener.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import ComboBox from '../../../sun/js/ComboBox.js';
import ComboBoxListItemNode from '../../../sun/js/ComboBoxListItemNode.js';
import multiSelectionSoundPlayerFactory from '../../../tambo/js/multiSelectionSoundPlayerFactory.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import CircuitElement from '../model/CircuitElement.js';
import type CircuitNode from './CircuitNode.js';

export default class AmmeterProbeNodeAttachmentKeyboardListener extends KeyboardListener<OneKeyStroke[]> {
  public constructor( probeNode: Node, circuitNode: CircuitNode, probePositionProperty: TProperty<Vector2> ) {
    const circuit = circuitNode.circuit;

    super( {
      keys: [ 'space', 'enter' ],

      fire: () => {
        const centerOffset = probeNode.center.minus( probeNode.centerTop );
        const verticalFudge = -5; // pixels to move the probe so its center visually aligns with the target
        const originalCenterPosition = probeNode.center.copy();

        const circuitElements = circuit.circuitElements.filter( () => true );

        if ( circuitElements.length === 0 ) {
          circuitNode.hideAttachmentHighlight();
          return;
        }

        const selectionProperty = new Property<CircuitElement | null>( null );
        let targetDropPosition = originalCenterPosition;

        // Start with the "don't move" option so it doesn't jump so much when you click it.
        const items = [ {
          value: null as CircuitElement | null,
          createNode: () => new Text( CircuitConstructionKitCommonFluent.a11y.vertexInteraction.noNewAttachmentStringProperty )
        } ];

        items.push( ...circuitElements.map( circuitElement => {
          return {
            value: circuitElement as CircuitElement | null,
            createNode: () => {
              const accessibleName = circuitNode.getCircuitElementNode( circuitElement ).accessibleName || circuitElement.type;
              return new Text( accessibleName );
            }
          };
        } ) );

        const comboBox = new ComboBox( selectionProperty, items, circuitNode.screenView, {
          tandem: Tandem.OPT_OUT // transient ui
        } );

        let cancelled = false;

        comboBox.listBox.visibleProperty.lazyLink( visible => {
          if ( cancelled ) {
            return;
          }

          if ( !visible ) {
            const dropPosition = targetDropPosition.copy().minus( centerOffset ).plusXY( 0, -verticalFudge );
            probePositionProperty.value = dropPosition;
            circuitNode.hideAttachmentHighlight();

            animationFrameTimer.runOnNextTick( () => {

              comboBox.dispose();
              probeNode.focus();
            } );
          }
        } );

        selectionProperty.lazyLink( selectedCircuitElement => {
          targetDropPosition = selectedCircuitElement ?
                               Vector2.average( [
                                 selectedCircuitElement.startVertexProperty.value.positionProperty.value,
                                 selectedCircuitElement.endVertexProperty.value.positionProperty.value
                               ] ) :
                               originalCenterPosition;
          circuitNode.showAttachmentHighlight( targetDropPosition );
        } );

        // Show in the top center of the ScreenView
        comboBox.centerX = circuitNode.screenView.layoutBounds.centerX;
        comboBox.top = circuitNode.screenView.visibleBoundsProperty.value.top + 5;

        circuitNode.screenView.addChild( comboBox );

        comboBox.showListBox();
        comboBox.focusListItemNode( items[ 0 ].value );

        comboBox.cancelEmitter.addListener( () => {
          selectionProperty.value = null;
          targetDropPosition = originalCenterPosition;

          const dropPosition = targetDropPosition.copy().minus( centerOffset ).plusXY( 0, -verticalFudge );
          probePositionProperty.value = dropPosition;
          cancelled = true;
          circuitNode.hideAttachmentHighlight();

          animationFrameTimer.runOnNextTick( () => {

            comboBox.dispose();
            probeNode.focus();
          } );

        } );

        pdomFocusProperty.link( focus => {
          const node = focus?.trail?.lastNode();
          if ( node && node instanceof ComboBoxListItemNode ) {
            const value = node.item.value;

            // Note that another combo box setting null would mess up this logic. We are only safe since this combo box is transient.
            if ( value instanceof CircuitElement || value === null ) {
              selectionProperty.value = value;

              const index = circuitElements.indexOf( value as CircuitElement ) + 1; // +1 for the "no attachment" option
              const soundPlayer = multiSelectionSoundPlayerFactory.getSelectionSoundPlayer( index );
              soundPlayer.play();
            }
          }
        }, {
          disposer: comboBox
        } );
      }
    } );
  }
}

circuitConstructionKitCommon.register( 'AmmeterProbeNodeAttachmentKeyboardListener', AmmeterProbeNodeAttachmentKeyboardListener );
