// Copyright 2016-2023, University of Colorado Boulder

/**
 * Renders and provides interactivity for FixedCircuitElements (all CircuitElements except Wires).
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import Vector2 from '../../../dot/js/Vector2.js';
import { Image, Node, SceneryEvent } from '../../../scenery/js/imports.js';
import Tandem from '../../../tandem/js/Tandem.js';
import fire_png from '../../images/fire_png.js';
import CCKCUtils from '../CCKCUtils.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElementViewType from '../model/CircuitElementViewType.js';
import FixedCircuitElement from '../model/FixedCircuitElement.js';
import Resistor from '../model/Resistor.js';
import CCKCScreenView from './CCKCScreenView.js';
import CircuitElementNode, { CircuitElementNodeOptions } from './CircuitElementNode.js';
import CircuitNode from './CircuitNode.js';
import CircuitNodeDragListener from './CircuitNodeDragListener.js';
import FixedCircuitElementHighlightNode from './FixedCircuitElementHighlightNode.js';
import CircuitElement from '../model/CircuitElement.js';
import Multilink, { UnknownMultilink } from '../../../axon/js/Multilink.js';
import Bounds2 from '../../../dot/js/Bounds2.js';
import optionize from '../../../phet-core/js/optionize.js';
import Vertex from '../model/Vertex.js';

// constants
const matrix = new Matrix3();
const rotationMatrix = new Matrix3();
const FIRE_THRESHOLD = 15; // Beyond this number of amps, flammable CircuitElements catch on fire
const ONE_AMP_PROPERTY = new NumberProperty( 1 ); // All batteries are flammable, so treat them as if they have nonzero resistance
const HIGHLIGHT_PADDING = 10; // in view coordinates

/**
 * Determine whether fire should be shown on the circuit element.
 * @param current - in amps
 * @param isValueDepictionEnabled - whether values are shown
 */
const isFireShown = ( current: number, isValueDepictionEnabled: boolean ) =>
  Math.abs( current ) >= FIRE_THRESHOLD && isValueDepictionEnabled;

type SelfOptions = {
  isIcon?: boolean;
  showHighlight?: boolean;
};
export type FixedCircuitElementNodeOptions = SelfOptions & CircuitElementNodeOptions;

export default class FixedCircuitElementNode extends CircuitElementNode {
  private readonly lifelikeNode: Node;
  private readonly schematicNode: Node;
  protected isIcon: boolean;
  private readonly circuitNode: CircuitNode | null;
  public readonly contentNode: Node;
  private readonly fireNode: Node | null;
  protected readonly viewTypeProperty: Property<CircuitElementViewType>;
  private readonly viewPropertyListener: ( viewType: CircuitElementViewType ) => void;
  protected readonly highlightNode: FixedCircuitElementHighlightNode | null;
  private readonly markDirtyListener: () => void;
  private readonly moveToFrontListener: () => void;
  protected readonly pickableListener: ( pickable: boolean | null ) => Node;
  private readonly fixedCircuitElementNodePickable: boolean | null;
  public readonly dragListener: CircuitNodeDragListener | null;

  // Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
  public static readonly webglSpriteNodes: Node[] = [
    new Image( fire_png )
  ];
  private readonly updateHighlightVisibility: ( ( circuitElement: CircuitElement | Vertex | null ) => void ) | null;
  private readonly updateFireMultilink: UnknownMultilink | null;

