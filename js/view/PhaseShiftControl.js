// Copyright 2019, University of Colorado Boulder

/**
 * Control that allows the user to change the phase of the ac voltage source.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const CCKCConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CCKCConstants' );
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const MathSymbols = require( 'SCENERY_PHET/MathSymbols' );
  const merge = require( 'PHET_CORE/merge' );
  const NumberSpinner = require( 'SUN/NumberSpinner' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );

  const FONT = new PhetFont( CCKCConstants.FONT_SIZE ); // TODO: factor out

  class PhaseShiftControl extends VBox {

    /**
     * @param {ACVoltage} acVoltage
     * @param {Object} [options]
     */
    constructor( acVoltage, options ) {
      options = merge( {}, options );

      // const valueProperty = new Property( 0 );
      const valueRangeProperty = new Property( new Range( -180, 180 ) );
      const enabledProperty = new BooleanProperty( true );

      // options for all spinners
      const spinnerOptions = {
        enabledProperty: enabledProperty,

        // TODO: fine tune touch areas
        // touchAreaXDilation: 20,
        // touchAreaYDilation: 10,
        // mouseAreaXDilation: 10,
        // mouseAreaYDilation: 5,
        decimalPlaces: 0,
        deltaValue: 10,
        backgroundMinWidth: 60,
        xMargin: 10,
        font: FONT
      };
      const title = new Text( 'Phase Shift', {
        font: FONT
      } );

      const numberSpinner = new NumberSpinner( acVoltage.phaseProperty, valueRangeProperty, merge( {}, spinnerOptions, {
        arrowsPosition: 'leftRight',
        valuePattern: '{{value}}' + MathSymbols.DEGREES, // Does not require internationalization
        tandem: options.tandem.createTandem( 'numberSpinner' )
      } ) );

      options = merge( {
        spacing: 10
      }, options );

      assert && assert( !options.children, 'children not supported' );
      options.children = [ title, numberSpinner ];

      super( options );
    }
  }

  return circuitConstructionKitCommon.register( 'PhaseShiftControl', PhaseShiftControl );
} );