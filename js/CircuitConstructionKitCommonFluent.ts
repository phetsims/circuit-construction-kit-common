// Copyright 2025, University of Colorado Boulder
// AUTOMATICALLY GENERATED – DO NOT EDIT.
// Generated from circuit-construction-kit-common-strings_en.yaml

/* eslint-disable */
/* @formatter:off */

import { TReadOnlyProperty } from '../../axon/js/TReadOnlyProperty.js';
import type { FluentVariable } from '../../chipper/js/browser/FluentPattern.js';
import FluentPattern from '../../chipper/js/browser/FluentPattern.js';
import FluentConstant from '../../chipper/js/browser/FluentConstant.js';
import FluentContainer from '../../chipper/js/browser/FluentContainer.js';
import circuitConstructionKitCommon from './circuitConstructionKitCommon.js';
import CircuitConstructionKitCommonStrings from './CircuitConstructionKitCommonStrings.js';

// This map is used to create the fluent file and link to all StringProperties.
// Accessing StringProperties is also critical for including them in the built sim.
// However, if strings are unused in Fluent system too, they will be fully excluded from
// the build. So we need to only add actually used strings.
const fluentKeyToStringPropertyMap = new Map();

const addToMapIfDefined = ( key: string, path: string ) => {
  const sp = _.get( CircuitConstructionKitCommonStrings, path );
  if ( sp ) {
    fluentKeyToStringPropertyMap.set( key, sp );
  }
};

