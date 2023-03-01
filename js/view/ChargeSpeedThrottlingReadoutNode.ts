// Copyright 2016-2023, University of Colorado Boulder

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
import CircuitConstructionKitCommonStrings from '../CircuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import Multilink from '../../../axon/js/Multilink.js';

const animationSpeedLimitReachedStringProperty = CircuitConstructionKitCommonStrings.animationSpeedLimitReachedStringProperty;

export default class ChargeSpeedThrottlingReadoutNode extends Text {

  /**
   * @param timeScaleProperty - the fractional rate of time passage (1.0 = full speed)
   * @param showCurrentProperty - true if currents are visible
   * @param isValueDepictionEnabledProperty - true if the explore screen is running
   */
  public constructor( timeScaleProperty: Property<number>, showCurrentProperty: Property<boolean>, isValueDepictionEnabledProperty: Property<boolean> ) {
    super( '', {

      // Reduce the width of the animation speed limit reached so it doesn't overlap controls
      // see https://github.com/phetsims/circuit-construction-kit-dc/issues/118
      fontSize: 16,
      maxWidth: 530
    } );

    Multilink.multilink( [ timeScaleProperty, showCurrentProperty, isValueDepictionEnabledProperty, animationSpeedLimitReachedStringProperty ],
      ( timeScale, showCurrent, isValueDepictionEnabled ) => {
        const percent = timeScale * 100;
        const isThrottled = percent < 99.5;
        const fixed = timeScale < 0.01 ? '< 1' : Utils.toFixed( percent, 0 );
        this.setString( StringUtils.fillIn( animationSpeedLimitReachedStringProperty, { percent: fixed } ) );

        // Only show the throttling message if the speed is less than 100% and charges are visible
        this.visible = isThrottled && showCurrent && isValueDepictionEnabled;
      } );
  }
}

circuitConstructionKitCommon.register( 'ChargeSpeedThrottlingReadoutNode', ChargeSpeedThrottlingReadoutNode );