// Copyright 2025, University of Colorado Boulder

/**
 * Shared keyboard listener that presents a ComboBox for attaching probes or vertices to targets.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import animationFrameTimer from '../../../../axon/js/animationFrameTimer.js';
import Property from '../../../../axon/js/Property.js';
import type { TReadOnlyEmitter } from '../../../../axon/js/TEmitter.js';
import type Vector2 from '../../../../dot/js/Vector2.js';
import { pdomFocusProperty } from '../../../../scenery/js/accessibility/pdomFocusProperty.js';
import { OneKeyStroke } from '../../../../scenery/js/input/KeyDescriptor.js';
import KeyboardListener from '../../../../scenery/js/listeners/KeyboardListener.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import ComboBox from '../../../../sun/js/ComboBox.js';
import ComboBoxListItemNode from '../../../../sun/js/ComboBoxListItemNode.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import circuitConstructionKitCommon from '../../circuitConstructionKitCommon.js';
import type CircuitNode from '../CircuitNode.js';

type AttachmentItem<T> = {
  value: T | null;
  createNode: () => Node;
};

export type AttachmentKeyboardListenerOptions<T> = {

  // node that will regain focus after the ComboBox is closed
  triggerNode: Node;

  circuitNode: CircuitNode;

  // items to appear after the default "no attachment" entry
  getItems: () => AttachmentItem<T>[];

  getInitialPosition: () => Vector2;

  // position used for the highlight when the given selection is active
  getHighlightPosition: ( selection: T | null ) => Vector2;

  // called when the ComboBox closes (either by selection or cancel)
  applySelection: ( selection: T | null, targetPosition: Vector2 ) => void;

  onOpen?: () => void;
  onClose?: () => void;
  onCancel?: () => void;

  // invoked after a successful selection is applied (not cancelled)
  onSelectionApplied?: ( selection: T | null ) => void;

  // invoked when a list item receives focus
  onItemFocused?: ( value: T | null, index: number ) => void;

  // If the target being attached is disposed while the combo box is open, cancel the combo box
  targetDisposeEmitter?: TReadOnlyEmitter;

  // Optional callback to get a preferred initial value from the available items.
  // If provided and returns a non-null value, it will be used as the initial selection
  // when there's no prior interaction position match.
  getPreferredInitialValue?: ( availableItems: AttachmentItem<T>[] ) => T | null;
};

export default class AttachmentKeyboardListener<T> extends KeyboardListener<OneKeyStroke[]> {

  // Store the last successful connection highlight position for matching on next open
  private lastConnectionHighlightPosition: Vector2 | null = null;

  public constructor( options: AttachmentKeyboardListenerOptions<T> ) {
    super( {
      keys: [ 'space', 'enter' ],

      fire: () => {
        const availableItems = options.getItems();

        if ( availableItems.length === 0 ) {
          options.circuitNode.hideAttachmentHighlight();
          return;
        }

        const initialPosition = options.getInitialPosition();

        const items: AttachmentItem<T>[] = [ ...availableItems ];

        // Check if the current position matches any available item (from prior discrete interaction)
        let initialSelection = options.getPreferredInitialValue?.( availableItems ) ?? availableItems[ 0 ].value;
        if ( this.lastConnectionHighlightPosition ) {
          for ( const item of availableItems ) {
            const itemPosition = options.getHighlightPosition( item.value );
            if ( this.lastConnectionHighlightPosition.equalsEpsilon( itemPosition, 1 ) ) {
              initialSelection = item.value;
              break;
            }
          }
        }

        const selectionProperty = new Property<T | null>( initialSelection );
        let targetDropPosition = initialPosition;

        const comboBox = new ComboBox( selectionProperty, items, options.circuitNode.screenView, {
          opacity: 0.8,
          tandem: Tandem.OPT_OUT // transient ui
        } );

        // We must make the button non-focusable, otherwise when a selection is locked in, we will trigger a re-entrant focus property issue. See https://github.com/phetsims/circuit-construction-kit-common/issues/1078
        comboBox.button.focusable = false;

        let cancelled = false;

        comboBox.listBox.visibleProperty.lazyLink( visible => {
          if ( cancelled ) {
            return;
          }

          if ( !visible ) {
            options.applySelection( selectionProperty.value, targetDropPosition );

            // Store the highlight position for matching on next open (only if an item was selected)
            this.lastConnectionHighlightPosition = selectionProperty.value !== null ? targetDropPosition.copy() : null;

            options.circuitNode.hideAttachmentHighlight();
            options.onClose?.();
            options.onSelectionApplied?.( selectionProperty.value );

            animationFrameTimer.runOnNextTick( () => {
              comboBox.dispose();
              options.triggerNode.focus();
            } );
          }
        } );

        options.onOpen?.();

        selectionProperty.link( selection => {
          targetDropPosition = options.getHighlightPosition( selection );
          options.circuitNode.showAttachmentHighlight( targetDropPosition );
        } );

        // Offscreen unless in ?dev mode, then in top center of the ScreenView
        comboBox.centerX = options.circuitNode.screenView.layoutBounds.centerX;
        comboBox.top = options.circuitNode.screenView.visibleBoundsProperty.value.top + 5 + ( phet.chipper.queryParameters.dev ? 0 : 4000 );

        options.circuitNode.screenView.addChild( comboBox );

        comboBox.showListBox();
        comboBox.focusListItemNode( initialSelection );

        comboBox.cancelEmitter.addListener( () => {
          targetDropPosition = initialPosition;

          options.applySelection( null, targetDropPosition );
          cancelled = true;
          options.circuitNode.hideAttachmentHighlight();
          options.onCancel?.();

          animationFrameTimer.runOnNextTick( () => {
            comboBox.dispose();
            options.triggerNode.focus();
          } );

        } );

        // If the target (e.g., vertex) is disposed while the combo box is open, cancel without applying selection.
        // See https://github.com/phetsims/circuit-construction-kit-common/issues/1090
        if ( options.targetDisposeEmitter ) {
          const disposeListener = () => {
            cancelled = true;
            options.circuitNode.hideAttachmentHighlight();

            animationFrameTimer.runOnNextTick( () => {
              comboBox.dispose();
            } );
          };
          options.targetDisposeEmitter.addListener( disposeListener );

          // Clean up the listener when the combo box is disposed
          comboBox.disposeEmitter.addListener( () => {
            if ( options.targetDisposeEmitter!.hasListener( disposeListener ) ) {
              options.targetDisposeEmitter!.removeListener( disposeListener );
            }
          } );
        }

        pdomFocusProperty.link( focus => {
          const node = focus?.trail?.lastNode();
          if ( node && node instanceof ComboBoxListItemNode ) {
            const value = node.item.value as T | null;
            selectionProperty.value = value;

            const index = items.findIndex( item => item.value === value );
            if ( index >= 0 ) {
              options.onItemFocused?.( value, index );
            }
          }
        }, {
          disposer: comboBox
        } );
      }
    } );
  }
}

circuitConstructionKitCommon.register( 'AttachmentKeyboardListener', AttachmentKeyboardListener );