addToMapIfDefined( 'circuit_construction_kit_common_title', 'circuit-construction-kit-common.titleStringProperty' );
addToMapIfDefined( 'schematicStandard', 'schematicStandardStringProperty' );
addToMapIfDefined( 'realBulb', 'realBulbStringProperty' );
addToMapIfDefined( 'ieee', 'ieeeStringProperty' );
addToMapIfDefined( 'iec', 'iecStringProperty' );
addToMapIfDefined( 'british', 'britishStringProperty' );
addToMapIfDefined( 'acSource', 'acSourceStringProperty' );
addToMapIfDefined( 'advanced', 'advancedStringProperty' );
addToMapIfDefined( 'resistor', 'resistorStringProperty' );
addToMapIfDefined( 'capacitor', 'capacitorStringProperty' );
addToMapIfDefined( 'inductor', 'inductorStringProperty' );
addToMapIfDefined( 'stopwatch', 'stopwatchStringProperty' );
addToMapIfDefined( 'fuse', 'fuseStringProperty' );
addToMapIfDefined( 'time', 'timeStringProperty' );
addToMapIfDefined( 'oneSecond', 'oneSecondStringProperty' );
addToMapIfDefined( 'capacitance', 'capacitanceStringProperty' );
addToMapIfDefined( 'inductance', 'inductanceStringProperty' );
addToMapIfDefined( 'currentRating', 'currentRatingStringProperty' );
addToMapIfDefined( 'tiny', 'tinyStringProperty' );
addToMapIfDefined( 'lots', 'lotsStringProperty' );
addToMapIfDefined( 'phaseShift', 'phaseShiftStringProperty' );
addToMapIfDefined( 'coin', 'coinStringProperty' );
addToMapIfDefined( 'dollarBill', 'dollarBillStringProperty' );
addToMapIfDefined( 'eraser', 'eraserStringProperty' );
addToMapIfDefined( 'pencil', 'pencilStringProperty' );
addToMapIfDefined( 'hand', 'handStringProperty' );
addToMapIfDefined( 'dog', 'dogStringProperty' );
addToMapIfDefined( 'paperClip', 'paperClipStringProperty' );
addToMapIfDefined( 'wireResistivity', 'wireResistivityStringProperty' );
addToMapIfDefined( 'batteryResistance', 'batteryResistanceStringProperty' );
addToMapIfDefined( 'sourceResistance', 'sourceResistanceStringProperty' );
addToMapIfDefined( 'battery', 'batteryStringProperty' );
addToMapIfDefined( 'lightBulb', 'lightBulbStringProperty' );
addToMapIfDefined( 'addRealBulbs', 'addRealBulbsStringProperty' );
addToMapIfDefined( 'switch', 'switchStringProperty' );
addToMapIfDefined( 'wire', 'wireStringProperty' );
addToMapIfDefined( 'electrons', 'electronsStringProperty' );
addToMapIfDefined( 'conventional', 'conventionalStringProperty' );
addToMapIfDefined( 'tapCircuitElementToEdit', 'tapCircuitElementToEditStringProperty' );
addToMapIfDefined( 'current', 'currentStringProperty' );
addToMapIfDefined( 'showCurrent', 'showCurrentStringProperty' );
addToMapIfDefined( 'resistance', 'resistanceStringProperty' );
addToMapIfDefined( 'voltage', 'voltageStringProperty' );
addToMapIfDefined( 'voltageWithUnits', 'voltageWithUnitsStringProperty' );
addToMapIfDefined( 'voltageChart', 'voltageChartStringProperty' );
addToMapIfDefined( 'currentWithUnits', 'currentWithUnitsStringProperty' );
addToMapIfDefined( 'currentChart', 'currentChartStringProperty' );
addToMapIfDefined( 'frequency', 'frequencyStringProperty' );
addToMapIfDefined( 'voltmeter', 'voltmeterStringProperty' );
addToMapIfDefined( 'ammeter', 'ammeterStringProperty' );
addToMapIfDefined( 'ammeters', 'ammetersStringProperty' );
addToMapIfDefined( 'labels', 'labelsStringProperty' );
addToMapIfDefined( 'values', 'valuesStringProperty' );
addToMapIfDefined( 'ohms', 'ohmsStringProperty' );
addToMapIfDefined( 'theSwitchIsClosed', 'theSwitchIsClosedStringProperty' );
addToMapIfDefined( 'theSwitchIsOpen', 'theSwitchIsOpenStringProperty' );
addToMapIfDefined( 'ammeterReadout', 'ammeterReadoutStringProperty' );
addToMapIfDefined( 'magnitude', 'magnitudeStringProperty' );
addToMapIfDefined( 'signed', 'signedStringProperty' );
addToMapIfDefined( 'dataOutOfRange', 'dataOutOfRangeStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_playArea', 'a11y.screenSummary.playAreaStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_controlArea', 'a11y.screenSummary.controlAreaStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_currentDetails', 'a11y.screenSummary.currentDetailsStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_interactionHint', 'a11y.screenSummary.interactionHintStringProperty' );
addToMapIfDefined( 'a11y_constructionArea_accessibleHeading', 'a11y.constructionArea.accessibleHeadingStringProperty' );
addToMapIfDefined( 'a11y_vertexInteraction_noNewAttachment', 'a11y.vertexInteraction.noNewAttachmentStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_vertexDefaultLabel', 'a11y.circuitContextResponses.vertexDefaultLabelStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_connectedElements', 'a11y.circuitContextResponses.connectedElementsStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_vertexSplit', 'a11y.circuitContextResponses.vertexSplitStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_currentChangedSingle', 'a11y.circuitContextResponses.currentChangedSingleStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_currentMultiple', 'a11y.circuitContextResponses.currentMultipleStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_currentStopped', 'a11y.circuitContextResponses.currentStoppedStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_elementRemoved', 'a11y.circuitContextResponses.elementRemovedStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_lightBulbState', 'a11y.circuitContextResponses.lightBulbStateStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_componentValueChange', 'a11y.circuitContextResponses.componentValueChangeStringProperty' );
addToMapIfDefined( 'a11y_sensorToolbox_accessibleHeading', 'a11y.sensorToolbox.accessibleHeadingStringProperty' );
addToMapIfDefined( 'a11y_circuitElementToolbox_accessibleHeading', 'a11y.circuitElementToolbox.accessibleHeadingStringProperty' );
addToMapIfDefined( 'a11y_circuitElementToolbox_accessibleHelpText', 'a11y.circuitElementToolbox.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_advancedAccordionBox_accessibleName', 'a11y.advancedAccordionBox.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_advancedAccordionBox_addRealBulbsCheckbox_accessibleContextResponseChecked', 'a11y.advancedAccordionBox.addRealBulbsCheckbox.accessibleContextResponseCheckedStringProperty' );
addToMapIfDefined( 'a11y_advancedAccordionBox_addRealBulbsCheckbox_accessibleContextResponseUnchecked', 'a11y.advancedAccordionBox.addRealBulbsCheckbox.accessibleContextResponseUncheckedStringProperty' );
addToMapIfDefined( 'a11y_displayOptionsPanel_accessibleHeading', 'a11y.displayOptionsPanel.accessibleHeadingStringProperty' );
addToMapIfDefined( 'a11y_displayOptionsPanel_showCurrentCheckbox_accessibleContextResponseChecked', 'a11y.displayOptionsPanel.showCurrentCheckbox.accessibleContextResponseCheckedStringProperty' );
addToMapIfDefined( 'a11y_displayOptionsPanel_showCurrentCheckbox_accessibleContextResponseUnchecked', 'a11y.displayOptionsPanel.showCurrentCheckbox.accessibleContextResponseUncheckedStringProperty' );
addToMapIfDefined( 'a11y_displayOptionsPanel_currentTypeRadioButtonGroup_electronsRadioButton_accessibleContextResponse', 'a11y.displayOptionsPanel.currentTypeRadioButtonGroup.electronsRadioButton.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_displayOptionsPanel_currentTypeRadioButtonGroup_conventionalRadioButton_accessibleContextResponse', 'a11y.displayOptionsPanel.currentTypeRadioButtonGroup.conventionalRadioButton.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_displayOptionsPanel_labelsCheckbox_accessibleContextResponseChecked', 'a11y.displayOptionsPanel.labelsCheckbox.accessibleContextResponseCheckedStringProperty' );
addToMapIfDefined( 'a11y_displayOptionsPanel_labelsCheckbox_accessibleContextResponseUnchecked', 'a11y.displayOptionsPanel.labelsCheckbox.accessibleContextResponseUncheckedStringProperty' );
addToMapIfDefined( 'a11y_displayOptionsPanel_valuesCheckbox_accessibleContextResponseChecked', 'a11y.displayOptionsPanel.valuesCheckbox.accessibleContextResponseCheckedStringProperty' );
addToMapIfDefined( 'a11y_displayOptionsPanel_valuesCheckbox_accessibleContextResponseUnchecked', 'a11y.displayOptionsPanel.valuesCheckbox.accessibleContextResponseUncheckedStringProperty' );
addToMapIfDefined( 'a11y_viewRadioButtonGroup_accessibleHeading', 'a11y.viewRadioButtonGroup.accessibleHeadingStringProperty' );
addToMapIfDefined( 'a11y_viewRadioButtonGroup_accessibleName', 'a11y.viewRadioButtonGroup.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_viewRadioButtonGroup_accessibleHelpText', 'a11y.viewRadioButtonGroup.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_viewRadioButtonGroup_lifelikeRadioButton_accessibleName', 'a11y.viewRadioButtonGroup.lifelikeRadioButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_viewRadioButtonGroup_lifelikeRadioButton_accessibleHelpText', 'a11y.viewRadioButtonGroup.lifelikeRadioButton.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_viewRadioButtonGroup_lifelikeRadioButton_accessibleContextResponse', 'a11y.viewRadioButtonGroup.lifelikeRadioButton.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_viewRadioButtonGroup_schematicRadioButton_accessibleName', 'a11y.viewRadioButtonGroup.schematicRadioButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_viewRadioButtonGroup_schematicRadioButton_accessibleHelpText', 'a11y.viewRadioButtonGroup.schematicRadioButton.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_viewRadioButtonGroup_schematicRadioButton_accessibleContextResponse', 'a11y.viewRadioButtonGroup.schematicRadioButton.accessibleContextResponseStringProperty' );
addToMapIfDefined( 'a11y_circuitElementToolNode_accessibleHelpText', 'a11y.circuitElementToolNode.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_reverseBatteryButton_accessibleName', 'a11y.reverseBatteryButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_trashButton_accessibleName', 'a11y.trashButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_circuitElement_accessibleName', 'a11y.circuitElement.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_circuitElement_accessibleHelpText', 'a11y.circuitElement.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_keyboardHelpDialog_addElements_heading', 'a11y.keyboardHelpDialog.addElements.headingStringProperty' );
addToMapIfDefined( 'a11y_keyboardHelpDialog_addElements_createElement_label', 'a11y.keyboardHelpDialog.addElements.createElement.labelStringProperty' );
addToMapIfDefined( 'a11y_keyboardHelpDialog_addElements_createElement_labelInnerContent', 'a11y.keyboardHelpDialog.addElements.createElement.labelInnerContentStringProperty' );
addToMapIfDefined( 'a11y_keyboardHelpDialog_connectElements_heading', 'a11y.keyboardHelpDialog.connectElements.headingStringProperty' );
addToMapIfDefined( 'a11y_keyboardHelpDialog_connectElements_grabJunction_label', 'a11y.keyboardHelpDialog.connectElements.grabJunction.labelStringProperty' );
addToMapIfDefined( 'a11y_keyboardHelpDialog_connectElements_grabJunction_labelInnerContent', 'a11y.keyboardHelpDialog.connectElements.grabJunction.labelInnerContentStringProperty' );
addToMapIfDefined( 'a11y_keyboardHelpDialog_connectElements_selectTarget_label', 'a11y.keyboardHelpDialog.connectElements.selectTarget.labelStringProperty' );
addToMapIfDefined( 'a11y_keyboardHelpDialog_connectElements_selectTarget_labelInnerContent', 'a11y.keyboardHelpDialog.connectElements.selectTarget.labelInnerContentStringProperty' );
addToMapIfDefined( 'a11y_keyboardHelpDialog_connectElements_attachJunction_label', 'a11y.keyboardHelpDialog.connectElements.attachJunction.labelStringProperty' );
addToMapIfDefined( 'a11y_keyboardHelpDialog_connectElements_attachJunction_labelInnerContent', 'a11y.keyboardHelpDialog.connectElements.attachJunction.labelInnerContentStringProperty' );

