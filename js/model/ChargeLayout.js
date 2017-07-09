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
  var inherit = require( 'PHET_CORE/inherit' );
  var Charge = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/Charge' );
  var CircuitConstructionKitCommonConstants =
    require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitCommonConstants' );

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
     * @public
     */
    layoutCharges: function( circuitElement ) {

      // Avoid unnecessary work to improve performance
      if ( circuitElement.chargeLayoutDirty ) {

        // Remove any charges that were already in the branch.
        var chargesToRemove = this.circuit.getChargesInCircuitElement( circuitElement );
        this.circuit.charges.removeAll( chargesToRemove );

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
                               (firstChargePosition + lastChargePosition) / 2 :
                               i * spacing + offset;
          var charge = new Charge(
            circuitElement,
            chargePosition,
            this.circuit.showCurrentProperty,
            this.circuit.currentTypeProperty.get() === 'electrons' ? -1 : +1
          );
          this.circuit.charges.add( charge );
        }

        circuitElement.chargeLayoutDirty = false;
      }
    }
  } );
} );