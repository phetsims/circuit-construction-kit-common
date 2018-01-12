// Copyright 2016-2017, University of Colorado Boulder

/**
 * This control panel shows checkboxes for "Show Electrons", etc.  Exists for the life of the sim and hence does not
 * require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var AlignBox = require( 'SCENERY/nodes/AlignBox' );
  var AlignGroup = require( 'SCENERY/nodes/AlignGroup' );
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var Checkbox = require( 'SUN/Checkbox' );
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  var CCKCPanel = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/CCKCPanel' );
  var ConventionalCurrentArrowNode = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/view/ConventionalCurrentArrowNode' );
  var CurrentType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CurrentType' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );

  // strings
  var conventionalString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/conventional' );
  var ElectronChargeNode = require( 'SCENERY_PHET/ElectronChargeNode' );
  var electronsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/electrons' );
  var labelsString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/labels' );
  var showCurrentString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/showCurrent' );
  var valuesString = require( 'string!CIRCUIT_CONSTRUCTION_KIT_COMMON/values' );

  // constants
  var TEXT_OPTIONS = {
    fontSize: CCKCConstants.FONT_SIZE,
    maxWidth: 120
  };
  var BOX_ALIGNMENT = { xAlign: 'left' };
  var SPACING = 10;
  var LEFT_MARGIN = 30;

  /**
   * @param {AlignGroup} alignGroup - box for aligning with other controls
   * @param {Property.<boolean>} showCurrentProperty - true if current should be shown
   * @param {Property.<boolean>} currentTypeProperty - true if current should be shown as electrons or conventional
   * @param {Property.<boolean>} showValuesProperty - true if values should be shown
   * @param {Property.<boolean>} showLabelsProperty - true if toolbox labels should be shown
   * @param {Tandem} tandem
   * @constructor
   */
  function DisplayOptionsPanel( alignGroup, showCurrentProperty, currentTypeProperty, showValuesProperty,
                                showLabelsProperty, tandem ) {

    /**
     * Create an AquaRadioButton for the specified kind of current
     * @param {CurrentType} currentType
     * @param {Node} node - the Node to display in the button
     * @param {Tandem} tandem
     * @returns {AquaRadioButton}
     */
    var createRadioButton = function( currentType, node, tandem ) {
      return new AquaRadioButton( currentTypeProperty, currentType, node, {
        radius: 7,
        tandem: tandem
      } );
    };

    var textIconSpacing = 11;

    // Align the Electrons/Conventional text and radio buttons
    var currentTypeRadioButtonLabelGroup = new AlignGroup();
    var electronsBox = new HBox( {
      children: [
        currentTypeRadioButtonLabelGroup.createBox( new Text( electronsString, TEXT_OPTIONS ), BOX_ALIGNMENT ),

        // Match the size to the play area electrons, see https://github.com/phetsims/circuit-construction-kit-dc/issues/154
        new ElectronChargeNode( { scale: 0.75 } )
      ],
      spacing: textIconSpacing
    } );
    var conventionalBox = new HBox( {
      children: [
        currentTypeRadioButtonLabelGroup.createBox( new Text( conventionalString, TEXT_OPTIONS ), BOX_ALIGNMENT ),
        new ConventionalCurrentArrowNode( tandem.createTandem( 'arrowNode' ) )
      ],
      spacing: textIconSpacing
    } );

    var electronsRadioButton = createRadioButton( CurrentType.ELECTRONS, electronsBox, tandem.createTandem( 'electronsRadioButton' ) );
    var conventionalRadioButton = createRadioButton( CurrentType.CONVENTIONAL, conventionalBox, tandem.createTandem( 'conventionalRadioButton' ) );

    // Gray out current view options when current is not selected.
    showCurrentProperty.linkAttribute( electronsRadioButton, 'enabled' );
    showCurrentProperty.linkAttribute( conventionalRadioButton, 'enabled' );

    var BOX_WIDTH = 16;
    var showLabelsCheckbox = new Checkbox( new Text( labelsString, TEXT_OPTIONS ), showLabelsProperty, {
      tandem: tandem.createTandem( 'labelsCheckbox' ),
      boxWidth: BOX_WIDTH,
    } );
    var showValuesCheckbox = new Checkbox( new Text( valuesString, TEXT_OPTIONS ), showValuesProperty, {
      tandem: tandem.createTandem( 'valuesCheckbox' ),
      boxWidth: BOX_WIDTH
    } );
    var children = [

      // Show Current and sub-checkboxes
      new VBox( {
        align: 'left',
        spacing: 8,
        children: [
          new Checkbox( new Text( showCurrentString, TEXT_OPTIONS ), showCurrentProperty, {
            boxWidth: BOX_WIDTH,
            tandem: tandem.createTandem( 'showCurrentCheckbox' )
          } ),
          new AlignBox(
            new VBox( {
              align: 'left',
              spacing: 6,
              children: [
                electronsRadioButton,
                conventionalRadioButton
              ]
            } ), {
              leftMargin: LEFT_MARGIN
            }
          )
        ]
      } ),
      showLabelsCheckbox,
      showValuesCheckbox
    ];

    CCKCPanel.call( this, alignGroup.createBox( new VBox( {
      children: children,
      spacing: SPACING,
      align: 'left'
    } ), {

      // left align within the box
      xAlign: 'left'
    } ), tandem, {
      yMargin: 10
    } );

    // Touch & Mouse area extends to the right across the control panel
    showLabelsCheckbox.touchArea = showLabelsCheckbox.localBounds.dilatedXY( 5, SPACING / 2 ).withMaxX( this.bounds.width - LEFT_MARGIN );
    showLabelsCheckbox.mouseArea = showLabelsCheckbox.touchArea;

    showValuesCheckbox.touchArea = showValuesCheckbox.localBounds.dilatedXY( 5, SPACING / 2 ).withMaxX( this.bounds.width - LEFT_MARGIN );
    showValuesCheckbox.mouseArea = showValuesCheckbox.touchArea;
  }

  circuitConstructionKitCommon.register( 'DisplayOptionsPanel', DisplayOptionsPanel );

  return inherit( CCKCPanel, DisplayOptionsPanel );
} );