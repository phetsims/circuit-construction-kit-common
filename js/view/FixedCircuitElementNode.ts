// Copyright 2016-2021, University of Colorado Boulder

/**
 * Renders and provides interactivity for FixedCircuitElements (all CircuitElements except Wires).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import merge from '../../../phet-core/js/merge.js';
import SceneryEvent from '../../../scenery/js/input/SceneryEvent.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Tandem from '../../../tandem/js/Tandem.js';
import fireImage from '../../images/fire_png.js';
import CCKCUtils from '../CCKCUtils.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import FixedCircuitElement from '../model/FixedCircuitElement.js';
import Resistor from '../model/Resistor.js';
import CCKCScreenView from './CCKCScreenView.js';
import CircuitElementNode from './CircuitElementNode.js';
import CircuitLayerNode from './CircuitLayerNode.js';
import CircuitLayerNodeDragListener from './CircuitLayerNodeDragListener.js';
import FixedCircuitElementHighlightNode from './FixedCircuitElementHighlightNode.js';
import CircuitElement from '../model/CircuitElement.js';
import Multilink from '../../../axon/js/Multilink.js';

// constants
const matrix = new Matrix3();
const rotationMatrix = new Matrix3();
const FIRE_THRESHOLD = 15; // Beyond this number of amps, flammable CircuitElements catch on fire
const ONE_AMP_PROPERTY = new NumberProperty( 1 ); // All batteries are flammable, so treat them as if they have nonzero resistance
const HIGHLIGHT_PADDING = 10; // in view coordinates

/**
 * Determine whether fire should be shown on the circuit element.
 * @param {number} current - in amps
 * @param {boolean} isValueDepictionEnabled - whether values are shown
 * @returns {boolean}
 */
const isFireShown = ( current: number, isValueDepictionEnabled: boolean ) =>
  Math.abs( current ) >= FIRE_THRESHOLD && isValueDepictionEnabled;

type FixedCircuitElementNodeOptions = {
  isIcon: boolean,
  showHighlight: boolean
} & NodeOptions;// TODO: & CircuitElementNodeOptions

class FixedCircuitElementNode extends CircuitElementNode {
  private readonly lifelikeNode: Node;
  private readonly schematicNode: Node;
  isIcon: boolean;
  private readonly circuitLayerNode: CircuitLayerNode | null;
  contentNode: Node;
  private readonly fireNode: Node | null;
  readonly viewTypeProperty: Property<CircuitElementViewType>;
  private readonly viewPropertyListener: ( viewType: CircuitElementViewType ) => void;
  readonly highlightNode: FixedCircuitElementHighlightNode | null;
  private readonly markDirtyListener: () => void;
  private readonly moveToFrontListener: () => void;
  private readonly pickableListener: ( pickable: boolean | null ) => Node;
  private readonly fixedCircuitElementNodePickable: boolean | null;
  private readonly dragListener: CircuitLayerNodeDragListener | null;
  static webglSpriteNodes: Node[];
  private readonly updateHighlightVisibility: ( ( circuitElement: CircuitElement | null ) => void ) | null;
  private readonly updateFireMultilink: Multilink | null;

