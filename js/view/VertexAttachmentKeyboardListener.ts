// Copyright 2016-2025, University of Colorado Boulder

/**
 * Keyboard listener that allows attaching a vertex to another attachable vertex.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import animationFrameTimer from '../../../axon/js/animationFrameTimer.js';
import Property from '../../../axon/js/Property.js';
import { pdomFocusProperty } from '../../../scenery/js/accessibility/pdomFocusProperty.js';
import { OneKeyStroke } from '../../../scenery/js/input/KeyDescriptor.js';
import KeyboardListener from '../../../scenery/js/listeners/KeyboardListener.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import ComboBox from '../../../sun/js/ComboBox.js';
import ComboBoxListItemNode from '../../../sun/js/ComboBoxListItemNode.js';
import Tandem from '../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonFluent from '../CircuitConstructionKitCommonFluent.js';
import Vertex from '../model/Vertex.js';
import type CircuitNode from './CircuitNode.js';

export default class VertexAttachmentKeyboardListener extends KeyboardListener<OneKeyStroke[]> {
  public constructor( vertexNode: Node, circuitNode: CircuitNode, vertex: Vertex ) {
    const circuit = circuitNode.circuit;

    super( {

      // cannot use fireOnClick because that would interfere with dragging, see https://github.com/phetsims/circuit-construction-kit-common/issues/1079#issuecomment-3560928894
      keys: [ 'space', 'enter' ],

      fire: () => {
        // create a new radio button group that lets the user cycle through attachable vertices

        const originalPosition = vertex.positionProperty.value.copy();

        const attachableVertices = circuit.vertexGroup.filter( v => v.attachableProperty.get() &&
                                                                    v !== vertex &&
                                                                    !circuit.getNeighboringVertices( vertex ).includes( v ) &&
                                                                    !circuit.findAllFixedVertices( vertex ).includes( v ) );

        if ( attachableVertices.length === 0 ) {
          return;
        }

        const selectionProperty = new Property<Vertex | null>( null );

        // Start with the "don't move" option so it doesn't jump so much when you click it.
        const items = [ {
          value: null as Vertex | null,
          createNode: () => new Text( CircuitConstructionKitCommonFluent.a11y.vertexInteraction.noNewAttachmentStringProperty )
        } ];

        items.push( ...attachableVertices.map( v => {
          return {
            value: v as Vertex | null,
            createNode: () => new Text( circuitNode.getVertexNode( v ).attachmentName )
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

          console.log( 'list box visible changed to ', visible );
          if ( !visible ) {
            circuitNode.endDrag( vertex, true );

            animationFrameTimer.runOnNextTick( () => {

              comboBox.dispose();
              vertexNode.focus();
            } );
          }
        } );

        circuitNode.startDragVertex( vertexNode.parentToGlobalPoint( vertex.positionProperty.value ), vertex, vertex );

        selectionProperty.lazyLink( selectedVertex => {
          if ( selectedVertex ) {
            circuitNode.dragVertex( vertexNode.parentToGlobalPoint( selectedVertex.positionProperty.value ), vertex, true );
          }
          else {
            // move back to original position
            circuitNode.dragVertex( vertexNode.parentToGlobalPoint( originalPosition ), vertex, true );
          }
        } );

        circuitNode.addChild( comboBox );

        comboBox.showListBox();
        comboBox.focusListItemNode( items[ 0 ].value );

        comboBox.cancelEmitter.addListener( () => {
          selectionProperty.value = null;

          circuitNode.endDrag( vertex, true );
          cancelled = true;

          animationFrameTimer.runOnNextTick( () => {

            comboBox.dispose();
            vertexNode.focus();
          } );

        } );

        pdomFocusProperty.link( focus => {
          const node = focus?.trail?.lastNode();
          if ( node && node instanceof ComboBoxListItemNode ) {
            console.log( 'focused a different item' );
            const value = node.item.value;

            // Note that another combo box setting null would mess up this logic. We are only safe since this combo box is transient.
            if ( value instanceof Vertex || value === null ) {
              selectionProperty.value = value;
            }
          }
          else {
            console.log( 'focused something else' );
          }
        }, {
          disposer: comboBox
        } );
      }
    } );
  }
}

circuitConstructionKitCommon.register( 'VertexAttachmentKeyboardListener', VertexAttachmentKeyboardListener );