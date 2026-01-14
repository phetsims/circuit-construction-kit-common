// Copyright 2025-2026, University of Colorado Boulder
// AUTOMATICALLY GENERATED – DO NOT EDIT.
// Generated from circuit-construction-kit-common-strings_en.yaml

/* eslint-disable */
/* @formatter:off */

import { TReadOnlyProperty } from '../../axon/js/TReadOnlyProperty.js';
import FluentLibrary from '../../chipper/js/browser-and-node/FluentLibrary.js';
import FluentComment from '../../chipper/js/browser/FluentComment.js';
import FluentConstant from '../../chipper/js/browser/FluentConstant.js';
import FluentContainer from '../../chipper/js/browser/FluentContainer.js';
import type {FluentVariable} from '../../chipper/js/browser/FluentPattern.js';
import FluentPattern from '../../chipper/js/browser/FluentPattern.js';
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
addToMapIfDefined( 'thinPencil', 'thinPencilStringProperty' );
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
addToMapIfDefined( 'extremeBattery', 'extremeBatteryStringProperty' );
addToMapIfDefined( 'extremeBulb', 'extremeBulbStringProperty' );
addToMapIfDefined( 'extremeResistor', 'extremeResistorStringProperty' );
addToMapIfDefined( 'key_toCut', 'key.toCutStringProperty' );
addToMapIfDefined( 'key_toEditComponent', 'key.toEditComponentStringProperty' );
addToMapIfDefined( 'key_toChooseConnection', 'key.toChooseConnectionStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_addComponents_heading', 'keyboardHelpDialog.addComponents.headingStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_addComponents_createComponent_label', 'keyboardHelpDialog.addComponents.createComponent.labelStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_addComponents_createComponent_labelInnerContent', 'keyboardHelpDialog.addComponents.createComponent.labelInnerContentStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_connectComponents_heading', 'keyboardHelpDialog.connectComponents.headingStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_connectComponents_grabJunction_label', 'keyboardHelpDialog.connectComponents.grabJunction.labelStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_connectComponents_grabJunction_labelInnerContent', 'keyboardHelpDialog.connectComponents.grabJunction.labelInnerContentStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_connectComponents_selectTarget_label', 'keyboardHelpDialog.connectComponents.selectTarget.labelStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_connectComponents_selectTarget_labelInnerContent', 'keyboardHelpDialog.connectComponents.selectTarget.labelInnerContentStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_connectComponents_attachJunction_label', 'keyboardHelpDialog.connectComponents.attachJunction.labelStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_connectComponents_attachJunction_labelInnerContent', 'keyboardHelpDialog.connectComponents.attachJunction.labelInnerContentStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_editCircuitComponents_heading', 'keyboardHelpDialog.editCircuitComponents.headingStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_editCircuitComponents_editCircuitComponent', 'keyboardHelpDialog.editCircuitComponents.editCircuitComponentStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_editCircuitComponents_deleteCircuitComponent', 'keyboardHelpDialog.editCircuitComponents.deleteCircuitComponentStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_focus_heading', 'keyboardHelpDialog.focus.headingStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_focus_focusToolbox', 'keyboardHelpDialog.focus.focusToolboxStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_focus_focusConstructionArea', 'keyboardHelpDialog.focus.focusConstructionAreaStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_chooseConnection_heading', 'keyboardHelpDialog.chooseConnection.headingStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_chooseConnection_thingSingular', 'keyboardHelpDialog.chooseConnection.thingSingularStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_chooseConnection_thingPlural', 'keyboardHelpDialog.chooseConnection.thingPluralStringProperty' );
addToMapIfDefined( 'keyboardHelpDialog_chooseConnection_cancelConnection', 'keyboardHelpDialog.chooseConnection.cancelConnectionStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_wire', 'a11y.circuitDescription.circuitComponentTypeLabels.wireStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_battery', 'a11y.circuitDescription.circuitComponentTypeLabels.batteryStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_resistor', 'a11y.circuitDescription.circuitComponentTypeLabels.resistorStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_capacitor', 'a11y.circuitDescription.circuitComponentTypeLabels.capacitorStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_inductor', 'a11y.circuitDescription.circuitComponentTypeLabels.inductorStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_lightBulb', 'a11y.circuitDescription.circuitComponentTypeLabels.lightBulbStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_acSource', 'a11y.circuitDescription.circuitComponentTypeLabels.acSourceStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_fuse', 'a11y.circuitDescription.circuitComponentTypeLabels.fuseStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_switch', 'a11y.circuitDescription.circuitComponentTypeLabels.switchStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_voltmeter', 'a11y.circuitDescription.circuitComponentTypeLabels.voltmeterStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_ammeter', 'a11y.circuitDescription.circuitComponentTypeLabels.ammeterStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_stopwatch', 'a11y.circuitDescription.circuitComponentTypeLabels.stopwatchStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_extremeBattery', 'a11y.circuitDescription.circuitComponentTypeLabels.extremeBatteryStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_extremeResistor', 'a11y.circuitDescription.circuitComponentTypeLabels.extremeResistorStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_extremeLightBulb', 'a11y.circuitDescription.circuitComponentTypeLabels.extremeLightBulbStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_realLightBulb', 'a11y.circuitDescription.circuitComponentTypeLabels.realLightBulbStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_coin', 'a11y.circuitDescription.circuitComponentTypeLabels.coinStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_paperClip', 'a11y.circuitDescription.circuitComponentTypeLabels.paperClipStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_pencil', 'a11y.circuitDescription.circuitComponentTypeLabels.pencilStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_thinPencil', 'a11y.circuitDescription.circuitComponentTypeLabels.thinPencilStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_eraser', 'a11y.circuitDescription.circuitComponentTypeLabels.eraserStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_hand', 'a11y.circuitDescription.circuitComponentTypeLabels.handStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypeLabels_dollarBill', 'a11y.circuitDescription.circuitComponentTypeLabels.dollarBillStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_wire', 'a11y.circuitDescription.circuitComponentTypePlurals.wireStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_battery', 'a11y.circuitDescription.circuitComponentTypePlurals.batteryStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_resistor', 'a11y.circuitDescription.circuitComponentTypePlurals.resistorStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_capacitor', 'a11y.circuitDescription.circuitComponentTypePlurals.capacitorStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_inductor', 'a11y.circuitDescription.circuitComponentTypePlurals.inductorStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_lightBulb', 'a11y.circuitDescription.circuitComponentTypePlurals.lightBulbStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_acSource', 'a11y.circuitDescription.circuitComponentTypePlurals.acSourceStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_fuse', 'a11y.circuitDescription.circuitComponentTypePlurals.fuseStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_switch', 'a11y.circuitDescription.circuitComponentTypePlurals.switchStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_voltmeter', 'a11y.circuitDescription.circuitComponentTypePlurals.voltmeterStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_ammeter', 'a11y.circuitDescription.circuitComponentTypePlurals.ammeterStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_stopwatch', 'a11y.circuitDescription.circuitComponentTypePlurals.stopwatchStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_extremeBattery', 'a11y.circuitDescription.circuitComponentTypePlurals.extremeBatteryStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_extremeResistor', 'a11y.circuitDescription.circuitComponentTypePlurals.extremeResistorStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_extremeLightBulb', 'a11y.circuitDescription.circuitComponentTypePlurals.extremeLightBulbStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_realLightBulb', 'a11y.circuitDescription.circuitComponentTypePlurals.realLightBulbStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_coin', 'a11y.circuitDescription.circuitComponentTypePlurals.coinStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_paperClip', 'a11y.circuitDescription.circuitComponentTypePlurals.paperClipStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_pencil', 'a11y.circuitDescription.circuitComponentTypePlurals.pencilStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_thinPencil', 'a11y.circuitDescription.circuitComponentTypePlurals.thinPencilStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_eraser', 'a11y.circuitDescription.circuitComponentTypePlurals.eraserStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_hand', 'a11y.circuitDescription.circuitComponentTypePlurals.handStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_circuitComponentTypePlurals_dollarBill', 'a11y.circuitDescription.circuitComponentTypePlurals.dollarBillStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_terminalPrefix', 'a11y.circuitDescription.terminalPrefixStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_briefName', 'a11y.circuitDescription.briefNameStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_connectionDescription', 'a11y.circuitDescription.connectionDescriptionStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_compressedSingular', 'a11y.circuitDescription.compressedSingularStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_compressedPlural', 'a11y.circuitDescription.compressedPluralStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_listAnd', 'a11y.circuitDescription.listAndStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_listTwoItems', 'a11y.circuitDescription.listTwoItemsStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_listFinalSeparator', 'a11y.circuitDescription.listFinalSeparatorStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_groupHeading', 'a11y.circuitDescription.groupHeadingStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_groupWithConnection', 'a11y.circuitDescription.groupWithConnectionStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_connectionPoint', 'a11y.circuitDescription.connectionPointStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_connection', 'a11y.circuitDescription.connectionStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_disconnected', 'a11y.circuitDescription.disconnectedStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_accessibleNameWithSelected', 'a11y.circuitDescription.accessibleNameWithSelectedStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_group', 'a11y.circuitDescription.groupStringProperty' );
addToMapIfDefined( 'a11y_circuitDescription_emptyConstructionAreaMessage', 'a11y.circuitDescription.emptyConstructionAreaMessageStringProperty' );
addToMapIfDefined( 'a11y_circuitGroupDescription_unconnectedSummary', 'a11y.circuitGroupDescription.unconnectedSummaryStringProperty' );
addToMapIfDefined( 'a11y_circuitGroupDescription_groupSummary', 'a11y.circuitGroupDescription.groupSummaryStringProperty' );
addToMapIfDefined( 'a11y_circuitGroupDescription_connectionStatus', 'a11y.circuitGroupDescription.connectionStatusStringProperty' );
addToMapIfDefined( 'a11y_circuitGroupDescription_currentFlowStatus', 'a11y.circuitGroupDescription.currentFlowStatusStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_playArea', 'a11y.screenSummary.playAreaStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_controlArea', 'a11y.screenSummary.controlAreaStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_currentDetails', 'a11y.screenSummary.currentDetailsStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_connectivityPhrase', 'a11y.screenSummary.connectivityPhraseStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_currentFlowingPhrase', 'a11y.screenSummary.currentFlowingPhraseStringProperty' );
addToMapIfDefined( 'a11y_screenSummary_interactionHint', 'a11y.screenSummary.interactionHintStringProperty' );
addToMapIfDefined( 'a11y_constructionArea_accessibleHeading', 'a11y.constructionArea.accessibleHeadingStringProperty' );
addToMapIfDefined( 'a11y_constructionAreaStatus_leadingNoCircuit', 'a11y.constructionAreaStatus.leadingNoCircuitStringProperty' );
addToMapIfDefined( 'a11y_constructionAreaStatus_leadingCircuitActive', 'a11y.constructionAreaStatus.leadingCircuitActiveStringProperty' );
addToMapIfDefined( 'a11y_constructionAreaStatus_wireCount', 'a11y.constructionAreaStatus.wireCountStringProperty' );
addToMapIfDefined( 'a11y_constructionAreaStatus_additionalComponentCount', 'a11y.constructionAreaStatus.additionalComponentCountStringProperty' );
addToMapIfDefined( 'a11y_constructionAreaStatus_connectionCount', 'a11y.constructionAreaStatus.connectionCountStringProperty' );
addToMapIfDefined( 'a11y_constructionAreaStatus_helpTextCase1', 'a11y.constructionAreaStatus.helpTextCase1StringProperty' );
addToMapIfDefined( 'a11y_constructionAreaStatus_helpTextCase2', 'a11y.constructionAreaStatus.helpTextCase2StringProperty' );
addToMapIfDefined( 'a11y_constructionAreaStatus_helpTextCase3', 'a11y.constructionAreaStatus.helpTextCase3StringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_junctionDefaultLabel', 'a11y.circuitContextResponses.junctionDefaultLabelStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_selectedForEditing', 'a11y.circuitContextResponses.selectedForEditingStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_editControlsHidden', 'a11y.circuitContextResponses.editControlsHiddenStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_editPanelHeading', 'a11y.circuitContextResponses.editPanelHeadingStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_editPanelHelpText', 'a11y.circuitContextResponses.editPanelHelpTextStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_connectedComponents', 'a11y.circuitContextResponses.connectedComponentsStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_junctionSplit', 'a11y.circuitContextResponses.junctionSplitStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_currentChangedSingle', 'a11y.circuitContextResponses.currentChangedSingleStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_currentMultiple', 'a11y.circuitContextResponses.currentMultipleStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_currentStopped', 'a11y.circuitContextResponses.currentStoppedStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_componentRemoved', 'a11y.circuitContextResponses.componentRemovedStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_lightBulbState', 'a11y.circuitContextResponses.lightBulbStateStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_componentValueChange', 'a11y.circuitContextResponses.componentValueChangeStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_noChangesInGroup', 'a11y.circuitContextResponses.noChangesInGroupStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_currentChangePhrase', 'a11y.circuitContextResponses.currentChangePhraseStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_lightBulbChangePhrase', 'a11y.circuitContextResponses.lightBulbChangePhraseStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_vertexConnectedWithCurrent', 'a11y.circuitContextResponses.vertexConnectedWithCurrentStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_vertexConnectedSimple', 'a11y.circuitContextResponses.vertexConnectedSimpleStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_switchOpened', 'a11y.circuitContextResponses.switchOpenedStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_switchClosed', 'a11y.circuitContextResponses.switchClosedStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_switchOpenedNoChange', 'a11y.circuitContextResponses.switchOpenedNoChangeStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_switchClosedNoChange', 'a11y.circuitContextResponses.switchClosedNoChangeStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_fuseBroken', 'a11y.circuitContextResponses.fuseBrokenStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_fuseBrokenNoChange', 'a11y.circuitContextResponses.fuseBrokenNoChangeStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_fuseRepaired', 'a11y.circuitContextResponses.fuseRepairedStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_fuseRepairedNoChange', 'a11y.circuitContextResponses.fuseRepairedNoChangeStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_batteryReversed', 'a11y.circuitContextResponses.batteryReversedStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_batteryReversedNoChange', 'a11y.circuitContextResponses.batteryReversedNoChangeStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_vertexDisconnected', 'a11y.circuitContextResponses.vertexDisconnectedStringProperty' );
addToMapIfDefined( 'a11y_circuitContextResponses_vertexDisconnectedNoChange', 'a11y.circuitContextResponses.vertexDisconnectedNoChangeStringProperty' );
addToMapIfDefined( 'a11y_sensorToolbox_accessibleHeading', 'a11y.sensorToolbox.accessibleHeadingStringProperty' );
addToMapIfDefined( 'a11y_sensorToolbox_nonContactAmmeter_accessibleName', 'a11y.sensorToolbox.nonContactAmmeter.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_sensorToolbox_voltmeter_accessibleName', 'a11y.sensorToolbox.voltmeter.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_sensorToolbox_ammeter_accessibleName', 'a11y.sensorToolbox.ammeter.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_circuitComponentToolbox_carousel_accessibleName', 'a11y.circuitComponentToolbox.carousel.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_circuitComponentToolbox_carousel_accessibleHelpText', 'a11y.circuitComponentToolbox.carousel.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_circuitComponentToolbox_toolAccessibleName', 'a11y.circuitComponentToolbox.toolAccessibleNameStringProperty' );
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
addToMapIfDefined( 'a11y_circuitComponentToolNode_accessibleHelpText', 'a11y.circuitComponentToolNode.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_reverseBatteryButton_accessibleName', 'a11y.reverseBatteryButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_switchToggleButton_openSwitch', 'a11y.switchToggleButton.openSwitchStringProperty' );
addToMapIfDefined( 'a11y_switchToggleButton_closeSwitch', 'a11y.switchToggleButton.closeSwitchStringProperty' );
addToMapIfDefined( 'a11y_disconnectButton_accessibleName', 'a11y.disconnectButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_trashButton_accessibleName', 'a11y.trashButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_fuseRepairButton_accessibleName', 'a11y.fuseRepairButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_sourceResistanceControl_ariaValueText', 'a11y.sourceResistanceControl.ariaValueTextStringProperty' );
addToMapIfDefined( 'a11y_wireResistivityControl_ariaValueText', 'a11y.wireResistivityControl.ariaValueTextStringProperty' );
addToMapIfDefined( 'a11y_fuseCurrentRatingControl_ariaValueText', 'a11y.fuseCurrentRatingControl.ariaValueTextStringProperty' );
addToMapIfDefined( 'a11y_ammeterNode_accessibleHeading', 'a11y.ammeterNode.accessibleHeadingStringProperty' );
addToMapIfDefined( 'a11y_ammeterNode_accessibleHeadingNumbered', 'a11y.ammeterNode.accessibleHeadingNumberedStringProperty' );
addToMapIfDefined( 'a11y_ammeterNode_accessibleParagraph', 'a11y.ammeterNode.accessibleParagraphStringProperty' );
addToMapIfDefined( 'a11y_ammeterNode_body_accessibleName', 'a11y.ammeterNode.body.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_ammeterNode_probe_accessibleName', 'a11y.ammeterNode.probe.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_ammeterNode_noReading', 'a11y.ammeterNode.noReadingStringProperty' );
addToMapIfDefined( 'a11y_ammeterNode_currentAmps', 'a11y.ammeterNode.currentAmpsStringProperty' );
addToMapIfDefined( 'a11y_voltmeterNode_accessibleHeading', 'a11y.voltmeterNode.accessibleHeadingStringProperty' );
addToMapIfDefined( 'a11y_voltmeterNode_accessibleHeadingNumbered', 'a11y.voltmeterNode.accessibleHeadingNumberedStringProperty' );
addToMapIfDefined( 'a11y_voltmeterNode_accessibleParagraph', 'a11y.voltmeterNode.accessibleParagraphStringProperty' );
addToMapIfDefined( 'a11y_voltmeterNode_body_accessibleName', 'a11y.voltmeterNode.body.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_voltmeterNode_blackProbe_accessibleName', 'a11y.voltmeterNode.blackProbe.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_voltmeterNode_redProbe_accessibleName', 'a11y.voltmeterNode.redProbe.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_voltmeterNode_noReading', 'a11y.voltmeterNode.noReadingStringProperty' );
addToMapIfDefined( 'a11y_circuitComponent_separator', 'a11y.circuitComponent.separatorStringProperty' );
addToMapIfDefined( 'a11y_circuitComponent_nameWithPosition', 'a11y.circuitComponent.nameWithPositionStringProperty' );
addToMapIfDefined( 'a11y_circuitComponent_values_resistanceOhms', 'a11y.circuitComponent.values.resistanceOhmsStringProperty' );
addToMapIfDefined( 'a11y_circuitComponent_values_resistanceMilliohms', 'a11y.circuitComponent.values.resistanceMilliohmsStringProperty' );
addToMapIfDefined( 'a11y_circuitComponent_values_voltageVolts', 'a11y.circuitComponent.values.voltageVoltsStringProperty' );
addToMapIfDefined( 'a11y_circuitComponent_values_capacitanceFarads', 'a11y.circuitComponent.values.capacitanceFaradsStringProperty' );
addToMapIfDefined( 'a11y_circuitComponent_values_inductanceHenries', 'a11y.circuitComponent.values.inductanceHenriesStringProperty' );
addToMapIfDefined( 'a11y_circuitComponent_values_currentRatingAmps', 'a11y.circuitComponent.values.currentRatingAmpsStringProperty' );
addToMapIfDefined( 'a11y_circuitComponent_values_infiniteOhms', 'a11y.circuitComponent.values.infiniteOhmsStringProperty' );
addToMapIfDefined( 'a11y_circuitComponent_switchStates_closed', 'a11y.circuitComponent.switchStates.closedStringProperty' );
addToMapIfDefined( 'a11y_circuitComponent_switchStates_open', 'a11y.circuitComponent.switchStates.openStringProperty' );
addToMapIfDefined( 'a11y_circuitComponent_modifiers_onFire', 'a11y.circuitComponent.modifiers.onFireStringProperty' );
addToMapIfDefined( 'a11y_circuitComponent_modifiers_broken', 'a11y.circuitComponent.modifiers.brokenStringProperty' );
addToMapIfDefined( 'a11y_circuitComponent_brightness_off', 'a11y.circuitComponent.brightness.offStringProperty' );
addToMapIfDefined( 'a11y_circuitComponent_brightness_percent', 'a11y.circuitComponent.brightness.percentStringProperty' );

