// Copyright 2016-2022, University of Colorado Boulder

/**
 * This shows a readout that indicates the speed of the simulation is reduced (to prevent a strobe effect). Exists for
 * the life of the sim and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Utils from '../../../dot/js/Utils.js';
import StringUtils from '../../../phetcommon/js/util/StringUtils.js';
import { Text } from '../../../scenery/js/imports.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

const animationSpeedLimitReachedString = circuitConstructionKitCommonStrings.animationSpeedLimitReached;

export default class ChargeSpeedThrottlingReadoutNode extends Text {

  /**
   * @param {Property.<number>} timeScaleProperty - the fractional rate of time passage (1.0 = full speed)
   * @param {Property.<boolean>} showCurrentProperty - true if currents are visible
   * @param {Property.<boolean>} isValueDepictionEnabledProperty - true if the explore screen is running
   */
  constructor( timeScaleProperty: Property<number>, showCurrentProperty: Property<boolean>, isValueDepictionEnabledProperty: Property<boolean> ) {
    super( animationSpeedLimitReachedString, {

      // Reduce the width of the animation speed limit reached so it doesn't overlap controls
      // see https://github.com/phetsims/circuit-construction-kit-dc/issues/118
      fontSize: 16,
      maxWidth: 530
    } );

    Property.multilink( [ timeScaleProperty, showCurrentProperty, isValueDepictionEnabledProperty ],
      ( timeScale, showCurrent, isValueDepictionEnabled ) => {
        const percent = timeScale * 100;
        const isThrottled = percent < 99.5;
        const fixed = timeScale < 0.01 ? '< 1' : Utils.toFixed( percent, 0 );
        this.setText( StringUtils.fillIn( animationSpeedLimitReachedString, { percent: fixed } ) );

        // Only show the throttling message if the speed is less than 100% and charges are visible
        this.visible = isThrottled && showCurrent && isValueDepictionEnabled;
      } );
  }
}

circuitConstructionKitCommon.register( 'ChargeSpeedThrottlingReadoutNode', ChargeSpeedThrottlingReadoutNode );