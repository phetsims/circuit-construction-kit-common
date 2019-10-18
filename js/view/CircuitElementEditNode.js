// Copyright 2016-2019, University of Colorado Boulder

/**
 * Shows controls for a single CircuitElement at the bottom of the screen and contained in a CircuitElementEditContainerNode.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Battery = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Battery' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const Fuse = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Fuse' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const merge = require( 'PHET_CORE/merge' );
  const NumberControl = require( 'SCENERY_PHET/NumberControl' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const ResetFuseButton = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ResetFuseButton' );
  const RotateBatteryButton = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/RotateBatteryButton' );
  const Tandem = require( 'TANDEM/Tandem' );
  const TrashButton = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/TrashButton' );

  // constants
  const FONT = new PhetFont( CCKCConstants.FONT_SIZE );
  const NUMBER_CONTROL_ELEMENT_MAX_WIDTH = 140;

  class CircuitElementEditNode extends HBox {

    /**
     * @param {string} title - text to show as a title
     * @param {string} valuePattern - pattern for NumberControl to display the value as text
     * @param {Property.<number>} valueProperty - property this control changes
     * @param {Circuit} circuit - parent circuit
     * @param {FixedCircuitElement} circuitElement - the CircuitElement controlled by this UI
     * @param {Tandem} tandem
     * @param {Object} options
     */
    constructor( title, valuePattern, valueProperty, circuit, circuitElement, tandem, options ) {

      options = merge( {
        showTrashCan: true,

        // TODO: A better way of doing this, see note in ACVoltage
        // Takes precedence over value specified in the CircuitElement
        delta: null,

        // TODO: A better way of doing this, see note in ACVoltage
        // Takes precedence over value specified in the CircuitElement
        editableRange: null
      }, options );

      // When the user changes any parameter of any circuit element, signify it.
      const valuePropertyListener = () => circuit.componentEditedEmitter.emit();

      valueProperty.lazyLink( valuePropertyListener );

      // Create the controls
      const numberControl = new NumberControl( title, valueProperty, options.editableRange || circuitElement.editableRange, {

        delta: options.delta || circuitElement.editorDelta,

        // subcomponent options
        titleNodeOptions: {
          maxWidth: NUMBER_CONTROL_ELEMENT_MAX_WIDTH,
          font: FONT
        },
        numberDisplayOptions: {
          maxWidth: NUMBER_CONTROL_ELEMENT_MAX_WIDTH,
          valuePattern: valuePattern,
          font: FONT,
          decimalPlaces: circuitElement.numberOfDecimalPlaces
        },

        // Prevent overlap with the navigation bar
        sliderOptions: {
          thumbTouchAreaYDilation: 5
        },

        // Trick the NumberControl into thinking it and its children do not need to be instrumented
        // This prevents it from ending up in the state.  Luckily somehow, it still works properly
        // in the state wrapper, probably from this code being called anyways from when the circuit element
        // is selected.
        tandem: Tandem.optional
      } );

      const children = [];

      // Batteries can be reversed
      if ( circuitElement instanceof Battery ) {

        // TODO: Rename type to reverse
        children.push( new RotateBatteryButton( circuit, circuitElement, tandem.createTandem( 'reverseBatteryButton' ) ) );
      }
      if ( circuitElement instanceof Fuse ) {
        children.push( new ResetFuseButton( circuitElement, tandem.createTandem( 'resetFuseButton' ) ) );
      }
      children.push( numberControl );

      // The button that deletes the circuit component
      if ( circuitElement.canBeDroppedInToolbox && options.showTrashCan ) {
        children.push( new TrashButton( circuit, circuitElement, tandem.createTandem( 'trashButton' ), {
          phetioState: false
        } ) );
      }

      super( {
        spacing: 40,
        children: children,
        align: 'bottom'
      } );

      // @private {function} - for disposal
      this.disposeCircuitElementEditNode = () => {
        numberControl.dispose();
        valueProperty.unlink( valuePropertyListener );
      };
    }

    /**
     * Dispose resources when no longer used.
     * @public
     * @override
     */
    dispose() {
      super.dispose();
      this.disposeCircuitElementEditNode();
    }
  }

  return circuitConstructionKitCommon.register( 'CircuitElementEditNode', CircuitElementEditNode );
} );