// A function that creates contents for a new Fluent file, which will be needed if any string changes.
const createFluentFile = (): string => {
  let ftl = '';
  for (const [key, stringProperty] of fluentKeyToStringPropertyMap.entries()) {
    ftl += `${key} = ${FluentLibrary.formatMultilineForFtl( stringProperty.value )}\n`;
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
  _comment_0: new FluentComment( {"comment":"Household items (max 1 each)","associatedKey":"coin"} ),
  _comment_1: new FluentComment( {"comment":"Household items (max 1 each, plurals unlikely but included for completeness)","associatedKey":"coin"} ),
  coinStringProperty: _.get( CircuitConstructionKitCommonStrings, 'coinStringProperty' ),
  dollarBillStringProperty: _.get( CircuitConstructionKitCommonStrings, 'dollarBillStringProperty' ),
  eraserStringProperty: _.get( CircuitConstructionKitCommonStrings, 'eraserStringProperty' ),
  pencilStringProperty: _.get( CircuitConstructionKitCommonStrings, 'pencilStringProperty' ),
  thinPencilStringProperty: _.get( CircuitConstructionKitCommonStrings, 'thinPencilStringProperty' ),
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
  _comment_2: new FluentComment( {"comment":"THESE ARE BUGGY BUT WE HAVE TO COORDINATE WITH i18n TOOLING TO FIX THEM","associatedKey":"capacitanceFaradsSymbol"} ),
  capacitanceFaradsSymbolStringProperty: _.get( CircuitConstructionKitCommonStrings, 'capacitanceFaradsSymbolStringProperty' ),
  inductanceHenriesSymbolStringProperty: _.get( CircuitConstructionKitCommonStrings, 'inductanceHenriesSymbolStringProperty' ),
  resistanceOhmsValuePatternStringProperty: _.get( CircuitConstructionKitCommonStrings, 'resistanceOhmsValuePatternStringProperty' ),
  theSwitchIsClosedStringProperty: _.get( CircuitConstructionKitCommonStrings, 'theSwitchIsClosedStringProperty' ),
  theSwitchIsOpenStringProperty: _.get( CircuitConstructionKitCommonStrings, 'theSwitchIsOpenStringProperty' ),
  ammeterReadoutStringProperty: _.get( CircuitConstructionKitCommonStrings, 'ammeterReadoutStringProperty' ),
  magnitudeStringProperty: _.get( CircuitConstructionKitCommonStrings, 'magnitudeStringProperty' ),
  signedStringProperty: _.get( CircuitConstructionKitCommonStrings, 'signedStringProperty' ),
  dataOutOfRangeStringProperty: _.get( CircuitConstructionKitCommonStrings, 'dataOutOfRangeStringProperty' ),
  _comment_3: new FluentComment( {"comment":"Extreme variants","associatedKey":"extremeBattery"} ),
  _comment_4: new FluentComment( {"comment":"Extreme variants","associatedKey":"extremeBattery"} ),
  extremeBatteryStringProperty: _.get( CircuitConstructionKitCommonStrings, 'extremeBatteryStringProperty' ),
  extremeBulbStringProperty: _.get( CircuitConstructionKitCommonStrings, 'extremeBulbStringProperty' ),
  extremeResistorStringProperty: _.get( CircuitConstructionKitCommonStrings, 'extremeResistorStringProperty' ),
  key: {
    toCutStringProperty: _.get( CircuitConstructionKitCommonStrings, 'key.toCutStringProperty' ),
    toEditComponentStringProperty: _.get( CircuitConstructionKitCommonStrings, 'key.toEditComponentStringProperty' ),
    toChooseConnectionStringProperty: _.get( CircuitConstructionKitCommonStrings, 'key.toChooseConnectionStringProperty' )
  },
  _comment_5: new FluentComment( {"comment":"TODO: Some of this text is PDOM only and should not appear in rosetta","associatedKey":"keyboardHelpDialog"} ),
  keyboardHelpDialog: {
    addComponents: {
      headingStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.addComponents.headingStringProperty' ),
      createComponent: {
        labelStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.addComponents.createComponent.labelStringProperty' ),
        labelInnerContentStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.addComponents.createComponent.labelInnerContentStringProperty' )
      }
    },
    connectComponents: {
      headingStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.connectComponents.headingStringProperty' ),
      grabJunction: {
        labelStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.connectComponents.grabJunction.labelStringProperty' ),
        labelInnerContentStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.connectComponents.grabJunction.labelInnerContentStringProperty' )
      },
      selectTarget: {
        labelStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.connectComponents.selectTarget.labelStringProperty' ),
        labelInnerContentStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.connectComponents.selectTarget.labelInnerContentStringProperty' )
      },
      attachJunction: {
        labelStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.connectComponents.attachJunction.labelStringProperty' ),
        labelInnerContentStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.connectComponents.attachJunction.labelInnerContentStringProperty' )
      }
    },
    editCircuitComponents: {
      headingStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.editCircuitComponents.headingStringProperty' ),
      editCircuitComponentStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.editCircuitComponents.editCircuitComponentStringProperty' ),
      deleteCircuitComponentStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.editCircuitComponents.deleteCircuitComponentStringProperty' )
    },
    focus: {
      headingStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.focus.headingStringProperty' ),
      focusToolboxStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.focus.focusToolboxStringProperty' ),
      focusConstructionAreaStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.focus.focusConstructionAreaStringProperty' )
    },
    _comment_0: new FluentComment( {"comment":"For connecting junctions or attaching a voltmeter probe or ammeter probe","associatedKey":"chooseConnection"} ),
    chooseConnection: {
      headingStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.chooseConnection.headingStringProperty' ),
      thingSingularStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.chooseConnection.thingSingularStringProperty' ),
      thingPluralStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.chooseConnection.thingPluralStringProperty' ),
      cancelConnectionStringProperty: _.get( CircuitConstructionKitCommonStrings, 'keyboardHelpDialog.chooseConnection.cancelConnectionStringProperty' )
    }
  },
  a11y: {
    circuitDescription: {
      _comment_0: new FluentComment( {"comment":"TODO: Reuse same labels as outside a11y key?","associatedKey":"circuitComponentTypeLabels"} ),
      circuitComponentTypeLabels: {
        wireStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_wire', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.wireStringProperty' ) ),
        batteryStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_battery', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.batteryStringProperty' ) ),
        resistorStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_resistor', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.resistorStringProperty' ) ),
        capacitorStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_capacitor', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.capacitorStringProperty' ) ),
        inductorStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_inductor', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.inductorStringProperty' ) ),
        lightBulbStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_lightBulb', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.lightBulbStringProperty' ) ),
        acSourceStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_acSource', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.acSourceStringProperty' ) ),
        fuseStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_fuse', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.fuseStringProperty' ) ),
        switchStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_switch', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.switchStringProperty' ) ),
        voltmeterStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_voltmeter', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.voltmeterStringProperty' ) ),
        ammeterStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_ammeter', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.ammeterStringProperty' ) ),
        stopwatchStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_stopwatch', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.stopwatchStringProperty' ) ),
        _comment_0: new FluentComment( {"comment":"Extreme variants","associatedKey":"extremeBattery"} ),
        _comment_1: new FluentComment( {"comment":"Extreme variants","associatedKey":"extremeBattery"} ),
        extremeBatteryStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_extremeBattery', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.extremeBatteryStringProperty' ) ),
        extremeResistorStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_extremeResistor', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.extremeResistorStringProperty' ) ),
        extremeLightBulbStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_extremeLightBulb', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.extremeLightBulbStringProperty' ) ),
        realLightBulbStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_realLightBulb', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.realLightBulbStringProperty' ) ),
        _comment_2: new FluentComment( {"comment":"Household items (max 1 each)","associatedKey":"coin"} ),
        _comment_3: new FluentComment( {"comment":"Household items (max 1 each, plurals unlikely but included for completeness)","associatedKey":"coin"} ),
        coinStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_coin', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.coinStringProperty' ) ),
        paperClipStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_paperClip', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.paperClipStringProperty' ) ),
        pencilStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_pencil', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.pencilStringProperty' ) ),
        thinPencilStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_thinPencil', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.thinPencilStringProperty' ) ),
        eraserStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_eraser', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.eraserStringProperty' ) ),
        handStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_hand', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.handStringProperty' ) ),
        dollarBillStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypeLabels_dollarBill', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypeLabels.dollarBillStringProperty' ) )
      },
      _comment_1: new FluentComment( {"comment":"Plural forms for circuit component types (used in compressed connection descriptions)","associatedKey":"circuitComponentTypePlurals"} ),
      circuitComponentTypePlurals: {
        wireStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_wire', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.wireStringProperty' ) ),
        batteryStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_battery', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.batteryStringProperty' ) ),
        resistorStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_resistor', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.resistorStringProperty' ) ),
        capacitorStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_capacitor', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.capacitorStringProperty' ) ),
        inductorStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_inductor', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.inductorStringProperty' ) ),
        lightBulbStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_lightBulb', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.lightBulbStringProperty' ) ),
        acSourceStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_acSource', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.acSourceStringProperty' ) ),
        fuseStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_fuse', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.fuseStringProperty' ) ),
        switchStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_switch', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.switchStringProperty' ) ),
        voltmeterStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_voltmeter', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.voltmeterStringProperty' ) ),
        ammeterStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_ammeter', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.ammeterStringProperty' ) ),
        stopwatchStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_stopwatch', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.stopwatchStringProperty' ) ),
        _comment_0: new FluentComment( {"comment":"Extreme variants","associatedKey":"extremeBattery"} ),
        _comment_1: new FluentComment( {"comment":"Extreme variants","associatedKey":"extremeBattery"} ),
        extremeBatteryStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_extremeBattery', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.extremeBatteryStringProperty' ) ),
        extremeResistorStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_extremeResistor', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.extremeResistorStringProperty' ) ),
        extremeLightBulbStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_extremeLightBulb', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.extremeLightBulbStringProperty' ) ),
        realLightBulbStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_realLightBulb', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.realLightBulbStringProperty' ) ),
        _comment_2: new FluentComment( {"comment":"Household items (max 1 each)","associatedKey":"coin"} ),
        _comment_3: new FluentComment( {"comment":"Household items (max 1 each, plurals unlikely but included for completeness)","associatedKey":"coin"} ),
        coinStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_coin', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.coinStringProperty' ) ),
        paperClipStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_paperClip', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.paperClipStringProperty' ) ),
        pencilStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_pencil', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.pencilStringProperty' ) ),
        thinPencilStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_thinPencil', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.thinPencilStringProperty' ) ),
        eraserStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_eraser', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.eraserStringProperty' ) ),
        handStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_hand', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.handStringProperty' ) ),
        dollarBillStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_circuitComponentTypePlurals_dollarBill', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.circuitComponentTypePlurals.dollarBillStringProperty' ) )
      },
      _comment_2: new FluentComment( {"comment":"Terminal and connection prefixes for vertex descriptions","associatedKey":"terminalPrefix"} ),
      terminalPrefix: new FluentPattern<{ componentName: FluentVariable, terminalType: 'positiveTerminal' | 'negativeTerminal' | 'side' | 'bottom' | 'none' | TReadOnlyProperty<'positiveTerminal' | 'negativeTerminal' | 'side' | 'bottom' | 'none'> }>( fluentSupport.bundleProperty, 'a11y_circuitDescription_terminalPrefix', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.terminalPrefixStringProperty' ), [{"name":"componentName"},{"name":"terminalType","variants":["positiveTerminal","negativeTerminal","side","bottom","none"]}] ),
      _comment_3: new FluentComment( {"comment":"Brief name for a circuit element (type + position number)","associatedKey":"briefName"} ),
      briefName: new FluentPattern<{ position: FluentVariable, typeLabel: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitDescription_briefName', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.briefNameStringProperty' ), [{"name":"position"},{"name":"typeLabel"}] ),
      _comment_4: new FluentComment( {"comment":"Connection description patterns","associatedKey":"connectionDescription"} ),
      connectionDescription: new FluentPattern<{ connectionLabel: FluentVariable, neighbors: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitDescription_connectionDescription', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.connectionDescriptionStringProperty' ), [{"name":"connectionLabel"},{"name":"neighbors"}] ),
      _comment_5: new FluentComment( {"comment":"For compressed descriptions with 4+ connections","associatedKey":"compressedSingular"} ),
      compressedSingular: new FluentPattern<{ count: FluentVariable, typeLabel: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitDescription_compressedSingular', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.compressedSingularStringProperty' ), [{"name":"count"},{"name":"typeLabel"}] ),
      compressedPlural: new FluentPattern<{ count: FluentVariable, pluralLabel: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitDescription_compressedPlural', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.compressedPluralStringProperty' ), [{"name":"count"},{"name":"pluralLabel"}] ),
      _comment_6: new FluentComment( {"comment":"List joining patterns","associatedKey":"listAnd"} ),
      listAndStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_listAnd', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.listAndStringProperty' ) ),
      listTwoItems: new FluentPattern<{ first: FluentVariable, second: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitDescription_listTwoItems', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.listTwoItemsStringProperty' ), [{"name":"first"},{"name":"second"}] ),
      listFinalSeparator: new FluentPattern<{ last: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitDescription_listFinalSeparator', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.listFinalSeparatorStringProperty' ), [{"name":"last"}] ),
      _comment_7: new FluentComment( {"comment":"Group patterns","associatedKey":"groupHeading"} ),
      groupHeading: new FluentPattern<{ groupIndex: FluentVariable, totalGroups: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitDescription_groupHeading', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.groupHeadingStringProperty' ), [{"name":"groupIndex"},{"name":"totalGroups"}] ),
      groupWithConnection: new FluentPattern<{ description: FluentVariable, groupIndex: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitDescription_groupWithConnection', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.groupWithConnectionStringProperty' ), [{"name":"description"},{"name":"groupIndex"}] ),
      connectionPointStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_connectionPoint', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.connectionPointStringProperty' ) ),
      connectionStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_connection', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.connectionStringProperty' ) ),
      disconnectedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_disconnected', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.disconnectedStringProperty' ) ),
      _comment_8: new FluentComment( {"comment":"Suffix appended to accessible name when a circuit element is selected","associatedKey":"accessibleNameWithSelected"} ),
      accessibleNameWithSelected: new FluentPattern<{ accessibleName: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitDescription_accessibleNameWithSelected', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.accessibleNameWithSelectedStringProperty' ), [{"name":"accessibleName"}] ),
      groupStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_group', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.groupStringProperty' ) ),
      emptyConstructionAreaMessageStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitDescription_emptyConstructionAreaMessage', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitDescription.emptyConstructionAreaMessageStringProperty' ) )
    },
    circuitGroupDescription: {
      _comment_0: new FluentComment( {"comment":"Unconnected section summary","associatedKey":"unconnectedSummary"} ),
      unconnectedSummary: new FluentPattern<{ componentList: FluentVariable, count: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_circuitGroupDescription_unconnectedSummary', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitGroupDescription.unconnectedSummaryStringProperty' ), [{"name":"componentList"},{"name":"count","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] ),
      _comment_1: new FluentComment( {"comment":"Connected group summary","associatedKey":"groupSummary"} ),
      groupSummary: new FluentPattern<{ componentList: FluentVariable, count: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitGroupDescription_groupSummary', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitGroupDescription.groupSummaryStringProperty' ), [{"name":"componentList"},{"name":"count"}] ),
      _comment_2: new FluentComment( {"comment":"Connection status","associatedKey":"connectionStatus"} ),
      connectionStatus: new FluentPattern<{ allConnected: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'> }>( fluentSupport.bundleProperty, 'a11y_circuitGroupDescription_connectionStatus', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitGroupDescription.connectionStatusStringProperty' ), [{"name":"allConnected","variants":["true","false"]}] ),
      _comment_3: new FluentComment( {"comment":"Current flow status","associatedKey":"currentFlowStatus"} ),
      currentFlowStatus: new FluentPattern<{ flowLevel: 'all' | 'some' | 'none' | 'notShown' | TReadOnlyProperty<'all' | 'some' | 'none' | 'notShown'> }>( fluentSupport.bundleProperty, 'a11y_circuitGroupDescription_currentFlowStatus', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitGroupDescription.currentFlowStatusStringProperty' ), [{"name":"flowLevel","variants":["all","some","none","notShown"]}] )
    },
    screenSummary: {
      playAreaStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_playArea', _.get( CircuitConstructionKitCommonStrings, 'a11y.screenSummary.playAreaStringProperty' ) ),
      controlAreaStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_controlArea', _.get( CircuitConstructionKitCommonStrings, 'a11y.screenSummary.controlAreaStringProperty' ) ),
      currentDetails: new FluentPattern<{ componentCount: number | 'zero' | number | 'other' | TReadOnlyProperty<number | 'zero' | number | 'other'>, connectivityPhrase: FluentVariable, currentFlowingPhrase: FluentVariable, viewType: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_screenSummary_currentDetails', _.get( CircuitConstructionKitCommonStrings, 'a11y.screenSummary.currentDetailsStringProperty' ), [{"name":"componentCount","variants":[{"type":"number","value":"zero"},{"type":"number","value":"other"}]},{"name":"connectivityPhrase"},{"name":"currentFlowingPhrase"},{"name":"viewType"}] ),
      connectivityPhrase: new FluentPattern<{ connectedCount: FluentVariable, disconnectedCount: number | 'zero' | number | 'one' | number | 'other' | TReadOnlyProperty<number | 'zero' | number | 'one' | number | 'other'>, disconnectedCountNumber: FluentVariable, groupCount: number | 'zero' | number | 'one' | number | 'other' | number | 'zero' | number | 'one' | number | 'other' | number | 'zero' | number | 'one' | number | 'other' | TReadOnlyProperty<number | 'zero' | number | 'one' | number | 'other' | number | 'zero' | number | 'one' | number | 'other' | number | 'zero' | number | 'one' | number | 'other'>, groupCountNumber: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_screenSummary_connectivityPhrase', _.get( CircuitConstructionKitCommonStrings, 'a11y.screenSummary.connectivityPhraseStringProperty' ), [{"name":"connectedCount"},{"name":"disconnectedCount","variants":[{"type":"number","value":"zero"},{"type":"number","value":"one"},{"type":"number","value":"other"}]},{"name":"disconnectedCountNumber"},{"name":"groupCount","variants":[{"type":"number","value":"zero"},{"type":"number","value":"one"},{"type":"number","value":"other"},{"type":"number","value":"zero"},{"type":"number","value":"one"},{"type":"number","value":"other"},{"type":"number","value":"zero"},{"type":"number","value":"one"},{"type":"number","value":"other"}]},{"name":"groupCountNumber"}] ),
      currentFlowingPhrase: new FluentPattern<{ groupCountNumber: FluentVariable, groupsWithCurrent: FluentVariable, hasCurrentFlowing: 'flowing' | 'notFlowing' | TReadOnlyProperty<'flowing' | 'notFlowing'> }>( fluentSupport.bundleProperty, 'a11y_screenSummary_currentFlowingPhrase', _.get( CircuitConstructionKitCommonStrings, 'a11y.screenSummary.currentFlowingPhraseStringProperty' ), [{"name":"groupCountNumber"},{"name":"groupsWithCurrent"},{"name":"hasCurrentFlowing","variants":["flowing","notFlowing"]}] ),
      interactionHintStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_screenSummary_interactionHint', _.get( CircuitConstructionKitCommonStrings, 'a11y.screenSummary.interactionHintStringProperty' ) )
    },
    constructionArea: {
      accessibleHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_constructionArea_accessibleHeading', _.get( CircuitConstructionKitCommonStrings, 'a11y.constructionArea.accessibleHeadingStringProperty' ) )
    },
    constructionAreaStatus: {
      leadingNoCircuitStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_constructionAreaStatus_leadingNoCircuit', _.get( CircuitConstructionKitCommonStrings, 'a11y.constructionAreaStatus.leadingNoCircuitStringProperty' ) ),
      leadingCircuitActive: new FluentPattern<{ currentLevel: 'low' | 'medium' | 'high' | TReadOnlyProperty<'low' | 'medium' | 'high'> }>( fluentSupport.bundleProperty, 'a11y_constructionAreaStatus_leadingCircuitActive', _.get( CircuitConstructionKitCommonStrings, 'a11y.constructionAreaStatus.leadingCircuitActiveStringProperty' ), [{"name":"currentLevel","variants":["low","medium","high"]}] ),
      wireCount: new FluentPattern<{ count: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_constructionAreaStatus_wireCount', _.get( CircuitConstructionKitCommonStrings, 'a11y.constructionAreaStatus.wireCountStringProperty' ), [{"name":"count","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] ),
      additionalComponentCount: new FluentPattern<{ count: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_constructionAreaStatus_additionalComponentCount', _.get( CircuitConstructionKitCommonStrings, 'a11y.constructionAreaStatus.additionalComponentCountStringProperty' ), [{"name":"count","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] ),
      connectionCount: new FluentPattern<{ count: number | 'zero' | number | 'one' | number | 'other' | TReadOnlyProperty<number | 'zero' | number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_constructionAreaStatus_connectionCount', _.get( CircuitConstructionKitCommonStrings, 'a11y.constructionAreaStatus.connectionCountStringProperty' ), [{"name":"count","variants":[{"type":"number","value":"zero"},{"type":"number","value":"one"},{"type":"number","value":"other"}]}] ),
      helpTextCase1StringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_constructionAreaStatus_helpTextCase1', _.get( CircuitConstructionKitCommonStrings, 'a11y.constructionAreaStatus.helpTextCase1StringProperty' ) ),
      helpTextCase2StringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_constructionAreaStatus_helpTextCase2', _.get( CircuitConstructionKitCommonStrings, 'a11y.constructionAreaStatus.helpTextCase2StringProperty' ) ),
      helpTextCase3StringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_constructionAreaStatus_helpTextCase3', _.get( CircuitConstructionKitCommonStrings, 'a11y.constructionAreaStatus.helpTextCase3StringProperty' ) )
    },
    circuitContextResponses: {
      junctionDefaultLabel: new FluentPattern<{ index: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_junctionDefaultLabel', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.junctionDefaultLabelStringProperty' ), [{"name":"index"}] ),
      selectedForEditingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_selectedForEditing', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.selectedForEditingStringProperty' ) ),
      editControlsHiddenStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_editControlsHidden', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.editControlsHiddenStringProperty' ) ),
      editPanelHeading: new FluentPattern<{ componentType: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_editPanelHeading', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.editPanelHeadingStringProperty' ), [{"name":"componentType"}] ),
      editPanelHelpText: new FluentPattern<{ componentType: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_editPanelHelpText', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.editPanelHelpTextStringProperty' ), [{"name":"componentType"}] ),
      connectedComponents: new FluentPattern<{ components: FluentVariable, groupIndex: FluentVariable, inGroup: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'> }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_connectedComponents', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.connectedComponentsStringProperty' ), [{"name":"components"},{"name":"groupIndex"},{"name":"inGroup","variants":["true","false"]}] ),
      junctionSplit: new FluentPattern<{ connectionCount: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'>, junctionName: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_junctionSplit', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.junctionSplitStringProperty' ), [{"name":"connectionCount","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]},{"name":"junctionName"}] ),
      currentChangedSingle: new FluentPattern<{ current: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_currentChangedSingle', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.currentChangedSingleStringProperty' ), [{"name":"current"}] ),
      currentMultipleStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_currentMultiple', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.currentMultipleStringProperty' ) ),
      currentStoppedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_currentStopped', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.currentStoppedStringProperty' ) ),
      componentRemovedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_componentRemoved', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.componentRemovedStringProperty' ) ),
      lightBulbState: new FluentPattern<{ componentName: FluentVariable, state: 'off' | 'dim' | 'steady' | 'bright' | TReadOnlyProperty<'off' | 'dim' | 'steady' | 'bright'> }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_lightBulbState', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.lightBulbStateStringProperty' ), [{"name":"componentName"},{"name":"state","variants":["off","dim","steady","bright"]}] ),
      componentValueChange: new FluentPattern<{ componentName: FluentVariable, newValue: FluentVariable, oldValue: FluentVariable, type: 'battery' | 'resistor' | 'lightBulb' | TReadOnlyProperty<'battery' | 'resistor' | 'lightBulb'> }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_componentValueChange', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.componentValueChangeStringProperty' ), [{"name":"componentName"},{"name":"newValue"},{"name":"oldValue"},{"name":"type","variants":["battery","resistor","lightBulb"]}] ),
      _comment_0: new FluentComment( {"comment":"When connected element changes but no current/brightness changes","associatedKey":"noChangesInGroup"} ),
      _comment_1: new FluentComment( {"comment":"Note: When showCurrent=false and hasLightBulbs=false, code returns null before calling this","associatedKey":"noChangesInGroup"} ),
      noChangesInGroup: new FluentPattern<{ groupIndex: FluentVariable, hasLightBulbs: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, showCurrent: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'> }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_noChangesInGroup', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.noChangesInGroupStringProperty' ), [{"name":"groupIndex"},{"name":"hasLightBulbs","variants":["true","false"]},{"name":"showCurrent","variants":["true","false"]}] ),
      _comment_2: new FluentComment( {"comment":"Current change patterns with scope (some/all) and direction","associatedKey":"currentChangePhrase"} ),
      currentChangePhrase: new FluentPattern<{ direction: 'changed' | 'increased' | 'decreased' | 'stopped' | 'reversed' | TReadOnlyProperty<'changed' | 'increased' | 'decreased' | 'stopped' | 'reversed'>, groupIndex: FluentVariable, scope: 'some' | 'all' | TReadOnlyProperty<'some' | 'all'> }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_currentChangePhrase', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.currentChangePhraseStringProperty' ), [{"name":"direction","variants":["changed","increased","decreased","stopped","reversed"]},{"name":"groupIndex"},{"name":"scope","variants":["some","all"]}] ),
      _comment_3: new FluentComment( {"comment":"Light bulb brightness change patterns","associatedKey":"lightBulbChangePhrase"} ),
      lightBulbChangePhrase: new FluentPattern<{ direction: 'brighter' | 'dimmer' | 'changed' | TReadOnlyProperty<'brighter' | 'dimmer' | 'changed'>, groupIndex: FluentVariable, scope: 'some' | 'all' | TReadOnlyProperty<'some' | 'all'> }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_lightBulbChangePhrase', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.lightBulbChangePhraseStringProperty' ), [{"name":"direction","variants":["brighter","dimmer","changed"]},{"name":"groupIndex"},{"name":"scope","variants":["some","all"]}] ),
      _comment_4: new FluentComment( {"comment":"Vertex connection with current flow","associatedKey":"vertexConnectedWithCurrent"} ),
      vertexConnectedWithCurrent: new FluentPattern<{ currentPhrase: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_vertexConnectedWithCurrent', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.vertexConnectedWithCurrentStringProperty' ), [{"name":"currentPhrase"}] ),
      _comment_5: new FluentComment( {"comment":"Simple vertex connection (when no current flows)","associatedKey":"vertexConnectedSimple"} ),
      vertexConnectedSimpleStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_vertexConnectedSimple', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.vertexConnectedSimpleStringProperty' ) ),
      _comment_6: new FluentComment( {"comment":"Switch toggle responses","associatedKey":"switchOpened"} ),
      switchOpened: new FluentPattern<{ currentPhrase: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_switchOpened', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.switchOpenedStringProperty' ), [{"name":"currentPhrase"}] ),
      switchClosed: new FluentPattern<{ currentPhrase: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_switchClosed', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.switchClosedStringProperty' ), [{"name":"currentPhrase"}] ),
      _comment_7: new FluentComment( {"comment":"Current phrases for switch (when disconnected or no change)","associatedKey":"switchOpenedNoChange"} ),
      switchOpenedNoChangeStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_switchOpenedNoChange', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.switchOpenedNoChangeStringProperty' ) ),
      switchClosedNoChangeStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_switchClosedNoChange', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.switchClosedNoChangeStringProperty' ) ),
      _comment_8: new FluentComment( {"comment":"Fuse broken responses","associatedKey":"fuseBroken"} ),
      fuseBroken: new FluentPattern<{ currentPhrase: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_fuseBroken', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.fuseBrokenStringProperty' ), [{"name":"currentPhrase"}] ),
      fuseBrokenNoChangeStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_fuseBrokenNoChange', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.fuseBrokenNoChangeStringProperty' ) ),
      _comment_9: new FluentComment( {"comment":"Fuse repaired responses","associatedKey":"fuseRepaired"} ),
      fuseRepaired: new FluentPattern<{ currentPhrase: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_fuseRepaired', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.fuseRepairedStringProperty' ), [{"name":"currentPhrase"}] ),
      fuseRepairedNoChangeStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_fuseRepairedNoChange', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.fuseRepairedNoChangeStringProperty' ) ),
      _comment_10: new FluentComment( {"comment":"Battery reversed responses","associatedKey":"batteryReversed"} ),
      batteryReversed: new FluentPattern<{ currentPhrase: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_batteryReversed', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.batteryReversedStringProperty' ), [{"name":"currentPhrase"}] ),
      batteryReversedNoChangeStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_batteryReversedNoChange', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.batteryReversedNoChangeStringProperty' ) ),
      _comment_11: new FluentComment( {"comment":"Vertex disconnection responses","associatedKey":"vertexDisconnected"} ),
      vertexDisconnected: new FluentPattern<{ currentPhrase: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_vertexDisconnected', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.vertexDisconnectedStringProperty' ), [{"name":"currentPhrase"}] ),
      vertexDisconnectedNoChangeStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitContextResponses_vertexDisconnectedNoChange', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitContextResponses.vertexDisconnectedNoChangeStringProperty' ) )
    },
    sensorToolbox: {
      accessibleHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_sensorToolbox_accessibleHeading', _.get( CircuitConstructionKitCommonStrings, 'a11y.sensorToolbox.accessibleHeadingStringProperty' ) ),
      nonContactAmmeter: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_sensorToolbox_nonContactAmmeter_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.sensorToolbox.nonContactAmmeter.accessibleNameStringProperty' ) )
      },
      voltmeter: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_sensorToolbox_voltmeter_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.sensorToolbox.voltmeter.accessibleNameStringProperty' ) )
      },
      ammeter: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_sensorToolbox_ammeter_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.sensorToolbox.ammeter.accessibleNameStringProperty' ) )
      }
    },
    circuitComponentToolbox: {
      carousel: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitComponentToolbox_carousel_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitComponentToolbox.carousel.accessibleNameStringProperty' ) ),
        accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitComponentToolbox_carousel_accessibleHelpText', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitComponentToolbox.carousel.accessibleHelpTextStringProperty' ) )
      },
      toolAccessibleName: new FluentPattern<{ componentName: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitComponentToolbox_toolAccessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitComponentToolbox.toolAccessibleNameStringProperty' ), [{"name":"componentName"}] )
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
    circuitComponentToolNode: {
      accessibleHelpText: new FluentPattern<{ accessibleName: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitComponentToolNode_accessibleHelpText', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitComponentToolNode.accessibleHelpTextStringProperty' ), [{"name":"accessibleName"}] )
    },
    reverseBatteryButton: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_reverseBatteryButton_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.reverseBatteryButton.accessibleNameStringProperty' ) )
    },
    switchToggleButton: {
      openSwitchStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_switchToggleButton_openSwitch', _.get( CircuitConstructionKitCommonStrings, 'a11y.switchToggleButton.openSwitchStringProperty' ) ),
      closeSwitchStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_switchToggleButton_closeSwitch', _.get( CircuitConstructionKitCommonStrings, 'a11y.switchToggleButton.closeSwitchStringProperty' ) )
    },
    disconnectButton: {
      accessibleName: new FluentPattern<{ accessibleName: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_disconnectButton_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.disconnectButton.accessibleNameStringProperty' ), [{"name":"accessibleName"}] )
    },
    trashButton: {
      accessibleName: new FluentPattern<{ accessibleName: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_trashButton_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.trashButton.accessibleNameStringProperty' ), [{"name":"accessibleName"}] )
    },
    fuseRepairButton: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_fuseRepairButton_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.fuseRepairButton.accessibleNameStringProperty' ) )
    },
    sourceResistanceControl: {
      ariaValueText: new FluentPattern<{ resistance: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_sourceResistanceControl_ariaValueText', _.get( CircuitConstructionKitCommonStrings, 'a11y.sourceResistanceControl.ariaValueTextStringProperty' ), [{"name":"resistance","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] )
    },
    wireResistivityControl: {
      ariaValueText: new FluentPattern<{ resistivity: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_wireResistivityControl_ariaValueText', _.get( CircuitConstructionKitCommonStrings, 'a11y.wireResistivityControl.ariaValueTextStringProperty' ), [{"name":"resistivity"}] )
    },
    fuseCurrentRatingControl: {
      ariaValueText: new FluentPattern<{ currentFormatted: FluentVariable, currentNumber: number | 'one' | number | 'other' | TReadOnlyProperty<number | 'one' | number | 'other'> }>( fluentSupport.bundleProperty, 'a11y_fuseCurrentRatingControl_ariaValueText', _.get( CircuitConstructionKitCommonStrings, 'a11y.fuseCurrentRatingControl.ariaValueTextStringProperty' ), [{"name":"currentFormatted"},{"name":"currentNumber","variants":[{"type":"number","value":"one"},{"type":"number","value":"other"}]}] )
    },
    ammeterNode: {
      accessibleHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_ammeterNode_accessibleHeading', _.get( CircuitConstructionKitCommonStrings, 'a11y.ammeterNode.accessibleHeadingStringProperty' ) ),
      accessibleHeadingNumbered: new FluentPattern<{ position: FluentVariable, total: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_ammeterNode_accessibleHeadingNumbered', _.get( CircuitConstructionKitCommonStrings, 'a11y.ammeterNode.accessibleHeadingNumberedStringProperty' ), [{"name":"position"},{"name":"total"}] ),
      accessibleParagraphStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_ammeterNode_accessibleParagraph', _.get( CircuitConstructionKitCommonStrings, 'a11y.ammeterNode.accessibleParagraphStringProperty' ) ),
      body: {
        accessibleName: new FluentPattern<{ reading: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_ammeterNode_body_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.ammeterNode.body.accessibleNameStringProperty' ), [{"name":"reading"}] )
      },
      probe: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_ammeterNode_probe_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.ammeterNode.probe.accessibleNameStringProperty' ) )
      },
      noReadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_ammeterNode_noReading', _.get( CircuitConstructionKitCommonStrings, 'a11y.ammeterNode.noReadingStringProperty' ) ),
      currentAmps: new FluentPattern<{ current: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_ammeterNode_currentAmps', _.get( CircuitConstructionKitCommonStrings, 'a11y.ammeterNode.currentAmpsStringProperty' ), [{"name":"current"}] )
    },
    voltmeterNode: {
      accessibleHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voltmeterNode_accessibleHeading', _.get( CircuitConstructionKitCommonStrings, 'a11y.voltmeterNode.accessibleHeadingStringProperty' ) ),
      accessibleHeadingNumbered: new FluentPattern<{ position: FluentVariable, total: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_voltmeterNode_accessibleHeadingNumbered', _.get( CircuitConstructionKitCommonStrings, 'a11y.voltmeterNode.accessibleHeadingNumberedStringProperty' ), [{"name":"position"},{"name":"total"}] ),
      accessibleParagraphStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voltmeterNode_accessibleParagraph', _.get( CircuitConstructionKitCommonStrings, 'a11y.voltmeterNode.accessibleParagraphStringProperty' ) ),
      body: {
        accessibleName: new FluentPattern<{ reading: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_voltmeterNode_body_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.voltmeterNode.body.accessibleNameStringProperty' ), [{"name":"reading"}] )
      },
      blackProbe: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voltmeterNode_blackProbe_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.voltmeterNode.blackProbe.accessibleNameStringProperty' ) )
      },
      redProbe: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voltmeterNode_redProbe_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.voltmeterNode.redProbe.accessibleNameStringProperty' ) )
      },
      noReadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_voltmeterNode_noReading', _.get( CircuitConstructionKitCommonStrings, 'a11y.voltmeterNode.noReadingStringProperty' ) )
    },
    circuitComponent: {
      _comment_0: new FluentComment( {"comment":"Composable parts for building accessible names (DRY pattern)","associatedKey":"separator"} ),
      _comment_1: new FluentComment( {"comment":"These are assembled in CircuitDescription.ts","associatedKey":"separator"} ),
      separatorStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitComponent_separator', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitComponent.separatorStringProperty' ) ),
      nameWithPosition: new FluentPattern<{ position: FluentVariable, total: FluentVariable, typeName: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitComponent_nameWithPosition', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitComponent.nameWithPositionStringProperty' ), [{"name":"position"},{"name":"total"},{"name":"typeName"}] ),
      values: {
        resistanceOhms: new FluentPattern<{ resistance: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitComponent_values_resistanceOhms', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitComponent.values.resistanceOhmsStringProperty' ), [{"name":"resistance"}] ),
        resistanceMilliohms: new FluentPattern<{ resistance: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitComponent_values_resistanceMilliohms', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitComponent.values.resistanceMilliohmsStringProperty' ), [{"name":"resistance"}] ),
        voltageVolts: new FluentPattern<{ voltage: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitComponent_values_voltageVolts', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitComponent.values.voltageVoltsStringProperty' ), [{"name":"voltage"}] ),
        capacitanceFarads: new FluentPattern<{ capacitance: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitComponent_values_capacitanceFarads', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitComponent.values.capacitanceFaradsStringProperty' ), [{"name":"capacitance"}] ),
        inductanceHenries: new FluentPattern<{ inductance: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitComponent_values_inductanceHenries', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitComponent.values.inductanceHenriesStringProperty' ), [{"name":"inductance"}] ),
        currentRatingAmps: new FluentPattern<{ currentRating: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitComponent_values_currentRatingAmps', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitComponent.values.currentRatingAmpsStringProperty' ), [{"name":"currentRating"}] ),
        infiniteOhmsStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitComponent_values_infiniteOhms', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitComponent.values.infiniteOhmsStringProperty' ) )
      },
      switchStates: {
        closedStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitComponent_switchStates_closed', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitComponent.switchStates.closedStringProperty' ) ),
        openStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitComponent_switchStates_open', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitComponent.switchStates.openStringProperty' ) )
      },
      modifiers: {
        onFireStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitComponent_modifiers_onFire', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitComponent.modifiers.onFireStringProperty' ) ),
        brokenStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitComponent_modifiers_broken', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitComponent.modifiers.brokenStringProperty' ) )
      },
      brightness: {
        offStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_circuitComponent_brightness_off', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitComponent.brightness.offStringProperty' ) ),
        percent: new FluentPattern<{ percent: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitComponent_brightness_percent', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitComponent.brightness.percentStringProperty' ), [{"name":"percent"}] )
      }
    }
  }
};

export default CircuitConstructionKitCommonFluent;

circuitConstructionKitCommon.register('CircuitConstructionKitCommonFluent', CircuitConstructionKitCommonFluent);