  /**
   * @param screenView - the main screen view, null for isIcon
   * @param circuitNode - Null if an isIcon is created
   * @param circuitElement - the corresponding model element
   * @param viewTypeProperty
   * @param lifelikeNode - the Node that will display the component as a lifelike object.  Origin must be
   *                            - left-center
   * @param schematicNode - the Node that will display the component. Origin must be left-center.
   * @param tandem
   * @param [providedOptions]
   */
  public constructor( screenView: CCKCScreenView | null, circuitNode: CircuitNode | null, circuitElement: FixedCircuitElement,
                      viewTypeProperty: Property<CircuitElementViewType>, lifelikeNode: Node, schematicNode: Node, tandem: Tandem,
                      providedOptions?: FixedCircuitElementNodeOptions ) {
    assert && assert( lifelikeNode !== schematicNode, 'schematicNode should be different than lifelikeNode' );

    const circuit = circuitNode && circuitNode.circuit;

    const contentNode = new Node();

    const options = optionize<FixedCircuitElementNodeOptions, SelfOptions, CircuitElementNodeOptions>()( {
      cursor: 'pointer',
      children: [ contentNode ],
      tandem: tandem,
      pickable: true,
      isIcon: false,
      showHighlight: true
    }, providedOptions );

    super( circuitElement, circuit, options );

    // shows the lifelike view
    this.lifelikeNode = lifelikeNode;

    // shows the schematic view
    this.schematicNode = schematicNode;

    // whether an isIcon is being rendered
    this.isIcon = options.isIcon;

    this.circuitNode = circuitNode;

    // node that shows the component, separate from the part that shows the highlight and the fire
    this.contentNode = contentNode;

    // display the fire for flammable CircuitElements
    this.fireNode = null;

    this.viewTypeProperty = viewTypeProperty;

    // Show the selected node
    this.viewPropertyListener = this.setViewType.bind( this );
    viewTypeProperty.link( this.viewPropertyListener );

    // Add highlight (but not for icons)
    if ( !options.isIcon && options.showHighlight ) {

      this.highlightNode = new FixedCircuitElementHighlightNode( this );

      // Update the highlight bounds after it is created
      this.viewPropertyListener( viewTypeProperty.value );
    }
    else {
      this.highlightNode = null;
    }

    this.markDirtyListener = this.markAsDirty.bind( this );
    circuitElement.vertexMovedEmitter.addListener( this.markDirtyListener );

    this.moveToFrontListener = this.moveFixedCircuitElementNodeToFront.bind( this );
    circuitElement.connectedEmitter.addListener( this.moveToFrontListener );
    circuitElement.vertexSelectedEmitter.addListener( this.moveToFrontListener );

    this.pickableListener = this.setPickable.bind( this );

    // LightBulbSocketNode cannot ever be pickable, so let it opt out of this callback
    options.pickable && circuitElement.interactiveProperty.link( this.pickableListener );

    this.fixedCircuitElementNodePickable = options.pickable || null;

    // Use whatever the start node currently is (it can change), and let the circuit manage the dependent vertices
    let initialPoint: Vector2 | null = null;
    let latestPoint: Vector2 | null = null;
    let dragged = false;

    if ( !options.isIcon && circuitNode ) {

      this.dragListener = new CircuitNodeDragListener( circuitNode, [ () => circuitElement.endVertexProperty.get() ], {
        start: ( event: SceneryEvent ) => {
          this.moveToFront();
          if ( event.pointer && event.pointer.point ) {
            initialPoint = event.pointer.point.copy();
            latestPoint = event.pointer.point.copy();
            circuitElement.interactiveProperty.get() && circuitNode.startDragVertex(
              event.pointer.point,
              circuitElement.endVertexProperty.get(),
              circuitElement
            );
            dragged = false;
          }

        },
        drag: ( event: SceneryEvent ) => {
          if ( event.pointer.point ) {
            latestPoint = event.pointer.point.copy();
            circuitElement.interactiveProperty.get() && circuitNode.dragVertex(
              event.pointer.point,
              circuitElement.endVertexProperty.get(),
              false
            );
            dragged = true;
          }
        },
        end: () =>
          this.endDrag( this.contentNode, [ circuitElement.endVertexProperty.get() ], screenView!, circuitNode,
            initialPoint!, latestPoint!, dragged ),
        tandem: tandem.createTandem( 'dragListener' )
      } );
      this.contentNode.addInputListener( this.dragListener );

      if ( options.showHighlight ) {

        this.updateHighlightVisibility = this.setSelectedCircuitElement.bind( this );
        circuitNode.circuit.selectionProperty.link( this.updateHighlightVisibility );
      }
      else {
        this.updateHighlightVisibility = null;
      }

      // Show fire for batteries and resistors
      if ( circuitElement.isFlammable ) {

        this.fireNode = new Image( fire_png, { pickable: false, imageOpacity: 0.95 } );
        this.fireNode.mutate( { scale: this.contentNode.width / this.fireNode.width } );
        this.addChild( this.fireNode );
        if ( screenView ) {

          // Show fire in batteries and resistors with resistance > 0
          this.updateFireMultilink = Multilink.multilink( [
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
   */
  private setViewType( viewType: CircuitElementViewType ): void {
    this.contentNode.children = [ viewType === CircuitElementViewType.LIFELIKE ? this.lifelikeNode : this.schematicNode ];

    // Update the dimensions of the highlight.  For Switches, retain the original bounds (big enough to encapsulate
    // both schematic and lifelike open and closed).
    ( this.circuitElement.isSizeChangedOnViewChange && this.highlightNode ) && this.highlightNode.recomputeBounds( this );
  }

  /**
   * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
   * CCKCLightBulbNode calls updateRender for its child socket node
   */
  public updateRender(): void {
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

    if ( this.highlightNode && this.circuitNode!.circuit.selectionProperty.get() === this.circuitElement ) {
      this.highlightNode.setMatrix( matrix );
    }

    // Update the fire transform
    const flameExtent = 0.8;
    const scale = magnitude / fire_png.width * flameExtent;
    const flameMargin = ( 1 - flameExtent ) / 2;
    const flameX = magnitude * flameMargin / scale;
    const flameY = -fire_png.height;
    matrix.multiplyMatrix( rotationMatrix.setToScale( scale ) )
      .multiplyMatrix( rotationMatrix.setToTranslation( flameX, flameY ) );
    this.fireNode && this.fireNode.setMatrix( matrix );
  }

  /**
   * Move the circuit element node to the front
   */
  private moveFixedCircuitElementNodeToFront(): void {

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
   */
  private setSelectedCircuitElement( circuitElement: CircuitElement | Vertex | null ): void {
    if ( this.highlightNode ) {
      const visible = ( circuitElement === this.circuitElement );
      CCKCUtils.setInSceneGraph( visible, this.circuitNode!.highlightLayer, this.highlightNode );
      this.markAsDirty();
    }
    else {
      assert && assert( false, 'should have a highlight node' );
    }
  }

  public override dispose(): void {

    // Interrupt the drag event if it was in progress
    this.dragListener && this.dragListener.interrupt();
    this.dragListener && this.dragListener.dispose();
    this.circuitElement.vertexMovedEmitter.removeListener( this.markDirtyListener );
    this.updateHighlightVisibility && this.circuitNode!.circuit.selectionProperty.unlink( this.updateHighlightVisibility );
    this.circuitElement.connectedEmitter.removeListener( this.moveToFrontListener );
    this.circuitElement.vertexSelectedEmitter.removeListener( this.moveToFrontListener );
    this.fixedCircuitElementNodePickable && this.circuitElement.interactiveProperty.unlink( this.pickableListener );
    this.circuitNode && this.highlightNode && CCKCUtils.setInSceneGraph( false, this.circuitNode.highlightLayer, this.highlightNode );
    this.viewTypeProperty.unlink( this.viewPropertyListener );

    if ( !this.isIcon && this.updateFireMultilink ) {
      Multilink.unmultilink( this.updateFireMultilink );
    }

    // Detach the child nodes which are reused (so they don't have a _parents reference)
    this.contentNode.dispose();

    super.dispose();
  }

  /**
   * Hide or show the fire depending on various parameters, for listener bind.
   */
  private updateFireVisible( current: number, resistance: number, isValueDepictionEnabled: boolean ): void {
    this.fireNode!.visible = isFireShown( current, isValueDepictionEnabled ) && resistance >= 1E-8;
  }

  /**
   * Gets the bounds for the highlight rectangle.
   */
  public getHighlightBounds(): Bounds2 {
    return this.contentNode.localBounds.dilated( HIGHLIGHT_PADDING );
  }
}

circuitConstructionKitCommon.register( 'FixedCircuitElementNode', FixedCircuitElementNode );