  /**
   * @param {CCKCScreenView|null} screenView - the main screen view, null for isIcon
   * @param {CircuitLayerNode|null} circuitLayerNode - Null if an isIcon is created
   * @param {FixedCircuitElement} circuitElement - the corresponding model element
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Node} lifelikeNode - the Node that will display the component as a lifelike object.  Origin must be
   *                            - left-center
   * @param {Node} schematicNode - the Node that will display the component. Origin must be left-center.
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( screenView: CCKCScreenView | null, circuitLayerNode: CircuitLayerNode | null, circuitElement: FixedCircuitElement,
               viewTypeProperty: Property<CircuitElementViewType>, lifelikeNode: Node, schematicNode: Node, tandem: Tandem,
               options?: Partial<FixedCircuitElementNodeOptions> ) {
    assert && assert( lifelikeNode !== schematicNode, 'schematicNode should be different than lifelikeNode' );

    const circuit = circuitLayerNode && circuitLayerNode.circuit;

    const contentNode = new Node();
    super( circuitElement, circuit, merge( {
      cursor: 'pointer',
      children: [ contentNode ],
      tandem: tandem,
      pickable: true
    }, options ) );

    // @private {Node} shows the lifelike view
    this.lifelikeNode = lifelikeNode;

    // @private {Node} shows the schematic view
    this.schematicNode = schematicNode;

    const filledOptions = merge( {
      isIcon: false,
      showHighlight: true
    }, options ) as FixedCircuitElementNodeOptions;

    // @private {boolean} - whether an isIcon is being rendered
    this.isIcon = filledOptions.isIcon;

    // @private {CircuitLayerNode}
    this.circuitLayerNode = circuitLayerNode;

    // @protected (read-only) {Node} node that shows the component, separate from the part that shows the highlight and
    // the fire
    this.contentNode = contentNode;

    // @private {Image|null} - display the fire for flammable CircuitElements
    this.fireNode = null;

    // @protected (read-only) {Property.<CircuitElementViewType>}
    this.viewTypeProperty = viewTypeProperty;

    // @private {function} - Show the selected node
    this.viewPropertyListener = this.setViewType.bind( this );
    viewTypeProperty.link( this.viewPropertyListener );

    // Add highlight (but not for icons)
    if ( !filledOptions.isIcon && filledOptions.showHighlight ) {

      // @protected (read-only) {FixedCircuitElementHighlightNode}
      this.highlightNode = new FixedCircuitElementHighlightNode( this );

      // Update the highlight bounds after it is created
      this.viewPropertyListener( viewTypeProperty.value );
    }
    else {
      this.highlightNode = null;
    }

    // @private {function}
    this.markDirtyListener = this.markAsDirty.bind( this );
    circuitElement.vertexMovedEmitter.addListener( this.markDirtyListener );

    // @private {function}
    this.moveToFrontListener = this.moveFixedCircuitElementNodeToFront.bind( this );
    circuitElement.connectedEmitter.addListener( this.moveToFrontListener );
    circuitElement.vertexSelectedEmitter.addListener( this.moveToFrontListener );

    // @private {function}
    this.pickableListener = this.setPickable.bind( this );

    // LightBulbSocketNode cannot ever be pickable, so let it opt out of this callback
    filledOptions.pickable && circuitElement.interactiveProperty.link( this.pickableListener );

    // @private {boolean}
    this.fixedCircuitElementNodePickable = filledOptions.pickable || null;

    // Use whatever the start node currently is (it can change), and let the circuit manage the dependent vertices
    let initialPoint: Vector2 | null = null;
    let latestPoint: Vector2 | null = null;
    let dragged = false;

    if ( !filledOptions.isIcon && circuitLayerNode ) {

      // @private {DragListener}
      this.dragListener = new CircuitLayerNodeDragListener( circuitLayerNode, [ () => circuitElement.endVertexProperty.get() ], {
        start: ( event: SceneryEvent ) => {
          this.moveToFront();
          if ( event.pointer && event.pointer.point ) {
            initialPoint = event.pointer.point.copy();
            latestPoint = event.pointer.point.copy();
            circuitElement.interactiveProperty.get() && circuitLayerNode.startDragVertex(
              event.pointer.point,
              circuitElement.endVertexProperty.get()
            );
            dragged = false;
          }

        },
        drag: ( event: SceneryEvent ) => {
          if ( event.pointer.point ) {
            latestPoint = event.pointer.point.copy();
            circuitElement.interactiveProperty.get() && circuitLayerNode.dragVertex(
              event.pointer.point,
              circuitElement.endVertexProperty.get(),
              false
            );
            dragged = true;
          }
        },
        end: ( event: SceneryEvent ) =>
          this.endDrag( this.contentNode, [ circuitElement.endVertexProperty.get() ], screenView as CCKCScreenView, circuitLayerNode,
            initialPoint!, latestPoint!, dragged ),
        tandem: tandem.createTandem( 'dragListener' )
      } );
      this.contentNode.addInputListener( this.dragListener );

      if ( filledOptions.showHighlight ) {

        // @private {function}
        this.updateHighlightVisibility = this.setSelectedCircuitElement.bind( this );
        circuitLayerNode.circuit.selectedCircuitElementProperty.link( this.updateHighlightVisibility );
      }
      else {
        this.updateHighlightVisibility = null;
      }

      // Show fire for batteries and resistors
      if ( circuitElement.isFlammable ) {

        this.fireNode = new Image( fireImage, { pickable: false, imageOpacity: 0.95 } ) as unknown as Node;
        this.fireNode.mutate( { scale: this.contentNode.width / this.fireNode.width } );
        this.addChild( this.fireNode );
        if ( screenView ) {

          // @private {Multilink} - Show fire in batteries and resistors with resistance > 0
          this.updateFireMultilink = Property.multilink( [
            circuitElement.currentProperty,
            ( circuitElement instanceof Resistor ) ? circuitElement.resistanceProperty : ONE_AMP_PROPERTY,
            screenView.model.isValueDepictionEnabledProperty
          ], this.updateFireVisible.bind( this ) );
        }
        else {
          assert && assert( false, 'screenView should have been defined' );
          this.updateFireMultilink = null;
        }
      }
      else {
        this.fireNode = null;
        this.updateFireMultilink = null;
      }
    }
    else {
      this.dragListener = null;
      this.updateFireMultilink = null;
      this.updateHighlightVisibility = null;
    }
  }

  /**
   * Set the view type
   * @param {CircuitElementViewType} viewType
   * @private
   */
  setViewType( viewType: CircuitElementViewType ) {
    this.contentNode.children = [ viewType === 'lifelike' ? this.lifelikeNode : this.schematicNode ];

    // Update the dimensions of the highlight.  For Switches, retain the original bounds (big enough to encapsulate
    // both schematic and lifelike open and closed).
    ( this.circuitElement.isSizeChangedOnViewChange && this.highlightNode ) && this.highlightNode.recomputeBounds( this );
  }

