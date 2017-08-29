// Copyright 2016-2017, University of Colorado Boulder

/**
 * Toolbox from which CircuitElements can be dragged or returned.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Property = require( 'AXON/Property' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  var BatteryType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/BatteryType' );
  var LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  var Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  var Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  var Vertex = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Vertex' );
  var Wire = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Wire' );
  var BatteryNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/BatteryNode' );
  var CircuitConstructionKitLightBulbNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitConstructionKitLightBulbNode' );
  var CircuitElementToolNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementToolNode' );
  var CircuitElementViewType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CircuitElementViewType' );
  var ResistorNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ResistorNode' );
  var SwitchNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/SwitchNode' );
  var Range = require( 'DOT/Range' );
  var Vector2 = require( 'DOT/Vector2' );
  var inherit = require( 'PHET_CORE/inherit' );
  var AlignGroup = require( 'SCENERY/nodes/AlignGroup' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Image = require( 'SCENERY/nodes/Image' );
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'SCENERY/nodes/Node' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Carousel = require( 'SUN/Carousel' );
  var PageControl = require( 'SUN/PageControl' );

  // strings
  var batteryString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/battery' );
  var coinString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/coin' );
  var dogString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/dog' );
  var dollarBillString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/dollarBill' );
  var eraserString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/eraser' );
  var handString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/hand' );
  var lightBulbString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/lightBulb' );
  var paperClipString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/paperClip' );
  var pencilString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/pencil' );
  var resistorString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistor' );
  var switchString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/switch' );
  var wireString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/wire' );

  // images
  var wireIconImage = require( 'image!CIRCUIT_CONSTRUCTION_KIT_COMMON/wire-icon.png' );

  // constants
  var BATTERY_LENGTH = CircuitConstructionKitCommonConstants.BATTERY_LENGTH;
  var TOOLBOX_ICON_SIZE = CircuitConstructionKitCommonConstants.TOOLBOX_ICON_SIZE;
  var RESISTOR_LENGTH = CircuitConstructionKitCommonConstants.RESISTOR_LENGTH;
  var WIRE_LENGTH = 100;
  var SWITCH_LENGTH = CircuitConstructionKitCommonConstants.SWITCH_LENGTH;
  var HIGH_RESISTANCE = Math.pow( 10, 9 );
  var CAROUSEL_ITEM_SPACING = 27;
  var CAROUSEL_PAGE_HEIGHT = 352; // so the carousels will be the same size on each screen

  /**
   * @param {Circuit} circuit
   * @param {Property.<boolean>} showLabelsProperty
   * @param {Property.<string>} viewTypeProperty
   * @param {CircuitLayerNode} circuitLayerNode
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function CircuitElementToolbox( circuit, showLabelsProperty, viewTypeProperty, circuitLayerNode, tandem, options ) {

    options = _.extend( {
      orientation: 'vertical',
      numberOfWires: 20,
      numberOfRightBatteries: 10,
      numberOfLightBulbs: 10,
      numberOfResistors: 10,
      numberOfSwitches: 5,
      numberOfCoins: 0,
      numberOfErasers: 0,
      numberOfPencils: 0,
      numberOfHands: 0,
      numberOfDogs: 0,
      numberOfDollarBills: 0,
      numberOfPaperClips: 0,
      numberOfHighVoltageBatteries: 0,
      numberOfHighResistanceResistors: 0,
      numberOfHighResistanceLightBulbs: 0
    }, options );

    /**
     * Create a Vertex at the specified location, convenience function for creating the vertices for CircuitElements.
     * @param {Vector2} position - the position of the Vertex in view = model coordinates
     * @returns {Vertex}
     */
    var createVertex = function( position ) {
      return new Vertex( position, { tandem: circuit.vertexGroupTandem.createNextTandem() } );
    };

    /**
     * Returns a function which counts the number of circuit elements (not counting those in the true black box).
     * @param {function} predicate - CircuitElement => boolean
     * @returns {function}
     */
    var createCounter = function( predicate ) {
      return function() {
        return circuit.circuitElements.getArray().filter( function( circuitElement ) {

          // Count according to the predicate, but don't count elements inside the true black box
          return predicate( circuitElement ) && !circuitElement.insideTrueBlackBoxProperty.get();
        } ).length;
      };
    };

    /**
     * Create a pair of vertices to be used for a new CircuitElement
     * @param {Vector2} position - the position of the center of the CircuitElement
     * @param {number} length - the distance between the vertices
     * @returns {{startVertex: Vertex, endVertex: Vertex}}
     */
    var createVertexPair = function( position, length ) {
      return {
        startVertex: createVertex( position.plusXY( -length / 2, 0 ) ),
        endVertex: createVertex( position.plusXY( length / 2, 0 ) )
      };
    };

    /**
     * Utility function that creates a CircuitElementToolNode
     * @param {string} labelString
     * @param {number} count
     * @param {Node} icon
     * @param {function} counterFunction - CircuitElement => boolean
     * @param {function} creator
     * @param {Object} [options]
     * @returns {CircuitElementToolNode}
     */
    var createCircuitElementToolNode = function( labelString, count, icon, counterFunction, creator, options ) {
      options = _.extend( { iconScale: 1.0 }, options );
      icon.mutate( { scale: options.iconScale * TOOLBOX_ICON_SIZE / Math.max( icon.width, icon.height ) } );
      return new CircuitElementToolNode(
        labelString, showLabelsProperty, circuitLayerNode, icon, count, createCounter( counterFunction ), creator
      );
    };

    // Create the tool nodes
    var lifelikeWireNode = new Image( wireIconImage );
    var schematicWireNode = new Line( 0, 0, 120, 0, {
      stroke: 'black',
      lineWidth: 4.5 // match with other toolbox icons
    } );
    var wireNode = new Node();
    viewTypeProperty.link( function( view ) {
      wireNode.children = [ view === CircuitElementViewType.LIFELIKE ? lifelikeWireNode : schematicWireNode ];
    } );
    var wireToolNode = createCircuitElementToolNode( wireString, options.numberOfWires,
      wireNode,
      function( circuitElement ) { return circuitElement instanceof Wire; },
      function( position ) {
        var vertexPair = createVertexPair( position, WIRE_LENGTH );
        return new Wire(
          vertexPair.startVertex,
          vertexPair.endVertex,
          circuit.wireResistivityProperty,
          circuit.wireGroupTandem.createNextTandem()
        );
      }
    );

    var batteryModel = new Battery( new Vertex( Vector2.ZERO ), new Vertex( new Vector2( CircuitConstructionKitCommonConstants.BATTERY_LENGTH, 0 ) ),
      null, BatteryType.NORMAL, tandem.createTandem( 'rightIconBattery' ) );
    var rightBatteryToolNode = createCircuitElementToolNode( batteryString, options.numberOfRightBatteries,
      new BatteryNode( null, null, batteryModel, viewTypeProperty, tandem.createTandem( 'rightBatteryIcon' ), { icon: true }
      ),
      function( circuitElement ) {
        return circuitElement instanceof Battery &&
               circuitElement.initialOrientation === 'right' &&
               circuitElement.batteryType === BatteryType.NORMAL;
      },
      function( position ) {
        var vertexPair = createVertexPair( position, BATTERY_LENGTH );
        return new Battery(
          vertexPair.startVertex,
          vertexPair.endVertex,
          circuit.batteryResistanceProperty,
          'normal',
          circuit.rightBatteryTandemGroup.createNextTandem()
        );
      }
    );

    var lightBulbModel = LightBulb.createAtPosition(
      Vector2.ZERO,
      circuit.vertexGroupTandem,
      CircuitConstructionKitCommonConstants.DEFAULT_RESISTANCE,
      viewTypeProperty,
      circuit.lightBulbGroupTandem.createNextTandem(), {
        highResistance: false
      } );
    var lightBulbToolNode = createCircuitElementToolNode( lightBulbString, options.numberOfLightBulbs,
      new CircuitConstructionKitLightBulbNode( null, null,
        lightBulbModel,
        new Property( true ), viewTypeProperty, tandem.createTandem( 'lightBulbIcon' ), { icon: true } ),
      function( circuitElement ) { return circuitElement instanceof LightBulb && !circuitElement.highResistance; },
      function( position ) {
        return LightBulb.createAtPosition(
          position,
          circuit.vertexGroupTandem,
          CircuitConstructionKitCommonConstants.DEFAULT_RESISTANCE,
          viewTypeProperty,
          circuit.lightBulbGroupTandem.createNextTandem()
        );
      }, {
        iconScale: 0.85
      } );

    // Override touch area because it has unique dimensions
    // lightBulbToolNode.touchArea = lightBulbToolNode.localBounds.dilatedXY( 11, 8 );

    var resistorModel = new Resistor(
      new Vertex( Vector2.ZERO ),
      new Vertex( new Vector2( CircuitConstructionKitCommonConstants.RESISTOR_LENGTH, 0 ) ),
      tandem.createTandem( 'resistor' )
    );
    var resistorToolNode = createCircuitElementToolNode( resistorString, options.numberOfResistors,
      new ResistorNode( null, null, resistorModel, viewTypeProperty, tandem.createTandem( 'resistorIcon' ), {
        icon: true
      } ),
      function( circuitElement ) {
        return circuitElement instanceof Resistor && circuitElement.resistorType === 'resistor';
      },
      function( position ) {
        var vertexPair = createVertexPair( position, RESISTOR_LENGTH );
        return new Resistor(
          vertexPair.startVertex, vertexPair.endVertex, circuit.resistorGroupTandem.createNextTandem()
        );
      }
    );

    var switchToolNode = createCircuitElementToolNode( switchString, options.numberOfSwitches,
      new SwitchNode( null, null,
        new Switch(
          new Vertex( Vector2.ZERO ),
          new Vertex( new Vector2( SWITCH_LENGTH, 0 ) ),
          tandem.createTandem( 'switch' )
        ), viewTypeProperty, tandem.createTandem( 'switchIcon' ), {
          icon: true
        } ),
      function( circuitElement ) { return circuitElement instanceof Switch; },
      function( position ) {
        var vertexPair = createVertexPair( position, SWITCH_LENGTH );
        return new Switch( vertexPair.startVertex, vertexPair.endVertex, circuit.switchGroupTandem.createNextTandem() );
      } );

    if ( options.numberOfCoins ) {

      /**
       * Create a ToolNode for a grab bag item
       * @param {string} resistorType
       * @param {number} resistance
       * @param {number} resistorLength
       * @param {string} labelString
       * @param {number} maxCount
       * @param {Tandem} iconModelTandem
       * @param {Tandem} iconTandem
       * @param {Tandem} groupTandem
       * @returns {CircuitElementToolNode}
       */
      var createGrabBagToolNode = function( resistorType, resistance, resistorLength, labelString, maxCount,
                                            iconModelTandem, iconTandem, groupTandem ) {
        var createGrabBagIcon = function( grabBagItem, tandem ) {
          return new ResistorNode( null, null, grabBagItem, viewTypeProperty, tandem, { icon: true } );
        };

        var getGrabBagItemCreator = function( resistorType, resistance, resistorLength, groupTandem ) {
          return function( position ) {
            var vertexPair = createVertexPair( position, resistorLength );
            return new Resistor( vertexPair.startVertex, vertexPair.endVertex, groupTandem.createNextTandem(), {
              resistance: resistance,
              resistorType: resistorType,
              resistorLength: resistorLength
            } );
          };
        };

        /**
         * Create the specified grab bag item
         * @param {string} resistorType
         * @param {number} resistorLength
         * @param {Tandem} tandem
         * @returns {Resistor}
         */
        var createGrabBagItem = function( resistorType, resistorLength, tandem ) {
          return new Resistor( new Vertex( Vector2.ZERO ), new Vertex( new Vector2( resistorLength, 0 ) ), tandem, {
            resistorType: resistorType,
            resistorLength: resistorLength
          } );
        };
        var createdItem = createGrabBagItem( resistorType, resistorLength, iconModelTandem );
        return createCircuitElementToolNode( labelString, maxCount, createGrabBagIcon( createdItem, iconTandem ),
          function( circuitElement ) {
            return circuitElement instanceof Resistor && circuitElement.resistorType === resistorType;
          },
          getGrabBagItemCreator( resistorType, resistance, resistorLength, groupTandem )
        );
      };

      var MIN_RESISTANCE = 1E-6;

      var dollarBillNode = createGrabBagToolNode(
        'dollarBill',
        HIGH_RESISTANCE,
        CircuitConstructionKitCommonConstants.DOLLAR_BILL_LENGTH,
        dollarBillString,
        options.numberOfDollarBills,
        tandem.createTandem( 'dollarBill' ),
        tandem.createTandem( 'dollarBillIcon' ),
        circuit.dollarBillGroupTandem
      );
      var paperClipNode = createGrabBagToolNode(
        'paperClip',
        MIN_RESISTANCE,
        CircuitConstructionKitCommonConstants.PAPER_CLIP_LENGTH,
        paperClipString,
        options.numberOfPaperClips,
        tandem.createTandem( 'paperClip' ),
        tandem.createTandem( 'paperClipIcon' ),
        circuit.paperClipGroupTandem
      );
      var coinToolNode = createGrabBagToolNode(
        'coin',
        MIN_RESISTANCE,
        CircuitConstructionKitCommonConstants.COIN_LENGTH,
        coinString,
        options.numberOfCoins,
        tandem.createTandem( 'coin' ),
        tandem.createTandem( 'coinIcon' ),
        circuit.coinGroupTandem
      );
      var eraserToolNode = createGrabBagToolNode(
        'eraser',
        HIGH_RESISTANCE,
        CircuitConstructionKitCommonConstants.ERASER_LENGTH,
        eraserString,
        options.numberOfErasers,
        tandem.createTandem( 'eraser' ),
        tandem.createTandem( 'eraserIcon' ),
        circuit.eraserGroupTandem
      );
      var pencilToolNode = createGrabBagToolNode(
        'pencil',
        300,
        CircuitConstructionKitCommonConstants.PENCIL_LENGTH,
        pencilString,
        options.numberOfPencils,
        tandem.createTandem( 'pencil' ),
        tandem.createTandem( 'pencilIcon' ),
        circuit.pencilGroupTandem
      );
      var handToolNode = createGrabBagToolNode(
        'hand',
        Math.pow( 10, 6 ),
        CircuitConstructionKitCommonConstants.HAND_LENGTH,
        handString,
        options.numberOfHands,
        tandem.createTandem( 'hand' ),
        tandem.createTandem( 'handIcon' ),
        circuit.handGroupTandem
      );
      var dogToolNode = createGrabBagToolNode(
        'dog',
        HIGH_RESISTANCE,
        CircuitConstructionKitCommonConstants.DOG_LENGTH,
        dogString,
        options.numberOfDogs,
        tandem.createTandem( 'dog' ),
        tandem.createTandem( 'dogIcon' ),
        circuit.dogGroupTandem
      );
    }

    if ( options.numberOfHighVoltageBatteries ) {

      var highVoltageBatteryToolNode = createCircuitElementToolNode(
        batteryString,
        options.numberOfHighVoltageBatteries,
        new BatteryNode( null, null,
          new Battery(
            new Vertex( Vector2.ZERO ),
            new Vertex( new Vector2( CircuitConstructionKitCommonConstants.BATTERY_LENGTH, 0 ) ),
            null,
            BatteryType.HIGH_VOLTAGE,
            tandem.createTandem( 'highVoltageIconBattery' )
          ), viewTypeProperty, tandem.createTandem( 'highVoltageBatteryIcon' ), { icon: true } ),
        function( circuitElement ) {
          return circuitElement instanceof Battery &&
                 circuitElement.initialOrientation === 'right' &&
                 circuitElement.batteryType === BatteryType.HIGH_VOLTAGE;
        }, function( position ) {
          var vertexPair = createVertexPair( position, BATTERY_LENGTH );
          return new Battery(
            vertexPair.startVertex,
            vertexPair.endVertex,
            circuit.batteryResistanceProperty,
            BatteryType.HIGH_VOLTAGE,
            circuit.rightBatteryTandemGroup.createNextTandem(), {
              voltage: 10000,
              editableRange: new Range( 100, 100000 ),
              editorDelta: CircuitConstructionKitCommonConstants.HIGH_EDITOR_DELTA
            } );
        } );

      var highResistanceBulbToolNode = createCircuitElementToolNode(
        lightBulbString,
        options.numberOfHighResistanceLightBulbs,
        new CircuitConstructionKitLightBulbNode(
          null,
          null,
          LightBulb.createAtPosition(
            Vector2.ZERO,
            circuit.vertexGroupTandem,
            1000,
            viewTypeProperty,
            circuit.lightBulbGroupTandem.createNextTandem(), {
              highResistance: true
            } ),
          new Property( true ),
          viewTypeProperty,
          tandem.createTandem( 'highResistanceLightBulbIcon' ), {
            icon: true
          } ),
        function( circuitElement ) { return circuitElement instanceof LightBulb && circuitElement.highResistance; },
        function( position ) {
          return LightBulb.createAtPosition( position, circuit.vertexGroupTandem,
            CircuitConstructionKitCommonConstants.HIGH_RESISTANCE, viewTypeProperty,
            circuit.lightBulbGroupTandem.createNextTandem(), {
              highResistance: true,
              editableRange: CircuitConstructionKitCommonConstants.HIGH_RESISTANCE_RANGE,
              editorDelta: CircuitConstructionKitCommonConstants.HIGH_EDITOR_DELTA
            } );
        } );

      var highResistanceResistorToolNode = createCircuitElementToolNode(
        resistorString,
        options.numberOfHighResistanceResistors,
        new ResistorNode( null, null,
          new Resistor(
            new Vertex( Vector2.ZERO ),
            new Vertex( new Vector2( CircuitConstructionKitCommonConstants.RESISTOR_LENGTH, 0 ) ),
            tandem.createTandem( 'highResistanceResistor' ), {
              resistorType: 'highResistanceResistor', resistance: 1000
            } ),
          viewTypeProperty,
          tandem.createTandem( 'highResistanceResistorIcon' ), {
            icon: true
          } ),
        function( circuitElement ) {
          return circuitElement instanceof Resistor && circuitElement.resistorType === 'highResistanceResistor';
        },
        function( position ) {
          var vertexPair = createVertexPair( position, RESISTOR_LENGTH );
          return new Resistor(
            vertexPair.startVertex,
            vertexPair.endVertex,
            circuit.resistorGroupTandem.createNextTandem(), {
              resistorType: 'highResistanceResistor',
              resistance: CircuitConstructionKitCommonConstants.HIGH_RESISTANCE,
              editableRange: CircuitConstructionKitCommonConstants.HIGH_RESISTANCE_RANGE,
              editorDelta: CircuitConstructionKitCommonConstants.HIGH_EDITOR_DELTA
            } );
        } );
    }

    // Tool nodes that appear on every screen. Pagination for the carousel, each page should begin with wire node
    var circuitElementToolNodes = [
      wireToolNode,
      rightBatteryToolNode,
      lightBulbToolNode,
      resistorToolNode,
      switchToolNode
    ];

    if ( options.numberOfCoins && !options.numberOfHighVoltageBatteries ) {
      circuitElementToolNodes = circuitElementToolNodes.concat( [

        new Node( { children: [ wireToolNode ] } ), // Wire should appear at the top of each carousel page
        dollarBillNode,
        paperClipNode,
        coinToolNode,
        eraserToolNode,

        new Node( { children: [ wireToolNode ] } ),// Wire should appear at the top of each carousel page
        pencilToolNode,
        handToolNode,
        dogToolNode
      ] );
    }
    else if ( options.numberOfCoins && options.numberOfHighVoltageBatteries ) {
      circuitElementToolNodes = circuitElementToolNodes.concat( [
        new Node( { children: [ wireToolNode ] } ),// Wire should appear at the top of each carousel page
        highVoltageBatteryToolNode,
        highResistanceBulbToolNode,
        highResistanceResistorToolNode,
        dollarBillNode,

        new Node( { children: [ wireToolNode ] } ),// Wire should appear at the top of each carousel page
        paperClipNode,
        coinToolNode,
        eraserToolNode,
        pencilToolNode,

        new Node( { children: [ wireToolNode ] } ),// Wire should appear at the top of each carousel page
        handToolNode,
        dogToolNode
      ] );
    }

    var ITEMS_PER_PAGE = 5;
    var SPACING = 5;

    // Carousel was optimized for items of equal size.  To get equal spacing between objects, we create our own pages
    // see https://github.com/phetsims/circuit-construction-kit-dc/issues/91
    var pages = _.chunk( circuitElementToolNodes, ITEMS_PER_PAGE ).map( function( elements ) {
      return new VBox( {
        children: elements,
        resize: true
      } );
    } );

    // The schematic and lifelike icons have different dimensions, so update the spacing when the view type changes
    viewTypeProperty.link( function() {

      // Track the spacings so that any non-filled pages can take the average spacing of the other pages
      var spacings = [];
      pages.forEach( function( page ) {

        // Zero out the spacing so we can compute the height without any spacing
        page.setSpacing( 0 );

        // Set the spacing so that items will fill the available area
        var spacing = (CAROUSEL_PAGE_HEIGHT - page.height) / (page.children.length - 1);
        page.setSpacing( spacing );

        // Track the spacings of filled pages so that the average can be used for non-filled pages
        if ( page.children.length === ITEMS_PER_PAGE ) {
          spacings.push( spacing );
        }
      } );
      // REVIEW*: _.sum
      var averageSpacing = _.reduce( spacings, function( sum, n ) {return sum + n;}, 0 ) / spacings.length;

      pages.forEach( function( page ) {
        if ( page.children.length !== ITEMS_PER_PAGE ) {
          page.setSpacing( averageSpacing );
        }
      } );
    } );

    // Make sure that non-filled pages have the same top
    var alignGroup = new AlignGroup();
    var alignedPages = pages.map( function( page ) {return alignGroup.createBox( page, { yAlign: 'top' } );} );

    // create the carousel
    this.carousel = new Carousel( alignedPages, {
      orientation: 'vertical',
      itemsPerPage: 1,
      spacing: CAROUSEL_ITEM_SPACING, // Determines the vertical margins
      margin: 15,

      // Expand the touch area above the up button and below the down button
      buttonTouchAreaYDilation: 8,
      tandem: tandem.createTandem( 'carousel' )
    } );

    var pageControl = new PageControl( this.carousel.numberOfPages, this.carousel.pageNumberProperty, {
      orientation: 'vertical',
      pageFill: 'white',
      pageStroke: 'black',
      interactive: true,
      dotTouchAreaDilation: 4,
      dotMouseAreaDilation: 4
    } );

    HBox.call( this, {
      spacing: SPACING,
      children: [ pageControl, this.carousel ]
    } );
  }

  circuitConstructionKitCommon.register( 'CircuitElementToolbox', CircuitElementToolbox );

  return inherit( HBox, CircuitElementToolbox, {

    /**
     * Resets the toolbox.
     * @override
     * @public
     */
    reset: function() {
      this.carousel && this.carousel.reset( { animationEnabled: false } );
    }
  } );
} );