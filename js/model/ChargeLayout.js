// Copyright 2016-2017, University of Colorado Boulder

/**
 * Creates Charge instances in a CircuitElement when it has been created, or when an adjacent wire's length has been
 * modified.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitCommonConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );
  var CurrentType = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/CurrentType' );
  var Charge = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Charge' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Circuit} circuit
   * @constructor
   */
  function ChargeLayout( circuit ) {

    // @private {Circuit}
    this.circuit = circuit;
  }

  circuitConstructionKitCommon.register( 'ChargeLayout', ChargeLayout );

  return inherit( Object, ChargeLayout, {

    /**
     * Creates and positions charges in the specified circuit element.
     * @param {CircuitElement} circuitElement - the circuit element within which the charges will be updated
     * REVIEW*: Move to Circuit (or ChargeAnimator) itself?
     * @public
     */
    layoutCharges: function( circuitElement ) {

      // Avoid unnecessary work to improve performance
      if ( circuitElement.chargeLayoutDirty ) {

        circuitElement.chargeLayoutDirty = false;

        // Identify charges that were already in the branch.
        var charges = this.circuit.getChargesInCircuitElement( circuitElement );

        // put charges 1/2 separation from the edge so it will match up with adjacent components
        var offset = CircuitConstructionKitCommonConstants.CHARGE_SEPARATION / 2;
        var lastChargePosition = circuitElement.chargePathLength - offset;
        var firstChargePosition = offset;
        var lengthForCharges = lastChargePosition - firstChargePosition;

        // Math.round leads to charges too far apart when N=2
        var numberOfCharges = Math.ceil( lengthForCharges / CircuitConstructionKitCommonConstants.CHARGE_SEPARATION );

        // compute distance between adjacent charges
        var spacing = lengthForCharges / ( numberOfCharges - 1 );

        for ( var i = 0; i < numberOfCharges; i++ ) {

          // If there is a single particle, show it in the middle of the component, otherwise space equally
          var chargePosition = numberOfCharges === 1 ?
                               ( firstChargePosition + lastChargePosition ) / 2 :
                               i * spacing + offset;

          var desiredCharge = this.circuit.currentTypeProperty.get() === CurrentType.ELECTRONS ? -1 : +1;

          if ( charges.length > 0 &&
               charges[ 0 ].charge === desiredCharge &&
               charges[ 0 ].circuitElement === circuitElement &&
               charges[ 0 ].visibleProperty === this.circuit.showCurrentProperty ) {

            var c = charges.shift(); // remove 1st element, since it's the charge we checked in the guard
            c.circuitElement = circuitElement;
            c.distance = chargePosition;
            c.updatePositionAndAngle();
          }
          else {

            // nothing suitable in the pool, create something new
            var charge = new Charge( circuitElement, chargePosition, this.circuit.showCurrentProperty, desiredCharge );
            this.circuit.charges.add( charge );
          }
        }

        // Any charges that did not get recycled should be removed
        this.circuit.charges.removeAll( charges );
      }
    }
  } );
} );