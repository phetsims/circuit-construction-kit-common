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
addToMapIfDefined( 'a11y_sensorToolbox_accessibleHeading', 'a11y.sensorToolbox.accessibleHeadingStringProperty' );
addToMapIfDefined( 'a11y_advancedAccordionBox_accessibleName', 'a11y.advancedAccordionBox.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_displayOptionsPanel_accessibleHeading', 'a11y.displayOptionsPanel.accessibleHeadingStringProperty' );
addToMapIfDefined( 'a11y_viewRadioButtonGroup_accessibleHeading', 'a11y.viewRadioButtonGroup.accessibleHeadingStringProperty' );
addToMapIfDefined( 'a11y_viewRadioButtonGroup_accessibleName', 'a11y.viewRadioButtonGroup.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_viewRadioButtonGroup_accessibleHelpText', 'a11y.viewRadioButtonGroup.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_viewRadioButtonGroup_lifelikeRadioButton_accessibleName', 'a11y.viewRadioButtonGroup.lifelikeRadioButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_viewRadioButtonGroup_lifelikeRadioButton_accessibleHelpText', 'a11y.viewRadioButtonGroup.lifelikeRadioButton.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_viewRadioButtonGroup_schematicRadioButton_accessibleName', 'a11y.viewRadioButtonGroup.schematicRadioButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_viewRadioButtonGroup_schematicRadioButton_accessibleHelpText', 'a11y.viewRadioButtonGroup.schematicRadioButton.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_circuitElementToolNode_accessibleHelpText', 'a11y.circuitElementToolNode.accessibleHelpTextStringProperty' );
addToMapIfDefined( 'a11y_reverseBatteryButton_accessibleName', 'a11y.reverseBatteryButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_trashButton_accessibleName', 'a11y.trashButton.accessibleNameStringProperty' );
addToMapIfDefined( 'a11y_circuitElement_accessibleName', 'a11y.circuitElement.accessibleNameStringProperty' );

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
    sensorToolbox: {
      accessibleHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_sensorToolbox_accessibleHeading', _.get( CircuitConstructionKitCommonStrings, 'a11y.sensorToolbox.accessibleHeadingStringProperty' ) )
    },
    advancedAccordionBox: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_advancedAccordionBox_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.advancedAccordionBox.accessibleNameStringProperty' ) )
    },
    displayOptionsPanel: {
      accessibleHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_displayOptionsPanel_accessibleHeading', _.get( CircuitConstructionKitCommonStrings, 'a11y.displayOptionsPanel.accessibleHeadingStringProperty' ) )
    },
    viewRadioButtonGroup: {
      accessibleHeadingStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_viewRadioButtonGroup_accessibleHeading', _.get( CircuitConstructionKitCommonStrings, 'a11y.viewRadioButtonGroup.accessibleHeadingStringProperty' ) ),
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_viewRadioButtonGroup_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.viewRadioButtonGroup.accessibleNameStringProperty' ) ),
      accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_viewRadioButtonGroup_accessibleHelpText', _.get( CircuitConstructionKitCommonStrings, 'a11y.viewRadioButtonGroup.accessibleHelpTextStringProperty' ) ),
      lifelikeRadioButton: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_viewRadioButtonGroup_lifelikeRadioButton_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.viewRadioButtonGroup.lifelikeRadioButton.accessibleNameStringProperty' ) ),
        accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_viewRadioButtonGroup_lifelikeRadioButton_accessibleHelpText', _.get( CircuitConstructionKitCommonStrings, 'a11y.viewRadioButtonGroup.lifelikeRadioButton.accessibleHelpTextStringProperty' ) )
      },
      schematicRadioButton: {
        accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_viewRadioButtonGroup_schematicRadioButton_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.viewRadioButtonGroup.schematicRadioButton.accessibleNameStringProperty' ) ),
        accessibleHelpTextStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_viewRadioButtonGroup_schematicRadioButton_accessibleHelpText', _.get( CircuitConstructionKitCommonStrings, 'a11y.viewRadioButtonGroup.schematicRadioButton.accessibleHelpTextStringProperty' ) )
      }
    },
    circuitElementToolNode: {
      accessibleHelpText: new FluentPattern<{ hasPosition: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, position: FluentVariable, resistance: FluentVariable, total: FluentVariable, type: 'resistor' | 'battery' | 'lightBulb' | 'capacitor' | 'inductor' | 'acSource' | 'fuse' | 'switch' | 'voltmeter' | 'ammeter' | 'stopwatch' | 'wire' | TReadOnlyProperty<'resistor' | 'battery' | 'lightBulb' | 'capacitor' | 'inductor' | 'acSource' | 'fuse' | 'switch' | 'voltmeter' | 'ammeter' | 'stopwatch' | 'wire'>, valuesShowing: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, voltage: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitElementToolNode_accessibleHelpText', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitElementToolNode.accessibleHelpTextStringProperty' ), [{"name":"hasPosition","variants":["true","false"]},{"name":"position"},{"name":"resistance"},{"name":"total"},{"name":"type","variants":["resistor","battery","lightBulb","capacitor","inductor","acSource","fuse","switch","voltmeter","ammeter","stopwatch","wire"]},{"name":"valuesShowing","variants":["true","false"]},{"name":"voltage"}] )
    },
    reverseBatteryButton: {
      accessibleNameStringProperty: new FluentConstant( fluentSupport.bundleProperty, 'a11y_reverseBatteryButton_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.reverseBatteryButton.accessibleNameStringProperty' ) )
    },
    trashButton: {
      accessibleName: new FluentPattern<{ hasPosition: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, position: FluentVariable, resistance: FluentVariable, total: FluentVariable, type: 'resistor' | 'battery' | 'lightBulb' | 'capacitor' | 'inductor' | 'acSource' | 'fuse' | 'switch' | 'voltmeter' | 'ammeter' | 'stopwatch' | 'wire' | TReadOnlyProperty<'resistor' | 'battery' | 'lightBulb' | 'capacitor' | 'inductor' | 'acSource' | 'fuse' | 'switch' | 'voltmeter' | 'ammeter' | 'stopwatch' | 'wire'>, valuesShowing: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, voltage: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_trashButton_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.trashButton.accessibleNameStringProperty' ), [{"name":"hasPosition","variants":["true","false"]},{"name":"position"},{"name":"resistance"},{"name":"total"},{"name":"type","variants":["resistor","battery","lightBulb","capacitor","inductor","acSource","fuse","switch","voltmeter","ammeter","stopwatch","wire"]},{"name":"valuesShowing","variants":["true","false"]},{"name":"voltage"}] )
    },
    circuitElement: {
      accessibleName: new FluentPattern<{ hasPosition: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, position: FluentVariable, resistance: FluentVariable, total: FluentVariable, type: 'resistor' | 'battery' | 'lightBulb' | 'capacitor' | 'inductor' | 'acSource' | 'fuse' | 'switch' | 'voltmeter' | 'ammeter' | 'stopwatch' | 'wire' | TReadOnlyProperty<'resistor' | 'battery' | 'lightBulb' | 'capacitor' | 'inductor' | 'acSource' | 'fuse' | 'switch' | 'voltmeter' | 'ammeter' | 'stopwatch' | 'wire'>, valuesShowing: 'true' | 'false' | TReadOnlyProperty<'true' | 'false'>, voltage: FluentVariable }>( fluentSupport.bundleProperty, 'a11y_circuitElement_accessibleName', _.get( CircuitConstructionKitCommonStrings, 'a11y.circuitElement.accessibleNameStringProperty' ), [{"name":"hasPosition","variants":["true","false"]},{"name":"position"},{"name":"resistance"},{"name":"total"},{"name":"type","variants":["resistor","battery","lightBulb","capacitor","inductor","acSource","fuse","switch","voltmeter","ammeter","stopwatch","wire"]},{"name":"valuesShowing","variants":["true","false"]},{"name":"voltage"}] )
    }
  }
};

export default CircuitConstructionKitCommonFluent;

circuitConstructionKitCommon.register('CircuitConstructionKitCommonFluent', CircuitConstructionKitCommonFluent);