// A function that creates contents for a new Fluent file, which will be needed if any string changes.
const createFluentFile = (): string => {
  let ftl = '';
  for (const [key, stringProperty] of fluentKeyToStringPropertyMap.entries()) {
    ftl += `${key} = ${stringProperty.value.replace('\n','\n ')}\n`;
  }
  return ftl;
};

const fluentSupport = new FluentContainer( createFluentFile, Array.from(fluentKeyToStringPropertyMap.values()) );

const CircuitConstructionKitCommonFluent = {
  "circuit-construction-kit-common": {
    titleStringProperty: _.get( CircuitConstructionKitCommonStrings, 'circuit-construction-kit-common.titleStringProperty' )
  },
  schematicStandardStringProperty: _.get( CircuitConstructionKitCommonStrings, 'schematicStandardStringProperty' ),
  realBulbStringProperty: _.get( CircuitConstructionKitCommonStrings, 'realBulbStringProperty' ),
  ieeeStringProperty: _.get( CircuitConstructionKitCommonStrings, 'ieeeStringProperty' ),
  iecStringProperty: _.get( CircuitConstructionKitCommonStrings, 'iecStringProperty' ),
  britishStringProperty: _.get( CircuitConstructionKitCommonStrings, 'britishStringProperty' ),
  animationSpeedLimitReachedStringProperty: _.get( CircuitConstructionKitCommonStrings, 'animationSpeedLimitReachedStringProperty' ),
  acSourceStringProperty: _.get( CircuitConstructionKitCommonStrings, 'acSourceStringProperty' ),
  advancedStringProperty: _.get( CircuitConstructionKitCommonStrings, 'advancedStringProperty' ),
  resistorStringProperty: _.get( CircuitConstructionKitCommonStrings, 'resistorStringProperty' ),
  capacitorStringProperty: _.get( CircuitConstructionKitCommonStrings, 'capacitorStringProperty' ),
  inductorStringProperty: _.get( CircuitConstructionKitCommonStrings, 'inductorStringProperty' ),
  stopwatchStringProperty: _.get( CircuitConstructionKitCommonStrings, 'stopwatchStringProperty' ),
  fuseStringProperty: _.get( CircuitConstructionKitCommonStrings, 'fuseStringProperty' ),
  timeStringProperty: _.get( CircuitConstructionKitCommonStrings, 'timeStringProperty' ),
  oneSecondStringProperty: _.get( CircuitConstructionKitCommonStrings, 'oneSecondStringProperty' ),
  capacitanceStringProperty: _.get( CircuitConstructionKitCommonStrings, 'capacitanceStringProperty' ),
  inductanceStringProperty: _.get( CircuitConstructionKitCommonStrings, 'inductanceStringProperty' ),
  currentRatingStringProperty: _.get( CircuitConstructionKitCommonStrings, 'currentRatingStringProperty' ),
  tinyStringProperty: _.get( CircuitConstructionKitCommonStrings, 'tinyStringProperty' ),
  lotsStringProperty: _.get( CircuitConstructionKitCommonStrings, 'lotsStringProperty' ),
  phaseShiftStringProperty: _.get( CircuitConstructionKitCommonStrings, 'phaseShiftStringProperty' ),
  coinStringProperty: _.get( CircuitConstructionKitCommonStrings, 'coinStringProperty' ),
  dollarBillStringProperty: _.get( CircuitConstructionKitCommonStrings, 'dollarBillStringProperty' ),
  eraserStringProperty: _.get( CircuitConstructionKitCommonStrings, 'eraserStringProperty' ),
  pencilStringProperty: _.get( CircuitConstructionKitCommonStrings, 'pencilStringProperty' ),
  handStringProperty: _.get( CircuitConstructionKitCommonStrings, 'handStringProperty' ),
  dogStringProperty: _.get( CircuitConstructionKitCommonStrings, 'dogStringProperty' ),
  paperClipStringProperty: _.get( CircuitConstructionKitCommonStrings, 'paperClipStringProperty' ),
  wireResistivityStringProperty: _.get( CircuitConstructionKitCommonStrings, 'wireResistivityStringProperty' ),
  batteryResistanceStringProperty: _.get( CircuitConstructionKitCommonStrings, 'batteryResistanceStringProperty' ),
  sourceResistanceStringProperty: _.get( CircuitConstructionKitCommonStrings, 'sourceResistanceStringProperty' ),
  batteryStringProperty: _.get( CircuitConstructionKitCommonStrings, 'batteryStringProperty' ),
  lightBulbStringProperty: _.get( CircuitConstructionKitCommonStrings, 'lightBulbStringProperty' ),
  addRealBulbsStringProperty: _.get( CircuitConstructionKitCommonStrings, 'addRealBulbsStringProperty' ),
  switchStringProperty: _.get( CircuitConstructionKitCommonStrings, 'switchStringProperty' ),
  wireStringProperty: _.get( CircuitConstructionKitCommonStrings, 'wireStringProperty' ),
  electronsStringProperty: _.get( CircuitConstructionKitCommonStrings, 'electronsStringProperty' ),
  conventionalStringProperty: _.get( CircuitConstructionKitCommonStrings, 'conventionalStringProperty' ),
  tapCircuitElementToEditStringProperty: _.get( CircuitConstructionKitCommonStrings, 'tapCircuitElementToEditStringProperty' ),
  currentStringProperty: _.get( CircuitConstructionKitCommonStrings, 'currentStringProperty' ),
  showCurrentStringProperty: _.get( CircuitConstructionKitCommonStrings, 'showCurrentStringProperty' ),
  resistanceStringProperty: _.get( CircuitConstructionKitCommonStrings, 'resistanceStringProperty' ),
  voltageStringProperty: _.get( CircuitConstructionKitCommonStrings, 'voltageStringProperty' ),
  voltageWithUnitsStringProperty: _.get( CircuitConstructionKitCommonStrings, 'voltageWithUnitsStringProperty' ),
  voltageChartStringProperty: _.get( CircuitConstructionKitCommonStrings, 'voltageChartStringProperty' ),
  currentWithUnitsStringProperty: _.get( CircuitConstructionKitCommonStrings, 'currentWithUnitsStringProperty' ),
  currentChartStringProperty: _.get( CircuitConstructionKitCommonStrings, 'currentChartStringProperty' ),
  frequencyStringProperty: _.get( CircuitConstructionKitCommonStrings, 'frequencyStringProperty' ),
  voltmeterStringProperty: _.get( CircuitConstructionKitCommonStrings, 'voltmeterStringProperty' ),
  ammeterStringProperty: _.get( CircuitConstructionKitCommonStrings, 'ammeterStringProperty' ),
  ammetersStringProperty: _.get( CircuitConstructionKitCommonStrings, 'ammetersStringProperty' ),
  labelsStringProperty: _.get( CircuitConstructionKitCommonStrings, 'labelsStringProperty' ),
  valuesStringProperty: _.get( CircuitConstructionKitCommonStrings, 'valuesStringProperty' ),
  ohmsStringProperty: _.get( CircuitConstructionKitCommonStrings, 'ohmsStringProperty' ),
  voltageUnitsStringProperty: _.get( CircuitConstructionKitCommonStrings, 'voltageUnitsStringProperty' ),
  voltageVoltsValuePatternStringProperty: _.get( CircuitConstructionKitCommonStrings, 'voltageVoltsValuePatternStringProperty' ),
  frequencyHzValuePatternStringProperty: _.get( CircuitConstructionKitCommonStrings, 'frequencyHzValuePatternStringProperty' ),
  currentUnitsStringProperty: _.get( CircuitConstructionKitCommonStrings, 'currentUnitsStringProperty' ),
  capacitanceUnitsStringProperty: _.get( CircuitConstructionKitCommonStrings, 'capacitanceUnitsStringProperty' ),
  inductanceUnitsStringProperty: _.get( CircuitConstructionKitCommonStrings, 'inductanceUnitsStringProperty' ),
  fuseValueStringProperty: _.get( CircuitConstructionKitCommonStrings, 'fuseValueStringProperty' ),
  resistanceOhmsSymbolStringProperty: _.get( CircuitConstructionKitCommonStrings, 'resistanceOhmsSymbolStringProperty' ),
  capacitanceFaradsSymbolStringProperty: _.get( CircuitConstructionKitCommonStrings, 'capacitanceFaradsSymbolStringProperty' ),
  inductanceHenriesSymbolStringProperty: _.get( CircuitConstructionKitCommonStrings, 'inductanceHenriesSymbolStringProperty' ),
  resistanceOhmsValuePatternStringProperty: _.get( CircuitConstructionKitCommonStrings, 'resistanceOhmsValuePatternStringProperty' ),
  theSwitchIsClosedStringProperty: _.get( CircuitConstructionKitCommonStrings, 'theSwitchIsClosedStringProperty' ),
  theSwitchIsOpenStringProperty: _.get( CircuitConstructionKitCommonStrings, 'theSwitchIsOpenStringProperty' ),
  ammeterReadoutStringProperty: _.get( CircuitConstructionKitCommonStrings, 'ammeterReadoutStringProperty' ),
  magnitudeStringProperty: _.get( CircuitConstructionKitCommonStrings, 'magnitudeStringProperty' ),
  signedStringProperty: _.get( CircuitConstructionKitCommonStrings, 'signedStringProperty' ),
  dataOutOfRangeStringProperty: _.get( CircuitConstructionKitCommonStrings, 'dataOutOfRangeStringProperty' ),
  a11y: {
    screenSummary: {
      playAreaStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_playArea', _.get( CircuitConstructionKitCommonStrings, 'a11y.screenSummary.playAreaStringProperty' ) ),
      controlArea: new FluentPattern<{ advancedControls: 'present' | 'absent' | TReadOnlyProperty<'present' | 'absent'> }>( fluentSupport.bundleProperty, 'a11y_screenSummary_controlArea', _.get( CircuitConstructionKitCommonStrings, 'a11y.screenSummary.controlAreaStringProperty' ), [{"name":"advancedControls","variants":["present","absent"]}] ),
      currentDetailsStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_currentDetails', _.get( CircuitConstructionKitCommonStrings, 'a11y.screenSummary.currentDetailsStringProperty' ) ),
      interactionHintStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_interactionHint', _.get( CircuitConstructionKitCommonStrings, 'a11y.screenSummary.interactionHintStringProperty' ) )
    },
    constructionArea: {
      accessibleHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_constructionArea_accessibleHeading', _.get( CircuitConstructionKitCommonStrings, 'a11y.constructionArea.accessibleHeadingStringProperty' ) )
    },
    vertexInteraction: {
      noNewAttachmentStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_vertexInteraction_noNewAttachment', _.get( CircuitConstructionKitCommonStrings, 'a11y.vertexInteraction.noNewAttachmentStringProperty' ) )
    },
    circuitContextResponses: {
      vertexDefaultLabel: new FluentPattern<{ index: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_vertexDefaultLabel', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.vertexDefaultLabelStringProperty' ), [{"name":"index"}] ),
      connectedElements: new FluentPattern<{ elements: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_connectedElements', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.connectedElementsStringProperty' ), [{"name":"elements"}] ),
      vertexSplit: new FluentPattern<{ connectionCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'>, vertexName: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_vertexSplit', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.vertexSplitStringProperty' ), [{"name":"connectionCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]},{"name":"vertexName"}] ),
      currentChangedSingle: new FluentPattern<{ current: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_currentChangedSingle', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.currentChangedSingleStringProperty' ), [{"name":"current"}] ),
      currentMultipleStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_currentMultiple', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.currentMultipleStringProperty' ) ),
      currentStoppedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_currentStopped', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.currentStoppedStringProperty' ) ),
      elementRemoved: new FluentPattern<{ elementName: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_elementRemoved', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.elementRemovedStringProperty' ), [{"name":"elementName"}] ),
      lightBulbState: new FluentPattern<{ elementName: FluentVariable, state: 'off' | 'dim' | 'steady' | 'bright' | TReadOnlyProperty<'off' | 'dim' | 'steady' | 'bright'> }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_lightBulbState', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.lightBulbStateStringProperty' ), [{"name":"elementName"},{"name":"state","variants":["off","dim","steady","bright"]}] ),
      componentValueChange: new FluentPattern<{ elementName: FluentVariable, newValue: FluentVariable, oldValue: FluentVariable, type: 'battery' | 'resistor' | 'lightBulb' | TReadOnlyProperty<'battery' | 'resistor' | 'lightBulb'> }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_componentValueChange', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.componentValueChangeStringProperty' ), [{"name":"elementName"},{"name":"newValue"},{"name":"oldValue"},{"name":"type","variants":["battery","resistor","lightBulb"]}] )
    },
    sensorToolbox: {
      accessibleHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_sensorToolbox_accessibleHeading', _.get( CircuitConstructionKitCommonStrings, 'a11y.sensorToolbox.accessibleHeadingStringProperty' ) )
    },
    circuitElementToolbox: {
      accessibleHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitElementToolbox_accessibleHeading', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitElementToolbox.accessibleHeadingStringProperty' ) ),
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitElementToolbox_accessibleHelpText', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitElementToolbox.accessibleHelpTextStringProperty' ) )
    },
    advancedAccordionBox: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_advancedAccordionBox_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.advancedAccordionBox.accessibleNameStringProperty' ) ),
      addRealBulbsCheckbox: {
        accessibleContextResponseCheckedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_advancedAccordionBox_addRealBulbsCheckbox_accessibleContextResponseChecked', _.get( CircuitConstructionKitCommonStrings, 'a11y.advancedAccordionBox.addRealBulbsCheckbox.accessibleContextResponseCheckedStringProperty' ) ),
        accessibleContextResponseUncheckedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_advancedAccordionBox_addRealBulbsCheckbox_accessibleContextResponseUnchecked', _.get( CircuitConstructionKitCommonStrings, 'a11y.advancedAccordionBox.addRealBulbsCheckbox.accessibleContextResponseUncheckedStringProperty' ) )
      }
    },
    displayOptionsPanel: {
      accessibleHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_displayOptionsPanel_accessibleHeading', _.get( CircuitConstructionKitCommonStrings, 'a11y.displayOptionsPanel.accessibleHeadingStringProperty' ) ),
      showCurrentCheckbox: {
        accessibleContextResponseChecked: new FluentPattern<{ currentType: 'electrons' | 'conventional' | TReadOnlyProperty<'electrons' | 'conventional'> }>( fluentSupport.bundleProperty, 'a11y_displayOptionsPanel_showCurrentCheckbox_accessibleContextResponseChecked', _.get( CircuitConstructionKitCommonStrings, 'a11y.displayOptionsPanel.showCurrentCheckbox.accessibleContextResponseCheckedStringProperty' ), [{"name":"currentType","variants":["electrons","conventional"]}] ),
        accessibleContextResponseUnchecked: new FluentPattern<{ currentType: 'electrons' | 'conventional' | TReadOnlyProperty<'electrons' | 'conventional'> }>( fluentSupport.bundleProperty, 'a11y_displayOptionsPanel_showCurrentCheckbox_accessibleContextResponseUnchecked', _.get( CircuitConstructionKitCommonStrings, 'a11y.displayOptionsPanel.showCurrentCheckbox.accessibleContextResponseUncheckedStringProperty' ), [{"name":"currentType","variants":["electrons","conventional"]}] )
      },
      currentTypeRadioButtonGroup: {
        electronsRadioButton: {
          accessibleContextResponseStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_displayOptionsPanel_currentTypeRadioButtonGroup_electronsRadioButton_accessibleContextResponse', _.get( CircuitConstructionKitCommonStrings, 'a11y.displayOptionsPanel.currentTypeRadioButtonGroup.electronsRadioButton.accessibleContextResponseStringProperty' ) )
        },
        conventionalRadioButton: {
          accessibleContextResponseStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_displayOptionsPanel_currentTypeRadioButtonGroup_conventionalRadioButton_accessibleContextResponse', _.get( CircuitConstructionKitCommonStrings, 'a11y.displayOptionsPanel.currentTypeRadioButtonGroup.conventionalRadioButton.accessibleContextResponseStringProperty' ) )
        }
      },
      labelsCheckbox: {
        accessibleContextResponseCheckedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_displayOptionsPanel_labelsCheckbox_accessibleContextResponseChecked', _.get( CircuitConstructionKitCommonStrings, 'a11y.displayOptionsPanel.labelsCheckbox.accessibleContextResponseCheckedStringProperty' ) ),
        accessibleContextResponseUncheckedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_displayOptionsPanel_labelsCheckbox_accessibleContextResponseUnchecked', _.get( CircuitConstructionKitCommonStrings, 'a11y.displayOptionsPanel.labelsCheckbox.accessibleContextResponseUncheckedStringProperty' ) )
      },
      valuesCheckbox: {
        accessibleContextResponseCheckedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_displayOptionsPanel_valuesCheckbox_accessibleContextResponseChecked', _.get( CircuitConstructionKitCommonStrings, 'a11y.displayOptionsPanel.valuesCheckbox.accessibleContextResponseCheckedStringProperty' ) ),
        accessibleContextResponseUncheckedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_displayOptionsPanel_valuesCheckbox_accessibleContextResponseUnchecked', _.get( CircuitConstructionKitCommonStrings, 'a11y.displayOptionsPanel.valuesCheckbox.accessibleContextResponseUncheckedStringProperty' ) )
      }
    },
    viewRadioButtonGroup: {
      accessibleHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_viewRadioButtonGroup_accessibleHeading', _.get( CircuitConstructionKitCommonStrings, 'a11y.viewRadioButtonGroup.accessibleHeadingStringProperty' ) ),
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_viewRadioButtonGroup_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.viewRadioButtonGroup.accessibleNameStringProperty' ) ),
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_viewRadioButtonGroup_accessibleHelpText', _.get( CircuitConstructionKitCommonStrings, 'a11y.viewRadioButtonGroup.accessibleHelpTextStringProperty' ) ),
      lifelikeRadioButton: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_viewRadioButtonGroup_lifelikeRadioButton_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.viewRadioButtonGroup.lifelikeRadioButton.accessibleNameStringProperty' ) ),
        accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_viewRadioButtonGroup_lifelikeRadioButton_accessibleHelpText', _.get( CircuitConstructionKitCommonStrings, 'a11y.viewRadioButtonGroup.lifelikeRadioButton.accessibleHelpTextStringProperty' ) ),
        accessibleContextResponseStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_viewRadioButtonGroup_lifelikeRadioButton_accessibleContextResponse', _.get( CircuitConstructionKitCommonStrings, 'a11y.viewRadioButtonGroup.lifelikeRadioButton.accessibleContextResponseStringProperty' ) )
      },
      schematicRadioButton: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_viewRadioButtonGroup_schematicRadioButton_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.viewRadioButtonGroup.schematicRadioButton.accessibleNameStringProperty' ) ),
        accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_viewRadioButtonGroup_schematicRadioButton_accessibleHelpText', _.get( CircuitConstructionKitCommonStrings, 'a11y.viewRadioButtonGroup.schematicRadioButton.accessibleHelpTextStringProperty' ) ),
        accessibleContextResponseStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_viewRadioButtonGroup_schematicRadioButton_accessibleContextResponse', _.get( CircuitConstructionKitCommonStrings, 'a11y.viewRadioButtonGroup.schematicRadioButton.accessibleContextResponseStringProperty' ) )
      }
    },
    circuitElementToolNode: {
      accessibleHelpText: new FluentPattern<{ capacitance: FluentVariable, displayMode: 'name' | 'value' | 'count' | 'countAndValue' | TReadOnlyProperty<'name' | 'value' | 'count' | 'countAndValue'>, hasPosition: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, inductance: FluentVariable, position: FluentVariable, resistance: FluentVariable, switchState: 'closed' | 'open' | TReadOnlyProperty<'closed' | 'open'>, total: FluentVariable, type: 'resistor' | 'battery' | 'lightBulb' | 'capacitor' | 'inductor' | 'acSource' | 'fuse' | 'switch' | 'voltmeter' | 'ammeter' | 'stopwatch' | 'wire' | 'false' | TReadOnlyProperty<'resistor' | 'battery' | 'lightBulb' | 'capacitor' | 'inductor' | 'acSource' | 'fuse' | 'switch' | 'voltmeter' | 'ammeter' | 'stopwatch' | 'wire' | 'false'>, voltage: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitElementToolNode_accessibleHelpText', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitElementToolNode.accessibleHelpTextStringProperty' ), [{"name":"capacitance"},{"name":"displayMode","variants":["name","value","count","countAndValue"]},{"name":"hasPosition","variants":["true","false"]},{"name":"inductance"},{"name":"position"},{"name":"resistance"},{"name":"switchState","variants":["closed","open"]},{"name":"total"},{"name":"type","variants":["resistor","battery","lightBulb","capacitor","inductor","acSource","fuse","switch","voltmeter","ammeter","stopwatch","wire","false"]},{"name":"voltage"}] )
    },
    reverseBatteryButton: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_reverseBatteryButton_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.reverseBatteryButton.accessibleNameStringProperty' ) )
    },
    trashButton: {
      accessibleName: new FluentPattern<{ capacitance: FluentVariable, displayMode: 'name' | 'value' | 'count' | 'countAndValue' | TReadOnlyProperty<'name' | 'value' | 'count' | 'countAndValue'>, hasPosition: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, inductance: FluentVariable, position: FluentVariable, resistance: FluentVariable, switchState: 'closed' | 'open' | TReadOnlyProperty<'closed' | 'open'>, total: FluentVariable, type: 'resistor' | 'battery' | 'lightBulb' | 'capacitor' | 'inductor' | 'acSource' | 'fuse' | 'switch' | 'voltmeter' | 'ammeter' | 'stopwatch' | 'wire' | 'false' | TReadOnlyProperty<'resistor' | 'battery' | 'lightBulb' | 'capacitor' | 'inductor' | 'acSource' | 'fuse' | 'switch' | 'voltmeter' | 'ammeter' | 'stopwatch' | 'wire' | 'false'>, voltage: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_trashButton_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.trashButton.accessibleNameStringProperty' ), [{"name":"capacitance"},{"name":"displayMode","variants":["name","value","count","countAndValue"]},{"name":"hasPosition","variants":["true","false"]},{"name":"inductance"},{"name":"position"},{"name":"resistance"},{"name":"switchState","variants":["closed","open"]},{"name":"total"},{"name":"type","variants":["resistor","battery","lightBulb","capacitor","inductor","acSource","fuse","switch","voltmeter","ammeter","stopwatch","wire","false"]},{"name":"voltage"}] )
    },
    circuitElement: {
      accessibleName: new FluentPattern<{ capacitance: FluentVariable, displayMode: 'name' | 'value' | 'count' | 'countAndValue' | TReadOnlyProperty<'name' | 'value' | 'count' | 'countAndValue'>, hasPosition: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, inductance: FluentVariable, position: FluentVariable, resistance: FluentVariable, switchState: 'closed' | 'open' | TReadOnlyProperty<'closed' | 'open'>, total: FluentVariable, type: 'resistor' | 'battery' | 'lightBulb' | 'capacitor' | 'inductor' | 'acSource' | 'fuse' | 'switch' | 'voltmeter' | 'ammeter' | 'stopwatch' | 'wire' | 'false' | TReadOnlyProperty<'resistor' | 'battery' | 'lightBulb' | 'capacitor' | 'inductor' | 'acSource' | 'fuse' | 'switch' | 'voltmeter' | 'ammeter' | 'stopwatch' | 'wire' | 'false'>, voltage: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitElement_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitElement.accessibleNameStringProperty' ), [{"name":"capacitance"},{"name":"displayMode","variants":["name","value","count","countAndValue"]},{"name":"hasPosition","variants":["true","false"]},{"name":"inductance"},{"name":"position"},{"name":"resistance"},{"name":"switchState","variants":["closed","open"]},{"name":"total"},{"name":"type","variants":["resistor","battery","lightBulb","capacitor","inductor","acSource","fuse","switch","voltmeter","ammeter","stopwatch","wire","false"]},{"name":"voltage"}] ),
      accessibleHelpText: new FluentPattern<{ switchState: 'closed' | 'open' | TReadOnlyProperty<'closed' | 'open'>, type: 'switch' | TReadOnlyProperty<'switch'> }>( fluentSupport.bundleProperty, 'a11y_circuitElement_accessibleHelpText', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitElement.accessibleHelpTextStringProperty' ), [{"name":"switchState","variants":["closed","open"]},{"name":"type","variants":["switch"]}] )
    },
    keyboardHelpDialog: {
      addElements: {
        headingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_keyboardHelpDialog_addElements_heading', _.get( CircuitConstructionKitCommonStrings, 'a11y.keyboardHelpDialog.addElements.headingStringProperty' ) ),
        createElement: {
          labelStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_keyboardHelpDialog_addElements_createElement_label', _.get( CircuitConstructionKitCommonStrings, 'a11y.keyboardHelpDialog.addElements.createElement.labelStringProperty' ) ),
          labelInnerContentStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_keyboardHelpDialog_addElements_createElement_labelInnerContent', _.get( CircuitConstructionKitCommonStrings, 'a11y.keyboardHelpDialog.addElements.createElement.labelInnerContentStringProperty' ) )
        }
      },
      connectElements: {
        headingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_keyboardHelpDialog_connectElements_heading', _.get( CircuitConstructionKitCommonStrings, 'a11y.keyboardHelpDialog.connectElements.headingStringProperty' ) ),
        grabJunction: {
          labelStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_keyboardHelpDialog_connectElements_grabJunction_label', _.get( CircuitConstructionKitCommonStrings, 'a11y.keyboardHelpDialog.connectElements.grabJunction.labelStringProperty' ) ),
          labelInnerContentStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_keyboardHelpDialog_connectElements_grabJunction_labelInnerContent', _.get( CircuitConstructionKitCommonStrings, 'a11y.keyboardHelpDialog.connectElements.grabJunction.labelInnerContentStringProperty' ) )
        },
        selectTarget: {
          labelStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_keyboardHelpDialog_connectElements_selectTarget_label', _.get( CircuitConstructionKitCommonStrings, 'a11y.keyboardHelpDialog.connectElements.selectTarget.labelStringProperty' ) ),
          labelInnerContentStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_keyboardHelpDialog_connectElements_selectTarget_labelInnerContent', _.get( CircuitConstructionKitCommonStrings, 'a11y.keyboardHelpDialog.connectElements.selectTarget.labelInnerContentStringProperty' ) )
        },
        attachJunction: {
          labelStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_keyboardHelpDialog_connectElements_attachJunction_label', _.get( CircuitConstructionKitCommonStrings, 'a11y.keyboardHelpDialog.connectElements.attachJunction.labelStringProperty' ) ),
          labelInnerContentStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_keyboardHelpDialog_connectElements_attachJunction_labelInnerContent', _.get( CircuitConstructionKitCommonStrings, 'a11y.keyboardHelpDialog.connectElements.attachJunction.labelInnerContentStringProperty' ) )
        }
      }
    }
  }
};

export default CircuitConstructionKitCommonFluent;

circuitConstructionKitCommon.register('CircuitConstructionKitCommonFluent', CircuitConstructionKitCommonFluent);