  /**
   * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
   * @public - CCKCLightBulbNode calls updateRender for its child socket node
   */
  updateRender() {
    const startPosition = this.circuitElement.startPositionProperty.get();
    const endPosition = this.circuitElement.endPositionProperty.get();

    if ( startPosition.equals( endPosition ) ) {

      // We are (hopefully!) in the middle of updating both vertices and we (hopefully!) will receive another callback
      // shortly with the correct values for both startPosition and endPosition
      // See https://github.com/phetsims/circuit-construction-kit-common/issues/413
      // assert && stepTimer.setTimeout( function() {
      //   assert && assert( !this.circuitElement.startPositionProperty.get().equals( this.circuitElement.endPositionProperty.get() ), 'vertices cannot be in the same spot' );
      // }, 0 );
      return;
    }

    const angle = Vector2.getAngleBetweenVectors( startPosition, endPosition );

    const magnitude = Vector2.getDistanceBetweenVectors( startPosition, endPosition );

    // Update the node transform in a single step, see #66
    matrix.setToTranslationRotationPoint( startPosition, angle );
    this.contentNode.setMatrix( matrix );

    if ( this.highlightNode && this.circuitLayerNode!.circuit.selectedCircuitElementProperty.get() === this.circuitElement ) {
      this.highlightNode.setMatrix( matrix );
    }

    // Update the fire transform
    const flameExtent = 0.8;
    const scale = magnitude / fireImage.width * flameExtent;
    const flameMargin = ( 1 - flameExtent ) / 2;
    const flameX = magnitude * flameMargin / scale;
    const flameY = -fireImage.height;
    matrix.multiplyMatrix( rotationMatrix.setToScale( scale ) )
      .multiplyMatrix( rotationMatrix.setToTranslation( flameX, flameY ) );
    this.fireNode && this.fireNode.setMatrix( matrix );
  }

  /**
   * Move the circuit element node to the front
   * @private
   */
  moveFixedCircuitElementNodeToFront() {

    // Components outside the black box do not move in front of the overlay
    if ( this.circuitElement.interactiveProperty.get() ) {
      this.moveToFront();
      this.circuitElement.moveToFrontEmitter.emit();
      this.circuitElement.startVertexProperty.get().relayerEmitter.emit();
      this.circuitElement.endVertexProperty.get().relayerEmitter.emit();
    }
  }

  /**
   * Used as a bound callback listener in the constructor to update the highlight visibility
   * @param {CircuitElement|null} circuitElement
   * @private
   */
  setSelectedCircuitElement( circuitElement: CircuitElement | null ) {
    if ( this.highlightNode ) {
      const visible = ( circuitElement === this.circuitElement );
      CCKCUtils.setInSceneGraph( visible, this.circuitLayerNode!.highlightLayer, this.highlightNode );
      this.markAsDirty();
    }
    else {
      assert && assert( false, 'should have a highlight node' );
    }
  }

  /**
   * @public - dispose resources when no longer used
   * @override
   */
  dispose() {

    // Interrupt the drag event if it was in progress
    this.dragListener && this.dragListener.interrupt();
    this.dragListener && this.dragListener.dispose();
    this.circuitElement.vertexMovedEmitter.removeListener( this.markDirtyListener );
    this.updateHighlightVisibility && this.circuitLayerNode!.circuit.selectedCircuitElementProperty.unlink( this.updateHighlightVisibility );
    this.circuitElement.connectedEmitter.removeListener( this.moveToFrontListener );
    this.circuitElement.vertexSelectedEmitter.removeListener( this.moveToFrontListener );
    this.fixedCircuitElementNodePickable && this.circuitElement.interactiveProperty.unlink( this.pickableListener );
    this.circuitLayerNode && this.highlightNode && CCKCUtils.setInSceneGraph( false, this.circuitLayerNode.highlightLayer, this.highlightNode );
    this.viewTypeProperty.unlink( this.viewPropertyListener );

    if ( !this.isIcon && this.updateFireMultilink ) {
      Property.unmultilink( this.updateFireMultilink );
    }

    // Detach the child nodes which are reused (so they don't have a _parents reference)
    this.contentNode.dispose();

    super.dispose();
  }

  /**
   * Hide or show the fire depending on various parameters
   * @param {number} current
   * @param {number} resistance
   * @param {boolean} isValueDepictionEnabled
   * @private - for listener bind
   */
  updateFireVisible( current: number, resistance: number, isValueDepictionEnabled: boolean ) {
    this.fireNode!.visible = isFireShown( current, isValueDepictionEnabled ) && resistance >= 1E-8;
  }

  /**
   * Gets the bounds for the highlight rectangle.
   * @returns {Bounds2}
   * @public
   */
  getHighlightBounds() {
    return this.contentNode.localBounds.dilated( HIGHLIGHT_PADDING );
  }
}

/**
 * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
 * @public {Array.<Image>}
 */
FixedCircuitElementNode.webglSpriteNodes = [
  new Image( fireImage ) as unknown as Node
];

circuitConstructionKitCommon.register( 'FixedCircuitElementNode', FixedCircuitElementNode );
export { FixedCircuitElementNodeOptions };
export default FixedCircuitElementNode;