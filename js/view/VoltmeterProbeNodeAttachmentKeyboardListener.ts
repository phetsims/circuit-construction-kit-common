// Copyright 2016-2025, University of Colorado Boulder

/**
 * Keyboard listener that allows attaching a voltmeter probe to a vertex.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import animationFrameTimer from '../../../axon/js/animationFrameTimer.js';
import Property from '../../../axon/js/Property.js';
import Vector2Property from '../../../dot/js/Vector2Property.js';
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
import Vertex from '../model/Vertex.js';
import type CircuitNode from './CircuitNode.js';

export default class VoltmeterProbeNodeAttachmentKeyboardListener extends KeyboardListener<OneKeyStroke[]> {
  public constructor( probeNode: Node, circuitNode: CircuitNode, probePositionProperty: Vector2Property ) {
    const circuit = circuitNode.circuit;

    super( {
      keys: [ 'space', 'enter' ],

      fire: () => {
        const originalPosition = probePositionProperty.value.copy();

        const vertices = circuit.vertexGroup.filter( () => true );

        if ( vertices.length === 0 ) {
          circuitNode.hideAttachmentHighlight();
          return;
        }

        const selectionProperty = new Property<Vertex | null>( null );
        let targetDropPosition = originalPosition;

        // Start with the "don't move" option so it doesn't jump so much when you click it.
        const items = [ {
          value: null as Vertex | null,
          createNode: () => new Text( CircuitConstructionKitCommonFluent.a11y.vertexInteraction.noNewAttachmentStringProperty )
        } ];

        items.push( ...vertices.map( vertex => {
          return {
            value: vertex as Vertex | null,
            createNode: () => new Text( circuitNode.getVertexNode( vertex ).attachmentName )
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
            const dropPosition = targetDropPosition.copy();
            probePositionProperty.value = dropPosition;
            circuitNode.hideAttachmentHighlight();

            animationFrameTimer.runOnNextTick( () => {

              comboBox.dispose();
              probeNode.focus();
            } );
          }
        } );

        selectionProperty.lazyLink( selectedVertex => {
          targetDropPosition = selectedVertex ? selectedVertex.positionProperty.value : originalPosition;
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
          targetDropPosition = originalPosition;

          const dropPosition = targetDropPosition.copy();
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
            if ( value instanceof Vertex || value === null ) {
              selectionProperty.value = value;

              const index = vertices.indexOf( value as Vertex ) + 1; // +1 for the "no attachment" option
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

circuitConstructionKitCommon.register( 'VoltmeterProbeNodeAttachmentKeyboardListener', VoltmeterProbeNodeAttachmentKeyboardListener );
