// Copyright 2015-2019, University of Colorado Boulder

/**
 * Renders the lifelike/schematic view for a Capacitor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Bounds3 = require( 'DOT/Bounds3' );
  const CapacitorConstants = require( 'SCENERY_PHET/capacitor/CapacitorConstants' );
  const CapacitorNode = require( 'SCENERY_PHET/capacitor/CapacitorNode' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CircuitElementViewType' );
  const Color = require( 'SCENERY/util/Color' );
  const FixedCircuitElementNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/FixedCircuitElementNode' );
  const Image = require( 'SCENERY/nodes/Image' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Orientation = require( 'PHET_CORE/Orientation' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Property = require( 'AXON/Property' );
  const Shape = require( 'KITE/Shape' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Util = require( 'DOT/Util' );
  const YawPitchModelViewTransform3 = require( 'SCENERY_PHET/capacitor/YawPitchModelViewTransform3' );

  // images
  const wireIconImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/wire-icon.png' );

  // constants
  // dimensions for schematic
  const SMALL_TERMINAL_WIDTH = 104;
  const LARGE_TERMINAL_WIDTH = 104;
  const WIDTH = 188;
  const GAP = 30;
  const LEFT_JUNCTION = WIDTH / 2 - GAP / 2;
  const RIGHT_JUNCTION = WIDTH / 2 + GAP / 2;

  // Points sampled using Photoshop from a raster of the IEEE icon seen at
  // https://upload.wikimedia.org/wikipedia/commons/c/cb/Circuit_elements.svg
  let leftSchematicShape = new Shape()
    .moveTo( 0, 0 ) // left wire
    .lineTo( LEFT_JUNCTION, 0 )
    .moveTo( LEFT_JUNCTION, SMALL_TERMINAL_WIDTH / 2 ) // left plate
    .lineTo( LEFT_JUNCTION, -SMALL_TERMINAL_WIDTH / 2 );

  let rightSchematicShape = new Shape()
    .moveTo( RIGHT_JUNCTION, 0 ) // right wire
    .lineTo( WIDTH, 0 )
    .moveTo( RIGHT_JUNCTION, LARGE_TERMINAL_WIDTH / 2 ) // right plate
    .lineTo( RIGHT_JUNCTION, -LARGE_TERMINAL_WIDTH / 2 );

  // Tuned the scale so the component fits exactly between the vertices
  const SCHEMATIC_SCALE = CCKCConstants.CAPACITOR_LENGTH / WIDTH;

  // Scale to fit the correct width
  leftSchematicShape = leftSchematicShape.transformed( Matrix3.scale( SCHEMATIC_SCALE, SCHEMATIC_SCALE ) );
  rightSchematicShape = rightSchematicShape.transformed( Matrix3.scale( SCHEMATIC_SCALE, SCHEMATIC_SCALE ) );

  class CapacitorCircuitElementNode extends FixedCircuitElementNode {

    /**
     * @param {CCKCScreenView|null} screenView - main screen view, null for isIcon
     * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
     * @param {Capacitor} capacitor
     * @param {Property.<CircuitElementViewType>} viewTypeProperty
     * @param {Tandem} tandem
     * @param {Object} [options]
     */
    constructor( screenView, circuitLayerNode, capacitor, viewTypeProperty, tandem, options ) {

      const wireStubOptions = {

        // mark as pickable so we can perform hit testing with the voltmeter probes
        pickable: true
      };
      const leftWireStub = new Image( wireIconImage, wireStubOptions );
      const rightWireStub = new Image( wireIconImage, wireStubOptions );

      // TODO: Consider making CapacitorNode more view-oriented, at least in its dimensions?
      const thickness = 0.01414213562373095;
      const plateBounds = new Bounds3( 0, 0, 0, thickness, CapacitorConstants.PLATE_HEIGHT, thickness );
      const V = 1.7707999999999996e-13;

      // TODO: OK to use a mock object like this, or should we create a model type
      const plateSeparationProperty = new NumberProperty( 0.004 );

      const circuit = {
        maxPlateCharge: 2.6562e-12,
        capacitor: {
          plateSizeProperty: new Property( plateBounds ),
          plateSeparationProperty: plateSeparationProperty,
          plateVoltageProperty: new NumberProperty( 1.5 ),
          plateChargeProperty: new NumberProperty( V ),
          getEffectiveEField: () => 0
        }
      };

      const modelViewTransform = new YawPitchModelViewTransform3();
      const plateChargeVisibleProperty = new BooleanProperty( true );
      const electricFieldVisibleProperty = new BooleanProperty( true );

      // TODO: This is probably creating far too many <canvas> elements, and also making the charges blurry
      const lifelikeNode = new CapacitorNode( circuit, modelViewTransform, plateChargeVisibleProperty, electricFieldVisibleProperty, {
        tandem: Tandem.optional,
        orientation: Orientation.HORIZONTAL // so the "-" charges are upside-up in the default orientation
      } );

      const voltageToPlateCharge = v => circuit.capacitor.plateChargeProperty.set( -Util.linear( -9, 9, -V, V, v ) );
      capacitor.voltageDifferenceProperty.link( voltageToPlateCharge );

      lifelikeNode.mutate( {
        scale: 0.45,
        rotation: -Math.PI / 2
      } );

      lifelikeNode.mutate( {
        centerX: capacitor.distanceBetweenVertices / 2,

        // Center vertically to match the FixedCircuitElementNode assumption that origin is center left
        centerY: 0
      } );
      leftWireStub.mutate( {
        centerX: lifelikeNode.centerX,
        centerY: lifelikeNode.centerY
      } );
      rightWireStub.mutate( {
        centerX: lifelikeNode.centerX,
        centerY: lifelikeNode.centerY
      } );

      const schematicPathOptions = {
        stroke: Color.BLACK,
        lineWidth: CCKCConstants.SCHEMATIC_LINE_WIDTH,
        strokePickable: true, // DO WE NEED NEXT LINE?
        pickable: true // so that we can use hit detection for the voltmeter probes.  TODO: do we need all of these?
      };
      const leftSchematicPath = new Path( leftSchematicShape, schematicPathOptions );
      const rightSchematicPath = new Path( rightSchematicShape, schematicPathOptions );

      // Wrap in another layer so it can be used for clipping
      const schematicNode = new Node( {
        children: [ leftSchematicPath, rightSchematicPath ],
        pickable: true // so that we can use hit detection for the voltmeter probes TODO: do we need all of these?
      } );

      // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
      schematicNode.mouseArea = schematicNode.localBounds.dilated( 2 );
      schematicNode.touchArea = schematicNode.localBounds.dilated( 2 );

      const lifelikeNodeContainer = new Node( {
        children: [ lifelikeNode, leftWireStub, rightWireStub ]
      } );
      super(
        screenView,
        circuitLayerNode,
        capacitor,
        viewTypeProperty,
        lifelikeNodeContainer,
        schematicNode,
        tandem,
        options
      );

      // @public (read-only) {Capacitor} - the Capacitor rendered by this Node
      this.capacitor = capacitor;

      // @public (read-only) - for clipping in ChargeNode
      this.capacitorCircuitElementLifelikeNode = lifelikeNode;

      // @public (read-only) - for clipping in ChargeNode
      this.capacitorCircuitElementSchematicNode = schematicNode;

      // @private
      this.leftWireStub = leftWireStub;
      this.rightWireStub = rightWireStub;
      this.leftSchematicPath = leftSchematicPath;
      this.rightSchematicPath = rightSchematicPath;

      capacitor.capacitanceProperty.link( capacitance => {

        // compute proportionality constant based on defaults.
        const k = 0.1 * 0.004;

        // inverse relationship between plate separation and capacitance.
        plateSeparationProperty.value = k / capacitance;

        // Adjust clipping region of wires accordingly
        const topPlateCenterToGlobal = this.capacitorCircuitElementLifelikeNode.getTopPlateClipShapeToGlobal();
        leftWireStub.clipArea = topPlateCenterToGlobal.transformed( leftWireStub.getGlobalToLocalMatrix() );

        const bottomPlateCenterToGlobal = this.capacitorCircuitElementLifelikeNode.getBottomPlateClipShapeToGlobal();
        rightWireStub.clipArea = bottomPlateCenterToGlobal.transformed( rightWireStub.getGlobalToLocalMatrix() );
      } );

      // @private
      this.disposeCapacitorCircuitElementNode = () => capacitor.voltageDifferenceProperty.unlink( voltageToPlateCharge );
    }

    // @public
    dispose() {
      this.disposeCapacitorCircuitElementNode();
      super.dispose();
    }

    /**
     * Returns true if the node hits the sensor at the given point.
     * @param {Vector2} point
     * @returns {boolean}
     * @overrides
     * @public
     */
    containsSensorPoint( point, globalPoint ) {

      // make sure bounds are correct if cut or joined in this animation frame
      this.step();

      return this.frontSideContainsSensorPoint( globalPoint ) || this.backSideContainsSensorPoint( globalPoint );
    }

    /**
     * Determine whether the start side (with the pivot) contains the sensor point.
     * @param {Vector2} globalPoint
     * @returns {boolean}
     */
    frontSideContainsSensorPoint( globalPoint ) {

      if ( this.viewTypeProperty.value === CircuitElementViewType.LIFELIKE ) {
        return this.capacitorCircuitElementLifelikeNode.frontSideContainsSensorPoint( globalPoint ) ||
               this.leftWireStub.containsPoint( this.leftWireStub.globalToParentPoint( globalPoint ) );
      }
      else {
        return this.leftSchematicPath.containsPoint( this.leftSchematicPath.globalToParentPoint( globalPoint ) );
      }
    }

    /**
     * Determine whether the end side (with the pivot) contains the sensor point.
     * @param {Vector2} globalPoint
     * @returns {boolean}
     */
    backSideContainsSensorPoint( globalPoint ) {

      if ( this.viewTypeProperty.value === CircuitElementViewType.LIFELIKE ) {
        return this.capacitorCircuitElementLifelikeNode.backSideContainsSensorPoint( globalPoint ) ||
               this.rightWireStub.containsPoint( this.rightWireStub.globalToParentPoint( globalPoint ) );
      }
      else {
        return this.rightSchematicPath.containsPoint( this.rightSchematicPath.globalToParentPoint( globalPoint ) );
      }
    }
  }

  /**
   * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
   * @public {Array.<Image>}
   */
  CapacitorCircuitElementNode.webglSpriteNodes = [
    new Image( wireIconImage )
  ];

  return circuitConstructionKitCommon.register( 'CapacitorCircuitElementNode', CapacitorCircuitElementNode );
} );