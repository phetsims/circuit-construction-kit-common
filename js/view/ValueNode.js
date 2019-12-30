// Copyright 2017-2019, University of Colorado Boulder

/**
 * When enabled, shows the readout above circuit elements, such as "9.0 V" for a 9 volt battery.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const ACVoltage = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/ACVoltage' );
  const Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  const Capacitor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Capacitor' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Color = require( 'SCENERY/util/Color' );
  const Emitter = require( 'AXON/Emitter' );
  const Fuse = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Fuse' );
  const Inductor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Inductor' );
  const LightBulb = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/LightBulb' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const merge = require( 'PHET_CORE/merge' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const Resistor = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Resistor' );
  const RichText = require( 'SCENERY/nodes/RichText' );
  const StringUtils = require( 'PHETCOMMON/util/StringUtils' );
  const Switch = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Switch' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Utils = require( 'DOT/Utils' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const Vector2 = require( 'DOT/Vector2' );

  // strings
  const capacitanceFaradsSymbolString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/capacitanceFaradsSymbol' );
  const fuseValueString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/fuseValue' );
  const inductanceHenriesSymbolString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/inductanceHenriesSymbol' );
  const resistanceOhmsSymbolString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/resistanceOhmsSymbol' );
  const voltageUnitsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/voltageUnits' );

  // constants
  const VERTICAL_OFFSET = 24;

  // Big enough to see when zoomed out
  const FONT = new PhetFont( { size: 22 } );

  /**
   * For convenience, creates a Text node with empty content and the specified tandem.
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  const createText = ( tandem, options ) => new Text( '', merge( { tandem: tandem, font: FONT }, options ) );

  /**
   * For convenience, creates a RichText node with empty content and the specified tandem.
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  const createRichText = ( tandem, options ) => new RichText( '', merge( { tandem: tandem, font: FONT }, options ) );

  const infinitySpan = '<span style="font-size: 26px; font-family: serif;"><b>∞</b></span>';

  class ValueNode extends Panel {

    /**
     * @param {CircuitElement} circuitElement
     * @param {Property.<boolean>} showValuesProperty
     * @param {Property.<CircuitElementViewType>} viewTypeProperty
     * @param {Tandem} tandem
     */
    constructor( circuitElement, showValuesProperty, viewTypeProperty, tandem ) {
      const disposeEmitterValueNode = new Emitter();

      let contentNode = null;
      let updatePosition = null;
      if ( circuitElement instanceof Battery || circuitElement instanceof ACVoltage ) {

        const voltageText = createText( tandem.createTandem( 'voltageText' ) );
        const voltageListener = voltage => {

          voltageText.text = StringUtils.fillIn( voltageUnitsString, {
            voltage: Utils.toFixed( voltage, circuitElement.numberOfDecimalPlaces )
          } );
          updatePosition && updatePosition();
        };
        circuitElement.voltageProperty.link( voltageListener );

        // Battery readouts shows voltage and internal resistance if it is nonzero
        contentNode = new VBox( {
          align: 'right',
          children: [ voltageText ]
        } );

        const resistanceNode = createText( tandem.createTandem( 'resistanceText' ) );
        const internalResistanceListener = ( internalResistance, lastInternalResistance ) => {
          resistanceNode.text = StringUtils.fillIn( resistanceOhmsSymbolString, {
            resistance: Utils.toFixed( internalResistance, 1 )
          } );

          // If the children should change, update them here
          if ( lastInternalResistance === null || ( internalResistance === 0 || lastInternalResistance === 0 ) ) {
            const desiredChildren = internalResistance > 0 ? [ voltageText, resistanceNode ] : [ voltageText ];

            // Only set children if changed
            if ( contentNode.getChildrenCount() !== desiredChildren.length ) {
              contentNode.children = desiredChildren;
            }
          }
          updatePosition && updatePosition();
        };
        circuitElement.internalResistanceProperty.link( internalResistanceListener );

        disposeEmitterValueNode.addListener( () => {
          circuitElement.voltageProperty.unlink( voltageListener );
          circuitElement.internalResistanceProperty.unlink( internalResistanceListener );
        } );
        contentNode.maxWidth = 100;
      }

      else if ( circuitElement instanceof Resistor ||
                circuitElement instanceof LightBulb ) {
        contentNode = createText( tandem.createTandem( 'resistanceText' ) );

        // Items like the hand and dog and high resistance resistor shouldn't show ".0"
        const linkResistance = resistance => {
          contentNode.text = StringUtils.fillIn( resistanceOhmsSymbolString, {
            resistance: Utils.toFixed( resistance, circuitElement.numberOfDecimalPlaces )
          } );
          updatePosition && updatePosition();
        };
        circuitElement.resistanceProperty.link( linkResistance );
        disposeEmitterValueNode.addListener( () => circuitElement.resistanceProperty.unlink( linkResistance ) );
        contentNode.maxWidth = 100;
      }
      else if ( circuitElement instanceof Capacitor ) {
        contentNode = createText( tandem.createTandem( 'capacitorText' ) );

        // Items like the hand and dog and high resistance resistor shouldn't show ".0"
        const linkCapacitance = capacitance => {

          contentNode.text = StringUtils.fillIn( capacitanceFaradsSymbolString, {
            resistance: Utils.toFixed( capacitance, circuitElement.numberOfDecimalPlaces )
          } );
          updatePosition && updatePosition();
        };
        circuitElement.capacitanceProperty.link( linkCapacitance );
        disposeEmitterValueNode.addListener( () => circuitElement.capacitanceProperty.unlink( linkCapacitance ) );
        contentNode.maxWidth = 100;
      }
      else if ( circuitElement instanceof Inductor ) {
        contentNode = createText( tandem.createTandem( 'inductorText' ) );

        // Items like the hand and dog and high resistance resistor shouldn't show ".0"
        const linkInductance = inductance => {
          contentNode.text = StringUtils.fillIn( inductanceHenriesSymbolString, {
            resistance: Utils.toFixed( inductance, circuitElement.numberOfDecimalPlaces )
          } );
          updatePosition && updatePosition();
        };
        circuitElement.inductanceProperty.link( linkInductance );
        disposeEmitterValueNode.addListener( () => circuitElement.inductanceProperty.unlink( linkInductance ) );
        contentNode.maxWidth = 100;
      }
      else if ( circuitElement instanceof Switch ) {

        // Make it easier to read the infinity symbol, see https://github.com/phetsims/circuit-construction-kit-dc/issues/135
        contentNode = createRichText( tandem.createTandem( 'switchText' ) );

        const updateResistance = resistance => {
          contentNode.text = StringUtils.fillIn( resistanceOhmsSymbolString, {

            // Using a serif font makes the infinity symbol look less lopsided
            resistance: resistance > 100000 ? infinitySpan : '0'
          } );

          // Account for the switch open and close geometry for positioning the label.  When the switch is open
          // the label must be higher
          updatePosition && updatePosition();
        };
        circuitElement.resistanceProperty.link( updateResistance );
        disposeEmitterValueNode.addListener( () => circuitElement.resistanceProperty.unlink( updateResistance ) );
        contentNode.maxWidth = 100;
      }
      else if ( circuitElement instanceof Fuse ) {
        contentNode = createRichText( tandem.createTandem( 'fuseText' ), {
          align: 'right'
        } );
        const multilink = Property.multilink( [ circuitElement.resistanceProperty, circuitElement.currentRatingProperty ],
          ( resistance, currentRating ) => {
            const milliOhmString = resistance === CCKCConstants.MAX_RESISTANCE ? infinitySpan :
                                   Utils.toFixed( resistance * 1000, circuitElement.numberOfDecimalPlaces );
            contentNode.text = StringUtils.fillIn( fuseValueString, {

              // Convert to milli
              resistance: milliOhmString,
              currentRating: Utils.toFixed( currentRating, circuitElement.numberOfDecimalPlaces )
            } );
            updatePosition && updatePosition();
          }
        );
        disposeEmitterValueNode.addListener( () => multilink.dispose() );
        contentNode.maxWidth = 100;
      }
      else {
        throw new Error( 'ValueNode cannot be shown for ' + circuitElement.constructor.name );
      }

      assert && assert( contentNode, 'Content node should be defined' );

      super( contentNode, {
        stroke: null,
        fill: new Color( 255, 255, 255, 0.6 ),// put transparency in the color so that the children aren't transparent
        tandem: tandem,
        cornerRadius: 3,
        xMargin: 3,
        yMargin: 1
      } );

      const matrix = Matrix3.identity();

      updatePosition = () => {

        // Only update position when the value is displayed
        if ( showValuesProperty.get() ) {

          // For a light bulb, choose the part of the filament in the top center for the label, see
          // https://github.com/phetsims/circuit-construction-kit-common/issues/325
          const distance = circuitElement instanceof LightBulb ? 0.56 : 0.5;

          // The label partially overlaps the component to make it clear which label goes with which component
          circuitElement.updateMatrixForPoint( circuitElement.chargePathLength * distance, matrix );
          const delta = Vector2.createPolar( VERTICAL_OFFSET, matrix.rotation + 3 * Math.PI / 2 );
          this.center = matrix.translation.plus( delta ); // above light bulb
        }
      };

      circuitElement.vertexMovedEmitter.addListener( updatePosition );
      updatePosition();
      showValuesProperty.link( updatePosition );
      viewTypeProperty.link( updatePosition );

      // @private {function}
      this.disposeValueNode = () => {
        circuitElement.vertexMovedEmitter.removeListener( updatePosition );
        showValuesProperty.unlink( updatePosition );
        viewTypeProperty.unlink( updatePosition );
        disposeEmitterValueNode.emit();
      };
    }

    /**
     * @public - dispose when no longer used
     * @override
     */
    dispose() {
      super.dispose();
      this.disposeValueNode();
    }
  }

  return circuitConstructionKitCommon.register( 'ValueNode', ValueNode );
} );